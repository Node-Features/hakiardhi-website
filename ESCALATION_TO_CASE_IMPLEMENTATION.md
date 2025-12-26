# Escalation to Case Implementation - Complete

## Overview
This document describes the complete implementation of the escalation-to-case creation flow, allowing incidents to be escalated and optionally converted into formal cases for structured legal resolution.

## Implementation Summary

### Backend Implementation

#### 1. Validation Schema
**File:** `Backend/v1/src/lib/incidents/escalation_validation.ts`

Created comprehensive validation schema supporting:
- Standard escalation fields (level, reason, priority, description)
- Optional case creation fields (create_case, case_title, case_description)

```typescript
export const EscalationValidation = z.object({
    escalation_level: z.enum(["supervisor", "department_head", "admin", "executive"]),
    department: z.enum(["legal", "field_ops", "community", "management"]).optional(),
    escalated_to: z.string().uuid().optional(),
    reason: z.enum([...]),
    description: z.string().min(20).max(2000),
    priority: z.enum(["low", "medium", "high", "urgent"]),
    deadline: z.string().datetime().optional(),
    create_case: z.boolean().default(false),
    case_title: z.string().min(10).max(200).optional(),
    case_description: z.string().min(50).max(5000).optional(),
});
```

#### 2. Escalation Endpoint
**File:** `Backend/v1/src/app/api/admin/incidents/[id]/escalation/route.ts`

**Endpoint:** `POST /api/admin/incidents/{id}/escalation`

**Features:**
- Creates escalation record with all metadata
- **Auto-creates case** when:
  - User explicitly sets `create_case: true`, OR
  - Escalation level is `admin` or `executive`
- Links case to escalation via `case_id` foreign key
- Creates initial case stage ("Open")
- Returns both escalation and case data
- Comprehensive error handling and logging

**Request Body:**
```json
{
  "escalation_level": "admin",
  "reason": "legal_complexity",
  "description": "Detailed escalation explanation...",
  "priority": "urgent",
  "deadline": "2025-12-31T23:59:59Z",
  "create_case": true,
  "case_title": "Land Dispute Case: Boundary Conflict",
  "case_description": "Comprehensive case description with legal background..."
}
```

**Response:**
```json
{
  "success": true,
  "message": "Escalation and case created successfully",
  "data": {
    "escalation": {
      "id": "esc-uuid",
      "incident_id": "inc-uuid",
      "escalation_level": "admin",
      "status": "pending",
      "case_id": "case-uuid",
      ...
    },
    "case": {
      "id": "case-uuid",
      "reference_number": "CASE-2025-001234",
      "title": "Land Dispute Case: Boundary Conflict",
      "status": "Open",
      ...
    }
  }
}
```

**Case Creation Logic:**
1. Fetches incident details (name, description, category, reporter)
2. Prepares case payload with:
   - `title`: User-provided or auto-generated from incident name
   - `description`: User-provided or combined from incident + escalation details
   - `category_id`: Inherited from incident
   - `submitted_by`: Inherited from incident reporter
   - `assigned_to`: Escalated person (if specified)
   - `status`: "Open"
   - `reference_number`: Auto-generated unique number
3. Validates case data against CaseValidation schema
4. Creates case record
5. Creates initial case stage
6. Links case to escalation

### Frontend Implementation

#### 3. Service Layer Update
**File:** `src/lib/api/services/escalations.ts`

Updated `create` method to:
- Accept case creation parameters
- Call real API endpoint (removed mock implementation)
- Return both escalation and optional case data

```typescript
create: async (data: CreateEscalationRequest & {
  create_case?: boolean;
  case_title?: string;
  case_description?: string;
}): Promise<{ data: EscalationResponse; case?: any }> => {
  const response = await authApi.post(
    `/api/admin/incidents/${data.incident_id}/escalation`,
    data
  );

  return {
    data: response.data.escalation,
    case: response.data.case,
  };
}
```

