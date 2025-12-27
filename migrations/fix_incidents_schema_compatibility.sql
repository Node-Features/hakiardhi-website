-- ============================================================================
-- Fix Incidents Schema Compatibility
--
-- Issues addressed:
-- 1. incidents.reported_by currently references users table
-- 2. Need to change it to reference beneficiaries table for incident reporting
-- 3. This aligns with the requirement that anyone can report incidents
-- ============================================================================

-- Step 1: Drop existing foreign key constraint
ALTER TABLE public.incidents
DROP CONSTRAINT IF EXISTS incidents_reported_by_fkey;

-- Step 2: Add new foreign key constraint pointing to beneficiaries
ALTER TABLE public.incidents
ADD CONSTRAINT incidents_reported_by_fkey
FOREIGN KEY (reported_by) REFERENCES public.beneficiaries(id);

-- Step 3: Add comment explaining the change
COMMENT ON COLUMN public.incidents.reported_by IS 'References beneficiaries table - incidents can be reported by any beneficiary (not just system users)';

-- Step 4: Create index for better query performance
CREATE INDEX IF NOT EXISTS idx_incidents_reported_by ON public.incidents(reported_by);

-- ============================================================================
-- Migration complete
--
-- What changed:
-- - incidents.reported_by now references beneficiaries.id instead of users.id
-- - This allows any beneficiary to report incidents
-- - System users can still be linked if they exist as beneficiaries
-- ============================================================================
