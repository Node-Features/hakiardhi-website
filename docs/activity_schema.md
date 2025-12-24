
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