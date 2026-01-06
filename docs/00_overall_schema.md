-- ============================================================================
-- HAKIARDHI DIGITAL ECOSYSTEM - DATABASE SCHEMA
-- ============================================================================
-- WARNING: This schema is for context only and is not meant to be run.
-- Table order and constraints may not be valid for execution.
--
-- Total Tables: 67
-- Organized into 15 logical modules
-- ============================================================================


-- ============================================================================
-- MODULE 1: ACTIVITY MANAGEMENT (5 tables)
-- Core activity tracking with assignments, beneficiaries, locations, and files
-- ============================================================================

CREATE TABLE public.activities (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  name text NOT NULL,
  project_id uuid,
  category_id uuid,
  start_date date,
  end_date date,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  status USER-DEFINED DEFAULT 'Pending'::activity_types,
  target_outcome bigint DEFAULT '0'::bigint,
  actual_outcome bigint DEFAULT '0'::bigint,
  success_rate numeric,
  CONSTRAINT activities_pkey PRIMARY KEY (id),
  CONSTRAINT activities_project_id_fkey FOREIGN KEY (project_id) REFERENCES public.projects(id),
  CONSTRAINT activities_category_id_fkey FOREIGN KEY (category_id) REFERENCES public.categories(id)
);

CREATE TABLE public.activity_assignments (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  activity_id uuid,
  assigned_to uuid,
  due_date date,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  project_location_id uuid,
  status USER-DEFINED DEFAULT 'Pending'::activity_types,
  CONSTRAINT activity_assignments_pkey PRIMARY KEY (id),
  CONSTRAINT activity_assignments_activity_id_fkey FOREIGN KEY (activity_id) REFERENCES public.activities(id),
  CONSTRAINT activity_assignments_assigned_to_fkey FOREIGN KEY (assigned_to) REFERENCES public.users(id),
  CONSTRAINT activity_assignments_project_location_id_fkey FOREIGN KEY (project_location_id) REFERENCES public.project_locations(id)
);

CREATE TABLE public.activity_beneficiaries (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  activity_id uuid NOT NULL,
  beneficiary_id uuid NOT NULL,
  role_in_activity text,
  attended boolean DEFAULT true,
  feedback text,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  CONSTRAINT activity_beneficiaries_pkey PRIMARY KEY (id),
  CONSTRAINT activity_beneficiaries_activity_id_fkey FOREIGN KEY (activity_id) REFERENCES public.activities(id),
  CONSTRAINT activity_beneficiaries_beneficiary_id_fkey FOREIGN KEY (beneficiary_id) REFERENCES public.beneficiaries(id)
);

CREATE TABLE public.activity_files (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  activity_id uuid,
  project_id uuid,
  entity_type text NOT NULL DEFAULT 'activity'::text,
  file_url text NOT NULL,
  processed_url text,
  storage_path text,
  file_name text,
  file_type text DEFAULT 'unknown'::text,
  mime_type text,
  size bigint DEFAULT 0,
  width integer,
  height integer,
  description text,
  uploaded_by uuid,
  upload_source text DEFAULT 'system'::text,
  job_id uuid,
  status text DEFAULT 'pending'::text CHECK (status = ANY (ARRAY['pending'::text, 'processing'::text, 'completed'::text, 'failed'::text])),
  error_message text,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  CONSTRAINT activity_files_pkey PRIMARY KEY (id),
  CONSTRAINT activity_files_activity_id_fkey FOREIGN KEY (activity_id) REFERENCES public.activities(id),
  CONSTRAINT activity_files_project_id_fkey FOREIGN KEY (project_id) REFERENCES public.projects(id),
  CONSTRAINT activity_files_uploaded_by_fkey FOREIGN KEY (uploaded_by) REFERENCES public.users(id)
);

