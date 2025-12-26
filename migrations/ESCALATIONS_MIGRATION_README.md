# Incident Escalations - Database Migration

## Overview
This migration adds support for incident escalation management with optional case creation.

## Tables Created

### 1. `incident_escalations`
Main table for tracking incident escalations.

**Features:**
- Links incidents to escalations
- Links escalations to cases (when created)
- Tracks escalation hierarchy (supervisor → department_head → admin → executive)
- Status workflow (pending → acknowledged → in_review → resolved/rejected)
- Priority levels and deadlines
- Resolution tracking

**Enums:**
- `escalation_status`: pending, acknowledged, in_review, resolved, rejected
- `escalation_level`: supervisor, department_head, admin, executive
- `department_type`: legal, field_ops, community, management
- `escalation_reason`: no_progress, requires_expertise, high_impact, legal_complexity, resource_needs, political_sensitivity, other
- `escalation_priority`: low, medium, high, urgent

### 2. `escalation_notes`
Follow-up notes and comments on escalations.

**Features:**
- Track communication and progress updates
- Link notes to escalations
- Author tracking
- Chronological ordering

## Migration Files

1. **`create_incident_escalations.sql`** - Main escalations table
2. **`create_escalation_notes.sql`** - Notes/comments table

## How to Apply

### Option 1: Using Supabase Dashboard
1. Go to your Supabase project
2. Navigate to SQL Editor
3. Copy and paste `create_incident_escalations.sql`
4. Execute the query
5. Copy and paste `create_escalation_notes.sql`
6. Execute the query

### Option 2: Using Supabase CLI
```bash
# Apply incident_escalations table
supabase db push migrations/create_incident_escalations.sql

# Apply escalation_notes table
supabase db push migrations/create_escalation_notes.sql
```

### Option 3: Using psql
```bash
# Connect to your database
psql -h <host> -U <user> -d <database>

# Execute migrations
\i migrations/create_incident_escalations.sql
\i migrations/create_escalation_notes.sql
```

## Data Model

```
incidents
  ├─ incident_escalations (many)
  │    ├─ case_id → cases (one, optional)
  │    ├─ escalated_by → users (one)
  │    ├─ escalated_to → users (one, optional)
  │    └─ escalation_notes (many)
  └─ ...
```

## Example Data

### Creating an Escalation
```sql
INSERT INTO incident_escalations (
  incident_id,
  escalated_by,
  escalated_by_name,
  escalated_to,
  escalated_to_name,
  escalation_level,
  reason,
  reason_label,
  description,
  priority,
  status
) VALUES (
  'incident-uuid',
  'user-uuid',
  'John Doe',
  'admin-uuid',
  'Admin User',
  'admin',
  'legal_complexity',
  'Legal Complexity',
  'This incident requires legal expertise to resolve...',
  'high',
  'pending'
);
```

### Creating an Escalation with Case
```sql
-- First, create the case
INSERT INTO cases (title, description, category_id, submitted_by, status, reference_number)
VALUES ('Land Dispute Case', 'Description...', 'cat-uuid', 'user-uuid', 'Open', 'CASE-2025-001234')
RETURNING id;

-- Then, create escalation linked to case
INSERT INTO incident_escalations (
  incident_id,
  case_id,  -- Link to created case
  escalated_by,
  escalated_by_name,
  escalation_level,
  reason,
  reason_label,
  description,
  priority,
  status
) VALUES (
  'incident-uuid',
  'case-uuid',  -- From previous INSERT
  'user-uuid',
  'John Doe',
  'executive',
  'high_impact',
  'High Community Impact',
  'Major land dispute affecting entire community...',
  'urgent',
  'pending'
);
```

### Adding a Note
```sql
INSERT INTO escalation_notes (
  escalation_id,
  content,
  created_by,
  created_by_name
) VALUES (
  'escalation-uuid',
  'Follow-up: Meeting scheduled with legal team for Friday.',
  'user-uuid',
  'Jane Smith'
);
```

## Queries

### Get All Escalations for an Incident
```sql
SELECT
  e.*,
  c.reference_number as case_reference_number,
  c.status as case_status
FROM incident_escalations e
LEFT JOIN cases c ON e.case_id = c.id
WHERE e.incident_id = 'incident-uuid'
ORDER BY e.created_at DESC;
```

### Get Escalation with Notes
```sql
SELECT
  e.*,
  json_agg(
    json_build_object(
      'id', n.id,
      'content', n.content,
      'created_by_name', n.created_by_name,
      'created_at', n.created_at
    ) ORDER BY n.created_at ASC
  ) as notes
FROM incident_escalations e
LEFT JOIN escalation_notes n ON n.escalation_id = e.id
WHERE e.id = 'escalation-uuid'
GROUP BY e.id;
```

### Get Active Escalations by Priority
```sql
SELECT *
FROM incident_escalations
WHERE status IN ('pending', 'acknowledged', 'in_review')
ORDER BY
  CASE priority
    WHEN 'urgent' THEN 1
    WHEN 'high' THEN 2
    WHEN 'medium' THEN 3
    WHEN 'low' THEN 4
  END,
  created_at DESC;
```

### Get Escalations That Created Cases
```sql
SELECT
  e.*,
  i.name as incident_name,
  c.reference_number,
  c.title as case_title,
  c.status as case_status
FROM incident_escalations e
INNER JOIN incidents i ON e.incident_id = i.id
INNER JOIN cases c ON e.case_id = c.id
WHERE e.case_id IS NOT NULL
ORDER BY e.created_at DESC;
```

