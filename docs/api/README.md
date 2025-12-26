# API Implementation Guide for HakiArdhi Public Portal

This folder contains the implementation guide and code templates for the Public Portal API endpoints.

## API Structure

The API follows the existing Next.js App Router pattern used in `Backend/v1/src/app/api/`.

```
Backend/v1/src/app/api/public/portal/
├── stats/
│   └── route.ts                    # GET /api/public/portal/stats
├── programs/
│   ├── route.ts                    # GET /api/public/portal/programs
│   ├── categories/route.ts         # GET /api/public/portal/programs/categories
│   ├── featured/route.ts           # GET /api/public/portal/programs/featured
│   └── [slug]/route.ts             # GET /api/public/portal/programs/:slug
├── portfolio/
│   ├── route.ts                    # GET /api/public/portal/portfolio
│   ├── categories/route.ts         # GET /api/public/portal/portfolio/categories
│   └── [slug]/route.ts             # GET /api/public/portal/portfolio/:slug
├── news/
│   ├── route.ts                    # GET /api/public/portal/news
│   ├── featured/route.ts           # GET /api/public/portal/news/featured
│   ├── upcoming/route.ts           # GET /api/public/portal/events/upcoming
│   └── [slug]/route.ts             # GET /api/public/portal/news/:slug
├── publications/
│   ├── route.ts                    # GET /api/public/portal/publications
│   ├── [id]/route.ts               # GET /api/public/portal/publications/:id
│   └── [id]/download/route.ts      # POST /api/public/portal/publications/:id/download
├── research/
│   ├── areas/route.ts              # GET /api/public/portal/research/areas
│   ├── stats/route.ts              # GET /api/public/portal/research/stats
│   └── partners/route.ts           # GET /api/public/portal/research/partners
├── legal-aid/
│   ├── stats/route.ts              # GET /api/public/portal/legal-aid/stats
│   ├── services/route.ts           # GET /api/public/portal/legal-aid/services
│   ├── success-stories/route.ts    # GET /api/public/portal/legal-aid/success-stories
│   └── submit/route.ts             # POST /api/public/portal/legal-aid/submit
├── lrm/
│   ├── regions/route.ts            # GET /api/public/portal/lrm/regions
│   ├── roles/route.ts              # GET /api/public/portal/lrm/roles
│   ├── stats/route.ts              # GET /api/public/portal/lrm/stats
│   └── apply/route.ts              # POST /api/public/portal/lrm/apply
├── about/
│   ├── organization/route.ts       # GET /api/public/portal/about/organization
│   ├── team/route.ts               # GET /api/public/portal/about/team
│   └── milestones/route.ts         # GET /api/public/portal/about/milestones
├── contact/
│   ├── info/route.ts               # GET /api/public/portal/contact/info
│   ├── offices/route.ts            # GET /api/public/portal/contact/offices
│   ├── submit/route.ts             # POST /api/public/portal/contact/submit
│   └── newsletter/route.ts         # POST /api/public/portal/newsletter/subscribe
├── faqs/
│   └── route.ts                    # GET /api/public/portal/faqs
├── donate/
│   ├── campaigns/route.ts          # GET /api/public/portal/donate/campaigns
│   ├── options/route.ts            # GET /api/public/portal/donate/options
│   ├── impact/route.ts             # GET /api/public/portal/donate/impact
│   └── process/route.ts            # POST /api/public/portal/donate/process
├── testimonials/
│   └── route.ts                    # GET /api/public/portal/testimonials
├── partners/
│   └── route.ts                    # GET /api/public/portal/partners
└── gallery/
    ├── route.ts                    # GET /api/public/portal/gallery
    └── [id]/route.ts               # GET /api/public/portal/gallery/:id
```

## Implementation Files

| File | Description |
|------|-------------|
| [types.ts](./types.ts) | TypeScript type definitions for all API responses |
| [routes-implementation.ts](./routes-implementation.ts) | Complete route implementations |
| [../validation/schemas.ts](../validation/schemas.ts) | Zod validation schemas |

## Response Format

All endpoints follow this standard response format:

```typescript
// Success response
{
  success: true,
  data: T | T[],
  meta?: {
    page: number;
    limit: number;
    total: number;
    total_pages: number;
  }
}

// Error response
{
  success: false,
  error: {
    code: string;
    message: string;
  }
}
```