CREATE TABLE public.activity_locations (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  region_id uuid NOT NULL DEFAULT gen_random_uuid(),
  district_id uuid NOT NULL DEFAULT gen_random_uuid(),
  village_id uuid NOT NULL DEFAULT gen_random_uuid(),
  start_date timestamp with time zone NOT NULL,
  end_date timestamp with time zone NOT NULL,
  activity_id uuid NOT NULL,
  CONSTRAINT activity_locations_pkey PRIMARY KEY (id),
  CONSTRAINT activity_locations_region_id_fkey FOREIGN KEY (region_id) REFERENCES public.regions(id),
  CONSTRAINT activity_locations_district_id_fkey FOREIGN KEY (district_id) REFERENCES public.districts(id),
  CONSTRAINT activity_locations_village_id_fkey FOREIGN KEY (village_id) REFERENCES public.villages(id),
  CONSTRAINT activity_locations_activity_id_fkey FOREIGN KEY (activity_id) REFERENCES public.activities(id)
);


-- ============================================================================
-- MODULE 2: PROJECT MANAGEMENT (3 tables)
-- Project lifecycle management with locations and documentation
-- ============================================================================

CREATE TABLE public.projects (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  title text NOT NULL,
  start_date date,
  end_date date,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  status USER-DEFINED NOT NULL DEFAULT 'Pending'::project_statuses,
  description text,
  slug text UNIQUE,
  short_description text,
  full_description text,
  cover_image text,
  gallery jsonb DEFAULT '[]'::jsonb,
  category_id uuid,
  location character varying,
  participants integer DEFAULT 0,
  objectives jsonb DEFAULT '[]'::jsonb,
  outcomes jsonb DEFAULT '[]'::jsonb,
  impact_metrics jsonb DEFAULT '[]'::jsonb,
  partners jsonb DEFAULT '[]'::jsonb,
  is_featured boolean DEFAULT false,
  is_published boolean DEFAULT false,
  CONSTRAINT projects_pkey PRIMARY KEY (id),
  CONSTRAINT projects_category_id_fkey FOREIGN KEY (category_id) REFERENCES public.categories(id)
);

CREATE TABLE public.project_files (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  file_url text NOT NULL,
  name text NOT NULL,
  file_type text NOT NULL DEFAULT 'image'::text,
  description text NOT NULL,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  project_id uuid DEFAULT gen_random_uuid(),
  CONSTRAINT project_files_pkey PRIMARY KEY (id),
  CONSTRAINT project_files_project_id_fkey FOREIGN KEY (project_id) REFERENCES public.projects(id)
);

CREATE TABLE public.project_locations (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  project_id uuid,
  region_id uuid,
  district_id uuid,
  village_id uuid,
  updated_at timestamp with time zone DEFAULT now(),
  CONSTRAINT project_locations_pkey PRIMARY KEY (id),
  CONSTRAINT project_locations_project_id_fkey FOREIGN KEY (project_id) REFERENCES public.projects(id),
  CONSTRAINT project_locations_region_id_fkey FOREIGN KEY (region_id) REFERENCES public.regions(id),
  CONSTRAINT project_locations_district_id_fkey FOREIGN KEY (district_id) REFERENCES public.districts(id),
  CONSTRAINT project_locations_village_id_fkey FOREIGN KEY (village_id) REFERENCES public.villages(id)
);


-- ============================================================================
-- MODULE 3: CASE MANAGEMENT (4 tables)
-- Legal case tracking with stages, assignments, and attachments
-- ============================================================================

CREATE TABLE public.cases (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  title text NOT NULL,
  reference_number text NOT NULL UNIQUE,
  submitted_by uuid,
  assigned_to uuid,
  category_id uuid,
  description text,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  status USER-DEFINED NOT NULL DEFAULT 'Open'::case_statuses,
  CONSTRAINT cases_pkey PRIMARY KEY (id),
  CONSTRAINT cases_submitted_by_fkey FOREIGN KEY (submitted_by) REFERENCES public.users(id),
  CONSTRAINT cases_assigned_to_fkey FOREIGN KEY (assigned_to) REFERENCES public.users(id),
  CONSTRAINT cases_category_id_fkey FOREIGN KEY (category_id) REFERENCES public.categories(id)
);

