# CMS Public Portal Content Management - Improvement Plan (REVISED)

## Executive Summary

This plan outlines the implementation of a comprehensive CMS system to manage all Public Portal page contents through the Admin Portal. Currently, the Public Portal uses static TypeScript data files (`/src/data/*.ts`), which requires code changes and redeployment for content updates. This improvement will:

1. **Reuse existing database tables** - Leverage organization_content, testimonials, partners, team_members, impact_statistics, gallery_items, etc.
2. **Extend existing `/api/admin/content` and `/api/public/portal` endpoints** - No new APIs needed
3. Add a "Pages" tab in the Admin Portal with dynamic page selector
4. Enable non-technical users to manage all public portal content

**KEY PRINCIPLE: Reuse existing features, no new tables or major endpoints**

## Current State Analysis

### Public Portal Architecture (As-Is)
- **Framework**: Next.js 15 App Router (Static Site Generation)
- **Content Storage**: Static TypeScript files in `/src/data/`
- **Data Files**:
  - `programs.ts` (30+ programs)
  - `newsEvents.ts` (20+ news items)
  - `portfolio.ts` (8+ portfolio items)
  - `publications.ts` (15+ publications)
  - `faqs.ts`, `testimonials.ts`, `partners.ts`, etc.
- **Rendering**: Client-side only filtering and search
- **Backend APIs**: Exist at `/api/public/*` but not integrated with frontend

### Content Inventory

#### 13 Main Page Sections to Manage:

1. **Home** (9 subsections)
   - Hero Banner
   - Impact at Glance (Stats)
   - What We Do (Programs Overview)
   - Success Stories (Testimonials)
   - Featured Programs
   - Latest News
   - Partners
   - Donate CTA
   - Newsletter Signup

2. **About Us** (7 subsections)
   - Mission & Vision
   - Our Story
   - Core Values
   - Leadership Team
   - Organizational Structure
   - Annual Reports
   - Achievements Timeline

3. **What We Do** (4 subsections)
   - Programs Overview
   - Focus Areas
   - Impact Metrics
   - Success Stories

4. **Programs** (4 subsections)
   - All Programs Listing
   - Program Categories
   - Featured Programs
   - Program Details (Individual pages)

5. **Research & Publications** (4 subsections)
   - Publications Library
   - Research Areas
   - Research Partners
   - Publication Details (Individual pages)

6. **Resource Centers** (6 subsections)
   - Legal Resources
   - Training Materials
   - Policy Briefs
   - Case Studies
   - Downloads
   - External Links

7. **Gallery** (2 subsections)
   - Photo Gallery
   - Video Gallery

8. **Legal Aid** (2 subsections)
   - Services Overview
   - Request Form

9. **Contact Us** (2 subsections)
   - Contact Information
   - Contact Form

10. **Portfolio** (3 subsections)
    - Portfolio Listing
    - Project Categories
    - Project Details (Individual pages)

11. **Work with Us** (2 subsections)
    - Career Opportunities
    - Volunteer Programs

12. **LRM Networks** (2 subsections)
    - Network Regions
    - Application Form

13. **Footer** (Global)
    - Social Media Links
    - Quick Links
    - Copyright Text

---

## Database Schema Design - REUSING EXISTING TABLES

### Key Insight: Existing Tables Already Support Portal Content!

The database already has all necessary tables. Instead of creating new ones, we'll:
1. **Extend `organization_content` table** to support more content_type values
2. **Use existing tables** for their respective data
3. **Minimal schema changes** - only add new enum values where needed

### 1. Extend Organization Content Table (EXISTING)

**Current Schema** (from `00_overall_schema.md`):
```sql
CREATE TABLE public.organization_content (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  content_type character varying NOT NULL CHECK (content_type::text = ANY (ARRAY[
    'vision'::character varying,
    'mission'::character varying,
    'who_we_are'::character varying,
    'value'::character varying,
    'history'::character varying,
    'approach'::character varying
  ]::text[])),
  title character varying,
  content text NOT NULL,
  icon_name character varying,
  display_order integer DEFAULT 0,
  is_active boolean DEFAULT true,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  CONSTRAINT organization_content_pkey PRIMARY KEY (id)
);
```

