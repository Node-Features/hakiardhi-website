# Case Module Redesign - Design Document

## Executive Summary
This document outlines the comprehensive redesign of the Case Management Module in the HakiArdhi Admin Portal, focusing on improved UX/UI, schema alignment, and modern case management workflows.

---

## 1. Schema Analysis

### Database Tables
Based on `schema.md`, the case module uses three core tables:

#### **cases**
```sql
- id (uuid, primary key)
- title (text, required)
- reference_number (text, unique, auto-generated)
- submitted_by (uuid, foreign key to users)
- assigned_to (uuid, foreign key to users, optional)
- category_id (uuid, foreign key to categories)
- description (text, required)
- status (enum: Open, Under Review, Investigation, Legal Action, Mediation, Ongoing, Resolved, Closed)
- created_at, updated_at (timestamps)
```

#### **case_stages**
```sql
- id (uuid, primary key)
- case_id (uuid, foreign key to cases)
- name (text, required)
- description (text, optional)
- next_stage (text, optional)
- status (enum: Ongoing, Resolved, Pending)
- created_at, updated_at (timestamps)
```

#### **stage_attachments**
```sql
- id (uuid, primary key)
- case_id (uuid, foreign key to cases)
- stage_id (uuid, foreign key to case_stages)
- file_url (text, required)
- file_name (text)
- description (text)
- file_type (text, default: 'image')
- size (bigint, default: 0)
- status (enum: pending, processing, completed, failed)
- created_at, updated_at (timestamps)
```

---

## 2. Current State Issues

### Form Design
- ❌ Fields not grouped logically
- ❌ Character count feedback could be better
- ❌ No helper text for complex fields
- ❌ Status dropdown enabled for new cases (should be disabled)

### Timeline/Stages
- ⚠️ Good accordion design but missing attachment display
- ⚠️ No dedicated "Add Attachment" button per stage
- ⚠️ Evidence upload only during stage creation/edit
- ⚠️ No visual representation of attachments

### Case Details Page
- ❌ Unnecessary "Hearings" tab (not in schema)
- ❌ Unnecessary "Parties" tab (not in schema)
- ❌ No court date reminders section
- ❌ No notifications to plaintiff section
- ❌ Status badge in wrong location

### Brand Colors
- ⚠️ Inconsistent use of green, blue, yellow
- ⚠️ Brand color (red) overused where yellow/green would be better
- ⚠️ Status indicators don't leverage full color palette

---

## 3. Redesign Strategy

### Color System (Based on Brand Guide)
```
Green (#10B981): Success states, resolved cases, completed stages
Blue (#3B82F6): Information, ongoing cases, in-progress states
Yellow (#F59E0B): Warnings, pending states, requires attention
Red (#EF4444): Errors, urgent items, deletions (use sparingly)
Brand (#DC2626): Primary actions, main CTAs
```

### Status Color Mapping
**Case Status**
- Open → Blue (new, informational)
- Under Review → Yellow (requires attention)
- Investigation → Yellow (requires attention)
- Legal Action → Brand/Red (serious)
- Mediation → Blue (ongoing process)
- Ongoing → Blue (active)
- Resolved → Green (success)
- Closed → Gray (archived)

**Stage Status**
- Ongoing → Blue (active)
- Pending → Yellow (waiting)
- Resolved → Green (complete)

---

## 4. Component Redesigns

### 4.1 CaseForm Improvements

#### Field Grouping
```
Section 1: Basic Information
- Title (required, 10-200 chars)
- Reference Number (disabled, auto-generated, with copy button)
- Category (required dropdown)
- Status (conditionally enabled, with color badge preview)

Section 2: Assignment & Responsibility
- Submitted By / Plaintiff (required, beneficiary dropdown with search)
- Assigned To / Lawyer (optional, user dropdown with role filter)

Section 3: Case Details
- Description (required, 50-5000 chars, rich text editor suggestion)
```

#### Enhanced Features
- ✅ Real-time character counter with color coding
- ✅ Field-level help tooltips
- ✅ Auto-save draft functionality (suggestion)
- ✅ Copy reference number button
- ✅ Status preview badge
- ✅ Required field indicators (* in red)

---

### 4.2 Case Timeline (CaseStagesAccordion) Redesign

#### Timeline Visual Enhancements
```
- Vertical timeline line (gradient)
- Stage nodes with status-based colors
- Stage number badges
- Expandable accordion cards
- Smooth animations
- Progress indicator
```

