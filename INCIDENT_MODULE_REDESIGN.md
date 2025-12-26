# Incident Module Redesign - Design Document

## Executive Summary
This document outlines the comprehensive redesign of the Incident Management Module in the HakiArdhi Admin Portal, introducing a structured **Escalation Procedure System**, enhancing UX/UI, ensuring schema alignment, and implementing modern incident management workflows with follow-up reminders and notifications.

---

## 1. Schema Analysis

### Database Tables
Based on `schema.md`, the incident module uses two core tables:

#### **incidents**
```sql
- id (uuid, primary key)
- name (text, required)
- region_id (uuid, foreign key to regions, optional)
- district_id (uuid, foreign key to districts, optional)
- village_id (uuid, foreign key to villages, optional)
- description (text, optional)
- reported_by (uuid, foreign key to users, optional)
- category_id (uuid, foreign key to categories, optional)
- status (enum: Verification Pending, Under Investigation, Resolved, Closed)
- created_at, updated_at (timestamps)
```

#### **incident_files**
```sql
- id (uuid, primary key)
- incident_id (uuid, foreign key to incidents)
- project_id (uuid, foreign key to projects, optional)
- file_url (text, required)
- file_name (text, optional)
- description (text, optional)
- file_type (text, default: 'image')
- size (bigint, default: 0)
- upload_job_id (uuid, optional)
- storage_bucket (text, default: 'incident-files')
- status (enum: pending, processing, completed, failed)
- error (text, optional)
- created_by (uuid, foreign key to users, optional)
- created_at, updated_at (timestamps)
```

### Additional Tables Required for Escalation System

#### **incident_escalations** (NEW - To be added to schema)
```sql
- id (uuid, primary key)
- incident_id (uuid, foreign key to incidents, required)
- escalated_by (uuid, foreign key to users, required)
- escalated_to (uuid, foreign key to users, optional)
- escalation_level (enum: supervisor, department_head, admin, executive)
- department (text, optional) - e.g., "Legal", "Field Operations", "Management"
- reason (text, required)
- description (text, optional)
- priority (enum: low, medium, high, urgent)
- deadline (timestamp, optional)
- status (enum: pending, acknowledged, in_review, resolved, rejected)
- resolution_notes (text, optional)
- resolved_at (timestamp, optional)
- created_at, updated_at (timestamps)
```

---

## 2. Current State Issues

### Form Design
- ❌ Fields not visually grouped
- ✅ Good validation and cascading location fields
- ⚠️ No priority field in form (exists in API)
- ⚠️ No character count for description
- ⚠️ Status field missing (should be disabled for new incidents)

### Incident Timeline/Progress Flow
- ⚠️ Current tabs (Investigation, Resolution) are separate - not a unified timeline
- ⚠️ No visual workflow representation
- ⚠️ No stage-based progression like cases
- ❌ **No escalation system** (CRITICAL MISSING FEATURE)

### Incident Details Page
- ❌ "Witnesses" tab (not in schema - should be removed or integrated differently)
- ❌ No follow-up reminders section
- ❌ No notifications to reporter section
- ❌ No escalation history display
- ⚠️ Quick actions exist but no escalation action

### Brand Colors
- ⚠️ Status colors partially aligned but can improve
- ⚠️ Priority colors use orange (not in brand guide)
- ⚠️ Brand color (red) underutilized for urgent escalations

---

## 3. Redesign Strategy

### Color System (Based on Brand Guide)
```
Green (#10B981): Success states, resolved incidents, completed investigations
Blue (#3B82F6): Information, under investigation, in-progress states
Yellow (#F59E0B): Warnings, verification pending, requires attention
Red (#EF4444): Errors, urgent escalations, critical priority (use strategically)
Brand (#DC2626): Primary actions, main CTAs, executive escalations
```

### Status Color Mapping
**Incident Status**
- Verification Pending → Yellow (requires attention/verification)
- Under Investigation → Blue (active investigation)
- Resolved → Green (successfully resolved)
- Closed → Gray (archived/completed)

**Priority Levels** (for Escalations)
- Low → Gray (standard)
- Medium → Blue (moderate attention)
- High → Yellow (urgent attention)
- Urgent → Red (immediate action required)

**Escalation Status**
- Pending → Yellow (awaiting acknowledgment)
- Acknowledged → Blue (received, being reviewed)
- In Review → Blue (active review)
- Resolved → Green (escalation addressed)
- Rejected → Gray (escalation denied/invalid)

