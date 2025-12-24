
-- ============================================================================
-- MODULE 9: PARTNERS & COLLABORATION (2 tables)
-- Partnership and collaboration tracking
-- ============================================================================

CREATE TABLE public.partners (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  name character varying NOT NULL,
  slug character varying UNIQUE,
  logo_url text,
  logo_url_dark text,
  website_url text,
  description text,
  partner_type character varying NOT NULL CHECK (partner_type::text = ANY (ARRAY['donor'::character varying, 'implementing'::character varying, 'research'::character varying, 'government'::character varying, 'academic'::character varying, 'ngo'::character varying, 'private_sector'::character varying, 'international'::character varying]::text[])),
  partnership_level character varying CHECK (partnership_level::text = ANY (ARRAY['strategic'::character varying, 'project'::character varying, 'network'::character varying, 'supporter'::character varying]::text[])),
  partnership_start date,
  partnership_end date,
  contact_name character varying,
  contact_email character varying,
  contact_phone character varying,
  projects_count integer DEFAULT 0,
  total_funding numeric,
  funding_currency character varying DEFAULT 'TZS'::character varying,
  country character varying,
  social_links jsonb DEFAULT '{}'::jsonb,
  featured_projects jsonb DEFAULT '[]'::jsonb,
  is_active boolean DEFAULT true,
  is_featured boolean DEFAULT false,
  display_order integer DEFAULT 0,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  CONSTRAINT partners_pkey PRIMARY KEY (id)
);

CREATE TABLE public.research_partners (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  name character varying NOT NULL,
  logo_url text,
  website_url text,
  description text,
  partner_type character varying,
  display_order integer DEFAULT 0,
  is_active boolean DEFAULT true,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  CONSTRAINT research_partners_pkey PRIMARY KEY (id)
);
