
-- ============================================================================
-- MODULE 11: CONTACT & COMMUNICATION (3 tables)
-- Public communication channels and engagement
-- ============================================================================

CREATE TABLE public.contact_submissions (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  ticket_number character varying UNIQUE,
  name character varying NOT NULL,
  email character varying NOT NULL,
  phone character varying,
  subject character varying NOT NULL,
  message text NOT NULL,
  category character varying CHECK (category::text = ANY (ARRAY['General'::character varying, 'Legal Aid'::character varying, 'Partnership'::character varying, 'Media'::character varying, 'Donation'::character varying, 'Volunteer'::character varying, 'Other'::character varying]::text[])),
  source character varying DEFAULT 'website'::character varying,
  status character varying DEFAULT 'pending'::character varying CHECK (status::text = ANY (ARRAY['pending'::character varying, 'in_progress'::character varying, 'resolved'::character varying, 'closed'::character varying, 'spam'::character varying]::text[])),
  priority character varying DEFAULT 'normal'::character varying CHECK (priority::text = ANY (ARRAY['low'::character varying, 'normal'::character varying, 'high'::character varying, 'urgent'::character varying]::text[])),
  assigned_to uuid,
  response text,
  responded_by uuid,
  responded_at timestamp with time zone,
  attachments jsonb DEFAULT '[]'::jsonb,
  metadata jsonb DEFAULT '{}'::jsonb,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  CONSTRAINT contact_submissions_pkey PRIMARY KEY (id),
  CONSTRAINT contact_submissions_assigned_to_fkey FOREIGN KEY (assigned_to) REFERENCES public.users(id),
  CONSTRAINT contact_submissions_responded_by_fkey FOREIGN KEY (responded_by) REFERENCES public.users(id)
);

CREATE TABLE public.newsletter_subscriptions (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  email character varying NOT NULL UNIQUE,
  name character varying,
  status character varying DEFAULT 'active'::character varying CHECK (status::text = ANY (ARRAY['pending'::character varying, 'active'::character varying, 'unsubscribed'::character varying, 'bounced'::character varying]::text[])),
  source character varying DEFAULT 'website'::character varying,
  interests jsonb DEFAULT '[]'::jsonb,
  subscribed_at timestamp with time zone DEFAULT now(),
  unsubscribed_at timestamp with time zone,
  confirmed_at timestamp with time zone,
  confirmation_token character varying,
  metadata jsonb DEFAULT '{}'::jsonb,
  CONSTRAINT newsletter_subscriptions_pkey PRIMARY KEY (id)
);

CREATE TABLE public.chatbot_logs (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  phone_number text,
  name text,
  location text,
  message text,
  response text,
  received_at timestamp with time zone,
  responded_at timestamp with time zone,
  CONSTRAINT chatbot_logs_pkey PRIMARY KEY (id)
);