**Escalation Levels**
- Supervisor → Blue badge
- Department Head → Yellow badge
- Admin → Brand/Red badge
- Executive → Brand/Red badge with icon

---

## 4. Component Redesigns

### 4.1 IncidentForm Improvements

#### Field Grouping
```
Section 1: Basic Information
- Incident Name (required, 10-200 chars, with counter)
- Category (required dropdown, incident types only)
- Priority (optional dropdown: Low, Medium, High, Urgent)
- Status (conditionally enabled for edit, disabled for new, with color badge preview)

Section 2: Location Details
- Region (required, cascading dropdown)
- District (required, depends on region)
- Village (required, depends on district)
- Interactive map preview (suggestion for future)

Section 3: Incident Details
- Description (required, 50-5000 chars, with counter, multi-line)

Section 4: Reporter Information
- Reported By (optional, user dropdown with "Anonymous" option)
- Contact Information (email/phone - suggestion for future)
```

#### Enhanced Features
- ✅ Real-time character counter with color coding
- ✅ Field-level help tooltips
- ✅ Priority badge preview
- ✅ Status badge preview
- ✅ Required field indicators (* in red)
- ✅ Cascading location dropdowns with loading states
- ✅ Visual section dividers
- ✅ Form progress indicator (suggestion)

---

### 4.2 Incident Workflow Timeline (NEW Component)

**Component Name:** `IncidentProgressFlow.tsx`

Replace separate Investigation and Resolution tabs with a unified visual timeline showing the incident's progression through stages.

#### Timeline Visual Structure
```
┌────────────────────────────────────────────────────┐
│  Status Banner (Current incident status)           │
│  [Verification Pending/Investigation/Resolved]     │
└────────────────────────────────────────────────────┘

┌────────────────────────────────────────────────────┐
│  Progress Bar                                      │
│  ●━━━━●━━━━●━━━━○ (visual completion indicator)    │
│  Reported → Investigation → Resolution → Closed    │
└────────────────────────────────────────────────────┘

┌────────────────────────────────────────────────────┐
│  🔍 Investigation Steps (Accordion)                │
│  ├── Initial Assessment (expandable)               │
│  ├── Evidence Collection (expandable)              │
│  ├── Interviews/Witness Statements (expandable)    │
│  └── Analysis & Findings (expandable)              │
└────────────────────────────────────────────────────┘

┌────────────────────────────────────────────────────┐
│  ✅ Resolution Steps (Accordion)                   │
│  ├── Action Plan (expandable)                     │
│  ├── Implementation (expandable)                   │
│  ├── Verification (expandable)                     │
│  └── Final Report (expandable)                     │
└────────────────────────────────────────────────────┘
```

#### Accordion Card Structure
```
Header (Always Visible):
- Step number badge (color-coded by status)
- Step name (bold, e.g., "Initial Assessment")
- Status badge (Pending/In Progress/Completed)
- Date created/updated
- Expand/collapse icon
- Edit/Delete actions (on hover, if applicable)

Expanded Content:
- Description/notes field
- Metadata grid:
  - Assigned investigator
  - Started date/time
  - Last updated
  - Completed date (if applicable)
- Attachments/evidence section:
  - Uploaded files list
  - Add attachment button
  - Preview thumbnails
  - Download links
- Quick actions:
  - Mark as Completed
  - Add Notes
  - Assign Investigator
```

---

### 4.3 Escalation Procedure System (NEW - CRITICAL FEATURE)

**Component Name:** `IncidentEscalation.tsx`

This is the most important new feature, allowing incidents to be escalated to higher authorities when they require specialized attention or are not being resolved at the current level.

#### Escalation Trigger Points
Escalation actions should be available:
1. **From Incident Details Page** - Prominent "Escalate Incident" button in Quick Actions
2. **From Incident List Page** - Bulk action or individual action menu
3. **From Workflow Timeline** - "Escalate" option at any stage
4. **Automatic Triggers** (future):
   - Incident open > 30 days without progress
   - High priority incidents not acknowledged within 24 hours
   - Recurring incidents in same location

#### Escalation Modal Form

**Trigger Button:**
```jsx
<Button
  variant="danger"
  className="bg-brand-600 hover:bg-brand-700 text-white"
  onClick={openEscalationModal}
>
  <svg>...</svg> {/* Alert icon */}
  Escalate Incident
</Button>
```

