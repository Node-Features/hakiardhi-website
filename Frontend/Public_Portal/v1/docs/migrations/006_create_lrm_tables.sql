-- Migration: Create LRM Network Tables for Public Portal
-- Description: Creates tables for Land Rights Monitors network management
-- Author: Development Team
-- Date: 2024-11-20

-- =====================================================
-- LRM MEMBERS TABLE
-- =====================================================

CREATE TABLE IF NOT EXISTS public.lrm_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.users(id),
  first_name VARCHAR(255) NOT NULL,
  last_name VARCHAR(255) NOT NULL,
  phone_number VARCHAR(50),
  email VARCHAR(255),
  region_id UUID REFERENCES public.regions(id),
  district_id UUID REFERENCES public.districts(id),
  village_id UUID REFERENCES public.villages(id),
  certification_number VARCHAR(50) UNIQUE,
  certified_date DATE,
  certification_expiry DATE,
  specialization VARCHAR(100), -- 'Land Disputes', 'Documentation', 'Legal Aid'
  bio TEXT,
  photo_url TEXT,
  languages JSONB DEFAULT '[]', -- Array of languages spoken
  is_active BOOLEAN DEFAULT TRUE,
  is_public BOOLEAN DEFAULT TRUE, -- Show in public directory
  cases_handled INTEGER DEFAULT 0,
  disputes_resolved INTEGER DEFAULT 0,
  families_educated INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_lrm_user ON public.lrm_members(user_id);
CREATE INDEX IF NOT EXISTS idx_lrm_region ON public.lrm_members(region_id);
CREATE INDEX IF NOT EXISTS idx_lrm_district ON public.lrm_members(district_id);
CREATE INDEX IF NOT EXISTS idx_lrm_village ON public.lrm_members(village_id);
CREATE INDEX IF NOT EXISTS idx_lrm_active ON public.lrm_members(is_active) WHERE is_active = true;
CREATE INDEX IF NOT EXISTS idx_lrm_public ON public.lrm_members(is_public) WHERE is_public = true;
CREATE INDEX IF NOT EXISTS idx_lrm_certified ON public.lrm_members(certified_date);

-- Comments
COMMENT ON TABLE public.lrm_members IS 'Stores Land Rights Monitor profiles';
COMMENT ON COLUMN public.lrm_members.certification_number IS 'Unique LRM certification identifier';
COMMENT ON COLUMN public.lrm_members.is_public IS 'Whether to show in public LRM directory';

-- =====================================================
-- LRM ACTIVITIES TABLE
-- =====================================================

CREATE TABLE IF NOT EXISTS public.lrm_activities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  lrm_id UUID NOT NULL REFERENCES public.lrm_members(id) ON DELETE CASCADE,
  activity_type VARCHAR(50) NOT NULL, -- 'dispute_resolved', 'education_session', 'legal_referral', 'documentation', 'mediation'
  title VARCHAR(255),
  description TEXT,
  beneficiaries_count INTEGER DEFAULT 0,
  location VARCHAR(255),
  region_id UUID REFERENCES public.regions(id),
  district_id UUID REFERENCES public.districts(id),
  village_id UUID REFERENCES public.villages(id),
  activity_date DATE NOT NULL,
  duration_hours DECIMAL(5,2),
  outcome VARCHAR(100),
  attachments JSONB DEFAULT '[]', -- Array of file URLs
  verified BOOLEAN DEFAULT FALSE,
  verified_by UUID REFERENCES public.users(id),
  verified_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_lrm_activities_lrm ON public.lrm_activities(lrm_id);
CREATE INDEX IF NOT EXISTS idx_lrm_activities_type ON public.lrm_activities(activity_type);
CREATE INDEX IF NOT EXISTS idx_lrm_activities_date ON public.lrm_activities(activity_date DESC);
CREATE INDEX IF NOT EXISTS idx_lrm_activities_region ON public.lrm_activities(region_id);
CREATE INDEX IF NOT EXISTS idx_lrm_activities_verified ON public.lrm_activities(verified);

-- Constraints
ALTER TABLE public.lrm_activities
ADD CONSTRAINT chk_lrm_activity_type CHECK (activity_type IN (
  'dispute_resolved',
  'education_session',
  'legal_referral',
  'documentation',
  'mediation',
  'consultation',
  'training',
  'awareness_campaign'
));

-- Comments
COMMENT ON TABLE public.lrm_activities IS 'Tracks activities performed by LRM members';
COMMENT ON COLUMN public.lrm_activities.activity_type IS 'Type of LRM activity performed';
COMMENT ON COLUMN public.lrm_activities.beneficiaries_count IS 'Number of people who benefited from this activity';

-- =====================================================
-- LRM ROLES TABLE (What LRMs do)
-- =====================================================

