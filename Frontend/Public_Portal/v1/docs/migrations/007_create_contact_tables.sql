-- Migration: Create Contact Tables for Public Portal
-- Description: Creates tables for contact form and office management
-- Author: Development Team
-- Date: 2024-11-20

-- =====================================================
-- CONTACT SUBMISSIONS TABLE
-- =====================================================

CREATE TABLE IF NOT EXISTS public.contact_submissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  ticket_number VARCHAR(50) UNIQUE,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) NOT NULL,
  phone VARCHAR(50),
  subject VARCHAR(100) NOT NULL,
  message TEXT NOT NULL,
  category VARCHAR(50), -- 'General', 'Legal Aid', 'Partnership', 'Media', 'Other'
  source VARCHAR(50) DEFAULT 'website', -- 'website', 'email', 'phone', 'whatsapp'
  status VARCHAR(50) DEFAULT 'pending', -- 'pending', 'in_progress', 'resolved', 'closed'
  priority VARCHAR(20) DEFAULT 'normal', -- 'low', 'normal', 'high', 'urgent'
  assigned_to UUID REFERENCES public.users(id),
  response TEXT,
  responded_by UUID REFERENCES public.users(id),
  responded_at TIMESTAMP WITH TIME ZONE,
  attachments JSONB DEFAULT '[]',
  metadata JSONB DEFAULT '{}', -- Browser info, IP, etc.
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_contact_ticket ON public.contact_submissions(ticket_number);
CREATE INDEX IF NOT EXISTS idx_contact_email ON public.contact_submissions(email);
CREATE INDEX IF NOT EXISTS idx_contact_status ON public.contact_submissions(status);
CREATE INDEX IF NOT EXISTS idx_contact_priority ON public.contact_submissions(priority);
CREATE INDEX IF NOT EXISTS idx_contact_category ON public.contact_submissions(category);
CREATE INDEX IF NOT EXISTS idx_contact_assigned ON public.contact_submissions(assigned_to);
CREATE INDEX IF NOT EXISTS idx_contact_created ON public.contact_submissions(created_at DESC);

-- Constraints
ALTER TABLE public.contact_submissions
ADD CONSTRAINT chk_contact_status CHECK (status IN ('pending', 'in_progress', 'resolved', 'closed', 'spam')),
ADD CONSTRAINT chk_contact_priority CHECK (priority IN ('low', 'normal', 'high', 'urgent')),
ADD CONSTRAINT chk_contact_category CHECK (category IN ('General', 'Legal Aid', 'Partnership', 'Media', 'Donation', 'Volunteer', 'Other'));

-- Comments
COMMENT ON TABLE public.contact_submissions IS 'Stores contact form submissions';
COMMENT ON COLUMN public.contact_submissions.ticket_number IS 'Human-readable reference number';
COMMENT ON COLUMN public.contact_submissions.source IS 'Channel through which contact was made';

-- =====================================================
-- TICKET NUMBER GENERATION
-- =====================================================

CREATE OR REPLACE FUNCTION generate_contact_ticket_number()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.ticket_number IS NULL THEN
    NEW.ticket_number := 'CNT-' || TO_CHAR(NOW(), 'YYYYMMDD') || '-' ||
                        LPAD(NEXTVAL('contact_ticket_seq')::TEXT, 4, '0');
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create sequence if not exists
CREATE SEQUENCE IF NOT EXISTS contact_ticket_seq START 1;

DROP TRIGGER IF EXISTS trigger_generate_contact_ticket ON public.contact_submissions;
CREATE TRIGGER trigger_generate_contact_ticket
BEFORE INSERT ON public.contact_submissions
FOR EACH ROW
EXECUTE FUNCTION generate_contact_ticket_number();

-- =====================================================
-- OFFICE LOCATIONS TABLE
-- =====================================================

CREATE TABLE IF NOT EXISTS public.office_locations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  office_type VARCHAR(50) DEFAULT 'office', -- 'headquarters', 'regional', 'field'
  address TEXT NOT NULL,
  city VARCHAR(100),
  region VARCHAR(100),
  country VARCHAR(100) DEFAULT 'Tanzania',
  postal_code VARCHAR(20),
  phone VARCHAR(50),
  phone_secondary VARCHAR(50),
  email VARCHAR(255),
  fax VARCHAR(50),
  working_hours VARCHAR(100), -- 'Mon-Fri: 8:00 AM - 5:00 PM'
  coordinates JSONB, -- {lat, lng}
  map_url TEXT, -- Google Maps embed URL
  directions TEXT, -- Directions/landmarks
  services JSONB DEFAULT '[]', -- Array of services offered at this location
  staff_count INTEGER,
  is_headquarters BOOLEAN DEFAULT FALSE,
  is_active BOOLEAN DEFAULT TRUE,
  display_order INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_offices_type ON public.office_locations(office_type);
