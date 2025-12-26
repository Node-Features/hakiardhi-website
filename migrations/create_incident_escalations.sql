-- ============================================================================
-- INCIDENT ESCALATIONS TABLE
-- Tracks escalations of incidents to higher authorities and case creation
-- ============================================================================

-- Create escalation status enum
CREATE TYPE escalation_status AS ENUM (
  'pending',
  'acknowledged',
  'in_review',
  'resolved',
  'rejected'
);

-- Create escalation level enum
CREATE TYPE escalation_level AS ENUM (
  'supervisor',
  'department_head',
  'admin',
  'executive'
);

-- Create department type enum
CREATE TYPE department_type AS ENUM (
  'legal',
  'field_ops',
  'community',
  'management'
);

-- Create escalation reason enum
CREATE TYPE escalation_reason AS ENUM (
  'no_progress',
  'requires_expertise',
  'high_impact',
  'legal_complexity',
  'resource_needs',
  'political_sensitivity',
  'other'
);

-- Create escalation priority enum (reuse if already exists)
DO $$ BEGIN
  CREATE TYPE escalation_priority AS ENUM ('low', 'medium', 'high', 'urgent');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

-- Create incident_escalations table
CREATE TABLE IF NOT EXISTS public.incident_escalations (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  incident_id uuid NOT NULL,
  case_id uuid,

  -- Who escalated
  escalated_by uuid NOT NULL,
  escalated_by_name text NOT NULL,

  -- Who it's escalated to
  escalated_to uuid,
  escalated_to_name text,

  -- Escalation details
  escalation_level escalation_level NOT NULL,
  department department_type,
  reason escalation_reason NOT NULL,
  reason_label text NOT NULL,
  description text NOT NULL,
  priority escalation_priority NOT NULL DEFAULT 'medium',
  deadline timestamp with time zone,

  -- Status and resolution
  status escalation_status NOT NULL DEFAULT 'pending',
  resolution_notes text,
  resolved_at timestamp with time zone,

  -- Timestamps
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),

  -- Constraints
  CONSTRAINT incident_escalations_pkey PRIMARY KEY (id),
  CONSTRAINT incident_escalations_incident_id_fkey FOREIGN KEY (incident_id)
    REFERENCES public.incidents(id) ON DELETE CASCADE,
  CONSTRAINT incident_escalations_case_id_fkey FOREIGN KEY (case_id)
    REFERENCES public.cases(id) ON DELETE SET NULL,
  CONSTRAINT incident_escalations_escalated_by_fkey FOREIGN KEY (escalated_by)
    REFERENCES public.users(id) ON DELETE RESTRICT,
  CONSTRAINT incident_escalations_escalated_to_fkey FOREIGN KEY (escalated_to)
    REFERENCES public.users(id) ON DELETE SET NULL,

  -- Validations
  CONSTRAINT incident_escalations_description_length CHECK (char_length(description) >= 20 AND char_length(description) <= 2000),
  CONSTRAINT incident_escalations_resolution_notes_length CHECK (char_length(resolution_notes) <= 2000),
  CONSTRAINT incident_escalations_department_required_for_dept_head CHECK (
    (escalation_level != 'department_head') OR (department IS NOT NULL)
  )
);

-- Create indexes for performance
CREATE INDEX idx_incident_escalations_incident_id ON public.incident_escalations(incident_id);
CREATE INDEX idx_incident_escalations_case_id ON public.incident_escalations(case_id);
CREATE INDEX idx_incident_escalations_escalated_by ON public.incident_escalations(escalated_by);
CREATE INDEX idx_incident_escalations_escalated_to ON public.incident_escalations(escalated_to);
CREATE INDEX idx_incident_escalations_status ON public.incident_escalations(status);
CREATE INDEX idx_incident_escalations_escalation_level ON public.incident_escalations(escalation_level);
CREATE INDEX idx_incident_escalations_priority ON public.incident_escalations(priority);
CREATE INDEX idx_incident_escalations_created_at ON public.incident_escalations(created_at DESC);

-- Create updated_at trigger
CREATE OR REPLACE FUNCTION update_incident_escalations_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_incident_escalations_updated_at
  BEFORE UPDATE ON public.incident_escalations
  FOR EACH ROW
  EXECUTE FUNCTION update_incident_escalations_updated_at();

-- Add comments for documentation
COMMENT ON TABLE public.incident_escalations IS 'Tracks escalations of incidents to higher authorities and optional case creation';
COMMENT ON COLUMN public.incident_escalations.incident_id IS 'Reference to the incident being escalated';
COMMENT ON COLUMN public.incident_escalations.case_id IS 'Reference to case created from this escalation (if any)';
COMMENT ON COLUMN public.incident_escalations.escalated_by IS 'User who initiated the escalation';
COMMENT ON COLUMN public.incident_escalations.escalated_to IS 'User to whom the incident is escalated (for supervisor/admin levels)';
COMMENT ON COLUMN public.incident_escalations.escalation_level IS 'Level of escalation: supervisor, department_head, admin, or executive';
COMMENT ON COLUMN public.incident_escalations.department IS 'Department for department_head escalations';
COMMENT ON COLUMN public.incident_escalations.reason IS 'Reason code for escalation';
COMMENT ON COLUMN public.incident_escalations.reason_label IS 'Human-readable reason label';
COMMENT ON COLUMN public.incident_escalations.priority IS 'Priority level of the escalation';
COMMENT ON COLUMN public.incident_escalations.deadline IS 'Expected response or resolution deadline';
COMMENT ON COLUMN public.incident_escalations.status IS 'Current status of the escalation';
COMMENT ON COLUMN public.incident_escalations.resolution_notes IS 'Notes on how the escalation was resolved or rejected';
COMMENT ON COLUMN public.incident_escalations.resolved_at IS 'Timestamp when escalation was resolved or rejected';

-- Grant permissions (adjust based on your roles)
GRANT SELECT, INSERT, UPDATE ON public.incident_escalations TO authenticated;
GRANT SELECT ON public.incident_escalations TO anon;