CREATE TABLE IF NOT EXISTS public.lrm_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title VARCHAR(255) NOT NULL,
  description TEXT NOT NULL,
  icon_name VARCHAR(50),
  display_order INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_lrm_roles_active ON public.lrm_roles(is_active) WHERE is_active = true;
CREATE INDEX IF NOT EXISTS idx_lrm_roles_order ON public.lrm_roles(display_order);

-- Comments
COMMENT ON TABLE public.lrm_roles IS 'Describes the roles/responsibilities of LRM members';

-- =====================================================
-- LRM JOIN PROCESS TABLE
-- =====================================================

CREATE TABLE IF NOT EXISTS public.lrm_join_steps (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  step_number INTEGER NOT NULL,
  title VARCHAR(255) NOT NULL,
  description TEXT NOT NULL,
  icon_name VARCHAR(50),
  requirements JSONB DEFAULT '[]', -- Array of requirement strings
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_lrm_join_active ON public.lrm_join_steps(is_active) WHERE is_active = true;
CREATE INDEX IF NOT EXISTS idx_lrm_join_order ON public.lrm_join_steps(step_number);

-- Comments
COMMENT ON TABLE public.lrm_join_steps IS 'Steps to become an LRM member';

-- =====================================================
-- LRM APPLICATIONS TABLE
-- =====================================================

CREATE TABLE IF NOT EXISTS public.lrm_applications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  first_name VARCHAR(255) NOT NULL,
  last_name VARCHAR(255) NOT NULL,
  email VARCHAR(255) NOT NULL,
  phone_number VARCHAR(50) NOT NULL,
  region_id UUID REFERENCES public.regions(id),
  district_id UUID REFERENCES public.districts(id),
  village_id UUID REFERENCES public.villages(id),
  motivation TEXT NOT NULL,
  experience TEXT,
  education VARCHAR(255),
  languages JSONB DEFAULT '[]',
  availability VARCHAR(50), -- 'Full-time', 'Part-time', 'Weekends'
  documents JSONB DEFAULT '[]', -- Array of uploaded document URLs
  status VARCHAR(50) DEFAULT 'pending', -- 'pending', 'under_review', 'approved', 'rejected'
  reviewed_by UUID REFERENCES public.users(id),
  reviewed_at TIMESTAMP WITH TIME ZONE,
  review_notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_lrm_applications_status ON public.lrm_applications(status);
CREATE INDEX IF NOT EXISTS idx_lrm_applications_region ON public.lrm_applications(region_id);
CREATE INDEX IF NOT EXISTS idx_lrm_applications_created ON public.lrm_applications(created_at DESC);

-- Constraints
ALTER TABLE public.lrm_applications
ADD CONSTRAINT chk_lrm_application_status CHECK (status IN ('pending', 'under_review', 'approved', 'rejected', 'on_hold'));

-- Comments
COMMENT ON TABLE public.lrm_applications IS 'Stores LRM membership applications';

-- =====================================================
-- TRIGGER TO UPDATE LRM MEMBER STATS
-- =====================================================

CREATE OR REPLACE FUNCTION update_lrm_member_stats()
RETURNS TRIGGER AS $$
BEGIN
  -- Update the LRM member's statistics
  UPDATE public.lrm_members
  SET
    cases_handled = (
      SELECT COUNT(*) FROM public.lrm_activities
      WHERE lrm_id = COALESCE(NEW.lrm_id, OLD.lrm_id)
    ),
    disputes_resolved = (
      SELECT COUNT(*) FROM public.lrm_activities
      WHERE lrm_id = COALESCE(NEW.lrm_id, OLD.lrm_id)
      AND activity_type = 'dispute_resolved'
    ),
    families_educated = (
      SELECT COALESCE(SUM(beneficiaries_count), 0) FROM public.lrm_activities
      WHERE lrm_id = COALESCE(NEW.lrm_id, OLD.lrm_id)
      AND activity_type IN ('education_session', 'awareness_campaign')
    )
  WHERE id = COALESCE(NEW.lrm_id, OLD.lrm_id);

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_update_lrm_stats ON public.lrm_activities;
CREATE TRIGGER trigger_update_lrm_stats
AFTER INSERT OR UPDATE OR DELETE ON public.lrm_activities
FOR EACH ROW
EXECUTE FUNCTION update_lrm_member_stats();

-- Apply updated_at trigger
DROP TRIGGER IF EXISTS trigger_lrm_members_updated ON public.lrm_members;
CREATE TRIGGER trigger_lrm_members_updated
BEFORE UPDATE ON public.lrm_members
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS trigger_lrm_activities_updated ON public.lrm_activities;
CREATE TRIGGER trigger_lrm_activities_updated
BEFORE UPDATE ON public.lrm_activities
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();