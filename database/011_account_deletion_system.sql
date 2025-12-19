-- =====================================================
-- Migration 011: Account Deletion System
-- =====================================================
-- Purpose: Add soft delete functionality with 30-day grace period
-- for user accounts, including data anonymization and account recovery
-- =====================================================

-- =====================================================
-- 1. Add soft delete columns to users table
-- =====================================================

ALTER TABLE public.users
  ADD COLUMN IF NOT EXISTS is_deleted BOOLEAN DEFAULT FALSE NOT NULL,
  ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMP WITH TIME ZONE,
  ADD COLUMN IF NOT EXISTS deletion_scheduled_at TIMESTAMP WITH TIME ZONE;

-- Add index for querying deleted accounts
CREATE INDEX IF NOT EXISTS idx_users_is_deleted ON public.users(is_deleted) WHERE is_deleted = TRUE;
CREATE INDEX IF NOT EXISTS idx_users_deletion_scheduled ON public.users(deletion_scheduled_at) WHERE deletion_scheduled_at IS NOT NULL;

COMMENT ON COLUMN public.users.is_deleted IS 'Indicates if user account is in deleted state (soft delete)';
COMMENT ON COLUMN public.users.deleted_at IS 'Timestamp when account was marked for deletion';
COMMENT ON COLUMN public.users.deletion_scheduled_at IS 'Timestamp when account will be permanently deleted (30 days after deleted_at)';

-- =====================================================
-- 2. Function to anonymize user account (soft delete)
-- =====================================================

CREATE OR REPLACE FUNCTION public.anonymize_user_account(target_user_id UUID)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  result JSONB;
  deleted_products_count INTEGER;
  deleted_sessions_count INTEGER;
  deleted_notifications_count INTEGER;
  deleted_favorites_count INTEGER;
  deleted_coupons_count INTEGER;
  user_record RECORD;
BEGIN
  -- Check if user exists and is not already deleted
  SELECT * INTO user_record FROM public.users
  WHERE id = target_user_id;

  IF NOT FOUND THEN
    RETURN jsonb_build_object(
      'success', FALSE,
      'error', 'User not found'
    );
  END IF;

  IF user_record.is_deleted = TRUE THEN
    RETURN jsonb_build_object(
      'success', FALSE,
      'error', 'User account is already deleted'
    );
  END IF;

  -- Start anonymization process

  -- 1. Anonymize user profile data
  UPDATE public.users
  SET
    full_name = 'Usuario Eliminado',
    email = 'deleted-' || target_user_id || '@deleted.local',
    phone = NULL,
    student_id = NULL,
    bio = NULL,
    avatar_url = NULL,
    is_deleted = TRUE,
    deleted_at = NOW(),
    deletion_scheduled_at = NOW() + INTERVAL '30 days',
    updated_at = NOW()
  WHERE id = target_user_id;

  -- 2. Delete user notifications
  DELETE FROM public.notifications
  WHERE user_id = target_user_id;
  GET DIAGNOSTICS deleted_notifications_count = ROW_COUNT;

  -- 3. Delete user favorites
  DELETE FROM public.favorites
  WHERE user_id = target_user_id;
  GET DIAGNOSTICS deleted_favorites_count = ROW_COUNT;

  -- 4. Delete user coupons
  DELETE FROM public.user_coupons
  WHERE user_id = target_user_id;
  GET DIAGNOSTICS deleted_coupons_count = ROW_COUNT;

  -- 5. Mark user's products as deleted (preserve for transaction history)
  UPDATE public.products
  SET
    status = 'deleted',
    updated_at = NOW()
  WHERE seller_id = target_user_id AND status != 'deleted';
  GET DIAGNOSTICS deleted_products_count = ROW_COUNT;

  -- 6. Mark tutoring sessions as deleted (preserve for academic records)
  UPDATE public.tutoring_sessions
  SET
    status = 'cancelled',
    updated_at = NOW()
  WHERE tutor_id = target_user_id AND status NOT IN ('cancelled', 'completed');
  GET DIAGNOSTICS deleted_sessions_count = ROW_COUNT;

  -- 7. Anonymize messages (keep for conversation history of other users)
  -- This preserves message structure but removes content from deleted user
  UPDATE public.messages
  SET
    content = '[Mensaje de usuario eliminado]',
    updated_at = NOW()
  WHERE sender_id = target_user_id;

  -- Build success response
  result = jsonb_build_object(
    'success', TRUE,
    'user_id', target_user_id,
    'deleted_at', NOW(),
    'recovery_deadline', NOW() + INTERVAL '30 days',
    'anonymized_data', jsonb_build_object(
      'products_marked_deleted', deleted_products_count,
      'sessions_cancelled', deleted_sessions_count,
      'notifications_deleted', deleted_notifications_count,
      'favorites_deleted', deleted_favorites_count,
      'coupons_deleted', deleted_coupons_count
    )
  );

  RETURN result;

EXCEPTION WHEN OTHERS THEN
  RETURN jsonb_build_object(
    'success', FALSE,
    'error', SQLERRM,
    'detail', SQLSTATE
  );
END;
$$;

COMMENT ON FUNCTION public.anonymize_user_account(UUID) IS 'Soft deletes a user account by anonymizing personal data and marking for deletion. Sets 30-day grace period for recovery.';

-- =====================================================
-- 3. Function to restore user account (undo soft delete)
-- =====================================================

