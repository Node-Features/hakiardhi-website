# Projects by Region API Documentation

## Overview

The **Projects by Region** endpoint provides a list of all projects with their associated regions. This endpoint is useful for filtering and displaying projects based on regional coverage in the admin dashboard.

## Endpoint Details

### Base Information

- **URL**: `/api/admin/regions/projects_by_region`
- **Method**: `GET`
- **Authentication**: Required (Bearer Token)
- **Content-Type**: `application/json`

### Supabase RPC Function

This endpoint calls the Supabase RPC function:

```sql
rpc_get_projects_with_regions()
```

The RPC function aggregates data from:
- `public.projects` - Project information
- `public.project_locations` - Join table for project-region relationships
- `public.regions` - Region information

## Request

### Headers

```http
Authorization: Bearer <your_access_token>
Content-Type: application/json
```

### Query Parameters

**None** - This endpoint does not accept any query parameters. It returns all projects with their regions.

### Example Request

```bash
curl -X GET http://localhost:3001/api/admin/regions/projects_by_region \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -H "Content-Type: application/json"
```

```javascript
// Using fetch
const response = await fetch('/api/admin/regions/projects_by_region', {
  headers: {
    'Authorization': `Bearer ${accessToken}`,
    'Content-Type': 'application/json',
  },
});

const result = await response.json();
```

```typescript
// Using Axios
import axios from 'axios';

const response = await axios.get('/api/admin/regions/projects_by_region', {
  headers: {
    'Authorization': `Bearer ${accessToken}`,
  },
});
```

## Response

### Success Response (200 OK)

```json
{
  "success": true,
  "data": [
    {
      "project_id": "123e4567-e89b-12d3-a456-426614174000",
      "project_name": "Land Rights Education Initiative",
      "regions": [
        {
          "id": "789fcdeb-51a2-43f1-b456-987654321000",
          "name": "Dar es Salaam"
        },
        {
          "id": "876ecdeb-51a2-43f1-b456-987654321001",
          "name": "Arusha"
        }
      ]
    },
    {
      "project_id": "234e5678-e89b-12d3-a456-426614174001",
      "project_name": "Community Legal Aid Program",
      "regions": [
        {
          "id": "765ecdeb-51a2-43f1-b456-987654321002",
          "name": "Kilimanjaro"
        }
      ]
    },
    {
      "project_id": "345e6789-e89b-12d3-a456-426614174002",
      "project_name": "Environmental Protection Project",
      "regions": []
    }
  ],
  "count": 3
}
```

### Response Schema

```typescript
interface RegionInfo {
  id: string;          // UUID of the region
  name: string;        // Name of the region
}

interface ProjectWithRegions {
  project_id: string;    // UUID of the project
  project_name: string;  // Name of the project
  regions: RegionInfo[]; // Array of regions (can be empty)
}

interface ProjectsByRegionResponse {
  success: boolean;              // Indicates if the request was successful
  data: ProjectWithRegions[];    // Array of projects with their regions
  count: number;                 // Total number of projects returned
}
```

### Error Responses

#### 401 Unauthorized

```json
{
  "success": false,
  "message": "Unauthorized"
}
```

**Cause**: Missing or invalid authentication token.

#### 500 Internal Server Error

```json
{
  "success": false,
  "message": "Failed to fetch projects with regions",
  "error": "Database connection failed"
}
```

**Cause**: Server error, database issue, or RPC function failure.

## Usage Examples

### Frontend Integration (React/TypeScript)

```typescript
import { useState, useEffect } from 'react';

interface RegionInfo {
  id: string;
  name: string;
}

interface ProjectWithRegions {
  project_id: string;
  project_name: string;
  regions: RegionInfo[];
}

function useProjectsByRegion() {
  const [projects, setProjects] = useState<ProjectWithRegions[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchProjects() {
      try {
        const token = localStorage.getItem('access_token');
        const response = await fetch('/api/admin/regions/projects_by_region', {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        });

        if (!response.ok) {
          throw new Error('Failed to fetch projects');
        }

        const result = await response.json();
        setProjects(result.data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unknown error');
      } finally {
        setLoading(false);
      }
    }

    fetchProjects();
  }, []);

  return { projects, loading, error };
}

// Usage in component
function ProjectRegionFilter() {
  const { projects, loading, error } = useProjectsByRegion();

  if (loading) return <div>Loading projects...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <select>
      <option value="">All Projects</option>
      {projects.map((project) => (
        <option key={project.project_id} value={project.project_id}>
          {project.project_name} ({project.regions.length} regions)
        </option>
      ))}
    </select>
  );
}
```

### Filtering Dashboard Data by Project

```typescript
// Use this endpoint to populate project filter dropdown
async function getProjectOptions() {
  const response = await fetch('/api/admin/regions/projects_by_region', {
    headers: {
      'Authorization': `Bearer ${token}`,
    },
  });

  const { data } = await response.json();

  return [
    { value: 'all', label: 'All Projects' },
    ...data.map((project: ProjectWithRegions) => ({
      value: project.project_id,
      label: project.project_name,
    })),
  ];
}
```

