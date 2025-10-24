-- Knowledge & CMS System - Database Schema
-- Publications, FAQs, Knowledge Hub for Hakiardhi

-- =====================================================
-- ENUM TYPES
-- =====================================================

CREATE TYPE publication_type AS ENUM (
  'training_manual',
  'fact_sheet',
  'poster',
  'annual_report',
  'policy_brief',
  'reader',
  'newsletter',
  'occasional_paper',
  'calendar',
  'special_publication'
);

CREATE TYPE publication_status AS ENUM (
  'draft',
  'review',
  'published',
  'archived',
  'withdrawn'
);

CREATE TYPE publication_language AS ENUM ('english', 'swahili');

CREATE TYPE access_level AS ENUM ('public', 'restricted', 'internal');

-- =====================================================
-- TABLE: publications (Knowledge/CMS)
-- =====================================================

CREATE TABLE IF NOT EXISTS publications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),

  -- Core Information
  title VARCHAR(500) NOT NULL,
  title_alternate VARCHAR(500), -- Swahili/English alternate
  slug VARCHAR(550) UNIQUE NOT NULL,
  type publication_type NOT NULL,
  description TEXT NOT NULL,

  -- Content
  file_url TEXT NOT NULL,
  file_url_low_data TEXT, -- Compressed version for rural users
  file_size_bytes BIGINT NOT NULL,
  file_size_low_data_bytes BIGINT,
  file_format VARCHAR(20) DEFAULT 'PDF',
  thumbnail_url TEXT,
  pages INTEGER,
  pdf_extracted_text TEXT, -- For search indexing

  -- Metadata
  author VARCHAR(500) NOT NULL,
  contributors TEXT[], -- Array of contributor names
  publication_year INTEGER NOT NULL CHECK (publication_year >= 1990),
  publication_date DATE NOT NULL,

  -- Classification
  themes TEXT[] NOT NULL, -- ['gender', 'land_rights', 'climate_change']
  language publication_language NOT NULL,
  audience TEXT[] NOT NULL, -- ['lrm', 'wgc', 'community', 'policymakers', 'donors']
  keywords TEXT[],

  -- Publishing Details
  isbn VARCHAR(20),
  edition VARCHAR(100),
  series VARCHAR(200),
  citation TEXT, -- Auto-generated APA citation

  -- Access Control
  access_level access_level NOT NULL DEFAULT 'public',
  status publication_status NOT NULL DEFAULT 'draft',

  -- Version Control
  version VARCHAR(20) NOT NULL DEFAULT '1.0',
  previous_version VARCHAR(20),
  version_notes TEXT,

  -- Analytics
  download_count INTEGER DEFAULT 0,
  view_count INTEGER DEFAULT 0,
  share_count INTEGER DEFAULT 0,

  -- Features
  featured BOOLEAN DEFAULT false,
  table_of_contents JSONB, -- TOC structure

  -- Related Content
  related_publication_ids UUID[],
  related_faq_count INTEGER DEFAULT 0,
  related_blog_count INTEGER DEFAULT 0,

  -- Metadata
  created_by UUID REFERENCES users(id) ON DELETE SET NULL,
  published_by UUID REFERENCES users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  published_at TIMESTAMPTZ,

  -- Search vector for full-text search
  search_vector tsvector
);

-- Indexes
CREATE INDEX idx_publications_type ON publications(type);
CREATE INDEX idx_publications_status ON publications(status);
CREATE INDEX idx_publications_language ON publications(language);
CREATE INDEX idx_publications_year ON publications(publication_year DESC);
CREATE INDEX idx_publications_access ON publications(access_level);
CREATE INDEX idx_publications_featured ON publications(featured);
CREATE INDEX idx_publications_slug ON publications(slug);
CREATE INDEX idx_publications_themes ON publications USING gin(themes);
CREATE INDEX idx_publications_audience ON publications USING gin(audience);
CREATE INDEX idx_publications_keywords ON publications USING gin(keywords);