#### Accordion Card Structure
```
Header (Always Visible):
- Stage number badge
- Stage name (bold)
- Status badge (color-coded)
- Created date
- Expand/collapse icon
- Edit/Delete actions (on hover)

Expanded Content:
- Description (if provided)
- Metadata grid:
  - Created date/time
  - Last updated
  - Next stage (if specified)
- Attachments section:
  - List of uploaded evidence
  - Add Attachment button
  - Preview thumbnails
  - Download links
- Quick actions:
  - Mark as Resolved
  - Update Status
```

#### New Features
- ✅ Attachments displayed inline in each stage
- ✅ "Add Attachment" button per stage
- ✅ File preview thumbnails (images)
- ✅ Document icons (PDFs, docs)
- ✅ File metadata (size, type, date)
- ✅ Download/view attachments
- ✅ Delete attachment confirmation
- ✅ Drag & drop file upload (suggestion)

---

### 4.3 Case Details Page Restructure

#### Remove These Tabs
- ❌ Hearings (not in schema)
- ❌ Parties (not in schema)

#### Keep These Tabs
- ✅ Overview
- ✅ Case Stages (renamed to "Timeline")
- ✅ Files (general case files)
- ✅ Notes

#### New Sections to Add

**Court Date Reminders** (New Component)
```jsx
<CourtReminders caseId={caseId} />
```
Location: Inside Overview tab, after case information

Features:
- List of upcoming court dates
- Add new reminder modal
- Date/time picker
- Reminder type (hearing, filing deadline, consultation)
- Email/SMS notification toggle
- Days before notification (configurable)
- Status indicator (upcoming, overdue, completed)
- Quick actions (reschedule, mark complete, delete)

**Case Notifications** (New Component)
```jsx
<CaseNotifications caseId={caseId} beneficiaryId={caseData.submitted_by} />
```
Location: Inside Overview tab, after reminders

Features:
- Send notification to plaintiff/beneficiary
- Notification templates (case update, court date, document request)
- Custom message option
- Delivery method (email, SMS, both)
- Notification history
- Read receipts (if supported)
- Quick message presets

---

### 4.4 Layout Improvements

#### Overview Tab Structure
```
┌─────────────────────────────────────────┐
│  Case Information Card                  │
│  (Basic details, edit button)           │
└─────────────────────────────────────────┘

┌─────────────────────────────────────────┐
│  Court Date Reminders                   │
│  (Upcoming dates, add new)              │
└─────────────────────────────────────────┘

┌─────────────────────────────────────────┐
│  Notifications to Plaintiff             │
│  (Send message, history)                │
└─────────────────────────────────────────┘
```

#### Timeline Tab Structure
```
┌─────────────────────────────────────────┐
│  Status Banner                          │
│  (Current case status, visual badge)    │
└─────────────────────────────────────────┘

┌─────────────────────────────────────────┐
│  Add Stage Button                       │
└─────────────────────────────────────────┘

┌─────────────────────────────────────────┐
│  Timeline                               │
│  ├── Stage 1 Accordion                  │
│  │   ├── Details                        │
│  │   └── Attachments (with add button)  │
│  ├── Stage 2 Accordion                  │
│  └── Stage 3 Accordion                  │
└─────────────────────────────────────────┘
```

---

## 5. Brand Color Application

### Status Indicators
```css
/* Case Statuses */
.status-open { @apply bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400; }
.status-under-review { @apply bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400; }
.status-investigation { @apply bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400; }
.status-legal-action { @apply bg-brand-100 text-brand-800 dark:bg-brand-900/20 dark:text-brand-400; }
.status-mediation { @apply bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400; }
.status-ongoing { @apply bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400; }
.status-resolved { @apply bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400; }
.status-closed { @apply bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400; }

/* Stage Statuses */
.stage-ongoing { @apply bg-blue-500 border-blue-500; }
.stage-pending { @apply bg-yellow-500 border-yellow-500; }
.stage-resolved { @apply bg-green-500 border-green-500; }
```

### Visual Elements
- **Timeline nodes**: Color-coded by stage status
- **Progress bars**: Green for progress, yellow for pending
- **Alert banners**: Yellow for warnings, green for success, blue for info
- **Action buttons**: Brand color for primary, gray for secondary

---

## 6. Additional Recommendations

### 🎯 High Priority

**1. Search & Filtering**
- Add advanced search in cases list
- Filter by status, category, assignee, date range
- Save filter presets
- Export filtered results