CREATE TABLE public.case_assignments (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  case_id uuid,
  assigned_to uuid,
  assigned_at timestamp with time zone DEFAULT now(),
  role text,
  status text DEFAULT 'assigned'::text,
  CONSTRAINT case_assignments_pkey PRIMARY KEY (id),
  CONSTRAINT case_assignments_case_id_fkey FOREIGN KEY (case_id) REFERENCES public.cases(id),
  CONSTRAINT case_assignments_assigned_to_fkey FOREIGN KEY (assigned_to) REFERENCES public.users(id)
);

CREATE TABLE public.case_stages (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  case_id uuid,
  name text NOT NULL,
  description text,
  next_stage text,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  status USER-DEFINED NOT NULL DEFAULT 'Ongoing'::case_statuses,
  CONSTRAINT case_stages_pkey PRIMARY KEY (id),
  CONSTRAINT case_stages_case_id_fkey FOREIGN KEY (case_id) REFERENCES public.cases(id)
);

CREATE TABLE public.stage_attachments (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  case_id uuid,
  stage_id uuid,
  file_url text NOT NULL,
  file_name text,
  description text,
  file_type text NOT NULL DEFAULT 'image'::text,
  size bigint NOT NULL DEFAULT 0,
  status text NOT NULL DEFAULT 'processed'::text CHECK (status = ANY (ARRAY['pending'::text, 'processing'::text, 'completed'::text, 'failed'::text])),
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT stage_attachments_pkey PRIMARY KEY (id),
  CONSTRAINT stage_attachments_case_id_fkey FOREIGN KEY (case_id) REFERENCES public.cases(id),
  CONSTRAINT stage_attachments_stage_id_fkey FOREIGN KEY (stage_id) REFERENCES public.case_stages(id)
);


-- ============================================================================
-- MODULE 4: INCIDENT MANAGEMENT (2 tables)
-- Incident reporting and tracking system
-- ============================================================================

CREATE TABLE public.incidents (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  name text NOT NULL,
  region_id uuid,
  district_id uuid,
  village_id uuid,
  description text,
  reported_by uuid,
  category_id uuid,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  status USER-DEFINED DEFAULT 'Verification Pending'::incident_status,
  priority character varying DEFAULT 'medium'::character varying CHECK (priority::text = ANY (ARRAY['low'::character varying::text, 'medium'::character varying::text, 'high'::character varying::text, 'urgent'::character varying::text])),
  CONSTRAINT incidents_pkey PRIMARY KEY (id),
  CONSTRAINT incidents_region_id_fkey FOREIGN KEY (region_id) REFERENCES public.regions(id),
  CONSTRAINT incidents_district_id_fkey FOREIGN KEY (district_id) REFERENCES public.districts(id),
  CONSTRAINT incidents_village_id_fkey FOREIGN KEY (village_id) REFERENCES public.villages(id),
  CONSTRAINT incidents_reported_by_fkey FOREIGN KEY (reported_by) REFERENCES public.users(id),
  CONSTRAINT incidents_category_id_fkey FOREIGN KEY (category_id) REFERENCES public.categories(id)
);

CREATE TABLE public.incident_files (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  incident_id uuid,
  project_id uuid,
  file_url text NOT NULL,
  file_name text,
  description text,
  file_type text DEFAULT 'image'::text,
  size bigint DEFAULT 0,
  upload_job_id uuid,
  storage_bucket text DEFAULT 'incident-files'::text,
  status text DEFAULT 'processed'::text CHECK (status = ANY (ARRAY['pending'::text, 'processing'::text, 'completed'::text, 'failed'::text])),
  error text,
  created_by uuid,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  CONSTRAINT incident_files_pkey PRIMARY KEY (id),
  CONSTRAINT incident_files_project_id_fkey FOREIGN KEY (project_id) REFERENCES public.projects(id),
  CONSTRAINT incident_files_created_by_fkey FOREIGN KEY (created_by) REFERENCES public.users(id),
  CONSTRAINT incident_files_incident_id_fkey FOREIGN KEY (incident_id) REFERENCES public.incidents(id)
);