**Proposed Extension** (Add new content_type values):
```sql
-- Extend the CHECK constraint to support portal page sections
ALTER TABLE organization_content DROP CONSTRAINT IF EXISTS organization_content_content_type_check;

ALTER TABLE organization_content ADD CONSTRAINT organization_content_content_type_check
CHECK (content_type::text = ANY (ARRAY[
  -- Existing types
  'vision'::character varying,
  'mission'::character varying,
  'who_we_are'::character varying,
  'value'::character varying,
  'history'::character varying,
  'approach'::character varying,
  -- New portal page section types
  'home_hero'::character varying,
  'home_programs_overview'::character varying,
  'home_donate_cta'::character varying,
  'what_we_do_overview'::character varying,
  'what_we_do_focus_areas'::character varying,
  'legal_aid_overview'::character varying,
  'legal_aid_services'::character varying,
  'lrm_overview'::character varying,
  'lrm_how_to_join'::character varying,
  'contact_info'::character varying,
  'footer_content'::character varying,
  'programs_intro'::character varying,
  'publications_intro'::character varying,
  'resource_centers_intro'::character varying,
  'gallery_intro'::character varying,
  'portfolio_intro'::character varying,
  'work_with_us_careers'::character varying,
  'work_with_us_volunteers'::character varying
]::text[]));
```

### 2. Portal Content Mapping to Existing Tables

| Portal Section | Existing Database Table | Admin API Endpoint | Public API Endpoint |
|----------------|-------------------------|--------------------|--------------------|
| **Home - Hero Banner** | `organization_content` (content_type='home_hero') | `/api/admin/content` | `/api/public/about/organization` |
| **Home - Impact Stats** | `impact_statistics` | Create `/api/admin/stats` | `/api/public/portal/stats` ✅ |
| **Home - What We Do** | `organization_content` (content_type='home_programs_overview') | `/api/admin/content` | `/api/public/about/organization` |
| **Home - Success Stories** | `testimonials` | Create `/api/admin/testimonials` | `/api/public/testimonials` ✅ |
| **Home - Featured Programs** | `activities` or `projects` | `/api/admin/activities` or `/api/admin/projects` | `/api/public/portal/programs/featured` ✅ |
| **Home - Latest News** | `blogs` (type='News') | `/api/admin/content?content_type=blog` ✅ | `/api/public/portal/news` ✅ |
| **Home - Partners** | `partners` | Create `/api/admin/partners` | `/api/public/partners` ✅ |
| **Home - Donate CTA** | `organization_content` (content_type='home_donate_cta') | `/api/admin/content` | `/api/public/about/organization` |
| **Home - Newsletter** | Static form (submits to `/api/public/newsletter/subscribe` ✅) | N/A | N/A |
| **About - Mission/Vision** | `organization_content` (content_type='mission'/'vision') ✅ | `/api/admin/content` | `/api/public/about/organization` ✅ |
| **About - Our Story** | `organization_content` (content_type='history') ✅ | `/api/admin/content` | `/api/public/about/organization` ✅ |
| **About - Core Values** | `organization_content` (content_type='value') ✅ | `/api/admin/content` | `/api/public/about/organization` ✅ |
| **About - Leadership Team** | `team_members` | Create `/api/admin/team` | `/api/public/about/team` ✅ |
| **About - Milestones** | `organization_milestones` | Create `/api/admin/milestones` | `/api/public/about/milestones` ✅ |
| **What We Do - Overview** | `organization_content` (content_type='what_we_do_overview') | `/api/admin/content` | `/api/public/about/organization` |
| **What We Do - Focus Areas** | `organization_content` (content_type='what_we_do_focus_areas') | `/api/admin/content` | `/api/public/about/organization` |
| **What We Do - Impact** | `impact_statistics` | `/api/admin/stats` | `/api/public/portal/stats` ✅ |
| **Programs - All Programs** | `activities` or `projects` | `/api/admin/activities` or `/api/admin/projects` | `/api/public/portal/programs` ✅ |
| **Programs - Categories** | `categories` (type='program') | `/api/admin/categories` ✅ | `/api/public/portal/programs/categories` ✅ |
| **Publications - Library** | `publications` | `/api/admin/content?content_type=publication` ✅ | `/api/public/portal/publications` ✅ |
| **Publications - Research Areas** | `research_areas` | Create `/api/admin/research-areas` | `/api/public/research/areas` ✅ |
| **Publications - Partners** | `research_partners` | Create `/api/admin/research-partners` | `/api/public/research/partners` ✅ |
| **Resource Centers** | `organization_content` + custom JSONB | `/api/admin/content` | New endpoint needed |
| **Gallery - Photos** | `gallery_items` (category filter) | Create `/api/admin/gallery` | `/api/public/gallery` ✅ |
| **Gallery - Videos** | `gallery_items` (with video_url field) | `/api/admin/gallery` | `/api/public/gallery` ✅ |
| **Legal Aid - Overview** | `organization_content` (content_type='legal_aid_overview') | `/api/admin/content` | `/api/public/about/organization` |
| **Legal Aid - Request Form** | Static form (submits to `/api/public/legal-aid/submit` ✅) | N/A | N/A |
| **Contact - Offices** | `office_locations` | Create `/api/admin/offices` | `/api/public/contact/offices` ✅ |
| **Contact - Form** | Static form (submits to `/api/public/contact/submit` ✅) | N/A | N/A |
| **Portfolio - Projects** | `portfolio_items` | Create `/api/admin/portfolio` | `/api/public/portal/portfolio` ✅ |
| **Work with Us - Careers** | `organization_content` (content_type='work_with_us_careers') | `/api/admin/content` | New endpoint needed |
| **Work with Us - Volunteers** | `organization_content` (content_type='work_with_us_volunteers') | `/api/admin/content` | New endpoint needed |
| **LRM Networks - Overview** | `organization_content` (content_type='lrm_overview') | `/api/admin/content` | `/api/public/about/organization` |
| **LRM Networks - Regions** | `lrm_members` + `regions` | Create `/api/admin/lrm-members` | `/api/public/lrm/regions` ✅ |
| **LRM Networks - Roles** | `lrm_roles` | Create `/api/admin/lrm-roles` | `/api/public/lrm/roles` ✅ |
| **Footer - Global Content** | `organization_content` (content_type='footer_content') | `/api/admin/content` | `/api/public/about/organization` |
| **FAQs** | `faqs` | `/api/admin/content?content_type=faq` ✅ | `/api/public/faqs` ✅ |
| **Testimonials** | `testimonials` | Create `/api/admin/testimonials` | `/api/public/testimonials` ✅ |
| **Partners** | `partners` | Create `/api/admin/partners` | `/api/public/partners` ✅ |