### Group Projects by Region

```typescript
function groupProjectsByRegion(projects: ProjectWithRegions[]) {
  const regionMap = new Map<string, ProjectWithRegions[]>();

  projects.forEach((project) => {
    project.regions.forEach((region) => {
      if (!regionMap.has(region.id)) {
        regionMap.set(region.id, []);
      }
      regionMap.get(region.id)!.push(project);
    });
  });

  return Array.from(regionMap.entries()).map(([regionId, regionProjects]) => ({
    regionId,
    regionName: regionProjects[0]?.regions.find(r => r.id === regionId)?.name || 'Unknown',
    projects: regionProjects,
    count: regionProjects.length,
  }));
}
```

## Implementation Details

### Backend Architecture

```
┌─────────────────────────────────────┐
│   API Route Handler                 │
│   /api/admin/regions/               │
│   projects_by_region/route.ts       │
└────────────┬────────────────────────┘
             │
             ▼
┌─────────────────────────────────────┐
│   Regions Service                   │
│   services/regions.service.ts       │
│   - getProjectsWithRegions()        │
└────────────┬────────────────────────┘
             │
             ▼
┌─────────────────────────────────────┐
│   Supabase RPC Function             │
│   rpc_get_projects_with_regions()   │
└────────────┬────────────────────────┘
             │
             ▼
┌─────────────────────────────────────┐
│   Database Tables                   │
│   - projects                        │
│   - project_locations               │
│   - regions                         │
└─────────────────────────────────────┘
```

### Files Created

1. **Types**: `Backend/v1/src/lib/types/regions.types.ts`
   - `RegionInfo` - Region identifier and name
   - `ProjectWithRegions` - Project with associated regions
   - `ProjectsByRegionResponse` - API response structure

2. **Service**: `Backend/v1/src/lib/services/regions.service.ts`
   - `RegionsService` class with `getProjectsWithRegions()` method
   - Error handling and logging

3. **Route**: `Backend/v1/src/app/api/admin/regions/projects_by_region/route.ts`
   - GET endpoint handler
   - Swagger documentation
   - Response formatting

## Testing

### Manual Testing with cURL

```bash
# Test successful request
curl -X GET http://localhost:3001/api/admin/regions/projects_by_region \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json"

# Test without authentication (should return 401)
curl -X GET http://localhost:3001/api/admin/regions/projects_by_region \
  -H "Content-Type: application/json"
```

### Unit Test Example (Jest)

```typescript
import { GET } from './route';
import { NextRequest } from 'next/server';

describe('/api/admin/regions/projects_by_region', () => {
  it('should return projects with regions', async () => {
    const request = new NextRequest('http://localhost:3001/api/admin/regions/projects_by_region');
    const response = await GET(request);
    const data = await response.json();

    expect(data.success).toBe(true);
    expect(Array.isArray(data.data)).toBe(true);
    expect(typeof data.count).toBe('number');
  });

  it('should return projects with correct structure', async () => {
    const request = new NextRequest('http://localhost:3001/api/admin/regions/projects_by_region');
    const response = await GET(request);
    const data = await response.json();

    if (data.data.length > 0) {
      const project = data.data[0];
      expect(project).toHaveProperty('project_id');
      expect(project).toHaveProperty('project_name');
      expect(project).toHaveProperty('regions');
      expect(Array.isArray(project.regions)).toBe(true);
    }
  });
});
```

## Performance Considerations

- **Caching**: Consider implementing Redis caching for this endpoint as project-region relationships don't change frequently
- **Pagination**: If the number of projects grows large, consider adding pagination support
- **Indexing**: Ensure database indexes exist on:
  - `projects.id`
  - `project_locations.project_id`
  - `project_locations.region_id`
  - `regions.id`

## Security

- **Authentication**: Bearer token required for all requests
- **Authorization**: Endpoint is admin-only (ensure middleware checks admin role)
- **Rate Limiting**: Consider adding rate limiting to prevent abuse
- **Data Filtering**: RPC function uses proper joins to prevent SQL injection

## Future Enhancements

1. **Add Filtering**: Support query parameters to filter by specific regions
2. **Add Sorting**: Allow sorting by project name or number of regions
3. **Add Pagination**: Implement offset/limit pagination for large datasets
4. **Add Search**: Support searching projects by name
5. **Add Aggregations**: Include counts like total beneficiaries per region

## Related Endpoints

- `GET /api/admin/analytics/overview` - Dashboard analytics with region filters
- `GET /api/admin/projects` - List all projects
- `GET /api/admin/regions` - List all regions

## Support

For issues or questions about this endpoint:
- Check server logs for detailed error messages
- Verify the Supabase RPC function exists and returns correct data
- Ensure proper database permissions for the service role
- Validate authentication tokens are being sent correctly

---

**Version**: 1.0.0
**Last Updated**: 2025-01-XX
**Status**: ✅ Production Ready