-- ============================================================================
-- MODULE 5: BENEFICIARIES (2 tables)
-- Beneficiary management and activity participation tracking
-- ============================================================================

CREATE TABLE public.beneficiaries (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  first_name text NOT NULL,
  last_name text NOT NULL,
  sex text CHECK (sex = ANY (ARRAY['male'::text, 'female'::text, 'other'::text])),
  role text,
  age_group text,
  is_pwd boolean DEFAULT false,
  phone_number text,
  image_url text,
  photo_consent boolean DEFAULT false,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  status USER-DEFINED NOT NULL DEFAULT 'Active'::user_statuses,
  region_id uuid,
  district_id uuid,
  village_id uuid,
  CONSTRAINT beneficiaries_pkey PRIMARY KEY (id),
  CONSTRAINT beneficiaries_region_id_fkey FOREIGN KEY (region_id) REFERENCES public.regions(id),
  CONSTRAINT beneficiaries_district_id_fkey FOREIGN KEY (district_id) REFERENCES public.districts(id),
  CONSTRAINT beneficiaries_village_id_fkey FOREIGN KEY (village_id) REFERENCES public.villages(id)
);

-- Note: activity_beneficiaries is defined in MODULE 1 as it's a bridge table


-- ============================================================================
-- MODULE 6: LRM NETWORK (4 tables)
-- Land Rights Monitors network management and activity tracking
-- ============================================================================

CREATE TABLE public.lrm_members (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  user_id uuid,
  first_name character varying NOT NULL,
  last_name character varying NOT NULL,
  phone_number character varying,
  email character varying,
  region_id uuid,
  district_id uuid,
  village_id uuid,
  certification_number character varying UNIQUE,
  certified_date date,
  certification_expiry date,
  specialization character varying,
  bio text,
  photo_url text,
  languages jsonb DEFAULT '[]'::jsonb,
  is_active boolean DEFAULT true,
  is_public boolean DEFAULT true,
  cases_handled integer DEFAULT 0,
  disputes_resolved integer DEFAULT 0,
  families_educated integer DEFAULT 0,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  CONSTRAINT lrm_members_pkey PRIMARY KEY (id),
  CONSTRAINT lrm_members_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id),
  CONSTRAINT lrm_members_region_id_fkey FOREIGN KEY (region_id) REFERENCES public.regions(id),
  CONSTRAINT lrm_members_district_id_fkey FOREIGN KEY (district_id) REFERENCES public.districts(id),
  CONSTRAINT lrm_members_village_id_fkey FOREIGN KEY (village_id) REFERENCES public.villages(id)
);

CREATE TABLE public.lrm_activities (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  lrm_id uuid NOT NULL,
  activity_type character varying NOT NULL CHECK (activity_type::text = ANY (ARRAY['dispute_resolved'::character varying, 'education_session'::character varying, 'legal_referral'::character varying, 'documentation'::character varying, 'mediation'::character varying, 'consultation'::character varying, 'training'::character varying, 'awareness_campaign'::character varying]::text[])),
  title character varying,
  description text,
  beneficiaries_count integer DEFAULT 0,
  location character varying,
  region_id uuid,
  district_id uuid,
  village_id uuid,
  activity_date date NOT NULL,
  duration_hours numeric,
  outcome character varying,
  attachments jsonb DEFAULT '[]'::jsonb,
  verified boolean DEFAULT false,
  verified_by uuid,
  verified_at timestamp with time zone,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  CONSTRAINT lrm_activities_pkey PRIMARY KEY (id),
  CONSTRAINT lrm_activities_lrm_id_fkey FOREIGN KEY (lrm_id) REFERENCES public.lrm_members(id),
  CONSTRAINT lrm_activities_region_id_fkey FOREIGN KEY (region_id) REFERENCES public.regions(id),
  CONSTRAINT lrm_activities_district_id_fkey FOREIGN KEY (district_id) REFERENCES public.districts(id),
  CONSTRAINT lrm_activities_village_id_fkey FOREIGN KEY (village_id) REFERENCES public.villages(id),
  CONSTRAINT lrm_activities_verified_by_fkey FOREIGN KEY (verified_by) REFERENCES public.users(id)
);

