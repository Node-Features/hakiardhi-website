
-- ============================================================================
-- MODULE 8: ORGANIZATION (6 tables)
-- Organization profile, team, credibility, and testimonials
-- ============================================================================

CREATE TABLE public.organization_content (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  content_type character varying NOT NULL CHECK (content_type::text = ANY (ARRAY['vision'::character varying, 'mission'::character varying, 'who_we_are'::character varying, 'value'::character varying, 'history'::character varying, 'approach'::character varying]::text[])),
  title character varying,
  content text NOT NULL,
  icon_name character varying,
  display_order integer DEFAULT 0,
  is_active boolean DEFAULT true,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  CONSTRAINT organization_content_pkey PRIMARY KEY (id)
);

CREATE TABLE public.organization_milestones (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  year character varying NOT NULL,
  title character varying NOT NULL,
  description text NOT NULL,
  icon_name character varying,
  display_order integer DEFAULT 0,
  is_active boolean DEFAULT true,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  CONSTRAINT organization_milestones_pkey PRIMARY KEY (id)
);

CREATE TABLE public.team_members (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  name character varying NOT NULL,
  role character varying NOT NULL,
  department character varying,
  bio text,
  image_url text,
  email character varying,
  phone character varying,
  linkedin_url text,
  twitter_url text,
  member_type character varying NOT NULL CHECK (member_type::text = ANY (ARRAY['leadership'::character varying, 'board'::character varying, 'staff'::character varying, 'advisor'::character varying]::text[])),
  display_order integer DEFAULT 0,
  is_active boolean DEFAULT true,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  CONSTRAINT team_members_pkey PRIMARY KEY (id)
);

CREATE TABLE public.office_locations (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  name character varying NOT NULL,
  office_type character varying DEFAULT 'office'::character varying CHECK (office_type::text = ANY (ARRAY['headquarters'::character varying, 'regional'::character varying, 'field'::character varying, 'partner'::character varying]::text[])),
  address text NOT NULL,
  city character varying,
  region character varying,
  country character varying DEFAULT 'Tanzania'::character varying,
  postal_code character varying,
  phone character varying,
  phone_secondary character varying,
  email character varying,
  fax character varying,
  working_hours character varying,
  coordinates jsonb,
  map_url text,
  directions text,
  services jsonb DEFAULT '[]'::jsonb,
  staff_count integer,
  is_headquarters boolean DEFAULT false,
  is_active boolean DEFAULT true,
  display_order integer DEFAULT 0,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  CONSTRAINT office_locations_pkey PRIMARY KEY (id)
);

CREATE TABLE public.social_proof (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  type character varying NOT NULL CHECK (type::text = ANY (ARRAY['award'::character varying, 'certification'::character varying, 'recognition'::character varying, 'media_mention'::character varying, 'ranking'::character varying]::text[])),
  title character varying NOT NULL,
  description text,
  image_url text,
  source character varying,
  source_url text,
  date_received date,
  is_featured boolean DEFAULT false,
  display_order integer DEFAULT 0,
  created_at timestamp with time zone DEFAULT now(),
  CONSTRAINT social_proof_pkey PRIMARY KEY (id)
);

CREATE TABLE public.testimonials (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  quote text NOT NULL,
  author_name character varying NOT NULL,
  author_role character varying,
  author_location character varying,
  author_image text,
  author_type character varying CHECK (author_type::text = ANY (ARRAY['beneficiary'::character varying, 'partner'::character varying, 'staff'::character varying, 'lrm'::character varying, 'community_leader'::character varying, 'government'::character varying]::text[])),
  project_id uuid,
  case_id uuid,
  portfolio_item_id uuid,
  rating integer CHECK (rating >= 1 AND rating <= 5),
  video_url text,
  is_featured boolean DEFAULT false,
  is_published boolean DEFAULT false,
  display_order integer DEFAULT 0,
  approved_by uuid,
  approved_at timestamp with time zone,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  CONSTRAINT testimonials_pkey PRIMARY KEY (id),
  CONSTRAINT testimonials_project_id_fkey FOREIGN KEY (project_id) REFERENCES public.projects(id),
  CONSTRAINT testimonials_case_id_fkey FOREIGN KEY (case_id) REFERENCES public.cases(id),
  CONSTRAINT testimonials_portfolio_item_id_fkey FOREIGN KEY (portfolio_item_id) REFERENCES public.portfolio_items(id),
  CONSTRAINT testimonials_approved_by_fkey FOREIGN KEY (approved_by) REFERENCES public.users(id)
);

CREATE TABLE public.impact_statistics (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  stat_key character varying NOT NULL UNIQUE,
  label character varying NOT NULL,
  value integer NOT NULL,
  value_suffix character varying,
  description text,
  icon_name character varying,
  category character varying,
  display_order integer DEFAULT 0,
  is_public boolean DEFAULT true,
  last_calculated timestamp with time zone DEFAULT now(),
  calculation_query text,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  CONSTRAINT impact_statistics_pkey PRIMARY KEY (id)
);
