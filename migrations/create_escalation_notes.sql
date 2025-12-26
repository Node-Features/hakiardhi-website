-- ============================================================================
-- ESCALATION NOTES TABLE
-- Follow-up notes and comments on escalations
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.escalation_notes (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  escalation_id uuid NOT NULL,

  -- Note content
  content text NOT NULL,

  -- Author
  created_by uuid NOT NULL,
  created_by_name text NOT NULL,

  -- Timestamps
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),

  -- Constraints
  CONSTRAINT escalation_notes_pkey PRIMARY KEY (id),
  CONSTRAINT escalation_notes_escalation_id_fkey FOREIGN KEY (escalation_id)
    REFERENCES public.incident_escalations(id) ON DELETE CASCADE,
  CONSTRAINT escalation_notes_created_by_fkey FOREIGN KEY (created_by)
    REFERENCES public.users(id) ON DELETE RESTRICT,

  -- Validations
  CONSTRAINT escalation_notes_content_not_empty CHECK (char_length(trim(content)) > 0),
  CONSTRAINT escalation_notes_content_max_length CHECK (char_length(content) <= 2000)
);

-- Create indexes for performance
CREATE INDEX idx_escalation_notes_escalation_id ON public.escalation_notes(escalation_id);
CREATE INDEX idx_escalation_notes_created_by ON public.escalation_notes(created_by);
CREATE INDEX idx_escalation_notes_created_at ON public.escalation_notes(created_at DESC);

-- Create updated_at trigger
CREATE OR REPLACE FUNCTION update_escalation_notes_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_escalation_notes_updated_at
  BEFORE UPDATE ON public.escalation_notes
  FOR EACH ROW
  EXECUTE FUNCTION update_escalation_notes_updated_at();

-- Add comments for documentation
COMMENT ON TABLE public.escalation_notes IS 'Follow-up notes and comments on escalations for tracking progress and communication';
COMMENT ON COLUMN public.escalation_notes.escalation_id IS 'Reference to the escalation this note belongs to';
COMMENT ON COLUMN public.escalation_notes.content IS 'Content of the note';
COMMENT ON COLUMN public.escalation_notes.created_by IS 'User who created the note';
COMMENT ON COLUMN public.escalation_notes.created_by_name IS 'Name of the user who created the note';

-- Grant permissions (adjust based on your roles)
GRANT SELECT, INSERT, UPDATE ON public.escalation_notes TO authenticated;
GRANT SELECT ON public.escalation_notes TO anon;