CREATE TABLE public.lrm_roles (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  title character varying NOT NULL,
  description text NOT NULL,
  icon_name character varying,
  display_order integer DEFAULT 0,
  is_active boolean DEFAULT true,
  created_at timestamp with time zone DEFAULT now(),
  CONSTRAINT lrm_roles_pkey PRIMARY KEY (id)
);

CREATE TABLE public.lrm_join_steps (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  step_number integer NOT NULL,
  title character varying NOT NULL,
  description text NOT NULL,
  icon_name character varying,
  requirements jsonb DEFAULT '[]'::jsonb,
  is_active boolean DEFAULT true,
  created_at timestamp with time zone DEFAULT now(),
  CONSTRAINT lrm_join_steps_pkey PRIMARY KEY (id)
);


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


-- ============================================================================
-- MODULE 8: ORGANIZATION (6 tables)
-- Organization profile, team, credibility, and testimonials
-- ============================================================================
 
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


-- ============================================================================
-- MODULE 10: DONATIONS & FUNDRAISING (4 tables)
-- Online donation and campaign management
-- ============================================================================

CREATE TABLE public.donation_campaigns (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  slug character varying UNIQUE,
  title character varying NOT NULL,
  subtitle character varying,
  description text NOT NULL,
  cover_image text,
  gallery jsonb DEFAULT '[]'::jsonb,
  target_amount numeric NOT NULL,
  raised_amount numeric DEFAULT 0,
  currency character varying DEFAULT 'TZS'::character varying,
  donors_count integer DEFAULT 0,
  start_date date,
  end_date date,
  category character varying,
  beneficiaries_target integer,
  impact_description text,
  updates jsonb DEFAULT '[]'::jsonb,
  is_featured boolean DEFAULT false,
  is_active boolean DEFAULT true,
  is_recurring boolean DEFAULT false,
  min_amount numeric DEFAULT 1000,
  suggested_amounts jsonb DEFAULT '[5000, 10000, 25000, 50000, 100000]'::jsonb,
  created_by uuid,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  CONSTRAINT donation_campaigns_pkey PRIMARY KEY (id),
  CONSTRAINT donation_campaigns_created_by_fkey FOREIGN KEY (created_by) REFERENCES public.users(id)
);

CREATE TABLE public.donations (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  transaction_reference character varying UNIQUE,
  campaign_id uuid,
  donor_name character varying,
  donor_email character varying,
  donor_phone character varying,
  donor_address text,
  donor_country character varying,
  amount numeric NOT NULL,
  currency character varying DEFAULT 'TZS'::character varying,
  amount_usd numeric,
  frequency character varying DEFAULT 'one-time'::character varying CHECK (frequency::text = ANY (ARRAY['one-time'::character varying, 'monthly'::character varying, 'quarterly'::character varying, 'yearly'::character varying]::text[])),
  payment_method character varying CHECK (payment_method::text = ANY (ARRAY['mobile_money'::character varying, 'card'::character varying, 'bank_transfer'::character varying, 'cash'::character varying, 'check'::character varying, 'online'::character varying]::text[])),
  payment_provider character varying,
  payment_reference character varying,
  payment_phone character varying,
  status character varying DEFAULT 'pending'::character varying CHECK (status::text = ANY (ARRAY['pending'::character varying, 'processing'::character varying, 'completed'::character varying, 'failed'::character varying, 'refunded'::character varying, 'cancelled'::character varying]::text[])),
  is_anonymous boolean DEFAULT false,
  is_recurring boolean DEFAULT false,
  recurring_id character varying,
  dedication_type character varying,
  dedication_name character varying,
  message text,
  receipt_sent boolean DEFAULT false,
  receipt_sent_at timestamp with time zone,
  tax_receipt_number character varying,
  metadata jsonb DEFAULT '{}'::jsonb,
  failed_reason text,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  completed_at timestamp with time zone,
  CONSTRAINT donations_pkey PRIMARY KEY (id),
  CONSTRAINT donations_campaign_id_fkey FOREIGN KEY (campaign_id) REFERENCES public.donation_campaigns(id)
);

