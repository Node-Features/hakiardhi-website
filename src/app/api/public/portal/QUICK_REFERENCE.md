# Public Portal API - Quick Reference Guide

## Base URL
```
/api/public/portal
```

## Endpoints Overview

### Statistics & General
| Endpoint | Method | Description |
|----------|--------|-------------|
| `/stats` | GET | Homepage statistics (projects, cases, LRMs, etc.) |

### Programs
| Endpoint | Method | Description | Query Params |
|----------|--------|-------------|--------------|
| `/programs` | GET | List programs | page, limit, search, category, status, featured |
| `/programs/featured` | GET | Featured programs | - |
| `/programs/categories` | GET | Program categories with counts | - |
| `/programs/{slug}` | GET | Program detail | - |

### Portfolio
| Endpoint | Method | Description | Query Params |
|----------|--------|-------------|--------------|
| `/portfolio` | GET | List portfolio items | page, limit, search, category, type, year, featured |
| `/portfolio/{slug}` | GET | Portfolio item detail | - |

### News & Events
| Endpoint | Method | Description | Query Params |
|----------|--------|-------------|--------------|
| `/news` | GET | List news & events | page, limit, search, category, type, featured |
| `/news/featured` | GET | Featured news | - |
| `/news/{slug}` | GET | News detail (tracks views) | - |
| `/events/upcoming` | GET | Upcoming events | - |

### Publications
| Endpoint | Method | Description | Query Params |
|----------|--------|-------------|--------------|
| `/publications` | GET | List publications | page, limit, search, type, topic, year, featured |
| `/publications/{id}` | GET | Publication detail (tracks views) | - |
| `/publications/{id}/download` | POST | Track download | - |

### Research
| Endpoint | Method | Description |
|----------|--------|-------------|
| `/research/stats` | GET | Research statistics |
| `/research/areas` | GET | Research areas |
| `/research/partners` | GET | Research partners |

### Legal Aid
| Endpoint | Method | Description | Request Body |
|----------|--------|-------------|--------------|
| `/legal-aid/stats` | GET | Legal aid statistics | - |
| `/legal-aid/submit` | POST | Submit case request | name, phone, email, region_id, district_id, case_type, description |

### LRM Network
| Endpoint | Method | Description | Request Body |
|----------|--------|-------------|--------------|
| `/lrm/regions` | GET | LRM by region | - |
| `/lrm/stats` | GET | LRM statistics | - |
| `/lrm/roles` | GET | LRM roles | - |
| `/lrm/apply` | POST | Submit LRM application | first_name, last_name, email, phone_number, region_id, district_id, motivation, languages, availability |

### About
| Endpoint | Method | Description |
|----------|--------|-------------|
| `/about/organization` | GET | Organization info (vision, mission, values) |
| `/about/team` | GET | Team members |
| `/about/milestones` | GET | Organization milestones |

### Contact
| Endpoint | Method | Description | Request Body |
|----------|--------|-------------|--------------|
| `/contact/offices` | GET | Office locations | - |
| `/contact/submit` | POST | Submit contact form | name, email, phone, subject, message |
| `/newsletter/subscribe` | POST | Subscribe to newsletter | email, name, interests |

### General Content
| Endpoint | Method | Description | Query Params |
|----------|--------|-------------|--------------|
| `/faqs` | GET | FAQs | category, search, featured |
| `/testimonials` | GET | Testimonials | featured |
| `/partners` | GET | Partners | featured |
| `/gallery` | GET | Gallery items | page, limit, category, project_id, featured |

### Donations
| Endpoint | Method | Description | Request Body |
|----------|--------|-------------|--------------|
| `/donate/campaigns` | GET | Donation campaigns | - |
| `/donate/options` | GET | Payment methods | - |
| `/donate/impact` | GET | Donation impact info | - |
| `/donate/process` | POST | Process donation | amount, currency, campaign_id, payment_method, donor_email, frequency |