CREATE INDEX IF NOT EXISTS idx_offices_city ON public.office_locations(city);
CREATE INDEX IF NOT EXISTS idx_offices_region ON public.office_locations(region);
CREATE INDEX IF NOT EXISTS idx_offices_active ON public.office_locations(is_active) WHERE is_active = true;
CREATE INDEX IF NOT EXISTS idx_offices_hq ON public.office_locations(is_headquarters) WHERE is_headquarters = true;
CREATE INDEX IF NOT EXISTS idx_offices_order ON public.office_locations(display_order);

-- Constraints
ALTER TABLE public.office_locations
ADD CONSTRAINT chk_office_type CHECK (office_type IN ('headquarters', 'regional', 'field', 'partner'));

-- Comments
COMMENT ON TABLE public.office_locations IS 'Stores office location information';
COMMENT ON COLUMN public.office_locations.coordinates IS 'JSON object with lat and lng for map display';
COMMENT ON COLUMN public.office_locations.services IS 'Array of services offered at this location';

-- =====================================================
-- EXTEND FAQS TABLE
-- =====================================================

ALTER TABLE public.faqs
ADD COLUMN IF NOT EXISTS category VARCHAR(50) DEFAULT 'General',
ADD COLUMN IF NOT EXISTS display_order INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS is_featured BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT TRUE,
ADD COLUMN IF NOT EXISTS helpful_count INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS not_helpful_count INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS tags JSONB DEFAULT '[]';

-- Indexes for FAQs
CREATE INDEX IF NOT EXISTS idx_faqs_category ON public.faqs(category);
CREATE INDEX IF NOT EXISTS idx_faqs_featured ON public.faqs(is_featured) WHERE is_featured = true;
CREATE INDEX IF NOT EXISTS idx_faqs_active ON public.faqs(is_active) WHERE is_active = true;
CREATE INDEX IF NOT EXISTS idx_faqs_order ON public.faqs(display_order);
CREATE INDEX IF NOT EXISTS idx_faqs_tags ON public.faqs USING GIN(tags);

-- Constraints for FAQs
ALTER TABLE public.faqs
ADD CONSTRAINT IF NOT EXISTS chk_faq_category CHECK (category IN ('General', 'Legal Aid', 'LRM Network', 'Donations', 'Programs', 'Research', 'Contact'));

-- Comments for FAQs
COMMENT ON COLUMN public.faqs.category IS 'FAQ category for filtering';
COMMENT ON COLUMN public.faqs.helpful_count IS 'Number of times marked as helpful';

-- =====================================================
-- NEWSLETTER SUBSCRIPTIONS TABLE
-- =====================================================

CREATE TABLE IF NOT EXISTS public.newsletter_subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email VARCHAR(255) NOT NULL UNIQUE,
  name VARCHAR(255),
  status VARCHAR(50) DEFAULT 'active', -- 'active', 'unsubscribed', 'bounced'
  source VARCHAR(50) DEFAULT 'website', -- 'website', 'event', 'partner'
  interests JSONB DEFAULT '[]', -- Array of interest topics
  subscribed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  unsubscribed_at TIMESTAMP WITH TIME ZONE,
  confirmed_at TIMESTAMP WITH TIME ZONE,
  confirmation_token VARCHAR(255),
  metadata JSONB DEFAULT '{}'
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_newsletter_email ON public.newsletter_subscriptions(email);
CREATE INDEX IF NOT EXISTS idx_newsletter_status ON public.newsletter_subscriptions(status);
CREATE INDEX IF NOT EXISTS idx_newsletter_token ON public.newsletter_subscriptions(confirmation_token);

-- Constraints
ALTER TABLE public.newsletter_subscriptions
ADD CONSTRAINT chk_newsletter_status CHECK (status IN ('pending', 'active', 'unsubscribed', 'bounced'));

-- Comments
COMMENT ON TABLE public.newsletter_subscriptions IS 'Stores newsletter subscription data';

-- Apply updated_at trigger
DROP TRIGGER IF EXISTS trigger_contact_updated ON public.contact_submissions;
CREATE TRIGGER trigger_contact_updated
BEFORE UPDATE ON public.contact_submissions
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS trigger_offices_updated ON public.office_locations;
CREATE TRIGGER trigger_offices_updated
BEFORE UPDATE ON public.office_locations
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();