## Common Query Parameters

### Pagination
- `page` - Page number (default: 1)
- `limit` - Items per page (default: 12, max: 100)

### Filtering
- `search` - Text search
- `category` - Filter by category
- `type` - Filter by type
- `status` - Filter by status
- `featured` - Filter featured items only

### Sorting
- `sort` - Field to sort by
- `order` - Sort direction ('asc' | 'desc')

## Endpoint Summary (52 endpoints)

### Home Page (5 endpoints)
- `GET /stats` - Impact statistics
- `GET /programs/featured` - Featured programs
- `GET /news/latest` - Latest news
- `GET /testimonials?featured=true` - Featured testimonials
- `GET /partners` - Partner organizations

### Programs (4 endpoints)
- `GET /programs` - List all programs
- `GET /programs/:slug` - Single program
- `GET /programs/categories` - Program categories
- `GET /programs/featured` - Featured programs

### Portfolio (3 endpoints)
- `GET /portfolio` - List all portfolio items
- `GET /portfolio/:slug` - Single portfolio item
- `GET /portfolio/categories` - Portfolio categories

### News & Events (4 endpoints)
- `GET /news` - List all news/events
- `GET /news/:slug` - Single news item
- `GET /news/featured` - Featured news
- `GET /events/upcoming` - Upcoming events

### Research (6 endpoints)
- `GET /publications` - List publications
- `GET /publications/:id` - Single publication
- `POST /publications/:id/download` - Track download
- `GET /research/areas` - Research areas
- `GET /research/stats` - Research statistics
- `GET /research/partners` - Research partners

### Legal Aid (4 endpoints)
- `GET /legal-aid/stats` - Legal aid statistics
- `GET /legal-aid/services` - Services offered
- `GET /legal-aid/success-stories` - Success stories
- `POST /legal-aid/submit` - Submit case

### LRM Network (4 endpoints)
- `GET /lrm/regions` - LRM by region
- `GET /lrm/roles` - LRM roles
- `GET /lrm/stats` - LRM impact statistics
- `POST /lrm/apply` - LRM application

### About (4 endpoints)
- `GET /about/organization` - Organization info
- `GET /about/team` - Team members
- `GET /about/milestones` - Timeline/history
- `GET /stats` - Impact statistics (shared)

### Contact (5 endpoints)
- `GET /contact/info` - Contact information
- `GET /contact/offices` - Office locations
- `GET /faqs` - FAQs
- `POST /contact/submit` - Contact form
- `POST /newsletter/subscribe` - Newsletter signup

### Donate (4 endpoints)
- `GET /donate/campaigns` - Active campaigns
- `GET /donate/options` - Donation options
- `GET /donate/impact` - Donation impact
- `POST /donate/process` - Process donation

### Social Proof (3 endpoints)
- `GET /testimonials` - All testimonials
- `GET /partners` - All partners
- `GET /gallery` - Photo gallery

## Implementation Steps

1. **Create directory structure** in `Backend/v1/src/app/api/public/portal/`
2. **Add types** to `Backend/v1/src/lib/types/portal.types.ts`
3. **Add validation schemas** to `Backend/v1/src/lib/portal/validation.ts`
4. **Implement routes** following the patterns in this guide
5. **Add tests** for each endpoint
6. **Update route permissions** in `Backend/v1/src/utils/routes_permission.ts`

## Security Considerations

- All public portal endpoints are read-only (except form submissions)
- Rate limiting: 100 requests/minute per IP
- Form submissions require CAPTCHA validation
- Sanitize all user input
- Use parameterized queries (Supabase handles this)

## Caching Strategy

- Use materialized views for complex queries
- Add Redis caching layer for frequently accessed data
- Cache TTLs:
  - Static content (about, team): 1 hour
  - Programs/portfolio list: 15 minutes
  - Statistics: 5 minutes
  - News/events: 5 minutes

## Related Documentation

- [API Design Document](../API_DESIGN_AND_INTEGRATION_PLAN.md)
- [Database Migrations](../migrations/README.md)
- [OpenAPI Specification](../openapi/swagger.yaml)
- [Test Specifications](../tests/README.md)
