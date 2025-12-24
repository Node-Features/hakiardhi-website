
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