-- Full-text search indexes
CREATE INDEX idx_publications_search_en ON publications USING gin(to_tsvector('english', coalesce(title, '') || ' ' || coalesce(description, '') || ' ' || coalesce(pdf_extracted_text, '')));
CREATE INDEX idx_publications_search_sw ON publications USING gin(to_tsvector('simple', coalesce(title, '') || ' ' || coalesce(description, ''))) WHERE language = 'swahili';

-- Unique constraint: Annual reports must have public access
CREATE OR REPLACE FUNCTION enforce_annual_report_public_access()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.type = 'annual_report' AND NEW.access_level != 'public' THEN
    NEW.access_level = 'public';
    RAISE NOTICE 'Annual report access level forced to public for transparency';
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_enforce_annual_report_public
  BEFORE INSERT OR UPDATE ON publications
  FOR EACH ROW
  EXECUTE FUNCTION enforce_annual_report_public_access();

-- =====================================================
-- TABLE: publication_versions
-- =====================================================

CREATE TABLE IF NOT EXISTS publication_versions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  publication_id UUID NOT NULL REFERENCES publications(id) ON DELETE CASCADE,
  resource_type VARCHAR(50) DEFAULT 'publication',
  version_number VARCHAR(20) NOT NULL,
  version_type VARCHAR(10) NOT NULL, -- 'major' or 'minor'
  version_notes TEXT NOT NULL,
  file_url TEXT NOT NULL,
  file_hash VARCHAR(128) NOT NULL, -- SHA-256 hash
  metadata JSONB,
  created_by UUID REFERENCES users(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  archived BOOLEAN DEFAULT false
);

CREATE INDEX idx_pub_versions_publication ON publication_versions(publication_id);
CREATE INDEX idx_pub_versions_version ON publication_versions(version_number);

-- =====================================================
-- TABLE: faqs
-- =====================================================

CREATE TABLE IF NOT EXISTS faqs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),

  -- Content
  question TEXT NOT NULL,
  answer TEXT NOT NULL,
  category VARCHAR(200) NOT NULL,

  -- Metadata
  language publication_language NOT NULL DEFAULT 'english',
  keywords TEXT[],

  -- Related Content
  related_publications UUID[], -- Links to publications
  related_blogs UUID[],

  -- Analytics
  view_count INTEGER DEFAULT 0,
  helpful_count INTEGER DEFAULT 0,
  not_helpful_count INTEGER DEFAULT 0,

  -- Status
  status publication_status NOT NULL DEFAULT 'published',
  priority INTEGER DEFAULT 0, -- Higher priority shows first

  -- Metadata
  created_by UUID REFERENCES users(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  -- Search vector
  search_vector tsvector
);

-- Indexes
CREATE INDEX idx_faqs_category ON faqs(category);
CREATE INDEX idx_faqs_language ON faqs(language);
CREATE INDEX idx_faqs_status ON faqs(status);
CREATE INDEX idx_faqs_priority ON faqs(priority DESC);
CREATE INDEX idx_faqs_keywords ON faqs USING gin(keywords);
CREATE INDEX idx_faqs_search ON faqs USING gin(to_tsvector('simple', coalesce(question, '') || ' ' || coalesce(answer, '')));

-- =====================================================
-- TABLE: chatbot_logs
-- =====================================================

CREATE TABLE IF NOT EXISTS chatbot_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),

  -- User Query
  user_query TEXT NOT NULL,
  user_id UUID REFERENCES users(id) ON DELETE SET NULL,
  session_id VARCHAR(100),

  -- Bot Response
  bot_response TEXT NOT NULL,
  matched_faq_id UUID REFERENCES faqs(id) ON DELETE SET NULL,
  confidence_score NUMERIC(3, 2), -- 0.00 to 1.00

  -- Context
  channel VARCHAR(50) NOT NULL, -- 'whatsapp', 'web', 'sms', 'mobile_app'
  language publication_language NOT NULL,

  -- Location
  ip_address VARCHAR(45),
  region VARCHAR(200),

  -- Feedback
  user_satisfied BOOLEAN,
  feedback_comment TEXT,

  -- Metadata
  timestamp TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_chatbot_channel ON chatbot_logs(channel);