#### 4. EscalationModal Component Enhancement
**File:** `src/components/features/incidents/escalation/EscalationModal.tsx`

**New Features:**

##### A. Case Creation Section
Professional UI section with:
- **Dashed border container** with zinc background
- **Case Management header** with icon
- **Auto-create info banner** for admin/executive levels (blue)
- **Checkbox toggle** with descriptive text
- **Conditional fields** that appear when enabled

##### B. Form Fields

**Create Case Checkbox:**
- Automatically checked and disabled for admin/executive levels
- Shows descriptive text about case benefits
- Clean toggle design with zinc colors

**Case Title Input:**
- Required when create_case is enabled
- Min 10, max 200 characters
- Placeholder: Auto-generated from incident name
- Character counter
- Red focus ring matching brand

**Case Description Textarea:**
- Required when create_case is enabled
- Min 50, max 5000 characters
- 5 rows
- Comprehensive placeholder text
- Character counter
- Red focus ring matching brand

##### C. Validation
Enhanced `validateForm()` to check:
- Case title: Required, 10-200 chars when create_case is true
- Case description: Required, 50-5000 chars when create_case is true
- Shows inline error messages

##### D. Submission Handling
Updated `handleSubmit()` to:
- Include case creation fields in request
- Show different success messages based on whether case was created
- Display case reference number in success toast
- Pass created case to parent callback

##### E. UI Enhancements
- **Dynamic submit button text:**
  - "Submit Escalation" (normal)
  - "Create Escalation & Case" (when creating case)
  - "Creating Escalation & Case..." (loading)
- **Fully rounded buttons** (`shape="pill"`)
- **Red gradient button** matching design system
- **Auto-create info banner** for transparency

##### F. Visual Design
```typescript
// Case Creation Section
<div className="rounded-lg border-2 border-dashed border-zinc-300 bg-zinc-50/50 p-5">
  {/* Header */}
  <h3>Case Management</h3>

  {/* Auto-create banner for admin/executive */}
  {['admin', 'executive'].includes(level) && (
    <div className="border border-blue-200 bg-blue-50">
      Auto-create enabled: Level escalations automatically create a case
    </div>
  )}

  {/* Checkbox */}
  <input type="checkbox" checked={create_case || isAutoCreate} />

  {/* Conditional Fields */}
  {shouldShowCaseFields && (
    <>
      <input type="text" /> {/* Case Title */}
      <textarea /> {/* Case Description */}
    </>
  )}
</div>
```

## User Flow

### Standard Escalation (No Case)
1. User opens escalation modal
2. Fills escalation details (level, reason, priority, description)
3. Leaves "Create case" unchecked
4. Clicks "Submit Escalation"
5. **Result:** Escalation created only

### Manual Case Creation
1. User opens escalation modal
2. Fills escalation details
3. Checks "Create a formal case" checkbox
4. Case fields appear
5. Fills case title and description
6. Clicks "Create Escalation & Case"
7. **Result:** Both escalation and case created
8. Success toast shows case reference number

### Auto Case Creation (Admin/Executive)
1. User selects "Administrator" or "Executive" escalation level
2. Blue info banner appears explaining auto-create
3. Checkbox is automatically checked and disabled
4. Case fields appear (required)
5. User fills case title and description
6. Button shows "Create Escalation & Case"
7. **Result:** Both escalation and case created automatically

## Key Features

### Backend
✅ Robust validation with Zod
✅ Auto-generate case reference numbers
✅ Link cases to escalations via foreign key
✅ Create initial case stage automatically
✅ Inherit incident metadata (category, reporter, location)
✅ Comprehensive error handling
✅ Detailed logging with timestamps

### Frontend
✅ Professional case creation UI
✅ Auto-create transparency for admin/executive
✅ Conditional field display
✅ Real-time character counters
✅ Inline validation errors
✅ Dynamic button text
✅ Success messages with case reference
✅ Fully rounded buttons (pill shape)
✅ Red gradient design matching brand
✅ Clean white/zinc color palette

