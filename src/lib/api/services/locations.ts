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

  /**
   * Create a new region
   * POST /api/admin/regions
   */
  createRegion: async (data: { name: string }): Promise<Region> => {
    return authApi.post<Region>('/api/admin/regions', data);
  },

  /**
   * Update a region
   * PUT /api/admin/regions/:id
   */
  updateRegion: async (id: string, data: { name: string }): Promise<Region> => {
    return authApi.put<Region>(`/api/admin/regions/${id}`, data);
  },

  /**
   * Delete a region
   * DELETE /api/admin/regions/:id
   */
  deleteRegion: async (id: string): Promise<void> => {
    return authApi.delete(`/api/admin/regions/${id}`);
  },

  /**
   * Create a new district
   * POST /api/admin/districts
   */
  createDistrict: async (data: { name: string; region_id: string }): Promise<District> => {
    return authApi.post<District>('/api/admin/districts', data);
  },

  /**
   * Update a district
   * PUT /api/admin/districts/:id
   */
  updateDistrict: async (id: string, data: { name: string; region_id: string }): Promise<District> => {
    return authApi.put<District>(`/api/admin/districts/${id}`, data);
  },

  /**
   * Delete a district
   * DELETE /api/admin/districts/:id
   */
  deleteDistrict: async (id: string): Promise<void> => {
    return authApi.delete(`/api/admin/districts/${id}`);
  },

  /**
   * Create a new village
   * POST /api/admin/villages
   */
  createVillage: async (data: { name: string; district_id: string }): Promise<Village> => {
    return authApi.post<Village>('/api/admin/villages', data);
  },

  /**
   * Update a village
   * PUT /api/admin/villages/:id
   */
  updateVillage: async (id: string, data: { name: string; district_id: string }): Promise<Village> => {
    return authApi.put<Village>(`/api/admin/villages/${id}`, data);
  },

  /**
   * Delete a village
   * DELETE /api/admin/villages/:id
   */
  deleteVillage: async (id: string): Promise<void> => {
    return authApi.delete(`/api/admin/villages/${id}`);
  },
};
