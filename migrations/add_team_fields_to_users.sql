-- Migration: Add Team Member Fields to Users Table
-- Description: Adds fields needed to display users as team members on the public portal
-- Date: 2026-01-28

-- Add team member fields to users table
ALTER TABLE public.users
ADD COLUMN IF NOT EXISTS department VARCHAR(100),
ADD COLUMN IF NOT EXISTS bio TEXT,
ADD COLUMN IF NOT EXISTS linkedin_url TEXT,
ADD COLUMN IF NOT EXISTS twitter_url TEXT,
ADD COLUMN IF NOT EXISTS member_type VARCHAR(50),
ADD COLUMN IF NOT EXISTS display_order INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS show_in_team BOOLEAN DEFAULT FALSE;

-- Add constraint for member_type values
ALTER TABLE public.users
ADD CONSTRAINT IF NOT EXISTS chk_user_member_type
CHECK (member_type IS NULL OR member_type IN ('leadership', 'board', 'staff', 'advisor'));

-- Add index for team queries
CREATE INDEX IF NOT EXISTS idx_users_show_in_team ON public.users(show_in_team) WHERE show_in_team = true;
CREATE INDEX IF NOT EXISTS idx_users_member_type ON public.users(member_type);
CREATE INDEX IF NOT EXISTS idx_users_display_order ON public.users(display_order);

-- Comments
COMMENT ON COLUMN public.users.department IS 'User department for team display';
COMMENT ON COLUMN public.users.bio IS 'User biography for team display';
COMMENT ON COLUMN public.users.linkedin_url IS 'LinkedIn profile URL';
COMMENT ON COLUMN public.users.twitter_url IS 'Twitter/X profile URL';
COMMENT ON COLUMN public.users.member_type IS 'Team category: leadership, board, staff, advisor';
COMMENT ON COLUMN public.users.display_order IS 'Order for displaying in team list';
COMMENT ON COLUMN public.users.show_in_team IS 'Whether to show this user on public team page';
