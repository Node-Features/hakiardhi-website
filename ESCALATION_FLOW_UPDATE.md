# Escalation Flow Update - Information Only Model

## Overview
Updated the escalation system to follow the proper flow: **Incident → Escalation → Legal Case → Resolution**

Escalations are now **information-only** tracking mechanisms. Resolution status automatically syncs from linked legal cases.

## Key Changes

### ✅ Conceptual Model
**Old Model (Incorrect):**
- Users could manually "resolve" escalations
- Escalation had independent resolution

**New Model (Correct):**
- Incident → Escalation → Formal Legal Case
- Escalation tracks progress information only
- Resolution determined by legal case proceedings
- Status auto-syncs from case table

### ✅ UI Changes

#### 1. Removed Manual Resolution
- ❌ Removed "Resolve Escalation" button
- ❌ Removed `onResolve` callback prop
- ✅ Escalation status auto-updates from linked case

#### 2. Added Case Information Display
- Shows "Formal Case Created" banner when linked to case
- Displays case reference number
- Shows message: "Resolution status tracked in legal proceedings"

#### 3. Updated Action Buttons
**Old Buttons:**
- View Full Details
- **Resolve Escalation** ← Removed
- Download All Attachments

**New Buttons:**
- **View Legal Case** (when case_id exists) ← New, primary action
- **View Progress** (renamed from "View Full Details")
- Download All Attachments (conditional)

#### 4. Information Banner
Added amber info banner explaining:
- With case: "Resolution tracked through formal legal case proceedings. Status updates automatically from case management."
- Without case: "This escalation is for information and tracking purposes. Resolution will be determined through proper legal procedures."

### ✅ Data Model Changes

#### EscalationResponse Type
```typescript
export interface EscalationResponse {
  // ... existing fields

  // New case linkage fields
  case_id?: string;
  case_reference_number?: string;
  case_status?: string;

  // Auto-synced from case
  status: EscalationStatus;
  resolution_notes?: string;
  resolved_at?: string;
}
```

### ✅ Backend Updates Needed

#### 1. GET Escalations - Include Case Data
```sql
-- Current query needs JOIN
SELECT
  e.*,
  c.id as case_id,
  c.reference_number as case_reference_number,
  c.status as case_status
FROM incident_escalations e
LEFT JOIN cases c ON e.case_id = c.id
WHERE e.incident_id = ?;
```

#### 2. Auto-Sync Escalation Status
Two approaches:

**Option A: Database Trigger**
```sql
CREATE OR REPLACE FUNCTION sync_escalation_status_from_case()
RETURNS TRIGGER AS $$
BEGIN
  -- When case is updated, update linked escalations
  UPDATE incident_escalations
  SET
    status = CASE
      WHEN NEW.status = 'Closed' THEN 'resolved'::escalation_status
      WHEN NEW.status IN ('Active', 'Under Review') THEN 'in_review'::escalation_status
      ELSE status
    END,
    resolution_notes = CASE
      WHEN NEW.status = 'Closed' THEN 'Resolved through legal case proceedings'
      ELSE resolution_notes
    END,
    resolved_at = CASE
      WHEN NEW.status = 'Closed' THEN NOW()
      ELSE resolved_at
    END,
    updated_at = NOW()
  WHERE case_id = NEW.id;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_sync_escalation_from_case
  AFTER UPDATE ON cases
  FOR EACH ROW
  WHEN (OLD.status IS DISTINCT FROM NEW.status)
  EXECUTE FUNCTION sync_escalation_status_from_case();
```

**Option B: API-Level Sync**
Update case status endpoint to also update linked escalations:
```typescript
// In case update endpoint
if (statusChanged) {
  await db.from('incident_escalations')
    .update({
      status: mapCaseStatusToEscalationStatus(newCaseStatus),
      resolution_notes: newCaseStatus === 'Closed'
        ? 'Resolved through legal case proceedings'
        : null,
      resolved_at: newCaseStatus === 'Closed'
        ? new Date().toISOString()
        : null
    })
    .eq('case_id', caseId);
}
```

#### 3. Status Mapping
```typescript
function mapCaseStatusToEscalationStatus(caseStatus: string): EscalationStatus {
  switch (caseStatus) {
    case 'Open':
    case 'Pending':
      return 'acknowledged';
    case 'Active':
    case 'Under Review':
    case 'Investigation':
      return 'in_review';
    case 'Closed':
    case 'Resolved':
      return 'resolved';
    case 'Rejected':
    case 'Dismissed':
      return 'rejected';
    default:
      return 'pending';
  }
}
```

