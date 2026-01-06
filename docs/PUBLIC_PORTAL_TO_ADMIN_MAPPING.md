# Public Portal to Admin Portal Content Mapping

This document maps all Public Portal content to Admin Portal management interfaces.

## 📄 About Us Page

### Content Sections on Public Portal

| Section | Current Data Source | Admin Management | Database Table | Admin Tab/Location |
|---------|-------------------|------------------|----------------|-------------------|
| **Hero Section** | `about.tsx` - aboutHero | ✅ Pages Tab | `organization_content` | Content Manager → Pages → Portal Page: "About Us" |
| **Vision & Mission** | `about.tsx` - visionMission | ✅ Pages Tab | `organization_content` | Content Manager → Pages → Content Type: "vision", "mission" |
| **Core Values** | `about.tsx` - coreValues | ✅ Pages Tab | `organization_content` | Content Manager → Pages → Content Type: "value" |
| **Approach Principles** | `about.tsx` - approachPrinciples | ✅ Pages Tab | `organization_content` | Content Manager → Pages → Content Type: "approach" |
| **Impact Statistics** | `about.tsx` - impactStats | ⚠️ **Computed from Materialized View** | `impact_statistics` (VIEW) | **NOT EDITABLE** - Auto-calculated |
| **Leadership Team** | `about.tsx` - leadershipTeam | ✅ Team Members Tab | `team_members` | Content Manager → Team Members → Filter: member_type="leadership" |
| **Core Team/Departments** | `about.tsx` - coreTeamRoles | ✅ Team Members Tab | `team_members` | Content Manager → Team Members → Filter: member_type="staff" |
| **Board of Directors** | `about.tsx` - boardMembers | ✅ Team Members Tab | `team_members` | Content Manager → Team Members → Filter: member_type="board" |
| **Partners & Donors** | `about.tsx` - partners | ✅ Partners Tab | `partners` | Content Manager → Partners |
| **Organization Milestones** | `about.tsx` - milestones | ✅ Milestones Tab | `organization_milestones` | Content Manager → Milestones |

### Key Notes:
- **Impact Statistics** are computed from actual data (cases, beneficiaries, projects, etc.) and should NOT be manually edited
- Team members use `member_type` field to categorize: 'leadership', 'board', 'staff', 'advisor'
- Partners can be filtered by `partner_type` and marked with `is_featured`

---

## 💼 What We Do Page

### Content Sections on Public Portal

| Section | Current Data Source | Admin Management | Database Table | Admin Tab/Location |
|---------|-------------------|------------------|----------------|-------------------|
| **Hero Section** | `whatWeDo.ts` - whatWeDoHero | ✅ Pages Tab | `organization_content` | Content Manager → Pages → Portal Page: "What We Do" |
| **Service Details** | `whatWeDo.ts` - serviceDetails[] | ⚠️ **Needs Structure** | `organization_content` or dedicated table | Content Manager → Pages → JSON fields |
| **Key Activities** | Within serviceDetails | ⚠️ **Needs Structure** | JSON array in content | Store as JSON array |
| **Impact Metrics** | Within serviceDetails | ⚠️ **Linked to Computed Stats** | Reference to `impact_statistics` | Link to materialized view data |
| **Success Stories** | Testimonials | ✅ Testimonials Tab | `testimonials` | Content Manager → Testimonials → Filter: is_featured=true |

### Service Details Structure Recommendation:

Each service (Research, Training, Advocacy, Legal Aid) should be stored as:

```typescript
{
  id: 'research',
  title: 'Research & Documentation',
  portal_page: 'what-we-do',
  section_type: 'service',
  content: 'Long description text',
  metadata: {
    keyActivities: [
      'Land tenure systems research and analysis',
      'Indigenous knowledge documentation',
      // ...
    ],
    impactStat: {
      value: '150+',
      description: 'Research publications...'
    },
    image: '/images/hero_1.JPG'
  }
}
```

Store in `organization_content` with `content_type='service'` (needs schema update).

---

## 🏠 Home Page

### Content Sections on Public Portal

| Section | Current Data Source | Admin Management | Database Table | Admin Tab/Location |
|---------|-------------------|------------------|----------------|-------------------|
| **Hero Banner** | Static | ✅ Pages Tab | `organization_content` | Content Manager → Pages → Portal Page: "Home" → Content Type: "home_hero" |
| **Impact Statistics** | Computed | ⚠️ **Materialized View** | `impact_statistics` (VIEW) | **NOT EDITABLE** - Auto-calculated |
| **What We Do Overview** | Static | ✅ Pages Tab | `organization_content` | Content Manager → Pages → Portal Page: "Home" → Content Type: "home_programs_overview" |
| **Success Stories** | Static | ✅ Testimonials Tab | `testimonials` | Content Manager → Testimonials → Filter: is_featured=true |
| **Featured Programs** | Projects | ✅ Existing | `projects` | Projects Management (existing feature) |
| **Latest News** | Blogs | ✅ Existing | `blogs` | Content Manager → Blogs & News → Filter: type="News" |
| **Partners Showcase** | Static | ✅ Partners Tab | `partners` | Content Manager → Partners → Filter: is_featured=true |
| **Donate CTA** | Static | ✅ Pages Tab | `organization_content` | Content Manager → Pages → Portal Page: "Home" → Content Type: "home_donate_cta" |

