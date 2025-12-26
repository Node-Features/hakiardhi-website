-- WARNING: This schema is for context only and is not meant to be run.
-- Table order and constraints may not be valid for execution.

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
CREATE TABLE public.blog_images (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  blog_id uuid,
  image_url text NOT NULL,
  description text,
  CONSTRAINT blog_images_pkey PRIMARY KEY (id),
  CONSTRAINT blog_images_blog_id_fkey FOREIGN KEY (blog_id) REFERENCES public.blogs(id)
);
CREATE TABLE public.blogs (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  title text NOT NULL,
  content text NOT NULL,
  category_id uuid,
  author_id uuid,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  CONSTRAINT blogs_pkey PRIMARY KEY (id),
  CONSTRAINT blogs_category_id_fkey FOREIGN KEY (category_id) REFERENCES public.categories(id),
  CONSTRAINT blogs_author_id_fkey FOREIGN KEY (author_id) REFERENCES public.users(id)
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
CREATE TABLE public.categories (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  name text NOT NULL UNIQUE,
  type text,
  description text,
  CONSTRAINT categories_pkey PRIMARY KEY (id)
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
CREATE TABLE public.districts (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  name text NOT NULL,
  region_id uuid,
  CONSTRAINT districts_pkey PRIMARY KEY (id),
  CONSTRAINT districts_region_id_fkey FOREIGN KEY (region_id) REFERENCES public.regions(id)
);
CREATE TABLE public.faqs (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  question text NOT NULL,
  response text,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  CONSTRAINT faqs_pkey PRIMARY KEY (id)
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
  CONSTRAINT incidents_pkey PRIMARY KEY (id),
  CONSTRAINT incidents_region_id_fkey FOREIGN KEY (region_id) REFERENCES public.regions(id),
  CONSTRAINT incidents_district_id_fkey FOREIGN KEY (district_id) REFERENCES public.districts(id),
  CONSTRAINT incidents_village_id_fkey FOREIGN KEY (village_id) REFERENCES public.villages(id),
  CONSTRAINT incidents_reported_by_fkey FOREIGN KEY (reported_by) REFERENCES public.users(id),
  CONSTRAINT incidents_category_id_fkey FOREIGN KEY (category_id) REFERENCES public.categories(id)
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
CREATE TABLE public.permissions (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  name text NOT NULL,
  description text,
  CONSTRAINT permissions_pkey PRIMARY KEY (id)
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
CREATE TABLE public.projects (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  title text NOT NULL,
  start_date date,
  end_date date,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  status USER-DEFINED NOT NULL DEFAULT 'Pending'::project_statuses,
  description text,
  CONSTRAINT projects_pkey PRIMARY KEY (id)
);
CREATE TABLE public.regions (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  name text NOT NULL,
  CONSTRAINT regions_pkey PRIMARY KEY (id)
);
CREATE TABLE public.role_permissions (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  role_id uuid NOT NULL,
  permission_id uuid NOT NULL,
  CONSTRAINT role_permissions_pkey PRIMARY KEY (id),
  CONSTRAINT role_permissions_role_id_fkey FOREIGN KEY (role_id) REFERENCES public.roles(id),
  CONSTRAINT role_permissions_permission_id_fkey FOREIGN KEY (permission_id) REFERENCES public.permissions(id)
);
CREATE TABLE public.roles (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  name text NOT NULL UNIQUE,
  CONSTRAINT roles_pkey PRIMARY KEY (id)
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
CREATE TABLE public.user_roles (
  user_id uuid NOT NULL,
  role_id uuid NOT NULL,
  assigned_at timestamp without time zone DEFAULT now(),
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  CONSTRAINT user_roles_pkey PRIMARY KEY (id),
  CONSTRAINT user_roles_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id),
  CONSTRAINT user_roles_role_id_fkey FOREIGN KEY (role_id) REFERENCES public.roles(id)
);
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
CREATE TABLE public.villages (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  name text NOT NULL,
  district_id uuid,
  CONSTRAINT villages_pkey PRIMARY KEY (id),
  CONSTRAINT villages_district_id_fkey FOREIGN KEY (district_id) REFERENCES public.districts(id)
);