## Database Schema

### incident_escalations Table
```sql
- id: uuid (PK)
- incident_id: uuid (FK -> incidents)
- case_id: uuid (FK -> cases) -- LINKS TO CASE
- escalated_by: uuid
- escalated_to: uuid
- escalation_level: text
- department: text
- reason: text
- reason_label: text
- description: text
- priority: text
- deadline: timestamp
- status: text
- resolution_notes: text
- created_at: timestamp
- updated_at: timestamp
```

### cases Table
```sql
- id: uuid (PK)
- reference_number: text (UNIQUE)
- title: text
- description: text
- category_id: uuid (FK)
- submitted_by: uuid
- assigned_to: uuid
- status: text
- created_at: timestamp
- updated_at: timestamp
```

### case_stages Table
```sql
- id: uuid (PK)
- case_id: uuid (FK -> cases)
- name: text
- description: text
- status: text
- order_index: integer
- created_at: timestamp
```

## Testing Checklist

### Backend
- [ ] Test escalation creation without case
- [ ] Test escalation with manual case creation
- [ ] Test auto case creation for admin level
- [ ] Test auto case creation for executive level
- [ ] Test case reference number generation
- [ ] Test validation errors (missing title, short description)
- [ ] Test case-escalation linkage
- [ ] Verify initial case stage creation

### Frontend
- [ ] Test checkbox toggle
- [ ] Test auto-enable for admin/executive
- [ ] Test conditional field display
- [ ] Test validation (required fields, character limits)
- [ ] Test character counters
- [ ] Test success message with case reference
- [ ] Test error handling
- [ ] Verify button text changes
- [ ] Verify fully rounded buttons

## Next Steps

1. **Test Complete Flow:** After backend server restart, test end-to-end
2. **Case Navigation:** Add link to view created case from success toast
3. **Escalation History:** Update to show linked case reference
4. **Case Details:** Show originating escalation in case details page
5. **Permissions:** Implement role-based access for case creation

## API Documentation

### POST /api/admin/incidents/{id}/escalation

**Authentication:** Required (Bearer token)

**Path Parameters:**
- `id` (uuid): Incident ID

**Request Body:**
```typescript
{
  escalation_level: "supervisor" | "department_head" | "admin" | "executive"
  department?: "legal" | "field_ops" | "community" | "management"
  escalated_to?: string (uuid)
  reason: "no_progress" | "requires_expertise" | "high_impact" | "legal_complexity" | "resource_needs" | "political_sensitivity" | "other"
  description: string (20-2000 chars)
  priority: "low" | "medium" | "high" | "urgent"
  deadline?: string (ISO datetime)
  create_case?: boolean
  case_title?: string (10-200 chars)
  case_description?: string (50-5000 chars)
}
```

**Success Response (201):**
```typescript
{
  success: true
  message: string
  data: {
    escalation: EscalationResponse
    case?: CaseResponse
  }
}
```

**Error Responses:**
- `400`: Validation error
- `404`: Incident not found
- `401`: Unauthorized
- `500`: Server error

## Notes

- Admin/Executive escalations **always** create cases
- Case title defaults to "Case: {incident.name}" if not provided
- Case description combines incident details + escalation reason if not provided
- Cases inherit category and reporter from original incident
- Initial case stage is always "Open" with status "Ongoing"
- Reference numbers are auto-generated in format: CASE-YYYY-NNNNNN

## Implementation Status

✅ Backend validation schema
✅ Backend escalation endpoint
✅ Case creation logic
✅ Case-escalation linking
✅ Frontend service update
✅ Frontend modal enhancement
✅ Form validation
✅ UI design (white/zinc/red)
✅ Auto-create transparency
✅ Success messaging
✅ Fully rounded buttons

**Status:** Complete and ready for testing
