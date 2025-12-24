
-- ============================================================================
-- MODULE 14: GEOGRAPHIC/LOCATION (3 tables)
-- Hierarchical location data for Tanzania
-- ============================================================================

CREATE TABLE public.regions (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  name text NOT NULL,
  CONSTRAINT regions_pkey PRIMARY KEY (id)
);

CREATE TABLE public.districts (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  name text NOT NULL,
  region_id uuid,
  CONSTRAINT districts_pkey PRIMARY KEY (id),
  CONSTRAINT districts_region_id_fkey FOREIGN KEY (region_id) REFERENCES public.regions(id)
);

CREATE TABLE public.villages (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  name text NOT NULL,
  district_id uuid,
  CONSTRAINT villages_pkey PRIMARY KEY (id),
  CONSTRAINT villages_district_id_fkey FOREIGN KEY (district_id) REFERENCES public.districts(id)
);