CREATE TABLE public.donation_impact (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  amount_range character varying NOT NULL,
  impact_description text NOT NULL,
  icon_name character varying,
  display_order integer DEFAULT 0,
  is_active boolean DEFAULT true,
  created_at timestamp with time zone DEFAULT now(),
  CONSTRAINT donation_impact_pkey PRIMARY KEY (id)
);

CREATE TABLE public.payment_methods (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  name character varying NOT NULL,
  code character varying NOT NULL UNIQUE,
  type character varying NOT NULL,
  provider character varying,
  icon_url text,
  instructions text,
  min_amount numeric,
  max_amount numeric,
  fee_percentage numeric,
  fee_fixed numeric,
  supported_currencies jsonb DEFAULT '["TZS"]'::jsonb,
  is_active boolean DEFAULT true,
  display_order integer DEFAULT 0,
  created_at timestamp with time zone DEFAULT now(),
  CONSTRAINT payment_methods_pkey PRIMARY KEY (id)
);


-- ============================================================================
-- MODULE 11: CONTACT & COMMUNICATION (3 tables)
-- Public communication channels and engagement
-- ============================================================================

CREATE TABLE public.contact_submissions (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  ticket_number character varying UNIQUE,
  name character varying NOT NULL,
  email character varying NOT NULL,
  phone character varying,
  subject character varying NOT NULL,
  message text NOT NULL,
  category character varying CHECK (category::text = ANY (ARRAY['General'::character varying, 'Legal Aid'::character varying, 'Partnership'::character varying, 'Media'::character varying, 'Donation'::character varying, 'Volunteer'::character varying, 'Other'::character varying]::text[])),
  source character varying DEFAULT 'website'::character varying,
  status character varying DEFAULT 'pending'::character varying CHECK (status::text = ANY (ARRAY['pending'::character varying, 'in_progress'::character varying, 'resolved'::character varying, 'closed'::character varying, 'spam'::character varying]::text[])),
  priority character varying DEFAULT 'normal'::character varying CHECK (priority::text = ANY (ARRAY['low'::character varying, 'normal'::character varying, 'high'::character varying, 'urgent'::character varying]::text[])),
  assigned_to uuid,
  response text,
  responded_by uuid,
  responded_at timestamp with time zone,
  attachments jsonb DEFAULT '[]'::jsonb,
  metadata jsonb DEFAULT '{}'::jsonb,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  CONSTRAINT contact_submissions_pkey PRIMARY KEY (id),
  CONSTRAINT contact_submissions_assigned_to_fkey FOREIGN KEY (assigned_to) REFERENCES public.users(id),
  CONSTRAINT contact_submissions_responded_by_fkey FOREIGN KEY (responded_by) REFERENCES public.users(id)
);