**Modal Structure:**
```jsx
<Modal title="Escalate Incident" size="large">
  {/* Incident Context Summary */}
  <div className="bg-yellow-50 dark:bg-yellow-900/20 border-l-4 border-yellow-400 p-4 mb-6">
    <h4>Incident: {incident.name}</h4>
    <p>Status: {incident.status} | Priority: {incident.priority}</p>
    <p>Location: {region} - {district} - {village}</p>
  </div>

  {/* Escalation Form Fields */}
  <form>
    {/* Escalation Level */}
    <Select
      label="Escalation Level"
      required
      options={[
        { value: 'supervisor', label: 'Supervisor', icon: UserIcon, color: 'blue' },
        { value: 'department_head', label: 'Department Head', icon: BriefcaseIcon, color: 'yellow' },
        { value: 'admin', label: 'Administrator', icon: ShieldIcon, color: 'brand' },
        { value: 'executive', label: 'Executive Management', icon: CrownIcon, color: 'brand' }
      ]}
    />

    {/* Department (conditional) */}
    {level === 'department_head' && (
      <Select
        label="Department"
        required
        options={[
          { value: 'legal', label: 'Legal Affairs' },
          { value: 'field_ops', label: 'Field Operations' },
          { value: 'community', label: 'Community Relations' },
          { value: 'management', label: 'Management' }
        ]}
      />
    )}

    {/* Specific Person (conditional) */}
    {(level === 'supervisor' || level === 'admin') && (
      <UserSelect
        label="Escalate To"
        required
        roleFilter={level === 'supervisor' ? 'supervisor' : 'admin'}
        placeholder="Select person to escalate to"
      />
    )}

    {/* Reason for Escalation */}
    <Select
      label="Reason for Escalation"
      required
      options={[
        { value: 'no_progress', label: 'No Progress / Stalled' },
        { value: 'requires_expertise', label: 'Requires Specialized Expertise' },
        { value: 'high_impact', label: 'High Community Impact' },
        { value: 'legal_complexity', label: 'Legal Complexity' },
        { value: 'resource_needs', label: 'Additional Resources Needed' },
        { value: 'political_sensitivity', label: 'Political Sensitivity' },
        { value: 'other', label: 'Other (specify below)' }
      ]}
    />

    {/* Priority */}
    <Select
      label="Escalation Priority"
      required
      options={[
        { value: 'low', label: 'Low - Standard Review', color: 'gray' },
        { value: 'medium', label: 'Medium - Review within 3 days', color: 'blue' },
        { value: 'high', label: 'High - Review within 24 hours', color: 'yellow' },
        { value: 'urgent', label: 'Urgent - Immediate Attention Required', color: 'red' }
      ]}
    />

    {/* Description */}
    <TextArea
      label="Escalation Details"
      required
      rows={6}
      placeholder="Provide detailed explanation for this escalation, including any relevant context, challenges faced, and expected outcomes..."
      maxLength={2000}
      showCounter
    />

    {/* Deadline */}
    <DateTimePicker
      label="Response Deadline (Optional)"
      helpText="Set a deadline for response or action on this escalation"
    />

    {/* Action Buttons */}
    <div className="flex justify-end gap-3 mt-6">
      <Button variant="secondary" onClick={closeModal}>
        Cancel
      </Button>
      <Button
        variant="primary"
        type="submit"
        className="bg-brand-600 hover:bg-brand-700"
      >
        Submit Escalation
      </Button>
    </div>
  </form>
</Modal>
```

#### Escalation History Display

**Location:** New section in Incident Details Overview tab

```jsx
<EscalationHistory incidentId={incidentId} />
```

