
-- ============================================================================
-- MODULE 6: LRM NETWORK (4 tables)
-- Land Rights Monitors network management and activity tracking
-- ============================================================================

CREATE TABLE public.lrm_members (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  user_id uuid,
  first_name character varying NOT NULL,
  last_name character varying NOT NULL,
  phone_number character varying,
  email character varying,
  region_id uuid,
  district_id uuid,
  village_id uuid,
  certification_number character varying UNIQUE,
  certified_date date,
  certification_expiry date,
  specialization character varying,
  bio text,
  photo_url text,
  languages jsonb DEFAULT '[]'::jsonb,
  is_active boolean DEFAULT true,
  is_public boolean DEFAULT true,
  cases_handled integer DEFAULT 0,
  disputes_resolved integer DEFAULT 0,
  families_educated integer DEFAULT 0,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  CONSTRAINT lrm_members_pkey PRIMARY KEY (id),
  CONSTRAINT lrm_members_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id),
  CONSTRAINT lrm_members_region_id_fkey FOREIGN KEY (region_id) REFERENCES public.regions(id),
  CONSTRAINT lrm_members_district_id_fkey FOREIGN KEY (district_id) REFERENCES public.districts(id),
  CONSTRAINT lrm_members_village_id_fkey FOREIGN KEY (village_id) REFERENCES public.villages(id)
);

CREATE TABLE public.lrm_activities (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  lrm_id uuid NOT NULL,
  activity_type character varying NOT NULL CHECK (activity_type::text = ANY (ARRAY['dispute_resolved'::character varying, 'education_session'::character varying, 'legal_referral'::character varying, 'documentation'::character varying, 'mediation'::character varying, 'consultation'::character varying, 'training'::character varying, 'awareness_campaign'::character varying]::text[])),
  title character varying,
  description text,
  beneficiaries_count integer DEFAULT 0,
  location character varying,
  region_id uuid,
  district_id uuid,
  village_id uuid,
  activity_date date NOT NULL,
  duration_hours numeric,
  outcome character varying,
  attachments jsonb DEFAULT '[]'::jsonb,
  verified boolean DEFAULT false,
  verified_by uuid,
  verified_at timestamp with time zone,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  CONSTRAINT lrm_activities_pkey PRIMARY KEY (id),
  CONSTRAINT lrm_activities_lrm_id_fkey FOREIGN KEY (lrm_id) REFERENCES public.lrm_members(id),
  CONSTRAINT lrm_activities_region_id_fkey FOREIGN KEY (region_id) REFERENCES public.regions(id),
  CONSTRAINT lrm_activities_district_id_fkey FOREIGN KEY (district_id) REFERENCES public.districts(id),
  CONSTRAINT lrm_activities_village_id_fkey FOREIGN KEY (village_id) REFERENCES public.villages(id),
  CONSTRAINT lrm_activities_verified_by_fkey FOREIGN KEY (verified_by) REFERENCES public.users(id)
);

CREATE TABLE public.lrm_roles (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  title character varying NOT NULL,
  description text NOT NULL,
  icon_name character varying,
  display_order integer DEFAULT 0,
  is_active boolean DEFAULT true,
  created_at timestamp with time zone DEFAULT now(),
  CONSTRAINT lrm_roles_pkey PRIMARY KEY (id)
);

CREATE TABLE public.lrm_join_steps (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  step_number integer NOT NULL,
  title character varying NOT NULL,
  description text NOT NULL,
  icon_name character varying,
  requirements jsonb DEFAULT '[]'::jsonb,
  is_active boolean DEFAULT true,
  created_at timestamp with time zone DEFAULT now(),
  CONSTRAINT lrm_join_steps_pkey PRIMARY KEY (id)
);