CREATE TABLE public.newsletter_subscriptions (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  email character varying NOT NULL UNIQUE,
  name character varying,
  status character varying DEFAULT 'active'::character varying CHECK (status::text = ANY (ARRAY['pending'::character varying, 'active'::character varying, 'unsubscribed'::character varying, 'bounced'::character varying]::text[])),
  source character varying DEFAULT 'website'::character varying,
  interests jsonb DEFAULT '[]'::jsonb,
  subscribed_at timestamp with time zone DEFAULT now(),
  unsubscribed_at timestamp with time zone,
  confirmed_at timestamp with time zone,
  confirmation_token character varying,
  metadata jsonb DEFAULT '{}'::jsonb,
  CONSTRAINT newsletter_subscriptions_pkey PRIMARY KEY (id)
);

CREATE TABLE public.chatbot_logs (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  phone_number text,
  name text,
  location text,
  message text,
  response text,
  received_at timestamp with time zone,
  responded_at timestamp with time zone,
  CONSTRAINT chatbot_logs_pkey PRIMARY KEY (id)
);


-- ============================================================================
-- MODULE 12: BACKGROUND JOB QUEUE (4 tables)
-- Asynchronous task processing for messages and file uploads
-- ============================================================================

CREATE TABLE public.message_jobs (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  job_type text NOT NULL,
  title text,
  payload jsonb,
  status USER-DEFINED NOT NULL DEFAULT 'pending'::job_status,
  created_at timestamp with time zone DEFAULT now(),
  started_at timestamp with time zone,
  completed_at timestamp with time zone,
  error text,
  created_by uuid,
  entity_type text DEFAULT ''::text,
  updated_at timestamp with time zone DEFAULT now(),
  failed_count bigint DEFAULT '0'::bigint,
  success_count bigint DEFAULT '0'::bigint,
  CONSTRAINT message_jobs_pkey PRIMARY KEY (id),
  CONSTRAINT message_jobs_created_by_fkey FOREIGN KEY (created_by) REFERENCES public.users(id)
);

CREATE TABLE public.message_job_recipients (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  job_id uuid NOT NULL,
  recipient_id uuid,
  channel text NOT NULL CHECK (channel = ANY (ARRAY['sms'::text, 'email'::text, 'whatsapp'::text, 'push'::text, 'other'::text])),
  destination text NOT NULL,
  status USER-DEFINED NOT NULL DEFAULT 'pending'::job_status,
  delivery_response jsonb DEFAULT '{}'::jsonb,
  attempts integer DEFAULT 0 CHECK (attempts >= 0),
  last_attempt_at timestamp with time zone,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  message text,
  error_message text,
  CONSTRAINT message_job_recipients_pkey PRIMARY KEY (id),
  CONSTRAINT message_job_recipients_job_id_fkey FOREIGN KEY (job_id) REFERENCES public.message_jobs(id)
);

CREATE TABLE public.upload_jobs (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  job_type text NOT NULL DEFAULT 'file_upload'::text,
  total_files integer DEFAULT 0,
  status USER-DEFINED DEFAULT 'pending'::job_status,
  attempts integer DEFAULT 0,
  created_by uuid,
  created_at timestamp with time zone DEFAULT now(),
  completed_at timestamp with time zone,
  last_attempt_at timestamp with time zone,
  error text,
  entity_id text,
  entity_type text,
  payload jsonb,
  updated_at timestamp with time zone DEFAULT now(),
  failed_count bigint DEFAULT '0'::bigint,
  success_count bigint DEFAULT '0'::bigint,
  CONSTRAINT upload_jobs_pkey PRIMARY KEY (id),
  CONSTRAINT upload_jobs_created_by_fkey FOREIGN KEY (created_by) REFERENCES public.users(id)
);

CREATE TABLE public.upload_job_files (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  job_id uuid NOT NULL,
  file_path text,
  size bigint,
  status USER-DEFINED DEFAULT 'pending'::job_status,
  attempts integer DEFAULT 0,
  error text,
  created_at timestamp with time zone DEFAULT now(),
  mime_type text,
  original_filename text,
  last_attempt_at timestamp with time zone DEFAULT now(),
  updated_at timestamp without time zone,
  error_message text,
  CONSTRAINT upload_job_files_pkey PRIMARY KEY (id)
);