## User Flow Examples

### Scenario 1: Escalation with Case Creation
1. User creates escalation (admin/executive level or manual case creation)
2. Case automatically created and linked
3. **Escalation shows:**
   - Blue banner: "Formal Case Created - Case #2025-001234"
   - Info: "Resolution status tracked in legal proceedings"
   - Primary action: "View Legal Case" button
4. User clicks "View Legal Case" → Navigates to case details
5. **When case is updated in legal proceedings:**
   - Case status changes to "Closed"
   - Escalation status auto-updates to "resolved"
   - Escalation resolved_at timestamp set
   - Resolution notes: "Resolved through legal case proceedings"

### Scenario 2: Escalation without Case
1. User creates supervisor-level escalation
2. No case created (not admin/executive level)
3. **Escalation shows:**
   - Amber banner: "Resolution will be determined through proper legal procedures"
   - Action: "View Progress" (information only)
4. If escalation later needs formal case:
   - Admin can manually escalate to admin/executive level
   - OR create case from case management system and link it

## Migration Guide

### Frontend Updates
1. ✅ Updated `EscalationHistory.tsx`
   - Removed resolve button
   - Added case information display
   - Added "View Legal Case" button
   - Added information banners
   - Renamed "View Full Details" to "View Progress"

2. ✅ Updated `escalation.ts` types
   - Added case_id, case_reference_number, case_status fields
   - Updated comments to indicate auto-sync

3. ⚠️ Need to update any parent components that passed `onResolve` prop
   - Remove the callback
   - Remove any "Resolve" modal or actions

### Backend Updates Required
1. ⚠️ Update GET escalations endpoint to JOIN with cases table
2. ⚠️ Implement status sync (trigger or API-level)
3. ⚠️ Update case status endpoint to trigger escalation updates
4. ⚠️ Add case status mapping function

## Benefits

### ✅ Proper Separation of Concerns
- Escalations = Tracking & Information
- Cases = Legal Resolution & Formal Proceedings

### ✅ Single Source of Truth
- Case status is authoritative
- No conflicting resolution data

### ✅ Audit Trail
- Clear link between incident → escalation → case
- Legal proceedings properly tracked in case management
- Escalation history preserved for reference

### ✅ Reduced User Confusion
- Clear messaging about escalation purpose
- Obvious path to legal case details
- No ambiguity about resolution authority

## Testing Checklist

### Frontend
- [x] Escalation cards show case information when linked
- [x] "Resolve Escalation" button removed
- [x] "View Legal Case" button appears for escalations with cases
- [x] "View Progress" button shows information only
- [x] Information banners display correct messages
- [x] No TypeScript errors with updated types

### Backend (To Do)
- [ ] GET escalations returns case data (join)
- [ ] Case status updates trigger escalation sync
- [ ] Status mapping works correctly
- [ ] Escalation resolved_at syncs from case closure
- [ ] Resolution notes auto-populate

### Integration
- [ ] Create escalation with case → case_id populated
- [ ] Update case status to "Closed" → escalation becomes "resolved"
- [ ] Escalation history shows correct case reference
- [ ] "View Legal Case" button navigates correctly
- [ ] Past escalations show resolution info from case

## Files Changed

### Frontend
- ✅ `src/components/features/incidents/escalation/EscalationHistory.tsx`
- ✅ `src/types/escalation.ts`
- ⚠️ Any parent components using `onResolve` prop (need to update)

### Backend (To Do)
- ⚠️ GET escalations endpoint (add JOIN)
- ⚠️ Case update endpoint (add escalation sync)
- ⚠️ Database migration (add trigger)
- ⚠️ Add status mapping utility

### Documentation
- ✅ `ESCALATION_FLOW_UPDATE.md` (this file)
- ⚠️ Update API documentation
- ⚠️ Update user manual/help docs

## Next Steps

1. **Test frontend changes** - Verify UI updates work correctly
2. **Update backend endpoints** - Add case data JOIN
3. **Implement status sync** - Choose trigger vs API approach
4. **Update parent components** - Remove onResolve callbacks
5. **Add tests** - Verify auto-sync functionality
6. **Update documentation** - API docs and user guides

## Notes

- Escalations are now **read-only** from user perspective for resolution
- Resolution authority belongs to legal case management
- This aligns with proper legal workflow: Incident → Escalation → Formal Case → Legal Resolution
- Users can still view all escalation information and track progress
- Clear path to case details via "View Legal Case" button
