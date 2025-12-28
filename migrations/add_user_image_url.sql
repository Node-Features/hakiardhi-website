-- Add image_url column to users table for profile pictures
ALTER TABLE public.users
ADD COLUMN IF NOT EXISTS image_url text;

-- Add comment
COMMENT ON COLUMN public.users.image_url IS 'URL to user profile picture stored in Supabase Storage';