-- ============================================================================
-- MODULE 13: USER MANAGEMENT & AUTHORIZATION (5 tables)
-- Authentication, user profiles, roles, and permissions (RBAC)
-- ============================================================================

CREATE TABLE public.users (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  first_name text NOT NULL,
  last_name text NOT NULL,
  email text NOT NULL UNIQUE,
  phone_number text,
  sex text,
  photo_consent boolean DEFAULT false,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  status USER-DEFINED NOT NULL DEFAULT 'Inactive'::user_statuses,
  password text NOT NULL,
  age_group text,
  CONSTRAINT users_pkey PRIMARY KEY (id)
);

CREATE TABLE public.roles (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  name text NOT NULL UNIQUE,
  CONSTRAINT roles_pkey PRIMARY KEY (id)
);

CREATE TABLE public.permissions (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  name text NOT NULL,
  description text,
  CONSTRAINT permissions_pkey PRIMARY KEY (id)
);

CREATE TABLE public.user_roles (
  user_id uuid NOT NULL,
  role_id uuid NOT NULL,
  assigned_at timestamp without time zone DEFAULT now(),
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  CONSTRAINT user_roles_pkey PRIMARY KEY (id),
  CONSTRAINT user_roles_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id),
  CONSTRAINT user_roles_role_id_fkey FOREIGN KEY (role_id) REFERENCES public.roles(id)
);

CREATE TABLE public.role_permissions (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  role_id uuid NOT NULL,
  permission_id uuid NOT NULL,
  CONSTRAINT role_permissions_pkey PRIMARY KEY (id),
  CONSTRAINT role_permissions_role_id_fkey FOREIGN KEY (role_id) REFERENCES public.roles(id),
  CONSTRAINT role_permissions_permission_id_fkey FOREIGN KEY (permission_id) REFERENCES public.permissions(id)
);


-- ============================================================================
-- MODULE 14: GEOGRAPHIC/LOCATION (3 tables)
-- Hierarchical location data for Tanzania
-- ============================================================================

CREATE TABLE public.regions (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  name text NOT NULL,
  CONSTRAINT regions_pkey PRIMARY KEY (id)
);

CREATE TABLE public.districts (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  name text NOT NULL,
  region_id uuid,
  CONSTRAINT districts_pkey PRIMARY KEY (id),
  CONSTRAINT districts_region_id_fkey FOREIGN KEY (region_id) REFERENCES public.regions(id)
);

CREATE TABLE public.villages (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  name text NOT NULL,
  district_id uuid,
  CONSTRAINT villages_pkey PRIMARY KEY (id),
  CONSTRAINT villages_district_id_fkey FOREIGN KEY (district_id) REFERENCES public.districts(id)
);


-- ============================================================================
-- MODULE 15: CATEGORIES & TAXONOMY (2 tables)
-- Shared categorization and research area taxonomy
-- ============================================================================

CREATE TABLE public.categories (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  name text NOT NULL UNIQUE,
  type text,
  description text,
  CONSTRAINT categories_pkey PRIMARY KEY (id)
);

CREATE TABLE public.research_areas (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  name character varying NOT NULL UNIQUE,
  slug character varying UNIQUE,
  description text,
  icon_name character varying,
  cover_image text,
  publication_count integer DEFAULT 0,
  display_order integer DEFAULT 0,
  is_active boolean DEFAULT true,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  CONSTRAINT research_areas_pkey PRIMARY KEY (id)
);


-- ============================================================================
-- END OF SCHEMA
-- ============================================================================
-- Summary:
-- - 67 tables organized into 15 logical modules
-- - Follows API endpoint grouping pattern
-- - Clear separation of concerns
-- - Shared resources: users, categories, locations
-- ============================================================================
