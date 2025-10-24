# Analytics Overview API Documentation

## Overview

The Analytics Overview API provides dashboard data for the admin portal, leveraging a Supabase RPC function (`rpc_get_admin_dashboard`) to aggregate statistics across projects, regions, and time intervals.

## Endpoint

### GET `/api/admin/analytics/overview`

Retrieve comprehensive dashboard analytics data with optional filters.

**Authentication:** Required (Bearer Token)

## Query Parameters

| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| `project_uuid` | UUID | No | null | Filter data by specific project |
| `region_uuid` | UUID | No | null | Filter data by specific region |
| `interval_type` | String | No | `month` | Time interval for data aggregation |

### Interval Types

- `month` - Aggregate data by month
- `quarter` - Aggregate data by quarter (Q1, Q2, Q3, Q4)
- `year` - Aggregate data by year
- `date` - Aggregate data by specific date

## Request Examples

### Get All Data (Default - Monthly)

```http
GET /api/admin/analytics/overview
Authorization: Bearer <token>
```

### Filter by Project

```http
GET /api/admin/analytics/overview?project_uuid=123e4567-e89b-12d3-a456-426614174000
Authorization: Bearer <token>
```

### Filter by Region and Quarterly Data

```http
GET /api/admin/analytics/overview?region_uuid=987fcdeb-51a2-43f1-b456-987654321000&interval_type=quarter
Authorization: Bearer <token>
```

### Filter by Project, Region, and Yearly Data

```http
GET /api/admin/analytics/overview?project_uuid=123e4567-e89b-12d3-a456-426614174000&region_uuid=987fcdeb-51a2-43f1-b456-987654321000&interval_type=year
Authorization: Bearer <token>
```

## Response Format

### Success Response (200 OK)

```json
{
  "success": true,
  "summary": {
    "global": {
      "total_users": 1250,
      "total_projects": 45,
      "total_regions": 12,
      "total_activities": 320,
      "total_beneficiaries": 8500,
      "total_incidents": 150,
      "total_cases": 75,
      "active_projects": 30,
      "completed_projects": 15
    },
    "projects": [
      {
        "project_id": "123e4567-e89b-12d3-a456-426614174000",
        "title": "Land Rights Education Initiative",
        "total_activities": 25,
        "completed_activities": 18,
        "total_beneficiaries": 450,
        "start_date": "2024-01-15",
        "end_date": "2025-12-31",
        "status": "Active"
      },
      {
        "project_id": "234e5678-e89b-12d3-a456-426614174001",
        "title": "Community Legal Aid Program",
        "total_activities": 30,
        "completed_activities": 22,
        "total_beneficiaries": 620,
        "start_date": "2023-06-01",
        "end_date": "2024-11-30",
        "status": "Active"
      }
    ],
    "regions": [
      {
        "region_id": "987fcdeb-51a2-43f1-b456-987654321000",
        "region_name": "Dar es Salaam",
        "beneficiaries": 3200,
        "incidents": 45,
        "cases": 22,
        "projects": 12
      },
      {
        "region_id": "876ecdeb-51a2-43f1-b456-987654321001",
        "region_name": "Arusha",
        "beneficiaries": 2100,
        "incidents": 30,
        "cases": 15,
        "projects": 8
      }
    ]
  }
}
```

### Error Responses

#### Invalid Parameters (400 Bad Request)

```json
{
  "success": false,
  "message": "Invalid interval_type. Must be one of: month, quarter, year, date"
}
```

#### Unauthorized (401 Unauthorized)

```json
{
  "success": false,
  "message": "Unauthorized access"
}
```

#### Server Error (500 Internal Server Error)

```json
{
  "success": false,
  "message": "Failed to fetch dashboard data",
  "error": "Detailed error message here"
}
```

## Data Structure

### Global Summary

Contains system-wide statistics:

