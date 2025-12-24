
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