**Visual Design:**
```
┌──────────────────────────────────────────────────────┐
│  🚨 Escalation History                               │
│  ┌────────────────────────────────────────────────┐  │
│  │ ACTIVE ESCALATION - High Priority              │  │
│  │ Escalated to: Executive Management             │  │
│  │ Reason: High Community Impact                  │  │
│  │ Deadline: Dec 12, 2025 5:00 PM                 │  │
│  │ Status: ⏳ Pending                             │  │
│  │ [View Details] [Add Follow-up]                 │  │
│  └────────────────────────────────────────────────┘  │
│                                                       │
│  Past Escalations:                                    │
│  ┌────────────────────────────────────────────────┐  │
│  │ ✅ Escalation #2 - Resolved                    │  │
│  │ To: Department Head (Legal Affairs)            │  │
│  │ Resolved on: Dec 8, 2025                       │  │
│  │ [View Details]                                  │  │
│  └────────────────────────────────────────────────┘  │
│  ┌────────────────────────────────────────────────┐  │
│  │ ✅ Escalation #1 - Resolved                    │  │
│  │ To: Supervisor (John Doe)                      │  │
│  │ Resolved on: Dec 1, 2025                       │  │
│  │ [View Details]                                  │  │
│  └────────────────────────────────────────────────┘  │
└──────────────────────────────────────────────────────┘
```

**Card Components:**
```jsx
// Active Escalation Card (prominent styling)
<div className="border-l-4 border-brand-500 bg-brand-50 dark:bg-brand-900/20 p-6 rounded-lg shadow-md">
  <div className="flex items-start justify-between">
    <div className="flex-1">
      {/* Alert icon + Priority badge */}
      <div className="flex items-center gap-3 mb-2">
        <svg className="h-6 w-6 text-brand-600">...</svg>
        <span className="px-3 py-1 bg-yellow-100 text-yellow-800 text-xs font-semibold rounded-full">
          High Priority
        </span>
        <span className="px-3 py-1 bg-yellow-100 text-yellow-800 text-xs font-semibold rounded-full">
          Pending
        </span>
      </div>

      {/* Escalation details */}
      <h4 className="text-lg font-bold text-gray-900 dark:text-white">
        Escalated to: Executive Management
      </h4>
      <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
        Reason: High Community Impact
      </p>

      {/* Metadata grid */}
      <div className="grid grid-cols-2 gap-4 mt-4 text-sm">
        <div>
          <span className="font-semibold">Escalated by:</span> Jane Smith
        </div>
        <div>
          <span className="font-semibold">Date:</span> Dec 10, 2025
        </div>
        <div>
          <span className="font-semibold">Deadline:</span>
          <span className="text-red-600 font-semibold">Dec 12, 2025 5:00 PM</span>
        </div>
        <div>
          <span className="font-semibold">Time Remaining:</span>
          <span className="text-red-600">2 days, 3 hours</span>
        </div>
      </div>
    </div>
  </div>

  {/* Actions */}
  <div className="flex gap-2 mt-4">
    <Button size="sm" variant="outline">View Full Details</Button>
    <Button size="sm" variant="outline">Add Follow-up Note</Button>
    <Button size="sm" variant="primary">Resolve Escalation</Button>
  </div>
</div>

// Resolved Escalation Card (compact, historical)
<div className="border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-4 rounded-lg">
  <div className="flex items-center justify-between">
    <div className="flex items-center gap-3">
      <svg className="h-5 w-5 text-green-500">✓</svg>
      <div>
        <h5 className="font-semibold text-gray-900 dark:text-white">
          Escalation to Department Head (Legal Affairs)
        </h5>
        <p className="text-xs text-gray-500">Resolved on Dec 8, 2025</p>
      </div>
    </div>
    <Button size="sm" variant="ghost">View Details</Button>
  </div>
</div>
```

#### Escalation Detail View Modal

When clicking "View Details" on an escalation:

