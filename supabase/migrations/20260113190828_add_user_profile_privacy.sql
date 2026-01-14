-- Add is_profile_public column to users table
-- This controls whether a user's profile is visible to other users

ALTER TABLE public.users
ADD COLUMN IF NOT EXISTS is_profile_public boolean DEFAULT true;

-- Add comment for documentation
COMMENT ON COLUMN public.users.is_profile_public IS 'Controls whether the user profile is visible to other users';
