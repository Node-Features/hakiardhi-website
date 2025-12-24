
-- ============================================================================
-- MODULE 5: BENEFICIARIES (2 tables)
-- Beneficiary management and activity participation tracking
-- ============================================================================

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

-- Note: activity_beneficiaries is defined in MODULE 1 in this folder: activity_schema.md as it's a bridge table
