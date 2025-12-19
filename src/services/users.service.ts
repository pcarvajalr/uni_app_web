import { supabase, handleSupabaseError } from '../lib/supabase';

/**
 * Service for managing user accounts and account deletion
 */

// Types for deletion status
export interface DeletionStatus {
  success: boolean;
  is_deleted: boolean;
  status: 'active' | 'pending_deletion';
  deleted_at?: string;
  deletion_scheduled_at?: string;
  days_until_permanent_deletion?: number;
  can_recover?: boolean;
  error?: string;
}

export interface DeletionResult {
  success: boolean;
  user_id?: string;
  deleted_at?: string;
  recovery_deadline?: string;
  anonymized_data?: {
    products_marked_deleted: number;
    sessions_cancelled: number;
    notifications_deleted: number;
    favorites_deleted: number;
    coupons_deleted: number;
  };
  error?: string;
}

export interface RestoreResult {
  success: boolean;
  user_id?: string;
  restored_at?: string;
  restored_data?: {
    products_restored: number;
  };
  error?: string;
}

/**
 * Request account deletion for the current user
 * This will soft-delete the account and anonymize personal data
 * Sets a 30-day grace period for account recovery
 *
 * @param userId - The UUID of the user to delete
 * @returns Promise with deletion result
 */
export const deleteAccount = async (userId: string): Promise<DeletionResult> => {
  try {
    // Call the Supabase function to anonymize the user account
    const { data, error } = await (supabase.rpc as any)('anonymize_user_account', {
      target_user_id: userId
    });

    if (error) {
      console.error('Error deleting account:', error);
      throw new Error(error.message || 'Error al eliminar la cuenta');
    }

    // Parse the result
    const result = data as unknown as DeletionResult;

    if (!result.success) {
      throw new Error(result.error || 'Error desconocido al eliminar la cuenta');
    }

    return result;
  } catch (error: any) {
    console.error('Error in deleteAccount:', error);
    throw error;
  }
};

/**
 * Get the deletion status of a user account
 * Returns whether the account is deleted, and if so, when it will be permanently deleted
 *
 * @param userId - The UUID of the user to check
 * @returns Promise with deletion status
 */
export const getAccountDeletionStatus = async (userId: string): Promise<DeletionStatus> => {
  try {
    const { data, error } = await (supabase.rpc as any)('get_account_deletion_status', {
      target_user_id: userId
    });

    if (error) {
      console.error('Error getting deletion status:', error);
      throw new Error(error.message || 'Error al obtener el estado de eliminación');
    }

    const result = data as unknown as DeletionStatus;

    if (!result.success) {
      throw new Error(result.error || 'Error desconocido al obtener el estado');
    }

    return result;
  } catch (error: any) {
    console.error('Error in getAccountDeletionStatus:', error);
    throw error;
  }
};

/**
 * Cancel account deletion and restore the account
 * Only works within the 30-day grace period
 * Requires providing new email and full name for security
 *
 * @param userId - The UUID of the user to restore
 * @param newEmail - New email address for the restored account
 * @param newFullName - New full name for the restored account
 * @returns Promise with restore result
 */
export const cancelAccountDeletion = async (
  userId: string,
  newEmail: string,
  newFullName: string
): Promise<RestoreResult> => {
  try {
    const { data, error } = await (supabase.rpc as any)('restore_user_account', {
      target_user_id: userId,
      new_email: newEmail,
      new_full_name: newFullName
    });

    if (error) {
      console.error('Error restoring account:', error);
      throw new Error(error.message || 'Error al restaurar la cuenta');
    }

    const result = data as unknown as RestoreResult;

    if (!result.success) {
      throw new Error(result.error || 'Error desconocido al restaurar la cuenta');
    }

    return result;
  } catch (error: any) {
    console.error('Error in cancelAccountDeletion:', error);
    throw error;
  }
};

/**
 * Check if a user account is active (not deleted)
 * Helper function for UI components
 *
 * @param userId - The UUID of the user to check
 * @returns Promise<boolean> - true if account is active, false if deleted
 */
export const isUserActive = async (userId: string): Promise<boolean> => {
  try {
    const status = await getAccountDeletionStatus(userId);
    return !status.is_deleted;
  } catch (error) {
    // If we can't get the status, assume the user is active
    console.error('Error checking if user is active:', error);
    return true;
  }
};