CREATE OR REPLACE FUNCTION public.restore_user_account(
  target_user_id UUID,
  new_email TEXT,
  new_full_name TEXT
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  result JSONB;
  user_record RECORD;
  restored_products_count INTEGER;
BEGIN
  -- Check if user exists and is in deleted state
  SELECT * INTO user_record FROM public.users
  WHERE id = target_user_id;

  IF NOT FOUND THEN
    RETURN jsonb_build_object(
      'success', FALSE,
      'error', 'User not found'
    );
  END IF;

  IF user_record.is_deleted = FALSE THEN
    RETURN jsonb_build_object(
      'success', FALSE,
      'error', 'User account is not deleted'
    );
  END IF;

  -- Check if grace period has expired
  IF user_record.deletion_scheduled_at < NOW() THEN
    RETURN jsonb_build_object(
      'success', FALSE,
      'error', 'Recovery period has expired. Account cannot be restored.'
    );
  END IF;

  -- Validate new email is not already in use
  IF EXISTS (SELECT 1 FROM public.users WHERE email = new_email AND id != target_user_id) THEN
    RETURN jsonb_build_object(
      'success', FALSE,
      'error', 'Email is already in use by another account'
    );
  END IF;

  -- Restore user account
  UPDATE public.users
  SET
    full_name = new_full_name,
    email = new_email,
    is_deleted = FALSE,
    deleted_at = NULL,
    deletion_scheduled_at = NULL,
    updated_at = NOW()
  WHERE id = target_user_id;

  -- Restore user's products
  UPDATE public.products
  SET
    status = 'available',
    updated_at = NOW()
  WHERE seller_id = target_user_id AND status = 'deleted';
  GET DIAGNOSTICS restored_products_count = ROW_COUNT;

  -- Note: Notifications, favorites, and coupons are NOT restored
  -- User must recreate these as needed

  -- Build success response
  result = jsonb_build_object(
    'success', TRUE,
    'user_id', target_user_id,
    'restored_at', NOW(),
    'restored_data', jsonb_build_object(
      'products_restored', restored_products_count
    )
  );

  RETURN result;

EXCEPTION WHEN OTHERS THEN
  RETURN jsonb_build_object(
    'success', FALSE,
    'error', SQLERRM,
    'detail', SQLSTATE
  );
END;
$$;

COMMENT ON FUNCTION public.restore_user_account(UUID, TEXT, TEXT) IS 'Restores a soft-deleted user account within the 30-day grace period. Requires new email and full name.';

-- =====================================================
-- 4. Function to check account deletion status
-- =====================================================

CREATE OR REPLACE FUNCTION public.get_account_deletion_status(target_user_id UUID)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  user_record RECORD;
  days_until_permanent_deletion INTEGER;
BEGIN
  SELECT * INTO user_record FROM public.users
  WHERE id = target_user_id;

  IF NOT FOUND THEN
    RETURN jsonb_build_object(
      'success', FALSE,
      'error', 'User not found'
    );
  END IF;

  IF user_record.is_deleted = FALSE THEN
    RETURN jsonb_build_object(
      'success', TRUE,
      'is_deleted', FALSE,
      'status', 'active'
    );
  END IF;

  -- Calculate days until permanent deletion
  days_until_permanent_deletion := EXTRACT(DAY FROM (user_record.deletion_scheduled_at - NOW()));

  RETURN jsonb_build_object(
    'success', TRUE,
    'is_deleted', TRUE,
    'status', 'pending_deletion',
    'deleted_at', user_record.deleted_at,
    'deletion_scheduled_at', user_record.deletion_scheduled_at,
    'days_until_permanent_deletion', days_until_permanent_deletion,
    'can_recover', user_record.deletion_scheduled_at > NOW()
  );

EXCEPTION WHEN OTHERS THEN
  RETURN jsonb_build_object(
    'success', FALSE,
    'error', SQLERRM
  );
END;
$$;

COMMENT ON FUNCTION public.get_account_deletion_status(UUID) IS 'Checks the deletion status of a user account and returns recovery deadline if applicable.';

-- =====================================================
-- 5. Update RLS policies to exclude deleted users
-- =====================================================

-- Note: You may want to add WHERE clauses to existing RLS policies
-- to exclude deleted users from being visible in queries.
-- Example:
-- ALTER POLICY "Users can view their own profile" ON public.users
-- USING (id = auth.uid() AND is_deleted = FALSE);

-- For now, we'll create a helper function
CREATE OR REPLACE FUNCTION public.is_user_active(user_id UUID)
RETURNS BOOLEAN
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT NOT COALESCE(is_deleted, FALSE)
  FROM public.users
  WHERE id = user_id;
$$;

COMMENT ON FUNCTION public.is_user_active(UUID) IS 'Helper function to check if a user account is active (not deleted). Use in RLS policies.';

-- =====================================================
-- 6. Grant necessary permissions
-- =====================================================

-- Grant execute permission on functions to authenticated users
GRANT EXECUTE ON FUNCTION public.anonymize_user_account(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION public.restore_user_account(UUID, TEXT, TEXT) TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_account_deletion_status(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION public.is_user_active(UUID) TO authenticated;

-- =====================================================
-- Migration Complete
-- =====================================================
-- Next steps:
-- 1. Run this migration in Supabase SQL Editor
-- 2. Test anonymize_user_account() with a test user
-- 3. Test restore_user_account() within grace period
-- 4. Implement frontend service (users.service.ts)
-- 5. Create AccountDeletionPage component
-- =====================================================
