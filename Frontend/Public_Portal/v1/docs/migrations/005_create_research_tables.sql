-- Migration: Create Research Tables for Public Portal
-- Description: Creates tables for publications and research content
-- Author: Development Team
-- Date: 2024-11-20

-- =====================================================
-- PUBLICATIONS TABLE
-- =====================================================

CREATE TABLE IF NOT EXISTS public.publications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title VARCHAR(500) NOT NULL,
  authors JSONB DEFAULT '[]', -- Array of author names
  publication_date DATE NOT NULL,
  type VARCHAR(50) NOT NULL, -- 'Report', 'Policy Brief', 'Journal Article', etc.
  topics JSONB DEFAULT '[]', -- Array of topic strings
  abstract TEXT NOT NULL,
  content TEXT, -- Full text content (optional)
  download_url TEXT NOT NULL,
  cover_image TEXT,
  thumbnail_url TEXT,
  downloads INTEGER DEFAULT 0,
  views INTEGER DEFAULT 0,
  is_featured BOOLEAN DEFAULT FALSE,
  pdf_size VARCHAR(20),
  pages INTEGER,
  citation TEXT,
  doi VARCHAR(100),
  isbn VARCHAR(20),
  language VARCHAR(50) DEFAULT 'English',
  keywords JSONB DEFAULT '[]',
  related_publications JSONB DEFAULT '[]', -- Array of publication IDs
  external_links JSONB DEFAULT '[]', -- Array of {title, url}
  is_published BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_publications_type ON public.publications(type);
CREATE INDEX IF NOT EXISTS idx_publications_date ON public.publications(publication_date DESC);
CREATE INDEX IF NOT EXISTS idx_publications_featured ON public.publications(is_featured) WHERE is_featured = true;
CREATE INDEX IF NOT EXISTS idx_publications_published ON public.publications(is_published) WHERE is_published = true;
CREATE INDEX IF NOT EXISTS idx_publications_topics ON public.publications USING GIN(topics);
CREATE INDEX IF NOT EXISTS idx_publications_keywords ON public.publications USING GIN(keywords);
CREATE INDEX IF NOT EXISTS idx_publications_downloads ON public.publications(downloads DESC);

-- Constraints
ALTER TABLE public.publications
ADD CONSTRAINT chk_publications_type CHECK (type IN ('Report', 'Policy Brief', 'Journal Article', 'Working Paper', 'Positional Paper', 'Book', 'Book Chapter', 'Thesis', 'Other'));

-- Comments
COMMENT ON TABLE public.publications IS 'Stores research publications and documents';
COMMENT ON COLUMN public.publications.authors IS 'Array of author name strings';
COMMENT ON COLUMN public.publications.topics IS 'Array of topic/category strings';
COMMENT ON COLUMN public.publications.doi IS 'Digital Object Identifier';
COMMENT ON COLUMN public.publications.pdf_size IS 'Human-readable file size (e.g., "2.5 MB")';

-- =====================================================
-- RESEARCH AREAS TABLE
-- =====================================================

CREATE TABLE IF NOT EXISTS public.research_areas (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL UNIQUE,
  slug VARCHAR(255) UNIQUE,
  description TEXT,
  icon_name VARCHAR(50),
  cover_image TEXT,
  publication_count INTEGER DEFAULT 0, -- Updated via trigger
  display_order INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_research_areas_slug ON public.research_areas(slug);
CREATE INDEX IF NOT EXISTS idx_research_areas_active ON public.research_areas(is_active) WHERE is_active = true;
CREATE INDEX IF NOT EXISTS idx_research_areas_order ON public.research_areas(display_order);

-- Comments
COMMENT ON TABLE public.research_areas IS 'Stores research focus areas/themes';
COMMENT ON COLUMN public.research_areas.publication_count IS 'Cached count of publications in this area';

-- =====================================================
-- RESEARCH PARTNERS TABLE
-- =====================================================

CREATE TABLE IF NOT EXISTS public.research_partners (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  logo_url TEXT,
  website_url TEXT,
  description TEXT,
  partner_type VARCHAR(50), -- 'Academic', 'NGO', 'Government', 'International'
  display_order INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_research_partners_type ON public.research_partners(partner_type);
CREATE INDEX IF NOT EXISTS idx_research_partners_active ON public.research_partners(is_active) WHERE is_active = true;

-- =====================================================
-- DOWNLOAD TRACKING FUNCTION
-- =====================================================

CREATE OR REPLACE FUNCTION increment_publication_downloads(pub_id UUID)
RETURNS VOID AS $$
BEGIN
  UPDATE public.publications
  SET downloads = downloads + 1
  WHERE id = pub_id;
END;
$$ LANGUAGE plpgsql;

-- Function to increment view count
CREATE OR REPLACE FUNCTION increment_publication_views(pub_id UUID)
RETURNS VOID AS $$
BEGIN
  UPDATE public.publications
  SET views = views + 1
  WHERE id = pub_id;
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- TRIGGER TO UPDATE RESEARCH AREA PUBLICATION COUNT
-- =====================================================

CREATE OR REPLACE FUNCTION update_research_area_count()
RETURNS TRIGGER AS $$
DECLARE
  topic_text TEXT;
BEGIN
  -- Update counts for all research areas
  UPDATE public.research_areas ra
  SET publication_count = (
    SELECT COUNT(*)
    FROM public.publications p
    WHERE p.is_published = true
    AND ra.name = ANY(SELECT jsonb_array_elements_text(p.topics))
  );
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_update_research_area_count ON public.publications;
CREATE TRIGGER trigger_update_research_area_count
AFTER INSERT OR UPDATE OR DELETE ON public.publications
FOR EACH STATEMENT
EXECUTE FUNCTION update_research_area_count();

-- Apply updated_at trigger
DROP TRIGGER IF EXISTS trigger_publications_updated ON public.publications;
CREATE TRIGGER trigger_publications_updated
BEFORE UPDATE ON public.publications
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS trigger_research_areas_updated ON public.research_areas;
CREATE TRIGGER trigger_research_areas_updated
BEFORE UPDATE ON public.research_areas
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- PUBLICATION TYPES VIEW
-- =====================================================

CREATE OR REPLACE VIEW public.v_publication_types AS
SELECT DISTINCT type, COUNT(*) as count
FROM public.publications
WHERE is_published = true
GROUP BY type
ORDER BY count DESC;

-- =====================================================
-- PUBLICATION TOPICS VIEW
-- =====================================================

CREATE OR REPLACE VIEW public.v_publication_topics AS
SELECT topic, COUNT(*) as count
FROM public.publications,
     jsonb_array_elements_text(topics) as topic
WHERE is_published = true
GROUP BY topic
ORDER BY count DESC;