```jsx
<Modal title="Escalation Details" size="large">
  {/* Header with status */}
  <div className="border-b pb-4 mb-4">
    <div className="flex items-center justify-between">
      <h3 className="text-xl font-bold">Escalation #{escalation.id}</h3>
      <Badge color={getStatusColor(escalation.status)}>
        {escalation.status}
      </Badge>
    </div>
  </div>

  {/* Escalation Information */}
  <div className="grid grid-cols-2 gap-6 mb-6">
    <InfoField label="Escalation Level" value={escalation.level} />
    <InfoField label="Department" value={escalation.department} />
    <InfoField label="Escalated To" value={escalation.escalated_to_name} />
    <InfoField label="Escalated By" value={escalation.escalated_by_name} />
    <InfoField label="Priority" value={escalation.priority} badge />
    <InfoField label="Created" value={formatDate(escalation.created_at)} />
    <InfoField label="Deadline" value={formatDate(escalation.deadline)} />
    <InfoField label="Status" value={escalation.status} badge />
  </div>

  {/* Reason & Description */}
  <div className="mb-6">
    <h4 className="font-semibold mb-2">Reason for Escalation</h4>
    <p>{escalation.reason}</p>
  </div>

  <div className="mb-6">
    <h4 className="font-semibold mb-2">Details</h4>
    <p className="text-gray-600 dark:text-gray-400">{escalation.description}</p>
  </div>

  {/* Resolution Notes (if resolved) */}
  {escalation.resolution_notes && (
    <div className="bg-green-50 dark:bg-green-900/20 border-l-4 border-green-500 p-4 mb-6">
      <h4 className="font-semibold mb-2 text-green-900 dark:text-green-300">
        Resolution
      </h4>
      <p className="text-green-800 dark:text-green-400">{escalation.resolution_notes}</p>
      <p className="text-xs text-green-600 dark:text-green-500 mt-2">
        Resolved on {formatDate(escalation.resolved_at)}
      </p>
    </div>
  )}

  {/* Follow-up Notes Timeline */}
  <div className="mb-6">
    <h4 className="font-semibold mb-3">Follow-up Notes</h4>
    <div className="space-y-3">
      {escalation.notes.map(note => (
        <div key={note.id} className="border-l-2 border-gray-300 pl-4 py-2">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-sm text-gray-700 dark:text-gray-300">{note.content}</p>
              <p className="text-xs text-gray-500 mt-1">
                {note.created_by_name} - {formatDate(note.created_at)}
              </p>
            </div>
          </div>
        </div>
      ))}
    </div>
  </div>

  {/* Actions (if pending/active) */}
  {escalation.status !== 'resolved' && (
    <div className="flex justify-end gap-3 pt-4 border-t">
      <Button variant="outline">Add Follow-up Note</Button>
      <Button variant="primary">Mark as Resolved</Button>
    </div>
  )}
</Modal>
```

#### Escalation Notification System

When an escalation is created, the system should:
1. ✅ Send email to escalated recipient
2. ✅ Send SMS if urgent priority
3. ✅ Create in-app notification
4. ✅ Add to recipient's task dashboard
5. ✅ Schedule reminder notifications based on deadline
6. ✅ Send deadline approaching alerts (24h, 6h, 1h before)

---

### 4.4 Incident Details Page Restructure

#### Remove These Tabs/Sections
- ❌ Witnesses (move to Notes or Investigation accordion steps if needed)

#### Keep These Tabs
- ✅ Overview
- ✅ Files (incident_files)
- ✅ Notes

#### Replace These Tabs
- 🔄 Investigation → Part of new "Progress Flow" tab
- 🔄 Resolution → Part of new "Progress Flow" tab

#### New Tabs to Add
- ✅ **Progress Flow** (replaces Investigation + Resolution)
- ✅ **Escalations** (new dedicated tab for escalation management)

#### New Sections to Add

**Follow-Up Reminders** (New Component)
```jsx
<IncidentReminders incidentId={incidentId} />
```
Location: Inside Overview tab, after incident information

Features:
- List of upcoming follow-up reminders
- Add new reminder modal
- Date/time picker
- Reminder type (site visit, call reporter, check status, meeting)
- Notification method (email/SMS/in-app)
- Days before notification (configurable)
- Status indicator (upcoming, overdue, completed)
- Quick actions (reschedule, mark complete, delete)

**Incident Notifications** (New Component)
```jsx
<IncidentNotifications incidentId={incidentId} reporterId={incident.reported_by} />
```
Location: Inside Overview tab, after reminders

Features:
- Send notification to incident reporter
- Notification templates (status update, resolution update, follow-up request)
- Custom message option
- Delivery method (email, SMS, both)
- Notification history
- Read receipts (if supported)
- Quick message presets
- Auto-notify on status changes (optional setting)

---

### 4.5 Layout Improvements

#### Overview Tab Structure
```
┌─────────────────────────────────────────┐
│  Incident Information Card              │
│  (Basic details, edit button)           │
└─────────────────────────────────────────┘

┌─────────────────────────────────────────┐
│  🚨 Active Escalations (if any)         │
│  (Prominent visual indicator)           │
└─────────────────────────────────────────┘

┌─────────────────────────────────────────┐
│  Follow-Up Reminders                    │
│  (Upcoming actions, add new)            │
└─────────────────────────────────────────┘

┌─────────────────────────────────────────┐
│  Notifications to Reporter              │
│  (Send message, history)                │
└─────────────────────────────────────────┘
```

