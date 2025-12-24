# Public Portal API Routes

This directory contains all API routes for the HakiArdhi Public Portal frontend application.

## Directory Structure

```
Backend/v1/src/app/api/public/portal/
├── README.md                           # This file
├── stats/route.ts                      # Homepage statistics
├── programs/
│   ├── route.ts                        # List programs (paginated, filtered)
│   ├── featured/route.ts               # Featured programs
│   ├── categories/route.ts             # Program categories
│   └── [slug]/route.ts                 # Program detail by slug
├── portfolio/
│   ├── route.ts                        # List portfolio items
│   └── [slug]/route.ts                 # Portfolio item detail
├── news/
│   ├── route.ts                        # List news & events
│   ├── featured/route.ts               # Featured news
│   └── [slug]/route.ts                 # News detail
├── events/
│   └── upcoming/route.ts               # Upcoming events
├── publications/
│   ├── route.ts                        # List publications
│   └── [id]/
│       ├── route.ts                    # Publication detail
│       └── download/route.ts           # Track downloads
├── research/
│   ├── stats/route.ts                  # Research statistics
│   ├── areas/route.ts                  # Research areas
│   └── partners/route.ts               # Research partners
├── legal-aid/
│   ├── stats/route.ts                  # Legal aid statistics
│   └── submit/route.ts                 # Submit case request
├── lrm/
│   ├── regions/route.ts                # LRM by region
│   ├── stats/route.ts                  # LRM statistics
│   ├── roles/route.ts                  # LRM roles
│   └── apply/route.ts                  # LRM application
├── about/
│   ├── organization/route.ts           # Organization info
│   ├── team/route.ts                   # Team members
│   └── milestones/route.ts             # Milestones
├── contact/
│   ├── offices/route.ts                # Office locations
│   └── submit/route.ts                 # Contact form
├── newsletter/
│   └── subscribe/route.ts              # Newsletter subscription
├── faqs/route.ts                       # FAQs
├── testimonials/route.ts               # Testimonials
├── partners/route.ts                   # Partners
├── gallery/route.ts                    # Gallery items
└── donate/
    ├── campaigns/route.ts              # Donation campaigns
    ├── options/route.ts                # Payment methods
    ├── impact/route.ts                 # Donation impact
    └── process/route.ts                # Process donation
```

## Shared Utilities

### Location: `Backend/v1/src/lib/portal/`

#### helpers.ts
- `apiResponse()` - Standard success response wrapper
- `errorResponse()` - Standard error response wrapper
- `getQueryParams()` - Parse URL query parameters
- `getPaginationMeta()` - Calculate pagination metadata
- `parseBoolean()` - Parse boolean query params
- `parseNumber()` - Parse number query params
- `generateReferenceNumber()` - Generate unique reference numbers
- `getTodayISO()` - Get today's date in ISO format

#### validation.ts
Contains Zod validation schemas for:
- Programs, Portfolio, News, Publications filtering
- FAQ, Gallery filtering
- Case submissions, LRM applications
- Contact forms, Newsletter subscriptions
- Donation requests

#### Types: `Backend/v1/src/lib/types/portal.types.ts`
TypeScript type definitions for all portal entities.

## API Response Format

### Success Response
```typescript
{
  success: true,
  data: any,
  meta?: {
    page: number,
    limit: number,
    total: number,
    total_pages: number
  }
}
```

### Error Response
```typescript
{
  success: false,
  error: {
    code: string,
    message: string
  }
}
```

### Validation Error Response
```typescript
{
  success: false,
  errors: [
    {
      field: string,
      message: string
    }
  ]
}
```

## Key Features

### 1. Consistent Response Format
All endpoints use standardized response helpers (`apiResponse`, `errorResponse`)

### 2. Input Validation
All POST endpoints and filtered GET endpoints use Zod validation schemas

### 3. Query Parameter Handling
- Pagination: `page`, `limit`
- Sorting: `sort`, `order`
- Filtering: `search`, `category`, `type`, `status`, `featured`, etc.

