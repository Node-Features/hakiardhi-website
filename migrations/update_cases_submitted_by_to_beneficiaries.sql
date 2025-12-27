-- Migration: Update cases.submitted_by to reference beneficiaries instead of users
-- Date: 2025-12-27
-- Description: Changes the foreign key constraint on cases.submitted_by from users(id) to beneficiaries(id)
--              to allow beneficiaries to submit cases directly

-- Step 1: Drop the existing foreign key constraint
ALTER TABLE cases
DROP CONSTRAINT IF EXISTS cases_submitted_by_fkey;

-- Step 2: Add the new foreign key constraint referencing beneficiaries
ALTER TABLE cases
ADD CONSTRAINT cases_submitted_by_fkey
FOREIGN KEY (submitted_by) REFERENCES beneficiaries(id) ON DELETE SET NULL;

-- Note: This migration assumes that existing submitted_by values need to be handled
-- If there are existing cases with submitted_by values referencing users,
-- you may need to either:
-- 1. Set them to NULL: UPDATE cases SET submitted_by = NULL WHERE submitted_by IS NOT NULL;
-- 2. Or create corresponding beneficiary records for those users first