```typescript
interface GlobalSummary {
  total_users: number;          // Total users in the system
  total_projects: number;        // Total projects created
  total_regions: number;         // Total regions covered
  total_activities: number;      // Total activities across all projects
  total_beneficiaries: number;   // Total unique beneficiaries
  total_incidents: number;       // Total incidents reported
  total_cases: number;           // Total legal cases
  active_projects: number;       // Currently active projects
  completed_projects: number;    // Completed projects
}
```

### Project Summary

Array of project-specific statistics:

```typescript
interface ProjectSummary {
  project_id: string;           // UUID of the project
  title: string;                // Project name
  total_activities: number;     // Total activities in project
  completed_activities: number; // Completed activities
  total_beneficiaries: number;  // Total beneficiaries served
  start_date: string;           // Project start date (ISO 8601)
  end_date: string | null;      // Project end date or null if ongoing
  status: string;               // Project status
}
```

### Region Summary

Array of region-specific statistics:

```typescript
interface RegionSummary {
  region_id: string;     // UUID of the region
  region_name: string;   // Region name
  beneficiaries: number; // Number of beneficiaries in region
  incidents: number;     // Number of incidents in region
  cases: number;         // Number of legal cases in region
  projects: number;      // Number of projects in region
}
```

## Implementation Details

### Backend Architecture

The endpoint follows this flow:

1. **Route Handler** (`/api/admin/analytics/overview/route.ts`)
   - Validates query parameters
   - Extracts filters from request
   - Calls analytics service

2. **Analytics Service** (`/lib/services/analytics.service.ts`)
   - Contains `getAdminDashboard()` method
   - Calls Supabase RPC function
   - Handles errors and data transformation

3. **Supabase RPC** (`rpc_get_admin_dashboard`)
   - Database function that aggregates data
   - Accepts: `project_uuid`, `region_uuid`, `interval_type`
   - Returns structured dashboard data

### Service Layer

```typescript
// From analytics.service.ts
async getAdminDashboard(filters: DashboardFilters): Promise<DashboardOverview> {
  const client = supabase(true); // Service role for admin access

  const { data, error } = await client.rpc('rpc_get_admin_dashboard', {
    project_uuid: filters.project_uuid || null,
    region_uuid: filters.region_uuid || null,
    interval_type: filters.interval_type || 'month',
  });

  if (error) {
    throw new Error(`Failed to fetch dashboard data: ${error.message}`);
  }

  return data as DashboardOverview;
}
```

## Frontend Integration

### Using with Global Filters

The frontend global filters can be mapped to API parameters:

```typescript
import { useFilters } from "@/context/FilterContext";

function useDashboardData() {
  const { filters } = useFilters();

  useEffect(() => {
    const fetchDashboard = async () => {
      const params = new URLSearchParams();

      // Map frontend filters to API parameters
      if (filters.projectId && filters.projectId !== 'all') {
        params.append('project_uuid', filters.projectId);
      }

      // Map time dimension to interval_type
      const intervalMap = {
        'year': 'year',
        'quarter': 'quarter',
        'month': 'month',
        'all': 'month' // default
      };
      params.append('interval_type', intervalMap[filters.timeDimension]);

      const response = await fetch(
        `/api/admin/analytics/overview?${params.toString()}`,
        {
          headers: {
            'Authorization': `Bearer ${accessToken}`,
          }
        }
      );

      const data = await response.json();
      // Use data...
    };

    fetchDashboard();
  }, [filters]);
}
```

### Example React Hook