#### Progress Flow Tab Structure
```
┌─────────────────────────────────────────┐
│  Status Banner                          │
│  (Current incident status, visual)      │
└─────────────────────────────────────────┘

┌─────────────────────────────────────────┐
│  Progress Indicator                     │
│  (Visual timeline bar)                  │
└─────────────────────────────────────────┘

┌─────────────────────────────────────────┐
│  Investigation Timeline                 │
│  ├── Step 1 Accordion                   │
│  │   ├── Details, assignee, dates      │
│  │   └── Attachments (with add button) │
│  ├── Step 2 Accordion                   │
│  └── Step 3 Accordion                   │
└─────────────────────────────────────────┘

┌─────────────────────────────────────────┐
│  Resolution Timeline                    │
│  ├── Step 1 Accordion                   │
│  └── Step 2 Accordion                   │
└─────────────────────────────────────────┘
```

#### Escalations Tab Structure (NEW)
```
┌─────────────────────────────────────────┐
│  Escalate Incident Button               │
│  (Primary CTA if no active escalation)  │
└─────────────────────────────────────────┘

┌─────────────────────────────────────────┐
│  Active Escalation (if exists)          │
│  (Prominent card with all details)      │
└─────────────────────────────────────────┘

┌─────────────────────────────────────────┐
│  Escalation History                     │
│  (List of past escalations)             │
└─────────────────────────────────────────┘

┌─────────────────────────────────────────┐
│  Escalation Analytics (suggestion)      │
│  - Average resolution time              │
│  - Success rate by level                │
│  - Most common reasons                  │
└─────────────────────────────────────────┘
```

---

## 5. Brand Color Application

### Status Indicators
```css
/* Incident Statuses */
.status-verification-pending {
  @apply bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400;
}
.status-under-investigation {
  @apply bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400;
}
.status-resolved {
  @apply bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400;
}
.status-closed {
  @apply bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400;
}

/* Escalation Priority */
.priority-low {
  @apply bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400;
}
.priority-medium {
  @apply bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400;
}
.priority-high {
  @apply bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400;
}
.priority-urgent {
  @apply bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400;
}

/* Escalation Status */
.escalation-pending {
  @apply bg-yellow-500 border-yellow-500;
}
.escalation-acknowledged {
  @apply bg-blue-500 border-blue-500;
}
.escalation-in-review {
  @apply bg-blue-500 border-blue-500;
}
.escalation-resolved {
  @apply bg-green-500 border-green-500;
}
.escalation-rejected {
  @apply bg-gray-500 border-gray-500;
}

/* Escalation Level Badges */
.level-supervisor {
  @apply bg-blue-100 text-blue-800 border-blue-300;
}
.level-department-head {
  @apply bg-yellow-100 text-yellow-800 border-yellow-300;
}
.level-admin {
  @apply bg-brand-100 text-brand-800 border-brand-300;
}
.level-executive {
  @apply bg-brand-100 text-brand-800 border-brand-300;
}
```

### Visual Elements
- **Progress timeline nodes**: Color-coded by step status (pending/active/completed)
- **Escalation cards**: Red border-left for active, green for resolved
- **Alert banners**: Yellow for pending escalations, red for overdue
- **Action buttons**: Brand color for escalate action, blue for progress actions
- **Deadline indicators**: Color-coded based on time remaining (green > 7 days, yellow 3-7 days, red < 3 days)

---

## 6. Additional Recommendations

### 🎯 High Priority

**1. Escalation Analytics Dashboard**
- Escalation rate by region/district
- Average escalation resolution time
- Success rate by escalation level
- Most common escalation reasons
- Bottleneck identification

**2. Smart Escalation Triggers**
- Auto-escalate if no progress in X days
- Auto-escalate high-priority incidents
- Escalation recommendation based on incident type
- Pattern detection (recurring incidents → auto-escalate)

**3. Incident Search & Filtering**
- Advanced search with multiple criteria
- Filter by status, priority, location, category, escalation status
- Saved filter presets
- Export filtered results
- Bulk actions on filtered results

### 🚀 Enhanced UX

**4. Geospatial Visualization**
- Map view of incidents by location
- Heat map of incident concentration
- Cluster analysis
- Incident patterns by region
- Interactive map filtering

