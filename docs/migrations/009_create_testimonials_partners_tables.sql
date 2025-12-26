-- Migration: Create Testimonials & Partners Tables for Public Portal
-- Description: Creates tables for testimonials and partner organizations
-- Author: Development Team
-- Date: 2024-11-20

-- =====================================================
-- TESTIMONIALS TABLE
-- =====================================================

CREATE TABLE IF NOT EXISTS public.testimonials (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  quote TEXT NOT NULL,
  author_name VARCHAR(255) NOT NULL,
  author_role VARCHAR(255), -- 'Community Member', 'LRM', 'Partner'
  author_location VARCHAR(255), -- 'Morogoro, Tanzania'
  author_image TEXT,
  author_type VARCHAR(50), -- 'beneficiary', 'partner', 'staff', 'lrm'
  project_id UUID REFERENCES public.projects(id),
  case_id UUID REFERENCES public.cases(id),
  portfolio_item_id UUID REFERENCES public.portfolio_items(id),
  rating INTEGER CHECK (rating >= 1 AND rating <= 5),
  video_url TEXT,
  is_featured BOOLEAN DEFAULT FALSE,
  is_published BOOLEAN DEFAULT FALSE,
  display_order INTEGER DEFAULT 0,
  approved_by UUID REFERENCES public.users(id),
  approved_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_testimonials_featured ON public.testimonials(is_featured) WHERE is_featured = true;
CREATE INDEX IF NOT EXISTS idx_testimonials_published ON public.testimonials(is_published) WHERE is_published = true;
CREATE INDEX IF NOT EXISTS idx_testimonials_type ON public.testimonials(author_type);
CREATE INDEX IF NOT EXISTS idx_testimonials_project ON public.testimonials(project_id);
CREATE INDEX IF NOT EXISTS idx_testimonials_order ON public.testimonials(display_order);

-- Constraints
ALTER TABLE public.testimonials
ADD CONSTRAINT chk_testimonial_author_type CHECK (author_type IN ('beneficiary', 'partner', 'staff', 'lrm', 'community_leader', 'government'));

-- Comments
COMMENT ON TABLE public.testimonials IS 'Stores testimonials from beneficiaries and partners';
COMMENT ON COLUMN public.testimonials.author_type IS 'Type of person giving testimonial';
COMMENT ON COLUMN public.testimonials.rating IS 'Optional star rating 1-5';

-- =====================================================
-- PARTNERS TABLE
-- =====================================================

CREATE TABLE IF NOT EXISTS public.partners (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  slug VARCHAR(255) UNIQUE,
  logo_url TEXT,
  logo_url_dark TEXT, -- Alternative logo for dark backgrounds
  website_url TEXT,
  description TEXT,
  partner_type VARCHAR(50) NOT NULL, -- 'donor', 'implementing', 'research', 'government'
  partnership_level VARCHAR(50), -- 'strategic', 'project', 'network'
  partnership_start DATE,
  partnership_end DATE, -- NULL if ongoing
  contact_name VARCHAR(255),
  contact_email VARCHAR(255),
  contact_phone VARCHAR(50),
  projects_count INTEGER DEFAULT 0,
  total_funding DECIMAL(15,2),
  funding_currency VARCHAR(3) DEFAULT 'TZS',
  country VARCHAR(100),
  social_links JSONB DEFAULT '{}', -- {twitter, linkedin, facebook}
  featured_projects JSONB DEFAULT '[]', -- Array of project IDs
  is_active BOOLEAN DEFAULT TRUE,
  is_featured BOOLEAN DEFAULT FALSE,
  display_order INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_partners_slug ON public.partners(slug);
CREATE INDEX IF NOT EXISTS idx_partners_type ON public.partners(partner_type);
CREATE INDEX IF NOT EXISTS idx_partners_level ON public.partners(partnership_level);
CREATE INDEX IF NOT EXISTS idx_partners_active ON public.partners(is_active) WHERE is_active = true;
CREATE INDEX IF NOT EXISTS idx_partners_featured ON public.partners(is_featured) WHERE is_featured = true;
CREATE INDEX IF NOT EXISTS idx_partners_order ON public.partners(display_order);

-- Constraints
ALTER TABLE public.partners
ADD CONSTRAINT chk_partner_type CHECK (partner_type IN ('donor', 'implementing', 'research', 'government', 'academic', 'ngo', 'private_sector', 'international')),
ADD CONSTRAINT chk_partnership_level CHECK (partnership_level IN ('strategic', 'project', 'network', 'supporter'));

-- Comments
COMMENT ON TABLE public.partners IS 'Stores partner organization information';
COMMENT ON COLUMN public.partners.partner_type IS 'Type of partnership relationship';
COMMENT ON COLUMN public.partners.partnership_level IS 'Level/tier of partnership';

-- =====================================================
-- GALLERY ITEMS TABLE
-- =====================================================

CREATE TABLE IF NOT EXISTS public.gallery_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title VARCHAR(255) NOT NULL,
  description TEXT,
  image_url TEXT NOT NULL,
  thumbnail_url TEXT,
  category VARCHAR(100), -- 'Events', 'Field Work', 'Training', 'Community'
  location VARCHAR(255),
  taken_date DATE,
  photographer VARCHAR(255),
  project_id UUID REFERENCES public.projects(id),
  activity_id UUID REFERENCES public.activities(id),
  event_id UUID REFERENCES public.blogs(id), -- If type is Event
  tags JSONB DEFAULT '[]',
  is_featured BOOLEAN DEFAULT FALSE,
  is_published BOOLEAN DEFAULT FALSE,
  views_count INTEGER DEFAULT 0,
  display_order INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_gallery_category ON public.gallery_items(category);
CREATE INDEX IF NOT EXISTS idx_gallery_featured ON public.gallery_items(is_featured) WHERE is_featured = true;
CREATE INDEX IF NOT EXISTS idx_gallery_published ON public.gallery_items(is_published) WHERE is_published = true;
CREATE INDEX IF NOT EXISTS idx_gallery_project ON public.gallery_items(project_id);
CREATE INDEX IF NOT EXISTS idx_gallery_date ON public.gallery_items(taken_date DESC);
CREATE INDEX IF NOT EXISTS idx_gallery_tags ON public.gallery_items USING GIN(tags);

-- Comments
COMMENT ON TABLE public.gallery_items IS 'Stores photo gallery for public portal';

-- =====================================================
-- IMPACT STATISTICS TABLE
-- =====================================================

CREATE TABLE IF NOT EXISTS public.impact_statistics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  stat_key VARCHAR(100) NOT NULL UNIQUE, -- 'beneficiaries_reached', 'cases_resolved'
  label VARCHAR(255) NOT NULL,
  value INTEGER NOT NULL,
  value_suffix VARCHAR(50), -- '+', '%', 'K'
  description TEXT,
  icon_name VARCHAR(50),
  category VARCHAR(100), -- 'overall', 'legal_aid', 'programs', 'lrm'
  display_order INTEGER DEFAULT 0,
  is_public BOOLEAN DEFAULT TRUE,
  last_calculated TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  calculation_query TEXT, -- SQL query to calculate this stat
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_impact_stats_key ON public.impact_statistics(stat_key);
CREATE INDEX IF NOT EXISTS idx_impact_stats_category ON public.impact_statistics(category);
CREATE INDEX IF NOT EXISTS idx_impact_stats_public ON public.impact_statistics(is_public) WHERE is_public = true;
CREATE INDEX IF NOT EXISTS idx_impact_stats_order ON public.impact_statistics(display_order);

-- Comments
COMMENT ON TABLE public.impact_statistics IS 'Stores calculated impact statistics for display';
COMMENT ON COLUMN public.impact_statistics.stat_key IS 'Unique identifier for the statistic';
COMMENT ON COLUMN public.impact_statistics.calculation_query IS 'SQL query used to calculate this stat';

-- =====================================================
-- SOCIAL PROOF ITEMS TABLE
-- =====================================================

CREATE TABLE IF NOT EXISTS public.social_proof (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  type VARCHAR(50) NOT NULL, -- 'award', 'certification', 'recognition', 'media_mention'
  title VARCHAR(255) NOT NULL,
  description TEXT,
  image_url TEXT,
  source VARCHAR(255), -- Organization or media that gave the recognition
  source_url TEXT,
  date_received DATE,
  is_featured BOOLEAN DEFAULT FALSE,
  display_order INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_social_proof_type ON public.social_proof(type);
CREATE INDEX IF NOT EXISTS idx_social_proof_featured ON public.social_proof(is_featured) WHERE is_featured = true;
CREATE INDEX IF NOT EXISTS idx_social_proof_date ON public.social_proof(date_received DESC);

-- Constraints
ALTER TABLE public.social_proof
ADD CONSTRAINT chk_social_proof_type CHECK (type IN ('award', 'certification', 'recognition', 'media_mention', 'ranking'));

-- Comments
COMMENT ON TABLE public.social_proof IS 'Stores awards, certifications, and media mentions';

-- Apply updated_at trigger
DROP TRIGGER IF EXISTS trigger_testimonials_updated ON public.testimonials;
CREATE TRIGGER trigger_testimonials_updated
BEFORE UPDATE ON public.testimonials
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS trigger_partners_updated ON public.partners;
CREATE TRIGGER trigger_partners_updated
BEFORE UPDATE ON public.partners
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS trigger_gallery_updated ON public.gallery_items;
CREATE TRIGGER trigger_gallery_updated
BEFORE UPDATE ON public.gallery_items
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS trigger_impact_stats_updated ON public.impact_statistics;
CREATE TRIGGER trigger_impact_stats_updated
BEFORE UPDATE ON public.impact_statistics
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- SEED DATA: Impact Statistics
-- =====================================================

INSERT INTO public.impact_statistics (stat_key, label, value, value_suffix, icon_name, category, display_order) VALUES
('beneficiaries_reached', 'Beneficiaries Reached', 50000, '+', 'Users', 'overall', 1),
('cases_resolved', 'Cases Resolved', 2500, '+', 'Scale', 'legal_aid', 2),
('land_secured_hectares', 'Hectares of Land Secured', 15000, '+', 'MapPin', 'overall', 3),
('lrm_trained', 'LRMs Trained', 500, '+', 'GraduationCap', 'lrm', 4),
('regions_covered', 'Regions Covered', 20, '', 'Map', 'overall', 5),
('publications_produced', 'Publications Produced', 150, '+', 'BookOpen', 'overall', 6)
ON CONFLICT (stat_key) DO UPDATE SET
  value = EXCLUDED.value,
  updated_at = NOW();
