-- Migration: Create Organization Tables for Public Portal
-- Description: Creates tables for About page content management
-- Author: Development Team
-- Date: 2024-11-20

-- =====================================================
-- ORGANIZATION CONTENT TABLE
-- =====================================================

CREATE TABLE IF NOT EXISTS public.organization_content (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  content_type VARCHAR(50) NOT NULL, -- 'vision', 'mission', 'who_we_are', 'value', 'history'
  title VARCHAR(255),
  content TEXT NOT NULL,
  icon_name VARCHAR(50),
  display_order INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_org_content_type ON public.organization_content(content_type);
CREATE INDEX IF NOT EXISTS idx_org_content_active ON public.organization_content(is_active) WHERE is_active = true;
CREATE INDEX IF NOT EXISTS idx_org_content_order ON public.organization_content(display_order);

-- Constraints
ALTER TABLE public.organization_content
ADD CONSTRAINT chk_org_content_type CHECK (content_type IN ('vision', 'mission', 'who_we_are', 'value', 'history', 'approach'));

-- Comments
COMMENT ON TABLE public.organization_content IS 'Stores static content for About page sections';
COMMENT ON COLUMN public.organization_content.content_type IS 'Type of content: vision, mission, who_we_are, value, history';
COMMENT ON COLUMN public.organization_content.icon_name IS 'Icon identifier for display (e.g., lucide icon name)';

-- =====================================================
-- TEAM MEMBERS TABLE
-- =====================================================

CREATE TABLE IF NOT EXISTS public.team_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  role VARCHAR(255) NOT NULL,
  department VARCHAR(100),
  bio TEXT,
  image_url TEXT,
  email VARCHAR(255),
  phone VARCHAR(50),
  linkedin_url TEXT,
  twitter_url TEXT,
  member_type VARCHAR(50) NOT NULL, -- 'leadership', 'board', 'staff'
  display_order INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_team_member_type ON public.team_members(member_type);
CREATE INDEX IF NOT EXISTS idx_team_member_active ON public.team_members(is_active) WHERE is_active = true;
CREATE INDEX IF NOT EXISTS idx_team_member_order ON public.team_members(display_order);
CREATE INDEX IF NOT EXISTS idx_team_member_dept ON public.team_members(department);

-- Constraints
ALTER TABLE public.team_members
ADD CONSTRAINT chk_team_member_type CHECK (member_type IN ('leadership', 'board', 'staff', 'advisor'));

-- Comments
COMMENT ON TABLE public.team_members IS 'Stores team member profiles for About page';
COMMENT ON COLUMN public.team_members.member_type IS 'Category: leadership, board, staff, advisor';

-- =====================================================
-- ORGANIZATION MILESTONES TABLE
-- =====================================================

CREATE TABLE IF NOT EXISTS public.organization_milestones (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  year VARCHAR(20) NOT NULL,
  title VARCHAR(255) NOT NULL,
  description TEXT NOT NULL,
  icon_name VARCHAR(50),
  display_order INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_milestones_year ON public.organization_milestones(year);
CREATE INDEX IF NOT EXISTS idx_milestones_active ON public.organization_milestones(is_active) WHERE is_active = true;
CREATE INDEX IF NOT EXISTS idx_milestones_order ON public.organization_milestones(display_order);

-- Comments
COMMENT ON TABLE public.organization_milestones IS 'Stores organization history timeline for About page';

-- =====================================================
-- UPDATED_AT TRIGGER FUNCTION
-- =====================================================

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply trigger to organization tables
DROP TRIGGER IF EXISTS trigger_org_content_updated ON public.organization_content;
CREATE TRIGGER trigger_org_content_updated
BEFORE UPDATE ON public.organization_content
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS trigger_team_members_updated ON public.team_members;
CREATE TRIGGER trigger_team_members_updated
BEFORE UPDATE ON public.team_members
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS trigger_milestones_updated ON public.organization_milestones;
CREATE TRIGGER trigger_milestones_updated
BEFORE UPDATE ON public.organization_milestones
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- SEED DATA (Optional - uncomment to use)
-- =====================================================

/*
-- Vision
INSERT INTO public.organization_content (content_type, title, content, display_order) VALUES
('vision', 'Our Vision', 'A Tanzania where all citizens have secure and equitable access to land and natural resources.', 1);

-- Mission
INSERT INTO public.organization_content (content_type, title, content, display_order) VALUES
('mission', 'Our Mission', 'To promote and protect land rights through legal aid, research, advocacy, and community empowerment.', 2);

-- Core Values
INSERT INTO public.organization_content (content_type, title, content, icon_name, display_order) VALUES
('value', 'Justice', 'We believe in equal access to justice for all citizens regardless of economic status.', 'Scale', 1),
('value', 'Integrity', 'We maintain the highest ethical standards in all our operations.', 'Shield', 2),
('value', 'Empowerment', 'We equip communities with knowledge to protect their land rights.', 'Users', 3),
('value', 'Collaboration', 'We work together with communities, government, and partners.', 'Handshake', 4);
*/