✅ = Already exists
Create = Needs to be created (but follows existing patterns)

### 3. Schema Changes Summary

**Minimal changes needed:**

1. **Extend `organization_content` table** - Add new content_type values (SQL above)
2. **No new tables required** - All existing tables can be reused!
3. **Add missing admin endpoints** for existing tables:
   - `/api/admin/testimonials`
   - `/api/admin/partners`
   - `/api/admin/team`
   - `/api/admin/milestones`
   - `/api/admin/stats`
   - `/api/admin/gallery`
   - `/api/admin/offices`
   - `/api/admin/portfolio`
   - `/api/admin/research-areas`
   - `/api/admin/research-partners`
   - `/api/admin/lrm-members`
   - `/api/admin/lrm-roles`

### 4. Content Structure Examples

Since we're reusing existing tables, the content structures are already defined in the schema!

**For `organization_content` table with new content_types:**
```json
// Example: Home Hero Banner (content_type='home_hero')
{
  "title": "Empowering Communities Through Land Rights",
  "content": "<p>Fighting for justice, dignity, and sustainable livelihoods</p>",
  "icon_name": "hero-image.jpg", // Stored in icon_name field for background image
  "display_order": 1,
  "is_active": true
}
```

**All other content uses existing table schemas:**
- Testimonials → `testimonials` table schema
- Partners → `partners` table schema
- Team → `team_members` table schema
- Stats → `impact_statistics` table schema
- Gallery → `gallery_items` table schema
- Publications → `publications` table schema
- Blogs/News → `blogs` table schema
- FAQs → `faqs` table schema
- Portfolio → `portfolio_items` table schema

No need to define new structures - they already exist!

#### Impact Stats (`section_type: 'stats'`)
```json
{
  "title": "Impact at a Glance",
  "stats": [
    { "value": "50,000+", "label": "Families Assisted", "icon": "users" },
    { "value": "120+", "label": "Communities Served", "icon": "map" },
    { "value": "25", "label": "Years of Service", "icon": "calendar" }
  ]
}
```

#### Testimonials (`section_type: 'testimonials'`)
```json
{
  "title": "Success Stories",
  "testimonials": [
    {
      "name": "John Doe",
      "location": "Nairobi, Kenya",
      "quote": "HAKIARDHI helped us reclaim our ancestral land...",
      "image": "https://...",
      "role": "Community Leader"
    }
  ]
}
```

#### Program Listing (`section_type: 'program-listing'`)
```json
{
  "title": "Our Programs",
  "description": "Comprehensive programs addressing land rights",
  "filters": ["All", "Legal Aid", "Advocacy", "Research"],
  "programs": [] // Will be joined with programs table
}
```

#### Content Block (`section_type: 'content-block'`)
```json
{
  "title": "Our Mission",
  "content": "<p>Rich HTML content...</p>",
  "media": {
    "type": "image",
    "url": "https://...",
    "alt": "Team photo"
  },
  "layout": "text-left-media-right"
}
```

#### Team Members (`section_type: 'team'`)
```json
{
  "title": "Leadership Team",
  "members": [
    {
      "name": "Jane Smith",
      "role": "Executive Director",
      "bio": "Jane has over 20 years...",
      "image": "https://...",
      "social": {
        "linkedin": "https://linkedin.com/in/...",
        "twitter": "https://twitter.com/..."
      }
    }
  ]
}
```