**2. Bulk Actions**
- Select multiple cases
- Bulk assign to lawyer
- Bulk status update
- Bulk export/print

**3. Case Analytics Dashboard**
- Cases by status (pie chart)
- Resolution time metrics
- Workload by lawyer
- Category distribution

### 🚀 Enhanced UX

**4. Smart Notifications**
- Auto-notify assigned lawyer when case created
- Remind about pending stages
- Alert on upcoming court dates (3 days, 1 day, 1 hour)
- Weekly case digest email

**5. Document Management**
- OCR for scanned documents
- Document categorization
- Version control for attachments
- Digital signatures support

**6. Timeline Enhancements**
- Auto-suggest next stages based on history
- Stage templates for common case types
- Bulk upload attachments
- Attachment annotations/comments

### ⚡ Performance

**7. Optimization**
- Lazy load attachments/files
- Infinite scroll for long timelines
- Image thumbnail generation
- PDF preview integration

### ♿ Accessibility

**8. WCAG 2.1 AA Compliance**
- Keyboard navigation for all interactions
- ARIA labels for screen readers
- Color contrast ratio > 4.5:1
- Focus indicators on all interactive elements
- Alt text for all images/icons

### 📱 Responsive Design

**9. Mobile Optimization**
- Simplified timeline view for mobile
- Bottom sheet modals on mobile
- Touch-friendly targets (min 44x44px)
- Optimized file upload for mobile

### 🔒 Security

**10. Data Protection**
- Audit log for case modifications
- Role-based field visibility
- Sensitive data masking
- Secure file encryption

---

## 7. Implementation Phases

### Phase 1: Core Improvements (Current Sprint)
- ✅ Redesign CaseForm with grouping
- ✅ Enhance timeline with attachments display
- ✅ Remove unnecessary tabs
- ✅ Add court reminders component
- ✅ Add notifications component
- ✅ Apply brand colors consistently

### Phase 2: Enhanced Features
- Search & filtering
- Bulk actions
- Analytics dashboard
- Smart notifications

### Phase 3: Advanced Capabilities
- Document OCR
- Digital signatures
- Mobile optimization
- Performance enhancements

---

## 8. Success Metrics

### User Experience
- Reduce time to create case: Target < 2 minutes
- Reduce clicks to add stage: Target < 3 clicks
- Increase attachment upload success rate: Target > 95%

### System Performance
- Page load time: Target < 2 seconds
- Search response time: Target < 500ms
- File upload speed: Target < 5 seconds for 10MB

### User Satisfaction
- Case management ease: Target 8/10
- Timeline clarity: Target 9/10
- Overall module satisfaction: Target 8.5/10

---

## 9. Brand Visual Guide Reference

### Color Palette
```
Primary Brand: #DC2626 (Red)
Success: #10B981 (Green)
Info: #3B82F6 (Blue)
Warning: #F59E0B (Yellow/Amber)
Error: #EF4444 (Red)
```

### Typography
- Headings: font-bold, text-gray-900 dark:text-white
- Body: font-normal, text-gray-700 dark:text-gray-300
- Labels: font-semibold text-sm, text-gray-700 dark:text-gray-300
- Helper text: text-xs, text-gray-500 dark:text-gray-400

### Spacing
- Section gap: space-y-6
- Card padding: p-6
- Form field gap: space-y-4
- Button gap: gap-3

### Borders & Shadows
- Card border: border border-gray-200 dark:border-gray-700
- Card shadow: shadow-sm hover:shadow-lg
- Border radius: rounded-lg (8px) or rounded-xl (12px)

---

## 10. Technical Stack

### Components Used
- React (Next.js 14)
- TypeScript
- Tailwind CSS
- Framer Motion (animations)
- React Hook Form (forms)
- Zod (validation)

### API Integration
- RESTful API (casesService)
- Optimistic updates
- Error handling with toasts
- Loading states

---

## Conclusion

This redesign transforms the Case Module into a modern, efficient, and user-friendly system that aligns with real-world case management workflows while maintaining strict schema compliance and brand consistency.

**Key Improvements:**
✅ Schema-aligned form structure
✅ Professional timeline with inline attachments
✅ Streamlined case details page
✅ Court reminders functionality
✅ Plaintiff notification system
✅ Strategic brand color usage
✅ Enhanced UX patterns
✅ Accessibility compliance
✅ Performance optimizations

**Next Steps:**
1. Review and approve design document
2. Implement Phase 1 improvements
3. User testing and feedback
4. Iterate and refine
5. Plan Phase 2 features