CREATE INDEX idx_chatbot_language ON chatbot_logs(language);
CREATE INDEX idx_chatbot_faq ON chatbot_logs(matched_faq_id);
CREATE INDEX idx_chatbot_timestamp ON chatbot_logs(timestamp DESC);
CREATE INDEX idx_chatbot_session ON chatbot_logs(session_id);

-- =====================================================
-- TABLE: search_suggestions
-- =====================================================

CREATE TABLE IF NOT EXISTS search_suggestions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  term VARCHAR(200) UNIQUE NOT NULL,
  popularity INTEGER DEFAULT 1,
  language publication_language,
  last_used TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_search_suggestions_term ON search_suggestions(term);
CREATE INDEX idx_search_suggestions_popularity ON search_suggestions(popularity DESC);

-- =====================================================
-- TABLE: search_logs
-- =====================================================

CREATE TABLE IF NOT EXISTS search_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  query VARCHAR(500) NOT NULL,
  result_count INTEGER NOT NULL,
  user_id UUID REFERENCES users(id) ON DELETE SET NULL,
  timestamp TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_search_logs_query ON search_logs(query);
CREATE INDEX idx_search_logs_timestamp ON search_logs(timestamp DESC);

-- =====================================================
-- TABLE: publication_subscribers
-- =====================================================

CREATE TABLE IF NOT EXISTS publication_subscribers (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  publication_id UUID NOT NULL REFERENCES publications(id) ON DELETE CASCADE,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  email VARCHAR(255) NOT NULL,
  subscribed_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  UNIQUE(publication_id, email)
);

CREATE INDEX idx_pub_subscribers_publication ON publication_subscribers(publication_id);
CREATE INDEX idx_pub_subscribers_user ON publication_subscribers(user_id);

-- =====================================================
-- FUNCTIONS & TRIGGERS
-- =====================================================

-- Auto-generate slug from title
CREATE OR REPLACE FUNCTION generate_publication_slug()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.slug IS NULL OR NEW.slug = '' THEN
    NEW.slug = lower(
      regexp_replace(
        regexp_replace(NEW.title, '[^a-zA-Z0-9\s-]', '', 'g'),
        '\s+', '-', 'g'
      )
    ) || '-' || substring(gen_random_uuid()::text, 1, 8);
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_generate_publication_slug
  BEFORE INSERT ON publications
  FOR EACH ROW
  EXECUTE FUNCTION generate_publication_slug();

-- Auto-generate citation
CREATE OR REPLACE FUNCTION generate_citation()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.citation IS NULL THEN
    NEW.citation = NEW.author || ' (' || NEW.publication_year || '). ' || NEW.title || '. ' ||
      CASE WHEN NEW.edition IS NOT NULL THEN NEW.edition || '. ' ELSE '' END ||
      'Dar es Salaam: Hakiardhi.';
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_generate_citation
  BEFORE INSERT OR UPDATE ON publications
  FOR EACH ROW
  EXECUTE FUNCTION generate_citation();

-- Update search vector on insert/update
CREATE OR REPLACE FUNCTION update_publication_search_vector()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.language = 'swahili' THEN
    NEW.search_vector = to_tsvector('simple',
      coalesce(NEW.title, '') || ' ' ||
      coalesce(NEW.description, '') || ' ' ||
      coalesce(NEW.pdf_extracted_text, '') || ' ' ||
      coalesce(array_to_string(NEW.keywords, ' '), '')
    );
  ELSE
    NEW.search_vector = to_tsvector('english',
      coalesce(NEW.title, '') || ' ' ||
      coalesce(NEW.description, '') || ' ' ||
      coalesce(NEW.pdf_extracted_text, '') || ' ' ||
      coalesce(array_to_string(NEW.keywords, ' '), '')
    );
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_publication_search
  BEFORE INSERT OR UPDATE ON publications
  FOR EACH ROW
  EXECUTE FUNCTION update_publication_search_vector();