#### Gallery (`section_type: 'gallery'`)
```json
{
  "title": "Photo Gallery",
  "media_type": "image", // or "video"
  "items": [
    {
      "url": "https://...",
      "thumbnail": "https://...",
      "caption": "Community meeting in Mombasa",
      "date": "2024-12-15",
      "tags": ["community", "meeting"]
    }
  ]
}
```

#### Timeline (`section_type: 'timeline'`)
```json
{
  "title": "Our Journey",
  "events": [
    {
      "year": "1999",
      "title": "HAKIARDHI Founded",
      "description": "Established to address land rights issues",
      "image": "https://..."
    }
  ]
}
```

#### Contact Info (`section_type: 'contact-info'`)
```json
{
  "office_address": "123 Main St, Nairobi, Kenya",
  "phone": "+254 123 456 789",
  "email": "info@hakiardhi.org",
  "working_hours": "Mon-Fri: 9AM-5PM",
  "social_media": {
    "facebook": "https://facebook.com/hakiardhi",
    "twitter": "https://twitter.com/hakiardhi",
    "instagram": "https://instagram.com/hakiardhi"
  },
  "map_embed": "https://maps.google.com/embed/..."
}
```

#### Form Configuration (`section_type: 'form'`)
```json
{
  "title": "Contact Us",
  "description": "Get in touch with our team",
  "fields": [
    { "name": "name", "type": "text", "label": "Full Name", "required": true },
    { "name": "email", "type": "email", "label": "Email", "required": true },
    { "name": "message", "type": "textarea", "label": "Message", "required": true }
  ],
  "submit_endpoint": "/api/public/contact/submit",
  "success_message": "Thank you for contacting us!",
  "notification_email": "admin@hakiardhi.org"
}
```

### 4. Reusing Existing Tables

Some content already exists in database tables and should be referenced:

- **Programs**: Use existing `programs` table (if exists) or create new one
- **Publications**: Use existing `publications` table
- **News/Blogs**: Use existing `blogs` table (type='News')
- **FAQs**: Use existing `faqs` table
- **Partners**: Create new `partners` table if doesn't exist