```typescript
import { useState, useEffect } from 'react';

interface DashboardData {
  summary: {
    global: GlobalSummary;
    projects: ProjectSummary[];
    regions: RegionSummary[];
  };
}

export function useDashboardOverview(
  projectId?: string,
  regionId?: string,
  intervalType: 'month' | 'quarter' | 'year' | 'date' = 'month'
) {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchData() {
      try {
        setLoading(true);
        const params = new URLSearchParams();

        if (projectId) params.append('project_uuid', projectId);
        if (regionId) params.append('region_uuid', regionId);
        params.append('interval_type', intervalType);

        const response = await fetch(
          `/api/admin/analytics/overview?${params.toString()}`,
          {
            headers: {
              'Authorization': `Bearer ${localStorage.getItem('access_token')}`,
            }
          }
        );

        if (!response.ok) {
          throw new Error('Failed to fetch dashboard data');
        }

        const result = await response.json();
        setData(result);
        setError(null);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unknown error');
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, [projectId, regionId, intervalType]);

  return { data, loading, error };
}
```

## Database Requirements

### Required RPC Function

The endpoint depends on a Supabase database function named `rpc_get_admin_dashboard`:

```sql
-- Example RPC function signature (to be implemented in Supabase)
CREATE OR REPLACE FUNCTION rpc_get_admin_dashboard(
  project_uuid UUID DEFAULT NULL,
  region_uuid UUID DEFAULT NULL,
  interval_type TEXT DEFAULT 'month'
)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Implementation should return JSON in the expected format
  -- {
  --   "summary": {
  --     "global": { ... },
  --     "projects": [ ... ],
  --     "regions": [ ... ]
  --   }
  -- }
END;
$$;
```

## Error Handling

The API implements comprehensive error handling:

1. **Parameter Validation**
   - Validates `interval_type` against allowed values
   - Returns 400 for invalid parameters

2. **RPC Errors**
   - Catches Supabase RPC errors
   - Logs errors to console
   - Returns 500 with error message

3. **Missing Data**
   - Throws error if RPC returns null
   - Handled gracefully in route handler

## Security Considerations

1. **Authentication Required**
   - All requests must include valid Bearer token
   - Enforced by middleware (if configured)

2. **Service Role Access**
   - Analytics service uses Supabase service role
   - Bypasses RLS for comprehensive data access
   - Should only be called from authenticated admin routes

3. **Data Privacy**
   - No personally identifiable information in responses
   - Only aggregated statistics returned

## Performance Considerations

1. **Caching**
   - Consider implementing Redis cache for frequently requested data
   - Cache TTL: 5-15 minutes for dashboard data

2. **Database Optimization**
   - RPC function should use materialized views or pre-aggregated tables
   - Ensure proper indexes on filtered columns

3. **Rate Limiting**
   - Implement rate limiting for dashboard endpoint
   - Recommended: 60 requests per minute per user

## Testing

### Manual Testing with curl

```bash
# Get default overview
curl -X GET "http://localhost:3000/api/admin/analytics/overview" \
  -H "Authorization: Bearer YOUR_TOKEN"

# Filter by project and quarterly data
curl -X GET "http://localhost:3000/api/admin/analytics/overview?project_uuid=123e4567-e89b-12d3-a456-426614174000&interval_type=quarter" \
  -H "Authorization: Bearer YOUR_TOKEN"

# Test invalid interval type (should return 400)
curl -X GET "http://localhost:3000/api/admin/analytics/overview?interval_type=invalid" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

## Files Modified/Created

### Created
- None (all files already existed)

### Modified
- `/Backend/v1/src/lib/types/analytics.types.ts` - Added dashboard types
- `/Backend/v1/src/lib/services/analytics.service.ts` - Added `getAdminDashboard()` method
- `/Backend/v1/src/app/api/admin/analytics/overview/route.ts` - Replaced mock data with real implementation

## Next Steps

1. **Implement Database RPC Function**
   - Create `rpc_get_admin_dashboard` in Supabase
   - Ensure it returns data in expected format
   - Optimize with indexes and materialized views

2. **Add Caching Layer**
   - Implement Redis caching
   - Add cache invalidation on data updates

3. **Add More Endpoints**
   - `/api/admin/analytics/trends` - Time series data
   - `/api/admin/analytics/export` - Export dashboard data

4. **Frontend Integration**
   - Connect dashboard components to API
   - Implement real-time updates with WebSockets
   - Add data visualization components
