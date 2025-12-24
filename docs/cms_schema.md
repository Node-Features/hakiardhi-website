
-- ============================================================================
-- MODULE 7: CONTENT MANAGEMENT SYSTEM - CMS (6 tables)
-- Public-facing content, media, and publications
-- ============================================================================

CREATE TABLE public.blogs (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  title text NOT NULL,
  content text NOT NULL,
  category_id uuid,
  author_id uuid,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  slug text NOT NULL UNIQUE,
  excerpt text,
  cover_image text,
  type character varying DEFAULT 'News'::character varying CHECK (type::text = ANY (ARRAY['News'::character varying, 'Event'::character varying, 'Announcement'::character varying, 'Update'::character varying]::text[])),
  event_date date,
  event_location character varying,
  gallery jsonb DEFAULT '[]'::jsonb,
  related_links jsonb DEFAULT '[]'::jsonb,
  is_featured boolean DEFAULT false,
  is_published boolean DEFAULT false,
  views_count integer DEFAULT 0,
  tags jsonb DEFAULT '[]'::jsonb,
  CONSTRAINT blogs_pkey PRIMARY KEY (id),
  CONSTRAINT blogs_category_id_fkey FOREIGN KEY (category_id) REFERENCES public.categories(id),
  CONSTRAINT blogs_author_id_fkey FOREIGN KEY (author_id) REFERENCES public.users(id)
);

CREATE TABLE public.blog_images (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  blog_id uuid,
  image_url text NOT NULL,
  description text,
  CONSTRAINT blog_images_pkey PRIMARY KEY (id),
  CONSTRAINT blog_images_blog_id_fkey FOREIGN KEY (blog_id) REFERENCES public.blogs(id)
);

CREATE TABLE public.publications (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  title character varying NOT NULL,
  authors jsonb DEFAULT '[]'::jsonb,
  publication_date date NOT NULL,
  type character varying NOT NULL CHECK (type::text = ANY (ARRAY['Report'::character varying, 'Policy Brief'::character varying, 'Journal Article'::character varying, 'Working Paper'::character varying, 'Positional Paper'::character varying, 'Book'::character varying, 'Book Chapter'::character varying, 'Thesis'::character varying, 'Other'::character varying]::text[])),
  topics jsonb DEFAULT '[]'::jsonb,
  abstract text NOT NULL,
  content text,
  download_url text NOT NULL,
  cover_image text,
  thumbnail_url text,
  downloads integer DEFAULT 0,
  views integer DEFAULT 0,
  is_featured boolean DEFAULT false,
  pdf_size character varying,
  pages integer,
  citation text,
  doi character varying,
  isbn character varying,
  language character varying DEFAULT 'English'::character varying,
  keywords jsonb DEFAULT '[]'::jsonb,
  related_publications jsonb DEFAULT '[]'::jsonb,
  external_links jsonb DEFAULT '[]'::jsonb,
  is_published boolean DEFAULT false,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  CONSTRAINT publications_pkey PRIMARY KEY (id)
);

CREATE TABLE public.gallery_items (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  title character varying NOT NULL,
  description text,
  image_url text NOT NULL,
  thumbnail_url text,
  category character varying,
  location character varying,
  taken_date date,
  photographer character varying,
  project_id uuid,
  activity_id uuid,
  event_id uuid,
  tags jsonb DEFAULT '[]'::jsonb,
  is_featured boolean DEFAULT false,
  is_published boolean DEFAULT false,
  views_count integer DEFAULT 0,
  display_order integer DEFAULT 0,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  CONSTRAINT gallery_items_pkey PRIMARY KEY (id),
  CONSTRAINT gallery_items_project_id_fkey FOREIGN KEY (project_id) REFERENCES public.projects(id),
  CONSTRAINT gallery_items_activity_id_fkey FOREIGN KEY (activity_id) REFERENCES public.activities(id),
  CONSTRAINT gallery_items_event_id_fkey FOREIGN KEY (event_id) REFERENCES public.blogs(id)
);

CREATE TABLE public.faqs (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  question text NOT NULL,
  response text,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  category character varying DEFAULT 'General'::character varying CHECK (category::text = ANY (ARRAY['General'::character varying, 'Legal Aid'::character varying, 'LRM Network'::character varying, 'Donations'::character varying, 'Programs'::character varying, 'Research'::character varying, 'Contact'::character varying]::text[])),
  CONSTRAINT faqs_pkey PRIMARY KEY (id)
);

CREATE TABLE public.portfolio_items (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  slug character varying NOT NULL UNIQUE,
  title character varying NOT NULL,
  subtitle character varying,
  description text NOT NULL,
  cover_image text,
  category character varying NOT NULL,
  type character varying NOT NULL CHECK (type::text = ANY (ARRAY['Case Study'::character varying, 'Project'::character varying, 'Initiative'::character varying, 'Success Story'::character varying, 'Campaign'::character varying]::text[])),
  year character varying,
  location character varying,
  beneficiaries integer,
  duration character varying,
  partner character varying,
  tags jsonb DEFAULT '[]'::jsonb,
  impact jsonb DEFAULT '[]'::jsonb,
  is_featured boolean DEFAULT false,
  challenge text,
  approach text,
  solution text,
  timeline jsonb DEFAULT '[]'::jsonb,
  testimonials jsonb DEFAULT '[]'::jsonb,
  impact_metrics jsonb DEFAULT '[]'::jsonb,
  gallery jsonb DEFAULT '[]'::jsonb,
  key_achievements jsonb DEFAULT '[]'::jsonb,
  total_budget character varying,
  funding_breakdown jsonb DEFAULT '[]'::jsonb,
  funding_sources jsonb DEFAULT '[]'::jsonb,
  needs_continued_support boolean DEFAULT false,
  support_message text,
  donate_url text,
  related_projects jsonb DEFAULT '[]'::jsonb,
  related_publications jsonb DEFAULT '[]'::jsonb,
  external_links jsonb DEFAULT '[]'::jsonb,
  is_published boolean DEFAULT false,
  published_at timestamp with time zone,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  CONSTRAINT portfolio_items_pkey PRIMARY KEY (id)
);