-- Update FAQ search vector
CREATE OR REPLACE FUNCTION update_faq_search_vector()
RETURNS TRIGGER AS $$
BEGIN
  NEW.search_vector = to_tsvector('simple',
    coalesce(NEW.question, '') || ' ' ||
    coalesce(NEW.answer, '') || ' ' ||
    coalesce(array_to_string(NEW.keywords, ' '), '')
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_faq_search
  BEFORE INSERT OR UPDATE ON faqs
  FOR EACH ROW
  EXECUTE FUNCTION update_faq_search_vector();

-- Increment search suggestion popularity
CREATE OR REPLACE FUNCTION increment_search_popularity(search_term VARCHAR)
RETURNS VOID AS $$
BEGIN
  INSERT INTO search_suggestions (term, popularity, last_used)
  VALUES (search_term, 1, NOW())
  ON CONFLICT (term) DO UPDATE
  SET popularity = search_suggestions.popularity + 1,
      last_used = NOW();
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- ROW LEVEL SECURITY (RLS)
-- =====================================================

-- Publications RLS
ALTER TABLE publications ENABLE ROW LEVEL SECURITY;

CREATE POLICY publications_public_read ON publications
  FOR SELECT
  USING (status = 'published' AND access_level = 'public');

CREATE POLICY publications_auth_read ON publications
  FOR SELECT
  USING (
    auth.jwt() IS NOT NULL AND (
      status = 'published' OR
      auth.jwt() ->> 'role' IN ('admin', 'editor', 'knowledge_officer')
    )
  );

CREATE POLICY publications_admin_all ON publications
  FOR ALL
  USING (auth.jwt() ->> 'role' IN ('admin', 'editor', 'knowledge_officer'));

-- FAQs RLS
ALTER TABLE faqs ENABLE ROW LEVEL SECURITY;

CREATE POLICY faqs_public_read ON faqs
  FOR SELECT
  USING (status = 'published');

CREATE POLICY faqs_admin_all ON faqs
  FOR ALL
  USING (auth.jwt() ->> 'role' IN ('admin', 'editor', 'knowledge_officer'));

-- =====================================================
-- VIEWS
-- =====================================================

-- View: Featured Publications
CREATE OR REPLACE VIEW featured_publications AS
SELECT
  id, title, title_alternate, type, description,
  file_url, file_url_low_data, thumbnail_url,
  author, publication_year, publication_date,
  themes, language, audience, download_count,
  view_count
FROM publications
WHERE featured = true
  AND status = 'published'
  AND access_level = 'public'
ORDER BY publication_date DESC;

-- View: Popular FAQs
CREATE OR REPLACE VIEW popular_faqs AS
SELECT
  id, question, answer, category, language,
  view_count, helpful_count,
  CASE
    WHEN (helpful_count + not_helpful_count) > 0
    THEN (helpful_count::float / (helpful_count + not_helpful_count) * 100)
    ELSE 0
  END as helpful_rate
FROM faqs
WHERE status = 'published'
ORDER BY view_count DESC, helpful_rate DESC
LIMIT 50;

COMMENT ON TABLE publications IS 'Knowledge management - publications, training materials, fact sheets, reports';
COMMENT ON TABLE faqs IS 'Frequently asked questions for chatbot and knowledge hub';
COMMENT ON TABLE chatbot_logs IS 'Chatbot interaction logs for analytics and improvement';
COMMENT ON TABLE publication_versions IS 'Version history for publications with accountability';
