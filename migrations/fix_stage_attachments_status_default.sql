-- Fix status default values for file attachment tables
-- The default was 'processed' but the check constraint only allows:
-- 'pending', 'processing', 'completed', 'failed'

-- ========================================
-- Fix stage_attachments table
-- ========================================
-- Change the default from 'processed' to 'completed'
ALTER TABLE public.stage_attachments
ALTER COLUMN status SET DEFAULT 'completed'::text;

-- Update any existing records that have 'processed' status to 'completed'
UPDATE public.stage_attachments
SET status = 'completed'
WHERE status = 'processed';

-- ========================================
-- Fix incident_files table
-- ========================================
-- Change the default from 'processed' to 'completed'
ALTER TABLE public.incident_files
ALTER COLUMN status SET DEFAULT 'completed'::text;

-- Update any existing records that have 'processed' status to 'completed'
UPDATE public.incident_files
SET status = 'completed'
WHERE status = 'processed';

-- Also fix the incorrect storage bucket default
ALTER TABLE public.incident_files
ALTER COLUMN storage_bucket SET DEFAULT 'incidents'::text;
