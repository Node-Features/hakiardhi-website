
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