## API Endpoints Using These Tables

### POST /api/admin/incidents/{id}/escalation
Creates escalation and optionally creates a case.

**Uses:**
- `incident_escalations` (INSERT)
- `cases` (INSERT if create_case=true)
- `case_stages` (INSERT if case created)

### GET /api/admin/incidents/{id}/escalations
Get all escalations for an incident.

**Uses:**
- `incident_escalations` (SELECT)

### PATCH /api/admin/escalations/{id}
Update escalation status.

**Uses:**
- `incident_escalations` (UPDATE)

### POST /api/admin/escalations/{id}/notes
Add a note to an escalation.

**Uses:**
- `escalation_notes` (INSERT)

### GET /api/admin/escalations/{id}/notes
Get all notes for an escalation.

**Uses:**
- `escalation_notes` (SELECT)

## Indexes

The following indexes are created for optimal performance:

**incident_escalations:**
- `idx_incident_escalations_incident_id` - Fast lookups by incident
- `idx_incident_escalations_case_id` - Fast lookups by case
- `idx_incident_escalations_escalated_by` - Fast lookups by creator
- `idx_incident_escalations_escalated_to` - Fast lookups by assignee
- `idx_incident_escalations_status` - Fast status filtering
- `idx_incident_escalations_escalation_level` - Fast level filtering
- `idx_incident_escalations_priority` - Fast priority filtering
- `idx_incident_escalations_created_at` - Fast chronological sorting

**escalation_notes:**
- `idx_escalation_notes_escalation_id` - Fast lookups by escalation
- `idx_escalation_notes_created_by` - Fast lookups by author
- `idx_escalation_notes_created_at` - Fast chronological sorting

## Constraints

### Foreign Keys
- `incident_id` → `incidents(id)` ON DELETE CASCADE
- `case_id` → `cases(id)` ON DELETE SET NULL
- `escalated_by` → `users(id)` ON DELETE RESTRICT
- `escalated_to` → `users(id)` ON DELETE SET NULL

### Validations
- Description: 20-2000 characters
- Resolution notes: Max 2000 characters
- Department required when escalation_level = 'department_head'
- Note content: Not empty, max 2000 characters

## Testing the Migration

After applying the migrations, test with:

```sql
-- 1. Check tables exist
SELECT table_name
FROM information_schema.tables
WHERE table_schema = 'public'
  AND table_name IN ('incident_escalations', 'escalation_notes');

-- 2. Check enums exist
SELECT enumlabel
FROM pg_enum
WHERE enumtypid = 'escalation_status'::regtype;

-- 3. Check indexes
SELECT indexname
FROM pg_indexes
WHERE tablename IN ('incident_escalations', 'escalation_notes');

-- 4. Test insert (will fail due to FK constraints if incidents/users/cases don't exist)
INSERT INTO incident_escalations (
  incident_id,
  escalated_by,
  escalated_by_name,
  escalation_level,
  reason,
  reason_label,
  description,
  priority
) VALUES (
  gen_random_uuid(),  -- Replace with actual incident_id
  gen_random_uuid(),  -- Replace with actual user_id
  'Test User',
  'supervisor',
  'no_progress',
  'No Progress / Stalled',
  'This is a test escalation with minimum required fields to verify table structure.',
  'medium'
);
```

## Rollback

If you need to rollback these changes:

```sql
-- Drop tables (this will delete all data!)
DROP TABLE IF EXISTS public.escalation_notes CASCADE;
DROP TABLE IF EXISTS public.incident_escalations CASCADE;

-- Drop enums
DROP TYPE IF EXISTS escalation_status CASCADE;
DROP TYPE IF EXISTS escalation_level CASCADE;
DROP TYPE IF EXISTS department_type CASCADE;
DROP TYPE IF EXISTS escalation_reason CASCADE;
DROP TYPE IF EXISTS escalation_priority CASCADE;

-- Drop functions
DROP FUNCTION IF EXISTS update_incident_escalations_updated_at() CASCADE;
DROP FUNCTION IF EXISTS update_escalation_notes_updated_at() CASCADE;
```

## Next Steps

After applying these migrations:

1. ✅ Update your API types to match the database schema
2. ✅ Test the escalation creation endpoint
3. ✅ Test case creation from escalations
4. ✅ Implement escalation status updates
5. ✅ Implement notes management
6. ✅ Add RLS policies if using Supabase (see security section below)

## Security (RLS Policies)

If using Supabase, add Row Level Security policies:

```sql
-- Enable RLS
ALTER TABLE public.incident_escalations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.escalation_notes ENABLE ROW LEVEL SECURITY;

-- Example policies (adjust based on your auth requirements)

-- Users can view escalations for incidents they have access to
CREATE POLICY "Users can view escalations" ON public.incident_escalations
  FOR SELECT
  USING (true);  -- Adjust based on your access control

-- Authenticated users can create escalations
CREATE POLICY "Authenticated users can create escalations" ON public.incident_escalations
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = escalated_by);

-- Users can update their own escalations
CREATE POLICY "Users can update their escalations" ON public.incident_escalations
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = escalated_by OR auth.uid() = escalated_to);

-- Similar policies for notes...
```

## Support

For issues or questions about this migration, please refer to:
- `ESCALATION_TO_CASE_IMPLEMENTATION.md` - Complete feature documentation
- `docs/incident_schema.md` - Original incident schema
- Backend API documentation