### 4. Error Handling
- Try-catch blocks with detailed error logging
- Appropriate HTTP status codes
- User-friendly error messages

### 5. Database Optimization
- Uses materialized views for statistics (performance)
- Efficient querying with select, filters, and indexes
- Proper use of count for pagination

### 6. Security
- Uses public Supabase client (bypass_rls = false)
- Input validation on all user-submitted data
- No sensitive data exposure

## Database Dependencies

### Materialized Views Required:
- `mv_home_page_stats` - Homepage statistics
- `mv_programs_list` - Programs with computed fields
- `mv_featured_programs` - Featured programs
- `mv_portfolio_list` - Portfolio items
- `mv_news_events_list` - News and events
- `mv_research_stats` - Research statistics
- `mv_legal_aid_stats` - Legal aid statistics
- `mv_lrm_by_region` - LRM distribution
- `mv_lrm_impact_stats` - LRM impact metrics

### Database Functions Required:
- `increment_blog_views(blog_id)` - Increment news view count
- `increment_publication_views(pub_id)` - Increment publication views
- `increment_publication_downloads(pub_id)` - Track downloads

### Tables Required:
- `publications`, `portfolio_items`, `activities`
- `research_areas`, `research_partners`
- `cases`, `lrm_applications`, `lrm_roles`
- `organization_content`, `team_members`, `organization_milestones`
- `office_locations`, `contact_submissions`, `newsletter_subscriptions`
- `faqs`, `testimonials`, `partners`, `gallery_items`
- `donation_campaigns`, `payment_methods`, `donation_impact`, `donations`

## Usage Examples

### Get Programs (with filtering and pagination)
```
GET /api/public/portal/programs?page=1&limit=10&search=land&category=Training&status=Ongoing
```

### Get Featured News
```
GET /api/public/portal/news/featured
```

### Submit Legal Aid Request
```
POST /api/public/portal/legal-aid/submit
Content-Type: application/json

{
  "name": "John Doe",
  "phone": "+255712345678",
  "email": "john@example.com",
  "region_id": "uuid",
  "district_id": "uuid",
  "case_type": "Land Dispute",
  "description": "Description of the legal issue..."
}
```

### Subscribe to Newsletter
```
POST /api/public/portal/newsletter/subscribe
Content-Type: application/json

{
  "email": "user@example.com",
  "name": "John Doe",
  "interests": ["Land Rights", "Research"]
}
```

## Important Notes

### 1. Materialized Views
Ensure all materialized views are created and refreshed regularly for optimal performance.

### 2. Database Functions
The increment functions must exist in the database schema.

### 3. Payment Integration
The donation process endpoint currently returns a placeholder payment URL. Integrate with actual payment gateway (M-Pesa, Stripe, etc.).

### 4. Reference Numbers
Case and application submissions generate unique reference numbers with timestamps.

### 5. Newsletter Subscriptions
The endpoint handles both new subscriptions and reactivation of inactive subscriptions.

### 6. View Counting
News articles and publications automatically increment view counts when accessed.

## Future Enhancements

1. **Rate Limiting**: Add rate limiting for public endpoints
2. **Caching**: Implement Redis caching for frequently accessed data
3. **Search**: Add full-text search capabilities
4. **Analytics**: Track API usage and user behavior
5. **Email Notifications**: Send confirmations for submissions
6. **Payment Gateway**: Complete payment integration
7. **File Uploads**: Handle document uploads for applications
8. **Localization**: Support multiple languages (English/Swahili)

## Testing

Test endpoints using:
- **Postman/Insomnia**: Import collection from API documentation
- **curl**: Command-line testing
- **Frontend Integration**: Use with Public Portal frontend

## Support

For issues or questions:
- Check database schema documentation
- Review validation schemas in `lib/portal/validation.ts`
- Examine type definitions in `lib/types/portal.types.ts`
- Review existing route implementations

## License

Part of the HakiArdhi Digital Ecosystem - Open Source Project
