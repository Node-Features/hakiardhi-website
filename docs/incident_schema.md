
-- ============================================================================
-- MODULE 4: INCIDENT MANAGEMENT (4 tables)
-- Incident reporting, tracking, and escalation system
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

-- Escalation Status Enum
CREATE TYPE escalation_status AS ENUM ('pending', 'acknowledged', 'in_review', 'resolved', 'rejected');
CREATE TYPE escalation_level AS ENUM ('supervisor', 'department_head', 'admin', 'executive');
CREATE TYPE department_type AS ENUM ('legal', 'field_ops', 'community', 'management');
CREATE TYPE escalation_reason AS ENUM ('no_progress', 'requires_expertise', 'high_impact', 'legal_complexity', 'resource_needs', 'political_sensitivity', 'other');

CREATE TABLE public.incident_escalations (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  incident_id uuid NOT NULL,
  case_id uuid,
  escalated_by uuid NOT NULL,
  escalated_by_name text NOT NULL,
  escalated_to uuid,
  escalated_to_name text,
  escalation_level escalation_level NOT NULL,
  department department_type,
  reason escalation_reason NOT NULL,
  reason_label text NOT NULL,
  description text NOT NULL,
  priority character varying NOT NULL DEFAULT 'medium'::character varying CHECK (priority::text = ANY (ARRAY['low'::character varying::text, 'medium'::character varying::text, 'high'::character varying::text, 'urgent'::character varying::text])),
  deadline timestamp with time zone,
  status escalation_status NOT NULL DEFAULT 'pending'::escalation_status,
  resolution_notes text,
  resolved_at timestamp with time zone,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  CONSTRAINT incident_escalations_pkey PRIMARY KEY (id),
  CONSTRAINT incident_escalations_incident_id_fkey FOREIGN KEY (incident_id) REFERENCES public.incidents(id) ON DELETE CASCADE,
  CONSTRAINT incident_escalations_case_id_fkey FOREIGN KEY (case_id) REFERENCES public.cases(id) ON DELETE SET NULL,
  CONSTRAINT incident_escalations_escalated_by_fkey FOREIGN KEY (escalated_by) REFERENCES public.users(id) ON DELETE RESTRICT,
  CONSTRAINT incident_escalations_escalated_to_fkey FOREIGN KEY (escalated_to) REFERENCES public.users(id) ON DELETE SET NULL,
  CONSTRAINT incident_escalations_description_length CHECK (char_length(description) >= 20 AND char_length(description) <= 2000),
  CONSTRAINT incident_escalations_department_required CHECK ((escalation_level != 'department_head') OR (department IS NOT NULL))
);

CREATE INDEX idx_incident_escalations_incident_id ON public.incident_escalations(incident_id);
CREATE INDEX idx_incident_escalations_case_id ON public.incident_escalations(case_id);
CREATE INDEX idx_incident_escalations_status ON public.incident_escalations(status);

CREATE TABLE public.escalation_notes (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  escalation_id uuid NOT NULL,
  content text NOT NULL,
  created_by uuid NOT NULL,
  created_by_name text NOT NULL,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  CONSTRAINT escalation_notes_pkey PRIMARY KEY (id),
  CONSTRAINT escalation_notes_escalation_id_fkey FOREIGN KEY (escalation_id) REFERENCES public.incident_escalations(id) ON DELETE CASCADE,
  CONSTRAINT escalation_notes_created_by_fkey FOREIGN KEY (created_by) REFERENCES public.users(id) ON DELETE RESTRICT,
  CONSTRAINT escalation_notes_content_not_empty CHECK (char_length(trim(content)) > 0)
);

CREATE INDEX idx_escalation_notes_escalation_id ON public.escalation_notes(escalation_id);

