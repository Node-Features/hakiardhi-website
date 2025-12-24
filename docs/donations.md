
-- ============================================================================
-- MODULE 10: DONATIONS & FUNDRAISING (4 tables)
-- Online donation and campaign management
-- ============================================================================

CREATE TABLE public.donation_campaigns (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  slug character varying UNIQUE,
  title character varying NOT NULL,
  subtitle character varying,
  description text NOT NULL,
  cover_image text,
  gallery jsonb DEFAULT '[]'::jsonb,
  target_amount numeric NOT NULL,
  raised_amount numeric DEFAULT 0,
  currency character varying DEFAULT 'TZS'::character varying,
  donors_count integer DEFAULT 0,
  start_date date,
  end_date date,
  category character varying,
  beneficiaries_target integer,
  impact_description text,
  updates jsonb DEFAULT '[]'::jsonb,
  is_featured boolean DEFAULT false,
  is_active boolean DEFAULT true,
  is_recurring boolean DEFAULT false,
  min_amount numeric DEFAULT 1000,
  suggested_amounts jsonb DEFAULT '[5000, 10000, 25000, 50000, 100000]'::jsonb,
  created_by uuid,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  CONSTRAINT donation_campaigns_pkey PRIMARY KEY (id),
  CONSTRAINT donation_campaigns_created_by_fkey FOREIGN KEY (created_by) REFERENCES public.users(id)
);

CREATE TABLE public.donations (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  transaction_reference character varying UNIQUE,
  campaign_id uuid,
  donor_name character varying,
  donor_email character varying,
  donor_phone character varying,
  donor_address text,
  donor_country character varying,
  amount numeric NOT NULL,
  currency character varying DEFAULT 'TZS'::character varying,
  amount_usd numeric,
  frequency character varying DEFAULT 'one-time'::character varying CHECK (frequency::text = ANY (ARRAY['one-time'::character varying, 'monthly'::character varying, 'quarterly'::character varying, 'yearly'::character varying]::text[])),
  payment_method character varying CHECK (payment_method::text = ANY (ARRAY['mobile_money'::character varying, 'card'::character varying, 'bank_transfer'::character varying, 'cash'::character varying, 'check'::character varying, 'online'::character varying]::text[])),
  payment_provider character varying,
  payment_reference character varying,
  payment_phone character varying,
  status character varying DEFAULT 'pending'::character varying CHECK (status::text = ANY (ARRAY['pending'::character varying, 'processing'::character varying, 'completed'::character varying, 'failed'::character varying, 'refunded'::character varying, 'cancelled'::character varying]::text[])),
  is_anonymous boolean DEFAULT false,
  is_recurring boolean DEFAULT false,
  recurring_id character varying,
  dedication_type character varying,
  dedication_name character varying,
  message text,
  receipt_sent boolean DEFAULT false,
  receipt_sent_at timestamp with time zone,
  tax_receipt_number character varying,
  metadata jsonb DEFAULT '{}'::jsonb,
  failed_reason text,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  completed_at timestamp with time zone,
  CONSTRAINT donations_pkey PRIMARY KEY (id),
  CONSTRAINT donations_campaign_id_fkey FOREIGN KEY (campaign_id) REFERENCES public.donation_campaigns(id)
);

CREATE TABLE public.donation_impact (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  amount_range character varying NOT NULL,
  impact_description text NOT NULL,
  icon_name character varying,
  display_order integer DEFAULT 0,
  is_active boolean DEFAULT true,
  created_at timestamp with time zone DEFAULT now(),
  CONSTRAINT donation_impact_pkey PRIMARY KEY (id)
);

CREATE TABLE public.payment_methods (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  name character varying NOT NULL,
  code character varying NOT NULL UNIQUE,
  type character varying NOT NULL,
  provider character varying,
  icon_url text,
  instructions text,
  min_amount numeric,
  max_amount numeric,
  fee_percentage numeric,
  fee_fixed numeric,
  supported_currencies jsonb DEFAULT '["TZS"]'::jsonb,
  is_active boolean DEFAULT true,
  display_order integer DEFAULT 0,
  created_at timestamp with time zone DEFAULT now(),
  CONSTRAINT payment_methods_pkey PRIMARY KEY (id)
);