## Common Query Parameters

### Pagination
- `page` (number, default: 1) - Page number
- `limit` (number, default: 10, max: 100) - Items per page

### Sorting
- `sort` (string) - Field to sort by
- `order` (asc|desc, default: desc) - Sort order

### Filtering
- `search` (string) - Search in title/description
- `category` (string) - Filter by category
- `type` (string) - Filter by type
- `status` (string) - Filter by status
- `featured` (boolean) - Filter featured items only

## Response Format

### Success Response
```json
{
  "success": true,
  "data": { ... },
  "meta": {
    "page": 1,
    "limit": 10,
    "total": 100,
    "total_pages": 10
  }
}
```

### Error Response
```json
{
  "success": false,
  "error": {
    "code": "ERROR_CODE",
    "message": "Human readable error message"
  }
}
```

### Validation Error Response
```json
{
  "success": false,
  "errors": [
    {
      "field": "email",
      "message": "Invalid email address"
    }
  ]
}
```

## HTTP Status Codes

- `200` - Success (GET requests)
- `201` - Created (POST requests)
- `400` - Bad Request (validation error)
- `404` - Not Found
- `409` - Conflict (e.g., already subscribed)
- `500` - Internal Server Error

## Error Codes

| Code | Description |
|------|-------------|
| `STATS_ERROR` | Failed to fetch statistics |
| `PROGRAMS_ERROR` | Failed to fetch programs |
| `PORTFOLIO_ERROR` | Failed to fetch portfolio items |
| `NEWS_ERROR` | Failed to fetch news |
| `PUBLICATIONS_ERROR` | Failed to fetch publications |
| `SUBMISSION_ERROR` | Failed to submit form |
| `APPLICATION_ERROR` | Failed to submit application |
| `CONTACT_ERROR` | Failed to submit contact form |
| `NEWSLETTER_ERROR` | Failed to subscribe to newsletter |
| `ALREADY_SUBSCRIBED` | Email already subscribed |
| `NOT_FOUND` | Resource not found |

## Example Requests

### Get Featured Programs
```bash
curl https://api.hakiardhi.org/api/public/portal/programs/featured
```

### Search Publications
```bash
curl "https://api.hakiardhi.org/api/public/portal/publications?search=land%20rights&page=1&limit=20"
```

### Submit Legal Aid Request
```bash
curl -X POST https://api.hakiardhi.org/api/public/portal/legal-aid/submit \
  -H "Content-Type: application/json" \
  -d '{
    "name": "John Doe",
    "phone": "+255712345678",
    "email": "john@example.com",
    "region_id": "uuid-here",
    "district_id": "uuid-here",
    "case_type": "Land Dispute",
    "description": "I have a land dispute with my neighbor..."
  }'
```

### Subscribe to Newsletter
```bash
curl -X POST https://api.hakiardhi.org/api/public/portal/newsletter/subscribe \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "name": "John Doe"
  }'
```

## Validation Rules

### Email
- Must be valid email format
- Required for most form submissions

### Phone
- Format: `^\+?[0-9]{10,15}$`
- Example: `+255712345678` or `0712345678`

### Text Fields
- Name: 2-100 characters
- Subject: 5-200 characters
- Description/Message: 20-2000 characters
- Motivation: 50-1000 characters

### IDs
- Must be valid UUIDs
- Required for region_id, district_id references

### Arrays
- Languages: At least 1 item required
- Topics: Optional array of strings

## Rate Limiting
(To be implemented)
- Public endpoints: 100 requests/minute per IP
- Form submissions: 10 requests/hour per IP

## CORS
All public portal endpoints support CORS for frontend access.

## Authentication
No authentication required for public portal endpoints.

## Support
For issues or questions, check:
- Full documentation: `Backend/v1/src/app/api/public/portal/README.md`
- Implementation details: `Backend/v1/src/app/api/public/portal/IMPLEMENTATION_SUMMARY.md`