```sql
-- Partners table (if doesn't exist)
CREATE TABLE partners (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  logo_url TEXT,
  website_url TEXT,
  description TEXT,
  partner_type VARCHAR(50), -- 'funding', 'implementing', 'research', etc.
  is_featured BOOLEAN DEFAULT false,
  display_order INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

---

## API Endpoint Design - REUSING EXISTING ENDPOINTS

### Key Principle: Extend Existing Admin Endpoints

Instead of creating new `/api/admin/portal/*` endpoints, we'll create admin CRUD endpoints for existing tables that are currently managed only via public endpoints.

### New Admin Endpoints Needed (Following Existing Patterns)

All these follow the same pattern as `/api/admin/content`:

#### 1. Organization Content (EXTEND EXISTING)
```
GET    /api/admin/organization/content
POST   /api/admin/organization/content
GET    /api/admin/organization/content/:id
PUT    /api/admin/organization/content/:id
DELETE /api/admin/organization/content/:id
```
**Note**: Extend to support new content_type values (home_hero, home_donate_cta, etc.)

#### 2. Testimonials (NEW - follows /api/admin/content pattern)
```
GET    /api/admin/testimonials
POST   /api/admin/testimonials
GET    /api/admin/testimonials/:id
PUT    /api/admin/testimonials/:id
DELETE /api/admin/testimonials/:id
```

#### 3. Partners (NEW)
```
GET    /api/admin/partners
POST   /api/admin/partners
GET    /api/admin/partners/:id
PUT    /api/admin/partners/:id
DELETE /api/admin/partners/:id
```

#### 4. Team Members (NEW)
```
GET    /api/admin/team
POST   /api/admin/team
GET    /api/admin/team/:id
PUT    /api/admin/team/:id
DELETE /api/admin/team/:id
```

#### 5. Impact Statistics (NEW)
```
GET    /api/admin/stats
POST   /api/admin/stats
GET    /api/admin/stats/:id
PUT    /api/admin/stats/:id
DELETE /api/admin/stats/:id
```

#### 6. Gallery Items (NEW)
```
GET    /api/admin/gallery
POST   /api/admin/gallery
GET    /api/admin/gallery/:id
PUT    /api/admin/gallery/:id
DELETE /api/admin/gallery/:id
```

#### 7. Office Locations (NEW)
```
GET    /api/admin/offices
POST   /api/admin/offices
GET    /api/admin/offices/:id
PUT    /api/admin/offices/:id
DELETE /api/admin/offices/:id
```

#### 8. Portfolio Items (NEW)
```
GET    /api/admin/portfolio
POST   /api/admin/portfolio
GET    /api/admin/portfolio/:id
PUT    /api/admin/portfolio/:id
DELETE /api/admin/portfolio/:id
```

#### 9. Organization Milestones (NEW)
```
GET    /api/admin/milestones
POST   /api/admin/milestones
GET    /api/admin/milestones/:id
PUT    /api/admin/milestones/:id
DELETE /api/admin/milestones/:id
```

#### 10. Research Areas (NEW)
```
GET    /api/admin/research/areas
POST   /api/admin/research/areas
GET    /api/admin/research/areas/:id
PUT    /api/admin/research/areas/:id
DELETE /api/admin/research/areas/:id
```

#### 11. Research Partners (NEW)
```
GET    /api/admin/research/partners
POST   /api/admin/research/partners
GET    /api/admin/research/partners/:id
PUT    /api/admin/research/partners/:id
DELETE /api/admin/research/partners/:id
```

#### 12. LRM Members (NEW)
```
GET    /api/admin/lrm/members
POST   /api/admin/lrm/members
GET    /api/admin/lrm/members/:id
PUT    /api/admin/lrm/members/:id
DELETE /api/admin/lrm/members/:id
```

#### 13. LRM Roles (NEW)
```
GET    /api/admin/lrm/roles
POST   /api/admin/lrm/roles
GET    /api/admin/lrm/roles/:id
PUT    /api/admin/lrm/roles/:id
DELETE /api/admin/lrm/roles/:id
```

### Public Portal Endpoints (ALREADY EXIST)

**No changes needed!** The public endpoints already exist at `/api/public/portal/*` and `/api/public/*`.

The admin portal will manage the data, and the public portal will consume it via existing endpoints.

---

## Frontend CMS UI Design

### 1. Add "Pages" Tab to Content Management

**File**: `Frontend/Admin_Portal/v1/src/app/(admin)/content/page.tsx`

Add new content type:

```typescript
const contentTypes = [
  { id: 'blog', label: 'Blogs', icon: '📝' },
  { id: 'publication', label: 'Publications', icon: '📚' },
  { id: 'faq', label: 'FAQs', icon: '❓' },
  { id: 'page', label: 'Pages', icon: '📄' },
  { id: 'portal', label: 'Portal Pages', icon: '🌐' }, // NEW
];
```

### 2. Portal Pages Management Interface

**New Component**: `PortalPagesManager.tsx`

```typescript
interface PortalPagesManagerProps {
  // Component for managing portal pages
}

Features:
- Dropdown to select from 13 pages
- Dynamic section list for selected page
- Add/Edit/Delete/Reorder sections
- Section-specific form editor
- Live preview option
- Publish/Unpublish toggle
```

### 3. Page Selector Dropdown

```tsx
<Select
  value={selectedPage}
  onChange={(page) => handlePageChange(page)}
  options={[
    { value: 'home', label: '🏠 Home' },
    { value: 'about-us', label: 'ℹ️ About Us' },
    { value: 'what-we-do', label: '💼 What We Do' },
    { value: 'programs', label: '📋 Programs' },
    { value: 'research-publications', label: '📚 Research & Publications' },
    { value: 'resource-centers', label: '📁 Resource Centers' },
    { value: 'gallery', label: '🖼️ Gallery' },
    { value: 'legal-aid', label: '⚖️ Legal Aid' },
    { value: 'contact-us', label: '📧 Contact Us' },
    { value: 'portfolio', label: '💼 Portfolio' },
    { value: 'work-with-us', label: '👥 Work with Us' },
    { value: 'lrm-networks', label: '🌐 LRM Networks' },
    { value: 'footer', label: '🔻 Footer (Global)' },
  ]}
/>
```

### 4. Section Editor (Dynamic Forms)

Based on `section_type`, render appropriate form fields:

#### Hero Section Editor
```tsx
<Form>
  <Input label="Heading" name="content.heading" />
  <Textarea label="Subheading" name="content.subheading" />
  <ImageUpload label="Background Image" name="content.background_image" />
  <DynamicList label="CTA Buttons" name="content.cta_buttons">
    <Input label="Button Label" />
    <Input label="Button URL" />
    <Select label="Style" options={['primary', 'secondary']} />
  </DynamicList>
</Form>
```

#### Stats Section Editor
```tsx
<Form>
  <Input label="Section Title" name="content.title" />
  <DynamicList label="Statistics" name="content.stats">
    <Input label="Value" placeholder="50,000+" />
    <Input label="Label" placeholder="Families Assisted" />
    <IconPicker label="Icon" />
  </DynamicList>
</Form>
```

#### Testimonials Section Editor
```tsx
<Form>
  <Input label="Section Title" name="content.title" />
  <DynamicList label="Testimonials" name="content.testimonials">
    <Input label="Name" />
    <Input label="Location" />
    <Input label="Role" />
    <Textarea label="Quote" />
    <ImageUpload label="Photo" />
  </DynamicList>
</Form>
```

#### Content Block Editor
```tsx
<Form>
  <Input label="Title" name="content.title" />
  <RichTextEditor label="Content" name="content.content" />
  <Select label="Layout" options={[
    'text-left-media-right',
    'text-right-media-left',
    'text-only',
    'media-only'
  ]} />
  <MediaPicker label="Media" name="content.media" />
</Form>
```

### 5. Section List with Drag & Drop Reordering

```tsx
<SortableList
  items={sections}
  onReorder={handleReorder}
  renderItem={(section) => (
    <SectionCard
      title={section.section_title}
      type={section.section_type}
      isActive={section.is_active}
      onEdit={() => handleEdit(section)}
      onDelete={() => handleDelete(section)}
      onToggle={() => handleToggle(section)}
    />
  )}
/>
```

---

## Migration Strategy

### Phase 1: Database Setup (Week 1)

1. **Create Tables**
   - Execute schema SQL scripts
   - Create indexes
   - Set up RLS policies

2. **Seed Initial Data**
   - Create seeder script to migrate from static TypeScript files to database
   - Map existing data structures to JSONB content format

```typescript
// scripts/seed-portal-content.ts
import programs from '../Public_Portal/v1/src/data/programs';
import newsEvents from '../Public_Portal/v1/src/data/newsEvents';
// ... import all data files

async function seedPortalContent() {
  // 1. Seed Home page sections
  await seedHomePage();

  // 2. Seed About Us page sections
  await seedAboutUsPage();

  // ... seed all 13 pages
}

async function seedHomePage() {
  const homePageId = await getPageId('home');

  // Seed hero banner
  await createSection(homePageId, {
    section_key: 'hero-banner',
    section_title: 'Hero Banner',
    section_type: 'hero',
    content: {
      heading: "Empowering Communities Through Land Rights",
      subheading: "Fighting for justice...",
      background_image: "/images/hero-bg.jpg",
      cta_buttons: [...]
    },
    display_order: 1
  });

  // Seed impact stats
  await createSection(homePageId, {
    section_key: 'impact-stats',
    section_title: 'Impact at a Glance',
    section_type: 'stats',
    content: {
      title: "Impact at a Glance",
      stats: [
        { value: "50,000+", label: "Families Assisted", icon: "users" },
        // ... more stats
      ]
    },
    display_order: 2
  });

  // ... seed remaining sections
}
```

### Phase 2: Backend API Development (Week 2)

1. **Create Route Handlers**
   - `/api/admin/portal/pages/route.ts` (GET all pages)
   - `/api/admin/portal/pages/[page_key]/route.ts` (GET, PUT page)
   - `/api/admin/portal/pages/[page_key]/sections/route.ts` (POST section)
   - `/api/admin/portal/pages/[page_key]/sections/[section_key]/route.ts` (GET, PUT, DELETE section)
   - `/api/admin/portal/pages/[page_key]/sections/reorder/route.ts` (POST reorder)

2. **Create Service Layer**
   ```typescript
   // lib/api/services/portalPages.ts
   export const portalPagesApi = {
     getPages: () => authApi.get('/admin/portal/pages'),
     getPage: (pageKey) => authApi.get(`/admin/portal/pages/${pageKey}`),
     updateSection: (pageKey, sectionKey, data) =>
       authApi.put(`/admin/portal/pages/${pageKey}/sections/${sectionKey}`, data),
     // ... more methods
   };
   ```

3. **Create Public Endpoints**
   - `/api/public/portal/pages/[page_key]/route.ts`
   - These will replace static data imports in Public Portal

### Phase 3: Admin Portal UI Development (Week 3-4)

1. **Create Components**
   - `PortalPagesManager.tsx` - Main manager component
   - `PageSelector.tsx` - Dropdown for page selection
   - `SectionList.tsx` - List of sections with drag-drop
   - `SectionEditor.tsx` - Dynamic form editor based on section_type
   - Form field components for each section type

2. **Add to Content Management**
   - Integrate into existing content tabs
   - Add routing for portal pages

3. **Testing**
   - Unit tests for components
   - Integration tests for API calls
   - E2E tests for complete workflows

### Phase 4: Public Portal Integration (Week 5)

1. **Update Public Portal to Use APIs**
   ```typescript
   // Before (Static)
   import programs from '@/data/programs';

   // After (Dynamic)
   const { data: programs } = await fetch('/api/public/programs');
   ```

2. **Update Page Components**
   - Modify each page to fetch from API instead of static imports
   - Implement ISR (Incremental Static Regeneration) for performance

   ```typescript
   // app/page.tsx (Home)
   export const revalidate = 60; // Revalidate every 60 seconds

   export default async function HomePage() {
     const pageData = await fetch('/api/public/portal/pages/home');
     return <DynamicPageRenderer sections={pageData.sections} />;
   }
   ```

3. **Create Dynamic Renderers**
   ```typescript
   // components/DynamicSectionRenderer.tsx
   export function DynamicSectionRenderer({ section }) {
     switch (section.section_type) {
       case 'hero':
         return <HeroSection {...section.content} />;
       case 'stats':
         return <StatsSection {...section.content} />;
       case 'testimonials':
         return <TestimonialsSection {...section.content} />;
       // ... handle all section types
     }
   }
   ```

### Phase 5: Testing & Deployment (Week 6)

1. **Quality Assurance**
   - Test all CRUD operations
   - Test section reordering
   - Test publish/unpublish
   - Cross-browser testing
   - Mobile responsiveness

2. **Performance Optimization**
   - Implement caching strategy
   - Optimize image loading
   - Set up CDN for static assets

3. **Documentation**
   - User guide for content managers
   - API documentation
   - Developer documentation

4. **Deployment**
   - Database migrations
   - Deploy backend updates
   - Deploy admin portal updates
   - Deploy public portal updates

---

## Implementation Files Structure

```
Backend/v1/
├── src/
│   └── app/
│       └── api/
│           ├── admin/
│           │   └── portal/
│           │       └── pages/
│           │           ├── route.ts (GET all pages)
│           │           ├── [page_key]/
│           │           │   ├── route.ts (GET, PUT page)
│           │           │   └── sections/
│           │           │       ├── route.ts (POST section)
│           │           │       ├── reorder/
│           │           │       │   └── route.ts (POST reorder)
│           │           │       └── [section_key]/
│           │           │           └── route.ts (GET, PUT, DELETE)
│           └── public/
│               └── portal/
│                   └── pages/
│                       └── [page_key]/
│                           └── route.ts (GET page for public)
└── database/
    └── migrations/
        ├── 001_create_portal_pages_tables.sql
        └── 002_seed_portal_pages_data.sql

Frontend/Admin_Portal/v1/
└── src/
    ├── app/
    │   └── (admin)/
    │       └── portal-pages/
    │           ├── page.tsx (Main portal pages manager)
    │           └── [page_key]/
    │               └── page.tsx (Page editor)
    ├── components/
    │   └── features/
    │       └── portal-pages/
    │           ├── PortalPagesManager.tsx
    │           ├── PageSelector.tsx
    │           ├── SectionList.tsx
    │           ├── SectionEditor.tsx
    │           └── section-editors/
    │               ├── HeroSectionEditor.tsx
    │               ├── StatsSectionEditor.tsx
    │               ├── TestimonialsSectionEditor.tsx
    │               ├── ContentBlockEditor.tsx
    │               └── ... (more editors)
    └── lib/
        └── api/
            └── services/
                └── portalPages.ts

Frontend/Public_Portal/v1/
└── src/
    ├── app/
    │   ├── page.tsx (Home - now fetches from API)
    │   ├── about/page.tsx (About - now fetches from API)
    │   └── ... (all pages updated to use API)
    └── components/
        └── dynamic/
            ├── DynamicPageRenderer.tsx
            └── section-renderers/
                ├── HeroSectionRenderer.tsx
                ├── StatsSectionRenderer.tsx
                └── ... (renderers for each section type)
```

---

## Benefits of This Approach

### 1. **Non-Technical Content Management**
   - Marketing team can update content without developer help
   - No code deployments needed for content changes
   - Visual editors for each section type

### 2. **Flexibility**
   - Add new sections without code changes
   - Reorder sections via drag & drop
   - Enable/disable sections on the fly

### 3. **Consistency**
   - Centralized content management
   - Enforced content structure via JSONB schemas
   - Reusable section types across pages

### 4. **Performance**
   - ISR for fast page loads
   - Database-driven but still static-first
   - CDN-friendly architecture

### 5. **SEO Control**
   - Manage meta tags per page
   - Control content visibility
   - Optimize for search engines

### 6. **Version Control**
   - Track content changes via updated_at
   - Audit trail of modifications
   - Potential for content versioning (future enhancement)

---

## Technical Considerations

### 1. **JSONB Schema Validation**

Add validation layer to ensure content structure matches expected schema:

```typescript
// lib/validation/sectionSchemas.ts
import { z } from 'zod';

const heroSectionSchema = z.object({
  heading: z.string().min(1).max(200),
  subheading: z.string().max(500),
  background_image: z.string().url(),
  cta_buttons: z.array(z.object({
    label: z.string(),
    url: z.string(),
    style: z.enum(['primary', 'secondary'])
  }))
});

export function validateSectionContent(section_type: string, content: any) {
  const schema = sectionSchemas[section_type];
  if (!schema) throw new Error(`Unknown section type: ${section_type}`);
  return schema.parse(content);
}
```

### 2. **Caching Strategy**

```typescript
// Implement Redis caching for frequently accessed pages
const getCachedPageData = async (pageKey: string) => {
  const cached = await redis.get(`portal:${pageKey}`);
  if (cached) return JSON.parse(cached);

  const data = await db.from('public_portal_sections')
    .select('*')
    .eq('page_key', pageKey);

  await redis.set(`portal:${pageKey}`, JSON.stringify(data), 'EX', 300); // 5min cache
  return data;
};
```

### 3. **Image Management**

- All images uploaded via existing `/api/admin/content/upload` endpoint
- Store in Supabase Storage bucket "portal-images"
- Implement image optimization (resize, compress, WebP conversion)

### 4. **Backward Compatibility**

During migration, support both static and dynamic content:

```typescript
// Fallback mechanism
const getPageContent = async (pageKey: string) => {
  try {
    // Try database first
    return await fetchFromDatabase(pageKey);
  } catch (error) {
    // Fallback to static data
    console.warn('Falling back to static data');
    return await import(`@/data/${pageKey}`);
  }
};
```

---

## Rollout Plan

### Week 1: Foundation
- [ ] Create database tables
- [ ] Write migration scripts
- [ ] Set up RLS policies
- [ ] Create seeder scripts

### Week 2: Backend
- [ ] Implement admin API endpoints
- [ ] Implement public API endpoints
- [ ] Add validation layer
- [ ] Write API tests

### Week 3: Admin UI (Part 1)
- [ ] Create PortalPagesManager component
- [ ] Implement page selector
- [ ] Build section list with reordering
- [ ] Create base SectionEditor component

### Week 4: Admin UI (Part 2)
- [ ] Build section-specific editors (Hero, Stats, Testimonials, etc.)
- [ ] Implement image uploads
- [ ] Add publish/unpublish controls
- [ ] Create preview functionality

### Week 5: Public Portal Integration
- [ ] Update Home page to use API
- [ ] Update About page to use API
- [ ] Update remaining pages
- [ ] Implement ISR
- [ ] Create dynamic renderers

### Week 6: Testing & Launch
- [ ] QA testing
- [ ] Performance optimization
- [ ] Documentation
- [ ] Staging deployment
- [ ] Production deployment
- [ ] Training for content managers

---

## Success Criteria

- ✅ All 13 pages manageable via Admin Portal
- ✅ Non-technical users can update content without developer help
- ✅ Public Portal pages load in < 2 seconds
- ✅ Content changes reflect on Public Portal within 1 minute
- ✅ Zero downtime during migration
- ✅ SEO rankings maintained or improved
- ✅ Mobile-responsive on all devices
- ✅ Accessibility compliance (WCAG 2.1 AA)

---

## Future Enhancements (Post-MVP)

1. **Content Versioning**
   - Track all content changes
   - Ability to revert to previous versions
   - Compare versions side-by-side

2. **Scheduled Publishing**
   - Schedule content to publish at specific date/time
   - Auto-unpublish expired content

3. **A/B Testing**
   - Create multiple variants of sections
   - Track performance metrics
   - Automatically promote winning variant

4. **Multi-language Support**
   - Add language selector
   - Manage translations per section
   - Auto-translate with AI assistance

5. **Analytics Integration**
   - Track section performance
   - Heatmaps for user interaction
   - Content engagement metrics

6. **Approval Workflow**
   - Content requires approval before publishing
   - Role-based permissions (Editor, Reviewer, Publisher)
   - Comment/feedback system

---

## Risk Mitigation

| Risk | Impact | Mitigation |
|------|--------|------------|
| Database migration fails | High | Create rollback script, test on staging first |
| Content structure changes break Public Portal | High | Implement schema validation, extensive testing |
| Performance degradation | Medium | Implement caching, ISR, CDN |
| User adoption resistance | Medium | Comprehensive training, intuitive UI |
| SEO ranking drop | Medium | Maintain URL structure, redirect old URLs |
| Data loss during migration | High | Full backup before migration, test restore process |

---

## Conclusion

This improvement plan transforms the Public Portal from a static, developer-dependent website to a fully manageable CMS-driven platform. By implementing this plan, the HAKIARDHI team will be able to:

1. Update website content instantly without deployments
2. Manage all 13 page sections through a unified interface
3. Maintain fast performance with ISR and caching
4. Scale content easily as the organization grows

The phased approach ensures minimal risk and allows for iterative improvements based on user feedback.

---

**Next Steps:**
1. Review and approve this plan
2. Allocate development resources (estimated 6 weeks for 1-2 developers)
3. Begin Phase 1: Database Setup
4. Schedule training sessions for content managers

**Questions or Clarifications:**
- Which sections should be prioritized for Phase 1?
- Are there any additional section types needed beyond those listed?
- What level of permissions/approval workflow is required?
