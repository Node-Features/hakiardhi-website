-- Migration: Add priority column to incidents table
-- Created: 2025-12-10

-- Add priority column with default value of 'medium'
ALTER TABLE public.incidents
ADD COLUMN IF NOT EXISTS priority character varying DEFAULT 'medium'::character varying
CHECK (priority::text = ANY (ARRAY['low'::character varying, 'medium'::character varying, 'high'::character varying, 'urgent'::character varying]::text[]));

-- Add comment to the column
COMMENT ON COLUMN public.incidents.priority IS 'Incident priority level: low, medium, high, or urgent';