**5. Reporter Communication Hub**
- Two-way messaging with reporters
- SMS integration for updates
- Email templates for common communications
- Auto-update reporters on status changes
- Reporter feedback collection

**6. Progress Automation**
- Workflow automation (status transitions)
- Auto-assign based on location/category
- Template-based investigation steps
- Pre-filled resolution actions based on incident type
- Smart deadline suggestions

### ⚡ Performance

**7. Optimization**
- Lazy load incident files
- Infinite scroll for long lists
- Image thumbnail generation
- PDF preview integration
- Caching for location data

### ♿ Accessibility

**8. WCAG 2.1 AA Compliance**
- Keyboard navigation for all interactions
- ARIA labels for screen readers
- Color contrast ratio > 4.5:1
- Focus indicators on all interactive elements
- Alt text for all images/icons
- Form error announcements

### 📱 Responsive Design

**9. Mobile Optimization**
- Simplified timeline for mobile
- Bottom sheet modals on mobile
- Touch-friendly targets (min 44x44px)
- Swipe gestures for navigation
- Optimized file upload for mobile

### 🔒 Security & Compliance

**10. Data Protection**
- Audit log for all incident modifications
- Role-based access control for escalations
- Sensitive data masking
- Secure file encryption
- Escalation approval workflows (future)

---

## 7. Implementation Phases

### Phase 1: Core Improvements & Escalation System (Current Sprint)
- ✅ Redesign IncidentForm with visual grouping and priority field
- ✅ Create IncidentProgressFlow component (unified timeline)
- ✅ **Create IncidentEscalation component (CRITICAL)**
- ✅ **Create escalation history display**
- ✅ Remove Witnesses tab (integrate into Investigation if needed)
- ✅ Create IncidentReminders component
- ✅ Create IncidentNotifications component
- ✅ Apply brand colors consistently
- ✅ **Add incident_escalations table to schema**

### Phase 2: Enhanced Features
- Search & filtering with escalation status
- Bulk actions including bulk escalate
- Analytics dashboard with escalation metrics
- Smart escalation triggers
- Geospatial visualization

### Phase 3: Advanced Capabilities
- Two-way reporter communication
- Workflow automation
- Mobile optimization
- Performance enhancements
- Advanced escalation analytics

---

## 8. Success Metrics

### User Experience
- Reduce time to escalate incident: Target < 2 minutes
- Reduce time to report incident: Target < 3 minutes
- Increase escalation resolution rate: Target > 85%
- Escalation acknowledgment time: Target < 4 hours

### System Performance
- Page load time: Target < 2 seconds
- Search response time: Target < 500ms
- File upload speed: Target < 5 seconds for 10MB
- Escalation creation time: Target < 1 second

### Operational Metrics
- Incident resolution rate: Target > 80%
- Average escalation time: Track and reduce over time
- Reporter satisfaction: Target 8/10
- Escalation effectiveness: Target 90% of escalations lead to resolution

### User Satisfaction
- Incident management ease: Target 8/10
- Escalation process clarity: Target 9/10
- Timeline visualization helpfulness: Target 8.5/10
- Overall module satisfaction: Target 8.5/10

---

## 9. Brand Visual Guide Reference

### Color Palette
```
Primary Brand: #DC2626 (Red) - Escalations, urgent actions
Success: #10B981 (Green) - Resolved, completed
Info: #3B82F6 (Blue) - Under investigation, acknowledged
Warning: #F59E0B (Yellow/Amber) - Pending, requires attention
Error: #EF4444 (Red) - Failed, rejected
```

### Typography
- Headings: font-bold, text-gray-900 dark:text-white
- Body: font-normal, text-gray-700 dark:text-gray-300
- Labels: font-semibold text-sm, text-gray-700 dark:text-gray-300
- Helper text: text-xs, text-gray-500 dark:text-gray-400
- Escalation headers: font-bold text-lg, with brand color accents

### Spacing
- Section gap: space-y-6
- Card padding: p-6
- Form field gap: space-y-4
- Button gap: gap-3
- Escalation card padding: p-6 (prominent)

### Borders & Shadows
- Card border: border border-gray-200 dark:border-gray-700
- Card shadow: shadow-sm hover:shadow-lg
- Border radius: rounded-lg (8px) or rounded-xl (12px)
- **Escalation card**: border-l-4 border-brand-500 shadow-md (visual prominence)

