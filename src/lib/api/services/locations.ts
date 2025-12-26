import { authApi } from '@/lib/api/interceptors';

// Location Types
export interface Region {
  id: string;
  name: string;
}

export interface District {
  id: string;
  name: string;
  region_id: string;
  regions?: { id: string; name: string };
}

export interface Village {
  id: string;
  name: string;
  district_id: string;
  districts?: {
    id: string;
    name: string;
    regions?: { id: string; name: string };
  };
}

export interface LocationsListParams {
  page?: number;
  limit?: number;
  search?: string;
  region_id?: string;
  district_id?: string;
  include_stats?: boolean;
}

export interface LocationsListResponse<T> {
  success: boolean;
  data: T[];
  meta: {
    page: number;
    limit: number;
    total: number;
    total_pages: number;
  };
}

/**
 * Locations API Service
 * All endpoints for regions, districts, and villages
 */
export const locationsService = {
  /**
   * Get all regions
   * GET /api/admin/regions
   */
  getRegions: async (params?: LocationsListParams): Promise<LocationsListResponse<Region>> => {
    const queryParams = new URLSearchParams();

    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
          queryParams.append(key, String(value));
        }
      });
    }

    const queryString = queryParams.toString();
    const url = `/api/admin/regions${queryString ? `?${queryString}` : ''}`;

    return authApi.get<LocationsListResponse<Region>>(url);
  },

  /**
   * Get districts (optionally filtered by region)
   * GET /api/admin/districts?region_id={region_id}
   */
  getDistricts: async (params?: LocationsListParams): Promise<LocationsListResponse<District>> => {
    const queryParams = new URLSearchParams();

    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
          queryParams.append(key, String(value));
        }
      });
    }

    const queryString = queryParams.toString();
    const url = `/api/admin/districts${queryString ? `?${queryString}` : ''}`;

    return authApi.get<LocationsListResponse<District>>(url);
  },

  /**
   * Get villages (optionally filtered by district)
   * GET /api/admin/villages?district_id={district_id}
   */
  getVillages: async (params?: LocationsListParams): Promise<LocationsListResponse<Village>> => {
    const queryParams = new URLSearchParams();

    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
          queryParams.append(key, String(value));
        }
      });
    }

    const queryString = queryParams.toString();
    const url = `/api/admin/villages${queryString ? `?${queryString}` : ''}`;

    return authApi.get<LocationsListResponse<Village>>(url);
  },
};
