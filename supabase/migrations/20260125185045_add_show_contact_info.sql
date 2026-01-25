-- Add show_contact_info column to users table
-- This controls whether a user's contact information (phone, email) is visible to others

ALTER TABLE public.users
ADD COLUMN IF NOT EXISTS show_contact_info boolean DEFAULT false;

-- Add comment for documentation
COMMENT ON COLUMN public.users.show_contact_info IS 'Controls whether the user contact information (phone, email) is visible to other users';
