-- Fix stage_attachments status default value
-- The default was 'processed' but the check constraint only allows:
-- 'pending', 'processing', 'completed', 'failed'

-- Change the default from 'processed' to 'completed'
ALTER TABLE public.stage_attachments
ALTER COLUMN status SET DEFAULT 'completed'::text;

-- Update any existing records that have 'processed' status to 'completed'
UPDATE public.stage_attachments
SET status = 'completed'
WHERE status = 'processed';