---

## 10. Technical Stack

### Components Used
- React (Next.js 14)
- TypeScript
- Tailwind CSS
- Framer Motion (animations)
- React Hook Form (forms)
- Zod (validation)
- React Hot Toast (notifications)

### API Integration
- RESTful API (incidentsService)
- **New escalationsService** for escalation CRUD operations
- Optimistic updates
- Error handling with toasts
- Loading states
- Real-time notifications (future: WebSocket/SSE)

### New Services Required
```typescript
// lib/api/services/escalations.ts
export const escalationsService = {
  create: (data: CreateEscalationRequest) => Promise<EscalationResponse>,
  getByIncident: (incidentId: string) => Promise<EscalationResponse[]>,
  getById: (id: string) => Promise<EscalationResponse>,
  update: (id: string, data: UpdateEscalationRequest) => Promise<EscalationResponse>,
  resolve: (id: string, notes: string) => Promise<EscalationResponse>,
  addNote: (id: string, note: string) => Promise<NoteResponse>,
  getStats: () => Promise<EscalationStatsResponse>
}
```

---

## 11. Escalation Workflow Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│                     INCIDENT CREATED                             │
│                            │                                     │
│                            ▼                                     │
│                  Verification Pending                            │
│                            │                                     │
│         ┌──────────────────┼──────────────────┐                 │
│         ▼                  ▼                  ▼                  │
│   Normal Flow      ESCALATION TRIGGERED   Investigation         │
│         │                  │                  │                  │
│         │                  ▼                  │                  │
│         │         ┌────────────────┐         │                  │
│         │         │  Escalation    │         │                  │
│         │         │  Modal Form    │         │                  │
│         │         └────────┬───────┘         │                  │
│         │                  │                  │                  │
│         │                  ▼                  │                  │
│         │         Select Level:               │                  │
│         │         - Supervisor                │                  │
│         │         - Department Head           │                  │
│         │         - Admin                     │                  │
│         │         - Executive                 │                  │
│         │                  │                  │                  │
│         │                  ▼                  │                  │
│         │         Create Escalation           │                  │
│         │         Record in DB                │                  │
│         │                  │                  │                  │
│         │                  ▼                  │                  │
│         │         Notify Recipient            │                  │
│         │         (Email/SMS/In-App)         │                  │
│         │                  │                  │                  │
│         │         ┌────────┼────────┐        │                  │
│         │         ▼        ▼        ▼         │                  │
│         │    Pending  Acknowledged  In Review │                  │
│         │         │        │         │         │                  │
│         │         └────────┴─────────┤        │                  │
│         │                            ▼         │                  │
│         │                    Resolved/Rejected │                  │
│         │                            │         │                  │
│         └────────────────────────────┼─────────┘                 │
│                                      ▼                            │
│                         Incident Resolution                       │
│                                      │                            │
│                                      ▼                            │
│                                  Closed                           │
└─────────────────────────────────────────────────────────────────┘
```

---

## Conclusion

This redesign transforms the Incident Module into a comprehensive, efficient incident management system with a **robust escalation framework**, ensuring incidents receive appropriate attention at all organizational levels. The redesign aligns strictly with the schema, follows brand guidelines, and implements modern UX patterns.

**Key Improvements:**
✅ Schema-aligned form structure with priority field
✅ Unified progress flow timeline (replaces separate tabs)
✅ **Comprehensive escalation procedure system** (CRITICAL NEW FEATURE)
✅ Escalation history tracking and visualization
✅ Follow-up reminders functionality
✅ Reporter notification system
✅ Strategic brand color usage with visual prominence for escalations
✅ Enhanced UX patterns
✅ Accessibility compliance
✅ Performance optimizations

**Critical Escalation Features:**
🚨 Multi-level escalation (supervisor → department → admin → executive)
🚨 Priority-based escalation handling
🚨 Deadline tracking with alerts
🚨 Visual prominence using brand colors
🚨 Escalation history and analytics
🚨 Automated notifications to recipients
🚨 Follow-up note system
🚨 Resolution tracking

**Next Steps:**
1. Review and approve design document
2. Add `incident_escalations` table to schema
3. Implement Phase 1 improvements (forms, workflow, **escalation system**)
4. Create escalation API endpoints
5. User testing with escalation workflows
6. Iterate and refine
7. Plan Phase 2 features
