# Database Migrations for HakiArdhi Public Portal

This folder contains SQL migration scripts for setting up the database schema required by the Public Portal API.

## Migration Files

| Order | File | Description |
|-------|------|-------------|
| 001 | `001_extend_projects_table.sql` | Extends projects table with public portal fields |
| 002 | `002_extend_blogs_table.sql` | Extends blogs table with public portal fields |
| 003 | `003_create_organization_tables.sql` | Creates organization_content, team_members, organization_milestones |
| 004 | `004_create_portfolio_tables.sql` | Creates portfolio_items table |
| 005 | `005_create_research_tables.sql` | Creates publications, research_areas tables |
| 006 | `006_create_lrm_tables.sql` | Creates lrm_members, lrm_activities, lrm_roles tables |
| 007 | `007_create_contact_tables.sql` | Creates contact_submissions, office_locations, newsletter_subscriptions |
| 008 | `008_create_donation_tables.sql` | Creates donation_campaigns, donations, payment_methods |
| 009 | `009_create_testimonials_partners_tables.sql` | Creates testimonials, partners, gallery_items, impact_statistics |
| 010 | `010_create_materialized_views.sql` | Creates all materialized views for optimized queries |

## How to Run Migrations

### Option 1: Using Supabase Dashboard

1. Log in to your Supabase project dashboard
2. Go to SQL Editor
3. Run each migration file in order (001 → 010)
4. Verify each migration completes successfully before proceeding

### Option 2: Using Supabase CLI

```bash
# Install Supabase CLI if not already installed
npm install -g supabase

# Link to your project
supabase link --project-ref your-project-ref

# Run migrations
supabase db push
```

### Option 3: Using the Backend Migration Runner

The backend has a migration runner at `Backend/v1/scripts/run-migration.ts`:

```bash
cd Backend/v1

# Run a specific migration
npx ts-node scripts/run-migration.ts ../Frontend/Public_Portal/v1/docs/migrations/001_extend_projects_table.sql

# Or run all migrations in sequence
for file in ../Frontend/Public_Portal/v1/docs/migrations/*.sql; do
  npx ts-node scripts/run-migration.ts "$file"
done
```

## Prerequisites

Before running migrations, ensure:

1. **Existing Tables**: The following tables must already exist:
   - `users`
   - `projects`
   - `blogs`
   - `cases`
   - `activities`
   - `beneficiaries`
   - `regions`, `districts`, `villages`
   - `categories`
   - `faqs`

2. **Database Extensions**: These PostgreSQL extensions should be enabled:
   - `uuid-ossp` (for UUID generation)
   - `pg_trgm` (for text search - optional)

3. **Environment Variables**: Ensure these are set:
   ```
   SUPABASE_URL=your_supabase_url
   SUPABASE_SERVICE_ROLE=your_service_role_key
   ```

## New Tables Summary

### Content Management
- `organization_content` - Vision, mission, values
- `team_members` - Staff and board profiles
- `organization_milestones` - Timeline/history
- `portfolio_items` - Case studies and projects showcase
- `gallery_items` - Photo gallery

### Research
- `publications` - Research papers and reports
- `research_areas` - Research focus areas
- `research_partners` - Academic/research partners

### LRM Network
- `lrm_members` - Land Rights Monitor profiles
- `lrm_activities` - LRM activity tracking
- `lrm_roles` - LRM responsibilities
- `lrm_join_steps` - How to become an LRM
- `lrm_applications` - LRM membership applications

### Contact & Support
- `contact_submissions` - Contact form entries
- `office_locations` - Office addresses
- `newsletter_subscriptions` - Email subscriptions

### Donations
- `donation_campaigns` - Fundraising campaigns
- `donations` - Individual donations
- `donation_impact` - Impact descriptions by amount
- `payment_methods` - Available payment methods

### Social Proof
- `testimonials` - Beneficiary testimonials
- `partners` - Partner organizations
- `impact_statistics` - Key impact numbers
- `social_proof` - Awards and recognitions

## Materialized Views

The following materialized views are created for optimized read performance:

| View | Purpose | Refresh Frequency |
|------|---------|-------------------|
| `mv_home_page_stats` | Homepage statistics | Daily + on change |
| `mv_featured_programs` | Featured programs | Daily + on change |
| `mv_programs_list` | All programs list | On change |
| `mv_news_events_list` | News/events list | On change |
| `mv_portfolio_list` | Portfolio items | On change |
| `mv_research_stats` | Research statistics | Daily |
| `mv_legal_aid_stats` | Legal aid statistics | Daily |
| `mv_lrm_by_region` | LRM by region | Daily |
| `mv_lrm_impact_stats` | LRM impact stats | Daily |
| `mv_about_page_content` | About page content | On change |

### Refreshing Views Manually

```sql
-- Refresh all views
SELECT refresh_public_portal_views();

-- Refresh a specific view
SELECT refresh_view('mv_home_page_stats');
```

### Scheduled Refresh (with pg_cron)

```sql
-- Run daily at 3 AM
SELECT cron.schedule(
  'refresh-daily-views',
  '0 3 * * *',
  'SELECT refresh_public_portal_views()'
);
```

## Rollback

To rollback a migration, use the corresponding `DROP` statements. Example:

```sql
-- Rollback 009_create_testimonials_partners_tables.sql
DROP TABLE IF EXISTS public.social_proof;
DROP TABLE IF EXISTS public.impact_statistics;
DROP TABLE IF EXISTS public.gallery_items;
DROP TABLE IF EXISTS public.partners;
DROP TABLE IF EXISTS public.testimonials;
```

## Troubleshooting

### Error: Relation already exists
If a table or view already exists, the migration will fail. Use `IF NOT EXISTS` (already included) or drop the existing object first.

### Error: Permission denied
Ensure you're running migrations with the service role key, not the anon key.

### Error: Foreign key constraint
Run migrations in order. Earlier migrations create tables that later migrations reference.

### Slow migration
Large tables may take time to alter. Consider running during off-peak hours.

## Post-Migration Steps

After running all migrations:

1. **Refresh materialized views**: `SELECT refresh_public_portal_views();`
2. **Verify indexes**: Check that all indexes were created successfully
3. **Set up Row Level Security (RLS)**: Configure policies for public access
4. **Seed initial data**: Add organization content, team members, etc.

## Related Documentation

- [API Design Document](../API_DESIGN_AND_INTEGRATION_PLAN.md)
- [Database Schema](../schema.md)
- [API Implementation](../api/README.md)