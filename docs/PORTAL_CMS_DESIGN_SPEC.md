# Portal Pages CMS - Design Specification

## Table of Contents
1. [Current State Analysis](#current-state-analysis)
2. [Proposed Design](#proposed-design)
3. [UI Wireframes](#ui-wireframes)
4. [Content Approval Workflow](#content-approval-workflow)
5. [Implementation Plan](#implementation-plan)

---

## Current State Analysis

### Existing Content Manager Structure

**Location**: `Frontend/Admin_Portal/v1/src/app/(admin)/content/page.tsx`

**Current Tabs** (4 tabs):
1. **Blogs & News** - Manages blog posts, news articles, announcements
2. **Publications** - Manages research papers, reports, whitepapers
3. **FAQs** - Manages frequently asked questions
4. **Pages** - Manages static pages (About, Contact, Terms, etc.)

**Tab Structure (Each tab contains)**:
- 📊 **Statistics Cards** (3 cards):
  - Total count
  - Published count
  - Draft count

- 🔍 **Action Bar**:
  - Search input (filters by title/slug/question)
  - Create button (opens modal)

- 📋 **Content List**:
  - Table view (for Blogs, FAQs, Pages)
  - Grid view (for Publications with cover images)
  - Shows: Title, Slug, Status, Updated Date, Actions

- ⚡ **Quick Actions**:
  - Publish/Unpublish toggle (inline switch)
  - View details (modal)
  - Edit (modal with ContentForm)
  - Delete (confirmation modal)

**Key Features**:
- ✅ Real-time search filtering
- ✅ Optimistic UI updates (publish toggle)
- ✅ Toast notifications for all actions
- ✅ Loading states
- ✅ Error handling
- ✅ Empty states
- ✅ Responsive design (mobile-first)
- ✅ Dark mode support
- ✅ Featured toggle (for publications)

**Forms**:
- Uses `ContentForm` component
- Opens in `Modal` (size="xl")
- Separate modals for Create, Edit, Delete, Details
- Form submission handled via `contentService` API calls

---

## Proposed Design

### Adding 5th Tab: "Portal Pages"

**New Tab**: **Portal Pages** 🌐
- **Purpose**: Manage all Public Portal page content (Home, About Us, What We Do, etc.)
- **Different from "Pages" tab**: "Pages" manages organization content (mission, vision), while "Portal Pages" manages specific portal sections

### Why a New Tab vs Extending Existing "Pages" Tab?

| Aspect | Pages Tab (Current) | Portal Pages Tab (New) |
|--------|---------------------|------------------------|
| **Content Type** | `organization_content` | Multiple tables (testimonials, partners, stats, etc.) |
| **Structure** | Flat list of pages | Hierarchical (Page → Sections) |
| **Content Model** | Single table | Multi-table (13+ tables) |
| **Use Case** | Static organizational content | Dynamic portal sections |
| **Editing** | Simple text editor | Various editors per content type |

**Decision**: Create a new **"Portal Pages"** tab to keep complexity separated and maintain clarity.

---

## UI Wireframes

### 1. Updated Content Manager with 5 Tabs

```
┌─────────────────────────────────────────────────────────────────────┐
│                        Content Management                            │
│  Manage website content including blogs, publications, FAQs, pages, │
│  and portal pages                                                    │
├─────────────────────────────────────────────────────────────────────┤
│                                                                       │
│  ┌───────────┬─────────────┬──────┬───────┬──────────────┐         │
│  │ 📝 Blogs  │ 📚 Publica- │ ❓   │ 📄    │ 🌐 Portal     │         │
│  │  & News   │   tions      │ FAQs │ Pages │   Pages      │         │
│  └───────────┴─────────────┴──────┴───────┴──────────────┘         │
│  ▔▔▔▔▔▔▔▔▔▔▔▔                     (active)  ▔▔▔▔▔▔▔▔▔▔▔▔         │
│                                                                       │
│  [Portal Pages Tab Content - See wireframe 2]                       │
│                                                                       │
└─────────────────────────────────────────────────────────────────────┘
```

### 2. Portal Pages Tab - Main View

```
┌─────────────────────────────────────────────────────────────────────┐
│ 🌐 Portal Pages Tab                                                  │
├─────────────────────────────────────────────────────────────────────┤
│                                                                       │
│  ┌─────────────────────────────────────────────────────────────┐   │
│  │ 📄 Select Page to Manage:                                     │   │
│  │                                                                │   │
│  │  ┌──────────────────────────────────────────────────┐        │   │
│  │  │ 🏠 Home                                    ▼     │        │   │
│  │  └──────────────────────────────────────────────────┘        │   │
│  │   Options:                                                    │   │
│  │   • 🏠 Home                                                   │   │
│  │   • ℹ️ About Us                                               │   │
│  │   • 💼 What We Do                                             │   │
│  │   • 📋 Programs                                               │   │
│  │   • 📚 Research & Publications                                │   │
│  │   • 📁 Resource Centers                                       │   │
│  │   • 🖼️ Gallery                                               │   │
│  │   • ⚖️ Legal Aid                                             │   │
│  │   • 📧 Contact Us                                             │   │
│  │   • 💼 Portfolio                                              │   │
│  │   • 👥 Work with Us                                           │   │
│  │   • 🌐 LRM Networks                                           │   │
│  │   • 🔻 Footer (Global)                                        │   │
│  └─────────────────────────────────────────────────────────────┘   │
│                                                                       │
│  ┌────────────────────────────────────────────────────────────┐    │
│  │ Page Preview & Description                                  │    │
│  │ ────────────────────────────────────────────────────────── │    │
│  │ Selected: Home Page                                          │    │
│  │                                                              │    │
│  │ The home page includes the following sections:              │    │
│  │ • Hero Banner                                                │    │
│  │ • Impact Statistics                                          │    │
│  │ • What We Do Overview                                        │    │
│  │ • Success Stories (Testimonials)                             │    │
│  │ • Featured Programs                                          │    │
│  │ • Latest News                                                │    │
│  │ • Partners & Donors                                          │    │
│  │ • Donate CTA                                                 │    │
│  │ • Newsletter Signup                                          │    │
│  └────────────────────────────────────────────────────────────┘    │
│                                                                       │
│  [Sections List - See wireframe 3]                                  │
│                                                                       │
└─────────────────────────────────────────────────────────────────────┘
```

### 3. Portal Pages Tab - Sections List (After Page Selection)

```
┌─────────────────────────────────────────────────────────────────────┐
│ 🏠 Home Page - Manage Sections                                       │
├─────────────────────────────────────────────────────────────────────┤
│                                                                       │
│  ┌──────────────┬──────────────┬──────────────┐                    │
│  │   📊 Total   │ ✅ Published │  📝 Drafts   │                    │
│  │      9       │      7       │      2       │                    │
│  └──────────────┴──────────────┴──────────────┘                    │
│                                                                       │
│  ┌────────────────────────────────────────┬───────────────────┐   │
│  │  🔍 Search sections...                │  [+ Add Section] │   │
│  └────────────────────────────────────────┴───────────────────┘   │
│                                                                       │
│  ┌─────────────────────────────────────────────────────────────┐  │
│  │ SECTION                │ TYPE          │ STATUS  │ ACTIONS   │  │
│  ├─────────────────────────────────────────────────────────────┤  │
│  │ 🎯 Hero Banner          │ Content Block │ ✅ Published │    │  │
│  │   Main homepage banner  │               │          │ [View]│  │
│  │                         │               │          │ [Edit]│  │
│  │                         │               │          │[Delete]│  │
│  ├─────────────────────────────────────────────────────────────┤  │
│  │ 📊 Impact Statistics    │ Statistics    │ ✅ Published │    │  │
│  │   Key impact numbers    │               │          │ [View]│  │
│  │                         │               │          │ [Edit]│  │
│  │                         │               │          │[Delete]│  │
│  ├─────────────────────────────────────────────────────────────┤  │
│  │ 💬 Success Stories      │ Testimonials  │ ✅ Published │    │  │
│  │   Client testimonials   │               │          │ [View]│  │
│  │                         │               │          │ [Edit]│  │
│  │                         │               │          │[Delete]│  │
│  ├─────────────────────────────────────────────────────────────┤  │
│  │ 🤝 Partners & Donors    │ Partners      │ ✅ Published │    │  │
│  │   Partner organization  │               │          │ [View]│  │
│  │                         │               │          │ [Edit]│  │
│  │                         │               │          │[Delete]│  │
│  ├─────────────────────────────────────────────────────────────┤  │
│  │ 🎁 Donate CTA          │ Content Block │ 📝 Draft    │    │  │
│  │   Donation call-to-action│              │          │ [View]│  │
│  │                         │               │          │ [Edit]│  │
│  │                         │               │          │[Delete]│  │
│  └─────────────────────────────────────────────────────────────┘  │
│                                                                       │
└─────────────────────────────────────────────────────────────────────┘
```

### 4. Section Editor Modal (Example: Testimonials)

```
┌─────────────────────────────────────────────────────────────────────┐
│ ✏️ Edit Section: Success Stories                           [✕]     │
├─────────────────────────────────────────────────────────────────────┤
│                                                                       │
│  Section Type: Testimonials                                         │
│  ┌───────────────────────────────────────────────────────────┐     │
│  │ Testimonials (3 items)                                     │     │
│  │                                                             │     │
│  │  ┌────────────────────────────────────────────────────┐  │     │
│  │  │ Testimonial 1                                  [▲][▼]│  │     │
│  │  │ ────────────────────────────────────────────────── │  │     │
│  │  │ Name: John Doe                                     │  │     │
│  │  │ Role: Community Leader                             │  │     │
│  │  │ Location: Nairobi, Kenya                          │  │     │
│  │  │ Quote: "HAKIARDHI helped us reclaim our..."       │  │     │
│  │  │ Image: [📷 Upload Image]                          │  │     │
│  │  │                                              [🗑 Remove] │  │     │
│  │  └────────────────────────────────────────────────────┘  │     │
│  │                                                             │     │
│  │  ┌────────────────────────────────────────────────────┐  │     │
│  │  │ Testimonial 2                                  [▲][▼]│  │     │
│  │  │ ────────────────────────────────────────────────── │  │     │
│  │  │ Name: Jane Smith                                   │  │     │
│  │  │ Role: Farmer                                       │  │     │
│  │  │ Location: Mombasa, Kenya                          │  │     │
│  │  │ Quote: "The training programs empowered..."        │  │     │
│  │  │ Image: [📷 Upload Image]                          │  │     │
│  │  │                                              [🗑 Remove] │  │     │
│  │  └────────────────────────────────────────────────────┘  │     │
│  │                                                             │     │
│  │  [+ Add Testimonial]                                      │     │
│  └───────────────────────────────────────────────────────────┘     │
│                                                                       │
│  ┌───────────────────────────────────────────────────────────┐     │
│  │ Publishing Options                                         │     │
│  │                                                             │     │
│  │  Status: ○ Draft    ● Published                           │     │
│  │                                                             │     │
│  │  Featured: ☐ Show on homepage                             │     │
│  │                                                             │     │
│  │  Display Order: [2]                                        │     │
│  └───────────────────────────────────────────────────────────┘     │
│                                                                       │
│  ┌─────────────────────────────────────────────────────────┐       │
│  │                           [Cancel]  [Save Changes]       │       │
│  └─────────────────────────────────────────────────────────┘       │
│                                                                       │
└─────────────────────────────────────────────────────────────────────┘
```

### 5. Section List - Alternative Card View

```
┌─────────────────────────────────────────────────────────────────────┐
│ 🏠 Home Page - Manage Sections (Card View)                           │
├─────────────────────────────────────────────────────────────────────┤
│                                                                       │
│  ┌──────────────────────┬──────────────────────┬────────────────┐  │
│  │  🎯 Hero Banner      │ 📊 Impact Stats      │ 💬 Testimonials│  │
│  │  ──────────────────  │ ──────────────────  │ ──────────────  │  │
│  │  Type: Content Block │ Type: Statistics     │ Type: List      │  │
│  │  Status: ✅ Published│ Status: ✅ Published │ Status: ✅ Published│  │
│  │                      │                      │                 │  │
│  │  "Empowering         │  4 statistics       │  3 testimonials │  │
│  │   Communities..."    │  configured          │  active         │  │
│  │                      │                      │                 │  │
│  │  [View] [Edit] [Del] │  [View] [Edit] [Del] │ [View] [Edit]   │  │
│  └──────────────────────┴──────────────────────┴────────────────┘  │
│                                                                       │
│  ┌──────────────────────┬──────────────────────┬────────────────┐  │
│  │  🤝 Partners         │ 🎁 Donate CTA       │ 📧 Newsletter  │  │
│  │  ──────────────────  │ ──────────────────  │ ──────────────  │  │
│  │  Type: Partner List  │ Type: Content Block │ Type: Form      │  │
│  │  Status: ✅ Published│ Status: 📝 Draft    │ Status: ✅ Published│  │
│  │                      │                      │                 │  │
│  │  6 partners          │  Donation section   │  Subscription   │  │
│  │  displayed           │  needs review       │  form           │  │
│  │                      │                      │                 │  │
│  │  [View] [Edit] [Del] │  [View] [Edit] [Del] │ [View] [Edit]   │  │
│  └──────────────────────┴──────────────────────┴────────────────┘  │
│                                                                       │
└─────────────────────────────────────────────────────────────────────┘
```

---

## Content Approval Workflow

### Workflow States

```
┌──────────┐      ┌──────────┐      ┌──────────┐      ┌──────────┐
│  Draft   │ ───> │ Pending  │ ───> │ Approved │ ───> │Published │
│          │      │ Review   │      │          │      │          │
└──────────┘      └──────────┘      └──────────┘      └──────────┘
     │                 │                                     │
     │                 │                                     │
     └─────────────────┴─────> Rejected ───────────────────┘
                                     │
                                     └────> Back to Draft
```

### Workflow Details

#### 1. **Draft** (Initial State)
- **Who**: Content Editors, Marketing Team
- **Actions**: Create, Edit, Delete, Save Draft
- **Permissions**: `portal_content_create`, `portal_content_edit`
- **Next Steps**:
  - Save and continue editing
  - Submit for Review → moves to "Pending Review"

#### 2. **Pending Review** (Awaiting Approval)
- **Who**: Content Reviewers, Senior Editors
- **Actions**: Review, Approve, Reject, Request Changes
- **Permissions**: `portal_content_review`, `portal_content_approve`
- **Notifications**:
  - Email to reviewers when submitted
  - In-app notification badge
- **Review Criteria**:
  - Content accuracy
  - Grammar and spelling
  - Brand guidelines compliance
  - Image quality
  - SEO optimization
- **Next Steps**:
  - Approve → moves to "Approved"
  - Reject with comments → back to "Draft"

#### 3. **Approved** (Ready to Publish)
- **Who**: Publishers, Admins
- **Actions**: Publish, Schedule Publish, Edit
- **Permissions**: `portal_content_publish`
- **Next Steps**:
  - Publish Now → moves to "Published"
  - Schedule → remains "Approved" until scheduled time
  - Edit → back to "Draft" (requires re-approval)

#### 4. **Published** (Live on Website)
- **Who**: Admins, Senior Editors
- **Actions**: Unpublish, Edit (creates new draft version)
- **Permissions**: `portal_content_publish`, `portal_content_unpublish`
- **Next Steps**:
  - Unpublish → back to "Approved" state
  - Edit → creates new draft version (published version remains live)

#### 5. **Rejected** (Needs Revision)
- **Who**: Content Editors (to fix)
- **Actions**: Edit, Re-submit
- **Permissions**: `portal_content_edit`
- **Feedback**: Reviewer comments attached
- **Next Steps**:
  - Address comments and re-submit → "Pending Review"

### Database Schema for Approval Workflow

```sql
-- Add to existing tables
ALTER TABLE organization_content ADD COLUMN workflow_status VARCHAR(50) DEFAULT 'draft'
  CHECK (workflow_status IN ('draft', 'pending_review', 'approved', 'published', 'rejected'));

ALTER TABLE organization_content ADD COLUMN submitted_for_review_at TIMESTAMP;
ALTER TABLE organization_content ADD COLUMN reviewed_by UUID REFERENCES users(id);
ALTER TABLE organization_content ADD COLUMN reviewed_at TIMESTAMP;
ALTER TABLE organization_content ADD COLUMN approved_by UUID REFERENCES users(id);
ALTER TABLE organization_content ADD COLUMN approved_at TIMESTAMP;
ALTER TABLE organization_content ADD COLUMN published_by UUID REFERENCES users(id);
ALTER TABLE organization_content ADD COLUMN published_at TIMESTAMP;
ALTER TABLE organization_content ADD COLUMN rejection_reason TEXT;

-- Same for other content tables (testimonials, partners, etc.)
ALTER TABLE testimonials ADD COLUMN workflow_status VARCHAR(50) DEFAULT 'draft';
ALTER TABLE partners ADD COLUMN workflow_status VARCHAR(50) DEFAULT 'draft';
-- etc.

-- Content Review History Table
CREATE TABLE content_review_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  content_type VARCHAR(50) NOT NULL, -- 'organization_content', 'testimonial', 'partner', etc.
  content_id UUID NOT NULL,
  action VARCHAR(50) NOT NULL, -- 'submitted', 'approved', 'rejected', 'published', 'unpublished'
  actor_id UUID REFERENCES users(id),
  comment TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_review_history_content ON content_review_history(content_type, content_id);
CREATE INDEX idx_review_history_actor ON content_review_history(actor_id);
```

### UI for Approval Workflow

#### Status Badge with Workflow State

```
┌──────────────────────────────────────────────────────┐
│ Content Item                                          │
│                                                       │
│  Status: [📝 Draft]          ← Gray badge           │
│  Status: [⏳ Pending Review]  ← Yellow badge         │
│  Status: [✅ Approved]        ← Green badge          │
│  Status: [🚀 Published]       ← Blue badge           │
│  Status: [❌ Rejected]        ← Red badge            │
└──────────────────────────────────────────────────────┘
```

#### Action Buttons Based on Workflow State

**Draft State**:
- [Save Draft] [Submit for Review]

**Pending Review State** (for reviewers):
- [Approve] [Reject] [Request Changes]

**Approved State** (for publishers):
- [Publish Now] [Schedule Publish] [Edit]

**Published State**:
- [Unpublish] [Edit (creates new version)]

**Rejected State** (for editors):
- [Edit & Resubmit] [View Feedback]

#### Review Modal

```
┌─────────────────────────────────────────────────────────────────────┐
│ 📋 Review Content: "Home Hero Banner"                      [✕]     │
├─────────────────────────────────────────────────────────────────────┤
│                                                                       │
│  Content Preview:                                                    │
│  ┌───────────────────────────────────────────────────────────┐     │
│  │ [Preview of the content]                                   │     │
│  └───────────────────────────────────────────────────────────┘     │
│                                                                       │
│  Review Checklist:                                                  │
│  ☑ Content is accurate and factual                                 │
│  ☑ Grammar and spelling are correct                                │
│  ☑ Images are high quality and properly sized                      │
│  ☑ Content follows brand guidelines                                │
│  ☐ SEO meta data is complete                                       │
│                                                                       │
│  Comments/Feedback:                                                 │
│  ┌───────────────────────────────────────────────────────────┐     │
│  │ [Text area for reviewer comments]                          │     │
│  │                                                             │     │
│  │                                                             │     │
│  └───────────────────────────────────────────────────────────┘     │
│                                                                       │
│  ┌─────────────────────────────────────────────────────────┐       │
│  │         [✅ Approve]  [❌ Reject]  [Cancel]             │       │
│  └─────────────────────────────────────────────────────────┘       │
│                                                                       │
└─────────────────────────────────────────────────────────────────────┘
```

### Notifications for Workflow

**Email Notifications**:
- Content submitted for review → Email to reviewers
- Content approved → Email to submitter
- Content rejected → Email to submitter with feedback
- Content published → Email to team

**In-App Notifications**:
- Badge on notification icon showing pending reviews count
- List of items requiring action
- Clickable to go directly to review interface

---

## Implementation Plan

### ✅ Already in Place

**Database Schema**: All 67 tables exist, including:
- ✅ `organization_content` - organization info (mission, vision, etc.)
- ✅ `testimonials` - success stories
- ✅ `partners` - partner organizations
- ✅ `team_members` - team profiles
- ✅ `impact_statistics` - impact numbers
- ✅ `gallery_items` - photo gallery
- ✅ `office_locations` - office addresses
- ✅ `portfolio_items` - portfolio cases
- ✅ `organization_milestones` - timeline events
- ✅ `research_areas` - research focus areas
- ✅ `research_partners` - research collaborators

**Public APIs**: All public endpoints exist at `/api/public/*`:
- ✅ `/api/public/testimonials` - fetch testimonials
- ✅ `/api/public/partners` - fetch partners
- ✅ `/api/public/about/team` - fetch team members
- ✅ `/api/public/stats` - fetch impact statistics
- ✅ `/api/public/gallery` - fetch gallery items
- ✅ `/api/public/about/organization` - fetch organization content
- ✅ `/api/public/about/milestones` - fetch milestones
- ✅ `/api/public/contact/offices` - fetch office locations
- ✅ `/api/public/portfolio` - fetch portfolio items
- ✅ `/api/public/research/areas` - fetch research areas
- ✅ `/api/public/research/partners` - fetch research partners

### 🚧 What Needs to Be Built

#### Week 1-2: Admin CRUD APIs (Create Missing Admin Endpoints)

**Pattern to Follow**: Copy `/api/admin/content/route.ts` structure

**Week 1 (Priority Content):**

**Day 1-2**: `/api/admin/organization/content`
```typescript
GET    /api/admin/organization/content
POST   /api/admin/organization/content
GET    /api/admin/organization/content/:id
PUT    /api/admin/organization/content/:id
DELETE /api/admin/organization/content/:id
```

**Day 3**: `/api/admin/testimonials`
```typescript
GET    /api/admin/testimonials
POST   /api/admin/testimonials
GET    /api/admin/testimonials/:id
PUT    /api/admin/testimonials/:id
DELETE /api/admin/testimonials/:id
```

**Day 4**: `/api/admin/partners`
```typescript
GET    /api/admin/partners
POST   /api/admin/partners
GET    /api/admin/partners/:id
PUT    /api/admin/partners/:id
DELETE /api/admin/partners/:id
```

**Day 5**: `/api/admin/team`
```typescript
GET    /api/admin/team
POST   /api/admin/team
GET    /api/admin/team/:id
PUT    /api/admin/team/:id
DELETE /api/admin/team/:id
```

**Week 2 (Additional Content):**

**Day 1**: `/api/admin/stats` (Impact Statistics)
**Day 2**: `/api/admin/gallery` (Gallery Items)
**Day 3**: `/api/admin/milestones` (Organization Milestones)
**Day 4**: `/api/admin/offices` (Office Locations)
**Day 5**: `/api/admin/portfolio` (Portfolio Items)

### Phase 2: Frontend CMS UI (Weeks 3-4)

#### Week 3: Portal Pages Tab Structure

**Day 1-2**: Add Portal Pages Tab
- [ ] Add 5th tab to content types array
- [ ] Create `PortalPagesManager` component
- [ ] Implement page selector dropdown
- [ ] Add page descriptions

**Day 3-4**: Page Sections List
- [ ] Create sections list component (table/card view)
- [ ] Implement search filtering
- [ ] Add statistics cards
- [ ] Create/Edit/Delete modals

**Day 5**: Section Type Components
- [ ] OrganizationContentForm (for hero, CTAs, intros)
- [ ] TestimonialForm
- [ ] PartnerForm

#### Week 4: Forms & Workflow UI

**Day 1-2**: Content Forms
- [ ] Team Member Form
- [ ] Impact Statistics Form
- [ ] Gallery Item Form
- [ ] Office Location Form

**Day 3-4**: Approval Workflow UI
- [ ] Add workflow status badges
- [ ] Submit for Review button
- [ ] Review modal
- [ ] Approval/Rejection actions
- [ ] Review history timeline

**Day 5**: Notifications
- [ ] In-app notification badge
- [ ] Pending reviews list
- [ ] Email notification triggers

### Phase 3: Data Migration & Testing (Week 5)

**Day 1-2**: Data Migration Script
- [ ] Write seeder for Home page content
- [ ] Write seeder for About Us page content
- [ ] Write seeder for What We Do page content
- [ ] Test data integrity

**Day 3-4**: Testing
- [ ] Unit tests for API endpoints
- [ ] Integration tests for workflow
- [ ] E2E tests for UI flows
- [ ] Cross-browser testing

**Day 5**: Documentation
- [ ] User guide for content managers
- [ ] API documentation updates
- [ ] Workflow documentation

### Phase 4: Deployment & Training (Week 6)

**Day 1-2**: Staging Deployment
- [ ] Deploy backend updates
- [ ] Deploy frontend updates
- [ ] Test on staging environment

**Day 3-4**: Training
- [ ] Create training materials
- [ ] Conduct training sessions for content managers
- [ ] Conduct training for reviewers/approvers (if workflow implemented)

**Day 5**: Production Deployment
- [ ] Deploy to production
- [ ] Monitor for issues
- [ ] Gather initial feedback

---

## Implementation Notes

### Simplified Workflow (Initial Launch)

For the initial implementation focusing on **Home, About Us, What We Do** pages, the approval workflow can be simplified:

**Option A - Full Workflow** (as designed above):
- Draft → Pending Review → Approved → Published
- Requires workflow columns in database
- Requires review interface

**Option B - Simple Publish/Unpublish** (faster to implement):
- Draft ↔ Published (toggle only)
- Reuses existing `is_published`/`is_active` columns
- No additional database changes needed
- Can add full workflow in Phase 2

**Recommendation**: Start with Option B for faster launch, then add full workflow after user feedback on initial version.

---

## Key Design Decisions

### 1. **Separate Tab vs Integrated**
✅ **Decision**: Separate "Portal Pages" tab
- **Reason**: Different data models, different workflows, different complexity
- **Benefit**: Clear separation of concerns, easier to understand

### 2. **Table vs Grid vs Card View**
✅ **Decision**: Hybrid approach
- **Table**: For simple lists (FAQs, Pages, Sections)
- **Grid**: For visual content (Publications, Gallery)
- **Card**: For portal page sections (shows more context)

### 3. **Approval Workflow**
✅ **Decision**: Multi-stage workflow (Draft → Review → Approved → Published)
- **Reason**: User requested content approval
- **Benefit**: Quality control, prevents accidental publishing
- **Trade-off**: More steps, but better governance

### 4. **Section Editing**
✅ **Decision**: Modal-based editing (consistent with existing pattern)
- **Reason**: Maintains consistency with current UI
- **Alternative considered**: Inline editing (rejected - too complex for multi-field forms)

### 5. **Page Selector**
✅ **Decision**: Dropdown selector at top of tab
- **Reason**: Clear navigation, shows all pages at once
- **Alternative considered**: Sidebar navigation (rejected - takes up space)

---

## Success Metrics

### Usability Metrics:
- ⏱️ Time to update homepage hero: < 2 minutes
- ⏱️ Time to add new testimonial: < 3 minutes
- ⏱️ Time to publish approved content: < 30 seconds
- 📊 Content manager satisfaction: > 4/5 stars

### Technical Metrics:
- 🚀 API response time: < 500ms
- 📦 Page load time: < 2 seconds
- ✅ Test coverage: > 80%
- 🐛 Production bugs: < 5 in first month

### Business Metrics:
- 📈 Frequency of content updates: 2x increase
- ⚡ Time from content creation to publication: 50% reduction
- 👥 Number of content contributors: 3x increase
- 🎯 Content approval rate: > 90%

---

## Revised Timeline Estimate

Based on existing infrastructure:

| Phase | Original Estimate | Revised Estimate | Description |
|-------|-------------------|------------------|-------------|
| Database Schema | 1 hour | **0 hours** | ✅ Already exists (67 tables) |
| Backend APIs | 26 hours | **16 hours** | Create 9 admin CRUD endpoints (2 days × 8 hours) |
| Frontend CMS UI | 40 hours | **40 hours** | Portal Pages tab + forms (5 days) |
| Data Migration | 16 hours | **8 hours** | Simplified (just seed existing tables) |
| Testing & Deployment | N/A | **8 hours** | Testing + deployment (1 day) |
| **Total** | **107 hours** | **72 hours (~9 working days)** | 33% time reduction |

### Why Faster?

1. ✅ **Database schema exists** - no migrations needed
2. ✅ **Public APIs exist** - proven table structure
3. ✅ **Admin API pattern exists** - copy `/api/admin/content` structure
4. ✅ **Frontend patterns exist** - reuse ContentForm, Modal, Tabs components

---

## Next Steps

1. **Review this design spec** with stakeholders
2. **Decide on workflow approach**: Full workflow (Option A) or Simple publish toggle (Option B)
3. **Confirm priority pages**: Home, About Us, What We Do (confirmed)
4. **Assign developers** to backend and frontend workstreams
5. **Set up project tracking** (GitHub issues)
6. **Begin Week 1**: Create admin CRUD APIs

---

## Questions & Clarifications Needed

1. **Permissions**: Who should have which permissions?
   - Content Editors: Create, Edit
   - Reviewers: Review, Approve/Reject
   - Publishers: Publish/Unpublish
   - Admins: All permissions

2. **Notification Preferences**: Email + in-app, or just in-app?

3. **Scheduled Publishing**: Should we support scheduling content to publish at a future date?

4. **Version History**: Should we track version history of edits?

5. **Bulk Actions**: Should we support bulk publish/unpublish?

---

**Document Version**: 1.0
**Last Updated**: 2026-01-03
**Author**: Claude Code
**Status**: Ready for Review
