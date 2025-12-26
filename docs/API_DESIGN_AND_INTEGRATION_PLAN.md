# HakiArdhi Public Portal - API Design & Integration Plan

## Overview

This document outlines the comprehensive API design and database integration strategy for the HakiArdhi Public Portal. It maps frontend data requirements to backend database tables, defines API endpoints, and recommends materialized views for optimal performance.

---

## Table of Contents

1. [Database Schema Overview](#database-schema-overview)
2. [Page-by-Page API Design](#page-by-page-api-design)
3. [Materialized Views](#materialized-views)
4. [API Response Formats](#api-response-formats)
5. [Integration Timeline](#integration-timeline)

---

## Database Schema Overview

### Core Tables for Public Portal

| Table | Purpose | Public Portal Usage |
|-------|---------|---------------------|
| `projects` | Store program/project data | Programs page, Portfolio |
| `activities` | Track activities within projects | Programs detail, Portfolio |
| `blogs` | News articles and announcements | News & Events page |
| `cases` | Legal aid cases | Legal Aid page, Portfolio |
| `beneficiaries` | Community members served | Impact stats, Testimonials |
| `regions/districts/villages` | Geographic locations | LRM Network, Contact |
| `categories` | Categorization system | All listing pages |
| `faqs` | Frequently asked questions | Contact page |

### Tables Requiring Extension

The following tables need additional fields for public portal display:

```sql
-- Extend projects table
ALTER TABLE projects ADD COLUMN
  slug VARCHAR(255) UNIQUE,
  short_description TEXT,
  full_description TEXT,
  cover_image TEXT,
  gallery JSONB DEFAULT '[]',
  category VARCHAR(100),
  location VARCHAR(255),
  participants INTEGER,
  objectives JSONB DEFAULT '[]',
  outcomes JSONB DEFAULT '[]',
  impact_metrics JSONB DEFAULT '[]',
  partners JSONB DEFAULT '[]',
  is_featured BOOLEAN DEFAULT FALSE,
  is_published BOOLEAN DEFAULT FALSE;

-- Extend blogs table
ALTER TABLE blogs ADD COLUMN
  slug VARCHAR(255) UNIQUE,
  excerpt TEXT,
  cover_image TEXT,
  type VARCHAR(50), -- 'News', 'Event', 'Announcement'
  event_date DATE,
  event_location VARCHAR(255),
  gallery JSONB DEFAULT '[]',
  related_links JSONB DEFAULT '[]',
  is_featured BOOLEAN DEFAULT FALSE,
  is_published BOOLEAN DEFAULT FALSE;
```

---

## Page-by-Page API Design

### 1. Home Page (`/`)

#### API Endpoints

```typescript
// Featured Programs
GET /api/v1/public/programs/featured
Response: Program[] (limit 6)

// Impact Statistics
GET /api/v1/public/stats/impact
Response: ImpactStats

// Latest News
GET /api/v1/public/news/latest
Response: NewsEvent[] (limit 3)

// Testimonials
GET /api/v1/public/testimonials/featured
Response: Testimonial[] (limit 3)

// Donors/Partners
GET /api/v1/public/partners
Response: Partner[]
```

#### Database Queries

```sql
-- Featured Programs (uses materialized view)
SELECT * FROM mv_featured_programs LIMIT 6;

-- Impact Statistics (uses materialized view)
SELECT * FROM mv_public_impact_stats;

-- Latest News
SELECT id, slug, title, excerpt, cover_image, type, created_at, category_id
FROM blogs
WHERE is_published = true
ORDER BY created_at DESC
LIMIT 3;
```

#### Materialized View: `mv_home_page_stats`
**Recommendation**: YES - High traffic page, computed stats

---

### 2. About Page (`/about`)

#### API Endpoints

```typescript
// Organization Info
GET /api/v1/public/organization
Response: { whoWeAre, vision, mission, coreValues, journey }

// Team Members
GET /api/v1/public/team
Response: { leadership, board, departments }

// Impact Statistics
GET /api/v1/public/stats/impact
Response: ImpactStats

// Partners
GET /api/v1/public/partners
Response: Partner[]
```

#### Database Tables Required

**New Table: `organization_content`**
```sql
CREATE TABLE organization_content (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  content_type VARCHAR(50) NOT NULL, -- 'vision', 'mission', 'who_we_are', 'value'
  title VARCHAR(255),
  content TEXT NOT NULL,
  icon_name VARCHAR(50),
  display_order INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE team_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  role VARCHAR(255) NOT NULL,
  department VARCHAR(100),
  bio TEXT,
  image_url TEXT,
  member_type VARCHAR(50), -- 'leadership', 'board', 'staff'
  display_order INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE organization_milestones (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  year VARCHAR(20) NOT NULL,
  title VARCHAR(255) NOT NULL,
  description TEXT NOT NULL,
  display_order INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

#### Materialized View: `mv_about_page_content`
**Recommendation**: YES - Rarely changes, frequently accessed

---

### 3. Programs Page (`/programs`)

#### API Endpoints

```typescript
// All Programs with filtering
GET /api/v1/public/programs
Query: ?category=Research&status=Ongoing&page=1&limit=12
Response: { data: Program[], total: number, page: number }

// Single Program Detail
GET /api/v1/public/programs/:slug
Response: ProgramDetail

// Program Categories
GET /api/v1/public/programs/categories
Response: string[]
```

#### Database Mapping

| Frontend Field | Database Column | Table |
|---------------|-----------------|-------|
| id | id | projects |
| slug | slug | projects |
| title | title | projects |
| description | short_description | projects |
| fullDescription | full_description | projects |
| category | categories.name | categories (JOIN) |
| image | cover_image | projects |
| date | start_date | projects |
| location | project_locations | project_locations (JOIN) |
| participants | COUNT(activity_beneficiaries) | Computed |
| status | status | projects |
| objectives | objectives | projects (JSONB) |
| impact | impact_metrics | projects (JSONB) |
| gallery | gallery | projects (JSONB) |
| partners | partners | projects (JSONB) |
| outcomes | outcomes | projects (JSONB) |

#### Query Example

```sql
SELECT
  p.id,
  p.slug,
  p.title,
  p.short_description AS description,
  p.full_description,
  c.name AS category,
  p.cover_image AS image,
  p.start_date AS date,
  r.name AS location,
  p.status,
  p.objectives,
  p.impact_metrics AS impact,
  p.gallery,
  p.partners,
  p.outcomes,
  (SELECT COUNT(DISTINCT ab.beneficiary_id)
   FROM activities a
   JOIN activity_beneficiaries ab ON a.id = ab.activity_id
   WHERE a.project_id = p.id) AS participants
FROM projects p
LEFT JOIN categories c ON p.category_id = c.id
LEFT JOIN project_locations pl ON p.id = pl.project_id
LEFT JOIN regions r ON pl.region_id = r.id
WHERE p.is_published = true
ORDER BY p.start_date DESC;
```

#### Materialized View: `mv_programs_list`
**Recommendation**: YES - Complex JOINs, frequently accessed

---

### 4. Portfolio Page (`/portfolio`)

#### API Endpoints

```typescript
// All Portfolio Items with filtering
GET /api/v1/public/portfolio
Query: ?category=Legal+Advocacy&type=Case+Study&year=2023&page=1
Response: { data: PortfolioItem[], total: number }

// Single Portfolio Item
GET /api/v1/public/portfolio/:slug
Response: PortfolioItemDetail

// Portfolio Categories
GET /api/v1/public/portfolio/categories
Response: string[]
```

#### New Table: `portfolio_items`

```sql
CREATE TABLE portfolio_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug VARCHAR(255) UNIQUE NOT NULL,
  title VARCHAR(255) NOT NULL,
  subtitle VARCHAR(255),
  description TEXT NOT NULL,
  cover_image TEXT,
  category VARCHAR(100) NOT NULL,
  type VARCHAR(50) NOT NULL, -- 'Case Study', 'Project', 'Initiative', 'Success Story'
  year VARCHAR(20),
  location VARCHAR(255),
  beneficiaries INTEGER,
  duration VARCHAR(100),
  partner VARCHAR(255),
  tags JSONB DEFAULT '[]',
  impact JSONB DEFAULT '[]',
  is_featured BOOLEAN DEFAULT FALSE,

  -- Impact Storytelling
  challenge TEXT,
  approach TEXT,
  timeline JSONB DEFAULT '[]',
  testimonials JSONB DEFAULT '[]',
  impact_metrics JSONB DEFAULT '[]',
  gallery JSONB DEFAULT '[]',

  -- Fundraising
  total_budget VARCHAR(50),
  funding_breakdown JSONB DEFAULT '[]',
  funding_sources JSONB DEFAULT '[]',
  needs_continued_support BOOLEAN DEFAULT FALSE,
  support_message TEXT,

  -- Meta
  is_published BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_portfolio_category ON portfolio_items(category);
CREATE INDEX idx_portfolio_type ON portfolio_items(type);
CREATE INDEX idx_portfolio_year ON portfolio_items(year);
CREATE INDEX idx_portfolio_featured ON portfolio_items(is_featured) WHERE is_featured = true;
```

#### Materialized View: `mv_portfolio_list`
**Recommendation**: YES - Complex data, filterable

---

### 5. News & Events Page (`/news-events`)

#### API Endpoints

```typescript
// All News/Events with filtering
GET /api/v1/public/news
Query: ?type=Event&category=Training&page=1&limit=12
Response: { data: NewsEvent[], total: number }

// Single News/Event
GET /api/v1/public/news/:slug
Response: NewsEventDetail

// Featured News
GET /api/v1/public/news/featured
Response: NewsEvent[] (limit 4)

// Upcoming Events
GET /api/v1/public/events/upcoming
Response: NewsEvent[]
```

#### Database Mapping (Using `blogs` table with extensions)

| Frontend Field | Database Column | Notes |
|---------------|-----------------|-------|
| id | id | |
| slug | slug | |
| title | title | |
| excerpt | excerpt | |
| fullDescription | content | |
| image | cover_image | |
| type | type | 'News', 'Event', 'Announcement' |
| category | categories.name | JOIN |
| date | event_date OR created_at | |
| author | users.first_name + users.last_name | JOIN |
| location | event_location | |
| featured | is_featured | |
| gallery | gallery | JSONB |
| relatedLinks | related_links | JSONB |

#### Materialized View: `mv_news_events_list`
**Recommendation**: YES - Frequent listing, multiple filters

---

### 6. Research Page (`/research`)

#### API Endpoints

```typescript
// All Publications with filtering
GET /api/v1/public/publications
Query: ?type=Report&topic=Gender&page=1&limit=12
Response: { data: Publication[], total: number }

// Single Publication
GET /api/v1/public/publications/:id
Response: PublicationDetail

// Research Areas
GET /api/v1/public/research/areas
Response: ResearchArea[]

// Research Statistics
GET /api/v1/public/research/stats
Response: ResearchStats

// Research Partners
GET /api/v1/public/research/partners
Response: Partner[]

// Increment Download Count
POST /api/v1/public/publications/:id/download
Response: { success: boolean }
```

#### New Table: `publications`

```sql
CREATE TABLE publications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title VARCHAR(500) NOT NULL,
  authors JSONB DEFAULT '[]', -- Array of author names
  publication_date DATE NOT NULL,
  type VARCHAR(50) NOT NULL, -- 'Report', 'Policy Brief', 'Journal Article', etc.
  topics JSONB DEFAULT '[]', -- Array of topic strings
  abstract TEXT NOT NULL,
  download_url TEXT NOT NULL,
  cover_image TEXT,
  downloads INTEGER DEFAULT 0,
  is_featured BOOLEAN DEFAULT FALSE,
  pdf_size VARCHAR(20),
  pages INTEGER,
  citation TEXT,
  is_published BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE research_areas (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  description TEXT,
  icon_name VARCHAR(50),
  publication_count INTEGER DEFAULT 0, -- Updated via trigger
  display_order INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT TRUE
);

CREATE INDEX idx_publications_type ON publications(type);
CREATE INDEX idx_publications_date ON publications(publication_date DESC);
CREATE INDEX idx_publications_featured ON publications(is_featured) WHERE is_featured = true;
CREATE INDEX idx_publications_topics ON publications USING GIN(topics);
```

#### Materialized View: `mv_research_stats`
**Recommendation**: YES - Aggregated counts, rarely changes

---

### 7. Legal Aid Page (`/legal-aid`)

#### API Endpoints

```typescript
// Legal Aid Statistics
GET /api/v1/public/legal-aid/stats
Response: LegalAidStats

// Services Overview
GET /api/v1/public/legal-aid/services
Response: Service[]

// Success Stories
GET /api/v1/public/legal-aid/success-stories
Response: SuccessStory[] (limit 6)

// FAQs
GET /api/v1/public/faqs?category=legal-aid
Response: FAQ[]

// Case Submission
POST /api/v1/public/legal-aid/submit-case
Body: { name, phone, email, region, district, village, case_type, description }
Response: { success: boolean, reference_number: string }
```

#### Database Integration

```sql
-- Legal Aid Statistics (uses materialized view)
SELECT * FROM mv_legal_aid_stats;

-- This aggregates from:
-- - cases table (total cases, by status)
-- - case_stages table (resolution rates)
-- - beneficiaries table (people served)
```

#### Materialized View: `mv_legal_aid_stats`
**Recommendation**: YES - Complex aggregations

---

### 8. LRM Network Page (`/lrm-network`)

#### API Endpoints

```typescript
// Regions with LRM Data
GET /api/v1/public/lrm/regions
Response: TanzaniaRegion[]

// LRM Roles/Activities
GET /api/v1/public/lrm/roles
Response: LRMRole[]

// LRM Impact Statistics
GET /api/v1/public/lrm/stats
Response: LRMImpactStats

// How to Become LRM
GET /api/v1/public/lrm/how-to-join
Response: HowToBecomeSection
```

#### New Tables

```sql
CREATE TABLE lrm_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id),
  region_id UUID REFERENCES regions(id),
  district_id UUID REFERENCES districts(id),
  village_id UUID REFERENCES villages(id),
  certified_date DATE,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE lrm_activities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  lrm_id UUID REFERENCES lrm_members(id),
  activity_type VARCHAR(50), -- 'dispute_resolved', 'education_session', 'legal_referral'
  description TEXT,
  beneficiaries_count INTEGER DEFAULT 0,
  activity_date DATE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- This view aggregates LRM data by region
CREATE MATERIALIZED VIEW mv_lrm_by_region AS
SELECT
  r.id AS region_id,
  r.name AS region_name,
  COUNT(DISTINCT lm.id) AS lrm_count,
  COUNT(DISTINCT d.id) AS districts,
  COUNT(DISTINCT v.id) AS villages,
  COALESCE(SUM(CASE WHEN la.activity_type = 'dispute_resolved' THEN 1 ELSE 0 END), 0) AS disputes_resolved,
  COALESCE(SUM(la.beneficiaries_count), 0) AS families_educated
FROM regions r
LEFT JOIN lrm_members lm ON r.id = lm.region_id AND lm.is_active = true
LEFT JOIN districts d ON r.id = d.region_id
LEFT JOIN villages v ON d.id = v.district_id
LEFT JOIN lrm_activities la ON lm.id = la.lrm_id
GROUP BY r.id, r.name;
```

#### Materialized View: `mv_lrm_by_region`, `mv_lrm_impact_stats`
**Recommendation**: YES - Heavy aggregations across multiple tables

---

### 9. Contact Page (`/contact`)

#### API Endpoints

```typescript
// Contact Information
GET /api/v1/public/contact-info
Response: ContactInfo

// FAQs
GET /api/v1/public/faqs
Response: FAQ[]

// Submit Contact Form
POST /api/v1/public/contact/submit
Body: { name, email, phone, subject, message }
Response: { success: boolean, ticket_id: string }

// Office Locations
GET /api/v1/public/offices
Response: Office[]
```

#### Database Integration

Uses existing `faqs` table. New tables needed:

```sql
CREATE TABLE contact_submissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) NOT NULL,
  phone VARCHAR(50),
  subject VARCHAR(100) NOT NULL,
  message TEXT NOT NULL,
  status VARCHAR(50) DEFAULT 'pending',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  responded_at TIMESTAMP WITH TIME ZONE
);

CREATE TABLE office_locations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  address TEXT NOT NULL,
  city VARCHAR(100),
  phone VARCHAR(50),
  email VARCHAR(255),
  coordinates JSONB, -- {lat, lng}
  is_headquarters BOOLEAN DEFAULT FALSE,
  is_active BOOLEAN DEFAULT TRUE
);
```

#### Materialized View
**Recommendation**: NO - Simple queries, dynamic form

---

### 10. Donate Page (`/donate`)

#### API Endpoints

```typescript
// Donation Options
GET /api/v1/public/donation/options
Response: DonationOption[]

// Active Campaigns
GET /api/v1/public/donation/campaigns
Response: Campaign[]

// Impact of Donations
GET /api/v1/public/donation/impact
Response: DonationImpact

// Process Donation
POST /api/v1/public/donation/process
Body: { amount, frequency, donor_info, payment_method }
Response: { success: boolean, payment_url: string }
```

#### New Tables

```sql
CREATE TABLE donation_campaigns (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title VARCHAR(255) NOT NULL,
  description TEXT,
  target_amount DECIMAL(12,2),
  raised_amount DECIMAL(12,2) DEFAULT 0,
  start_date DATE,
  end_date DATE,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE donations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  campaign_id UUID REFERENCES donation_campaigns(id),
  donor_name VARCHAR(255),
  donor_email VARCHAR(255),
  amount DECIMAL(12,2) NOT NULL,
  currency VARCHAR(3) DEFAULT 'TZS',
  frequency VARCHAR(20) DEFAULT 'one-time', -- 'one-time', 'monthly', 'yearly'
  payment_method VARCHAR(50),
  payment_reference VARCHAR(255),
  status VARCHAR(50) DEFAULT 'pending',
  is_anonymous BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

---

## Materialized Views

### Summary of Recommended Materialized Views

| View Name | Purpose | Refresh Frequency | Dependencies |
|-----------|---------|-------------------|--------------|
| `mv_home_page_stats` | Home page impact statistics | Daily | beneficiaries, cases, projects, activities |
| `mv_featured_programs` | Featured programs for home | Daily | projects, categories, project_locations |
| `mv_programs_list` | Programs listing with JOINs | On change | projects, categories, project_locations, activities |
| `mv_portfolio_list` | Portfolio items listing | On change | portfolio_items |
| `mv_news_events_list` | News/Events listing | On change | blogs, categories, users |
| `mv_research_stats` | Research page statistics | Daily | publications |
| `mv_legal_aid_stats` | Legal aid statistics | Daily | cases, case_stages, beneficiaries |
| `mv_lrm_by_region` | LRM data by region | Daily | lrm_members, regions, districts, villages |
| `mv_lrm_impact_stats` | LRM overall impact | Daily | lrm_activities |
| `mv_about_page_content` | About page static content | On change | organization_content, team_members |

### View Definitions

```sql
-- Home Page Statistics
CREATE MATERIALIZED VIEW mv_home_page_stats AS
SELECT
  (SELECT COUNT(*) FROM projects WHERE status = 'Completed') AS completed_projects,
  (SELECT COUNT(*) FROM cases WHERE status IN ('Resolved', 'Won')) AS cases_resolved,
  (SELECT COUNT(DISTINCT beneficiary_id) FROM activity_beneficiaries) AS beneficiaries_reached,
  (SELECT COUNT(*) FROM lrm_members WHERE is_active = true) AS active_lrms,
  (SELECT COUNT(DISTINCT region_id) FROM project_locations) AS regions_covered,
  (SELECT COUNT(*) FROM publications WHERE is_published = true) AS publications_count;

-- Refresh function
CREATE OR REPLACE FUNCTION refresh_home_stats()
RETURNS TRIGGER AS $$
BEGIN
  REFRESH MATERIALIZED VIEW CONCURRENTLY mv_home_page_stats;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- Featured Programs
CREATE MATERIALIZED VIEW mv_featured_programs AS
SELECT
  p.id,
  p.slug,
  p.title,
  p.short_description AS description,
  c.name AS category,
  p.cover_image AS image,
  p.start_date AS date,
  r.name AS location,
  p.status
FROM projects p
LEFT JOIN categories c ON p.category_id = c.id
LEFT JOIN project_locations pl ON p.id = pl.project_id
LEFT JOIN regions r ON pl.region_id = r.id
WHERE p.is_featured = true AND p.is_published = true
ORDER BY p.start_date DESC
LIMIT 6;

-- Research Statistics
CREATE MATERIALIZED VIEW mv_research_stats AS
SELECT
  COUNT(*) AS total_publications,
  SUM(downloads) AS total_downloads,
  COUNT(DISTINCT UNNEST(topics)) AS topic_count,
  (SELECT COUNT(*) FROM publications WHERE publication_date > NOW() - INTERVAL '1 year') AS recent_publications
FROM publications
WHERE is_published = true;
```

### Refresh Strategy

```sql
-- Create refresh schedule (using pg_cron)
SELECT cron.schedule('refresh-daily-views', '0 3 * * *', $$
  REFRESH MATERIALIZED VIEW CONCURRENTLY mv_home_page_stats;
  REFRESH MATERIALIZED VIEW CONCURRENTLY mv_legal_aid_stats;
  REFRESH MATERIALIZED VIEW CONCURRENTLY mv_lrm_by_region;
  REFRESH MATERIALIZED VIEW CONCURRENTLY mv_lrm_impact_stats;
  REFRESH MATERIALIZED VIEW CONCURRENTLY mv_research_stats;
$$);

-- Trigger-based refresh for content changes
CREATE TRIGGER refresh_programs_view
AFTER INSERT OR UPDATE OR DELETE ON projects
FOR EACH STATEMENT
EXECUTE FUNCTION refresh_programs_view();
```

---

## API Response Formats

### Standard Response Envelope

```typescript
interface ApiResponse<T> {
  success: boolean;
  data: T;
  meta?: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
  error?: {
    code: string;
    message: string;
  };
}
```

### Pagination Parameters

```typescript
interface PaginationParams {
  page?: number;      // Default: 1
  limit?: number;     // Default: 12, Max: 100
  sort?: string;      // Field name
  order?: 'asc' | 'desc';
}
```

### Common Filters

```typescript
interface CommonFilters {
  search?: string;
  category?: string;
  status?: string;
  dateFrom?: string;
  dateTo?: string;
  featured?: boolean;
}
```

---

## Integration Timeline

### Phase 1: Core Infrastructure (Week 1-2)
- [ ] Create new database tables (portfolio_items, publications, team_members, etc.)
- [ ] Extend existing tables with required columns
- [ ] Set up materialized views
- [ ] Create database indexes
- [ ] Set up API service structure

### Phase 2: Static Content APIs (Week 3-4)
- [ ] About page endpoints
- [ ] Contact page endpoints
- [ ] Organization content management
- [ ] FAQs management

### Phase 3: Programs & Portfolio (Week 5-6)
- [ ] Programs listing and detail APIs
- [ ] Portfolio listing and detail APIs
- [ ] Category management
- [ ] Search and filtering

### Phase 4: News & Research (Week 7-8)
- [ ] News/Events APIs
- [ ] Publications APIs
- [ ] File upload for documents
- [ ] Download tracking

### Phase 5: Dynamic Features (Week 9-10)
- [ ] Legal aid case submission
- [ ] Contact form submission
- [ ] Newsletter subscription
- [ ] Donation processing

### Phase 6: LRM Network & Analytics (Week 11-12)
- [ ] LRM member management
- [ ] Regional statistics APIs
- [ ] Impact tracking
- [ ] Dashboard analytics

### Phase 7: Testing & Optimization (Week 13-14)
- [ ] API performance testing
- [ ] Materialized view optimization
- [ ] Caching strategy implementation
- [ ] Security audit

### Phase 8: Frontend Integration (Week 15-16)
- [ ] Replace static data with API calls
- [ ] Implement loading states
- [ ] Error handling
- [ ] Cache management

---

## Security Considerations

### Public Endpoints
- Rate limiting: 100 requests/minute per IP
- Input validation and sanitization
- SQL injection prevention via parameterized queries
- CORS configuration for frontend domain

### Authenticated Endpoints (Admin)
- JWT authentication
- Role-based access control
- Audit logging for data changes

---

## Caching Strategy

### Redis Cache Layers

1. **Page-level cache**: Full API responses (TTL: 5 minutes)
2. **Query cache**: Database query results (TTL: 15 minutes)
3. **Static content**: About page, team info (TTL: 1 hour)

### Cache Invalidation

- Automatic invalidation on data updates via triggers
- Manual purge endpoints for admin
- Scheduled refresh for materialized views

---

## Monitoring & Logging

### Metrics to Track
- API response times
- Error rates by endpoint
- Cache hit/miss ratios
- Materialized view refresh times
- Database query performance

### Alerting
- Response time > 2s
- Error rate > 5%
- Failed materialized view refresh
- Database connection issues

---

## Next Steps

1. Review and approve this design document
2. Set up development database with new schema
3. Implement API endpoints following this specification
4. Create API documentation (OpenAPI/Swagger)
5. Develop integration tests
6. Begin frontend integration

---

*Document Version: 1.0*
*Last Updated: 2024-11-19*
*Author: Development Team*