---

## 📊 Content Manager Tabs Summary

### Current Tabs (8 Total)

1. **📝 Blogs & News**
   - Manages blog posts, news, announcements
   - Table: `blogs`
   - Features: Publish/Unpublish, Featured toggle, Cover images

2. **📚 Publications**
   - Research papers, reports, whitepapers
   - Table: `publications`
   - Features: PDF uploads, Authors (JSONB), Topics/Keywords

3. **❓ FAQs**
   - Frequently asked questions
   - Table: `faqs`
   - Features: Category filtering

4. **📄 Pages**
   - Organization content (vision, mission, values, etc.)
   - Portal page sections (home, about, what-we-do, etc.)
   - Table: `organization_content`
   - Features: Portal Page dropdown with 13 options

5. **👥 Team Members** ⭐ NEW
   - Leadership, Board, Staff, Advisors
   - Table: `team_members`
   - Fields: name, role, member_type, bio, image_url, email, phone, social links

6. **🤝 Partners** ⭐ NEW
   - Partner organizations, donors, collaborators
   - Table: `partners`
   - Fields: name, partner_type, logo_url, website_url, partnership_level, is_featured

7. **💬 Testimonials** ⭐ NEW
   - Success stories, client feedback
   - Table: `testimonials`
   - Fields: quote, author_name, author_role, author_location, rating, is_featured

8. **🏆 Milestones** ⭐ NEW
   - Organization timeline, key achievements
   - Table: `organization_milestones`
   - Fields: year, title, description, icon_name, display_order

---

## 🔄 Data Flow

### From Static Files → Database → Public Portal

**Current State:**
```
Public Portal → src/data/*.tsx (Static TypeScript files)
```

**Target State:**
```
Admin Portal → Database Tables → Public API → Public Portal
```

### Migration Steps

1. ✅ **Admin APIs Created** - CRUD endpoints for team, partners, testimonials, milestones
2. ✅ **Admin UI Created** - Content Manager tabs for managing all content
3. ⏳ **Data Migration** - Migrate static data from `/src/data/*.tsx` to database
4. ⏳ **Public Portal Integration** - Update Public Portal to fetch from APIs instead of static imports

---

## ⚠️ Important Distinctions

### Impact Statistics
- **DO NOT** create admin interface for manual entry
- Statistics are **computed from materialized views**
- They aggregate real data from:
  - Beneficiaries count → Villages reached
  - Training sessions → Women trained
  - Legal cases → Cases supported
  - Publications count → Research publications

### Team Members Data Issue
Current Public Portal data has **placeholder names** instead of real team members:
```typescript
// ❌ Current (Placeholder)
leadershipTeam = [
  { name: 'Executive Director', role: '...' }
]

// ✅ Should be (Real Names)
leadershipTeam = [
  { name: 'John Doe', role: 'Executive Director' }
]
```

Admin should enter **real team member names** when populating the database.

---

## 🚀 Next Steps

### Immediate Tasks
1. ✅ Admin APIs created for: team, partners, testimonials, milestones
2. ✅ Admin UI tabs added to Content Manager
3. ⏳ Create custom forms for better UX (currently using generic ContentForm)
4. ⏳ Migrate static data from Public Portal to database
5. ⏳ Update Public Portal to fetch from APIs

### Schema Updates Needed
1. **organization_content table**: Add new content_type values for portal sections:
   ```sql
   ALTER TABLE organization_content DROP CONSTRAINT organization_content_content_type_check;
   ALTER TABLE organization_content ADD CONSTRAINT organization_content_content_type_check
   CHECK (content_type::text = ANY (ARRAY[
     -- Existing
     'vision', 'mission', 'who_we_are', 'value', 'history', 'approach',
     -- New portal sections
     'home_hero', 'home_programs_overview', 'home_donate_cta',
     'what_we_do_overview', 'service', 'footer_content'
   ]::text[]));
   ```

---

## 📝 Content Entry Workflow

### For Content Managers

**To update About Us page:**
1. Go to Content Manager → **Pages** tab → Select "About Us" from dropdown
2. Edit Vision, Mission, Values (each is a separate entry)
3. Go to **Team Members** tab → Add/Edit leadership, board, staff
4. Go to **Partners** tab → Add/Edit partner organizations
5. Go to **Milestones** tab → Add/Edit historical events

**To update What We Do page:**
1. Go to Content Manager → **Pages** tab → Select "What We Do" from dropdown
2. Edit service descriptions and key activities (JSON format)
3. Impact statistics are **auto-calculated** - no manual entry needed

**To update Home page:**
1. Go to Content Manager → **Pages** tab → Select "Home" from dropdown
2. Edit hero banner, CTAs, overview sections
3. Go to **Testimonials** tab → Mark testimonials as "Featured"
4. Go to **Partners** tab → Mark partners as "Featured"
5. Go to **Blogs & News** tab → Latest news auto-shows newest entries

---

**Document Version**: 1.0
**Last Updated**: 2026-01-03
**Status**: Implementation Complete - Ready for Data Migration
