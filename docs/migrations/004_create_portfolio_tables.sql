-- Migration: Create Portfolio Tables for Public Portal
-- Description: Creates portfolio_items table for showcasing work
-- Author: Development Team
-- Date: 2024-11-20

-- =====================================================
-- PORTFOLIO ITEMS TABLE
-- =====================================================

CREATE TABLE IF NOT EXISTS public.portfolio_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug VARCHAR(255) UNIQUE NOT NULL,
  title VARCHAR(255) NOT NULL,
  subtitle VARCHAR(255),
  description TEXT NOT NULL,
  cover_image TEXT,
  category VARCHAR(100) NOT NULL,
  type VARCHAR(50) NOT NULL, -- 'Case Study', 'Project', 'Initiative', 'Success Story'
  year VARCHAR(20),
  location VARCHAR(255),
  beneficiaries INTEGER,
  duration VARCHAR(100),
  partner VARCHAR(255),
  tags JSONB DEFAULT '[]',
  impact JSONB DEFAULT '[]',
  is_featured BOOLEAN DEFAULT FALSE,

  -- Impact Storytelling
  challenge TEXT,
  approach TEXT,
  solution TEXT,
  timeline JSONB DEFAULT '[]', -- Array of {date, title, description}
  testimonials JSONB DEFAULT '[]', -- Array of {quote, author, role, image}
  impact_metrics JSONB DEFAULT '[]', -- Array of {label, value, icon, description}
  gallery JSONB DEFAULT '[]', -- Array of {url, caption}
  key_achievements JSONB DEFAULT '[]', -- Array of strings

  -- Fundraising/Support
  total_budget VARCHAR(50),
  funding_breakdown JSONB DEFAULT '[]', -- Array of {category, amount, percentage}
  funding_sources JSONB DEFAULT '[]', -- Array of {name, logo}
  needs_continued_support BOOLEAN DEFAULT FALSE,
  support_message TEXT,
  donate_url TEXT,

  -- Related Content
  related_projects JSONB DEFAULT '[]', -- Array of project IDs
  related_publications JSONB DEFAULT '[]', -- Array of publication IDs
  external_links JSONB DEFAULT '[]', -- Array of {title, url}

  -- Meta
  is_published BOOLEAN DEFAULT FALSE,
  published_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_portfolio_slug ON public.portfolio_items(slug);
CREATE INDEX IF NOT EXISTS idx_portfolio_category ON public.portfolio_items(category);
CREATE INDEX IF NOT EXISTS idx_portfolio_type ON public.portfolio_items(type);
CREATE INDEX IF NOT EXISTS idx_portfolio_year ON public.portfolio_items(year);
CREATE INDEX IF NOT EXISTS idx_portfolio_featured ON public.portfolio_items(is_featured) WHERE is_featured = true;
CREATE INDEX IF NOT EXISTS idx_portfolio_published ON public.portfolio_items(is_published) WHERE is_published = true;
CREATE INDEX IF NOT EXISTS idx_portfolio_tags ON public.portfolio_items USING GIN(tags);
CREATE INDEX IF NOT EXISTS idx_portfolio_created ON public.portfolio_items(created_at DESC);

-- Constraints
ALTER TABLE public.portfolio_items
ADD CONSTRAINT chk_portfolio_type CHECK (type IN ('Case Study', 'Project', 'Initiative', 'Success Story', 'Campaign'));

-- Comments
COMMENT ON TABLE public.portfolio_items IS 'Stores portfolio/work showcase items';
COMMENT ON COLUMN public.portfolio_items.slug IS 'URL-friendly identifier for public access';
COMMENT ON COLUMN public.portfolio_items.type IS 'Content type: Case Study, Project, Initiative, Success Story';
COMMENT ON COLUMN public.portfolio_items.challenge IS 'Description of the problem/challenge addressed';
COMMENT ON COLUMN public.portfolio_items.approach IS 'Description of the approach taken';
COMMENT ON COLUMN public.portfolio_items.solution IS 'Description of the solution implemented';
COMMENT ON COLUMN public.portfolio_items.timeline IS 'Array of milestone objects with date, title, description';
COMMENT ON COLUMN public.portfolio_items.impact_metrics IS 'Array of impact statistics with label, value, icon';
COMMENT ON COLUMN public.portfolio_items.needs_continued_support IS 'Flag indicating if project needs ongoing support';

-- Function to auto-generate slug from title
CREATE OR REPLACE FUNCTION generate_portfolio_slug()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.slug IS NULL OR NEW.slug = '' THEN
    NEW.slug := LOWER(REGEXP_REPLACE(NEW.title, '[^a-zA-Z0-9]+', '-', 'g'));
    NEW.slug := TRIM(BOTH '-' FROM NEW.slug);
    -- Add suffix if slug exists
    IF EXISTS (SELECT 1 FROM public.portfolio_items WHERE slug = NEW.slug AND id != COALESCE(NEW.id, '00000000-0000-0000-0000-000000000000'::uuid)) THEN
      NEW.slug := NEW.slug || '-' || EXTRACT(EPOCH FROM NOW())::integer;
    END IF;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for auto-generating slug
DROP TRIGGER IF EXISTS trigger_generate_portfolio_slug ON public.portfolio_items;
CREATE TRIGGER trigger_generate_portfolio_slug
BEFORE INSERT OR UPDATE ON public.portfolio_items
FOR EACH ROW
EXECUTE FUNCTION generate_portfolio_slug();

-- Apply updated_at trigger
DROP TRIGGER IF EXISTS trigger_portfolio_updated ON public.portfolio_items;
CREATE TRIGGER trigger_portfolio_updated
BEFORE UPDATE ON public.portfolio_items
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- PORTFOLIO CATEGORIES VIEW
-- =====================================================

CREATE OR REPLACE VIEW public.v_portfolio_categories AS
SELECT DISTINCT category, COUNT(*) as count
FROM public.portfolio_items
WHERE is_published = true
GROUP BY category
ORDER BY category;
