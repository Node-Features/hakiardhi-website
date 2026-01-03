import { authApi } from '../interceptors';

/**
 * Settings API Service
 * All endpoints for application settings
 */
export const settingsService = {
  /**
   * Get all settings
   * GET /api/admin/settings
   */
  getAll: async () => {
    return authApi.get<Record<string, unknown>>('/api/admin/settings');
  },

  /**
   * Get single setting by key
   * GET /api/admin/settings/:key
   */
  getByKey: async (key: string) => {
    return authApi.get<{ key: string; value: unknown }>(`/api/admin/settings/${key}`);
  },

  /**
   * Update setting
   * PUT /api/admin/settings/:key
   */
  update: async (key: string, value: unknown) => {
    return authApi.put<{ key: string; value: unknown }>(`/api/admin/settings/${key}`, {
      value,
    });
  },

  /**
   * Bulk update settings
   * PUT /api/admin/settings
   */
  bulkUpdate: async (settings: Record<string, unknown>) => {
    return authApi.put<Record<string, unknown>>('/api/admin/settings', settings);
  },

  /**
   * Reset setting to default
   * DELETE /api/admin/settings/:key
   */
  reset: async (key: string) => {
    return authApi.delete(`/api/admin/settings/${key}`);
  },
};

/**
 * Locations API Service
 * All endpoints for location data (regions, districts, villages)
 */
export const locationsService = {
  /**
   * Get all regions
   * GET /api/admin/locations/regions
   */
  getRegions: async () => {
    return authApi.get<
      Array<{
        id: string;
        name: string;
        code?: string;
      }>
    >('/api/admin/locations/regions');
  },

  /**
   * Get single region by ID
   * GET /api/admin/locations/regions/:id
   */
  getRegionById: async (id: string) => {
    return authApi.get<{
      id: string;
      name: string;
      code?: string;
    }>(`/api/admin/locations/regions/${id}`);
  },

  /**
   * Get districts by region
   * GET /api/admin/locations/regions/:regionId/districts
   */
  getDistrictsByRegion: async (regionId: string) => {
    return authApi.get<
      Array<{
        id: string;
        name: string;
        region_id: string;
        code?: string;
      }>
    >(`/api/admin/locations/regions/${regionId}/districts`);
  },

  /**
   * Get all districts
   * GET /api/admin/locations/districts
   */
  getDistricts: async () => {
    return authApi.get<
      Array<{
        id: string;
        name: string;
        region_id: string;
        code?: string;
      }>
    >('/api/admin/locations/districts');
  },

  /**
   * Get single district by ID
   * GET /api/admin/locations/districts/:id
   */
  getDistrictById: async (id: string) => {
    return authApi.get<{
      id: string;
      name: string;
      region_id: string;
      code?: string;
    }>(`/api/admin/locations/districts/${id}`);
  },

  /**
   * Get villages by district
   * GET /api/admin/locations/districts/:districtId/villages
   */
  getVillagesByDistrict: async (districtId: string) => {
    return authApi.get<
      Array<{
        id: string;
        name: string;
        district_id: string;
        code?: string;
      }>
    >(`/api/admin/locations/districts/${districtId}/villages`);
  },

  /**
   * Get all villages
   * GET /api/admin/locations/villages
   */
  getVillages: async () => {
    return authApi.get<
      Array<{
        id: string;
        name: string;
        district_id: string;
        code?: string;
      }>
    >('/api/admin/locations/villages');
  },

  /**
   * Get single village by ID
   * GET /api/admin/locations/villages/:id
   */
  getVillageById: async (id: string) => {
    return authApi.get<{
      id: string;
      name: string;
      district_id: string;
      code?: string;
    }>(`/api/admin/locations/villages/${id}`);
  },

  /**
   * Search locations
   * GET /api/admin/locations/search
   */
  search: async (query: string) => {
    return authApi.get<{
      regions: Array<{ id: string; name: string; type: 'region' }>;
      districts: Array<{ id: string; name: string; type: 'district' }>;
      villages: Array<{ id: string; name: string; type: 'village' }>;
    }>(`/api/admin/locations/search?q=${encodeURIComponent(query)}`);
  },
};

/**
 * Content Management API Service
 * Handles blogs, publications, FAQs, and organization pages
 */
export const contentService = {
  /**
   * Get all content items
   * GET /api/admin/content
   */
  getAll: async () => {
    return authApi.get<Array<{
      id: string;
      content_type: string;
      slug?: string;
      title: string;
      content: string;
      meta_description?: string;
      published: boolean;
      created_at: string;
      updated_at: string;
      [key: string]: any;
    }>>('/api/admin/content');
  },

  /**
   * Get single content item by ID
   * GET /api/admin/content/:id?content_type=<type>
   */
  getById: async (id: string, content_type: string) => {
    return authApi.get<{
      id: string;
      content_type: string;
      [key: string]: any;
    }>(`/api/admin/content/${id}?content_type=${content_type}`);
  },

  /**
   * Create new content
   * POST /api/admin/content
   */
  create: async (data: {
    content_type: string;
    [key: string]: any;
  }) => {
    return authApi.post<{
      id: string;
      content_type: string;
      [key: string]: any;
    }>('/api/admin/content', data);
  },

  /**
   * Update content
   * PUT /api/admin/content/:id
   */
  update: async (
    id: string,
    data: {
      content_type: string;
      [key: string]: any;
    }
  ) => {
    return authApi.put<{
      id: string;
      content_type: string;
      [key: string]: any;
    }>(`/api/admin/content/${id}`, data);
  },

  /**
   * Delete content
   * DELETE /api/admin/content/:id?content_type=<type>
   */
  delete: async (id: string, content_type: string) => {
    return authApi.delete(`/api/admin/content/${id}?content_type=${content_type}`);
  },

  /**
   * Publish content
   * POST /api/admin/content/:id/publish?content_type=<type>
   */
  publish: async (id: string, content_type: string) => {
    return authApi.post(`/api/admin/content/${id}/publish?content_type=${content_type}`);
  },

  /**
   * Unpublish content
   * POST /api/admin/content/:id/unpublish?content_type=<type>
   */
  unpublish: async (id: string, content_type: string) => {
    return authApi.post(`/api/admin/content/${id}/unpublish?content_type=${content_type}`);
  },
};

/**
 * Navigation API Service
 * All endpoints for navigation menu management
 */
export const navigationService = {
  /**
   * Get navigation menu items
   * GET /api/admin/navigation
   */
  getMenu: async () => {
    return authApi.get<
      Array<{
        id: string;
        label: string;
        path: string;
        icon?: string;
        order: number;
        parent_id?: string;
        children?: Array<unknown>;
      }>
    >('/api/admin/navigation');
  },

  /**
   * Update navigation menu
   * PUT /api/admin/navigation
   */
  updateMenu: async (
    items: Array<{
      id?: string;
      label: string;
      path: string;
      icon?: string;
      order: number;
      parent_id?: string;
    }>
  ) => {
    return authApi.put('/api/admin/navigation', { items });
  },
};

/**
 * Categories API Service
 * All endpoints for category management
 */
export const categoriesService = {
  /**
   * Get all categories with optional type filter
   * GET /api/admin/categories?type=<type>
   */
  getAll: async (type?: string) => {
    const params = new URLSearchParams();
    if (type) params.append('type', type);
    params.append('limit', '100'); // Get all categories

    return authApi.get<{
      success: boolean;
      data: Array<{
        id: string;
        name: string;
        type: string;
        description?: string;
      }>;
    }>(`/api/admin/categories?${params.toString()}`);
  },
};

/**
 * Analytics API Service
 * All endpoints for analytics and reporting
 */
export const analyticsService = {
  /**
   * Get dashboard statistics
   * GET /api/admin/analytics/dashboard
   */
  getDashboard: async () => {
    return authApi.get<{
      projects: { total: number; active: number };
      activities: { total: number; ongoing: number };
      beneficiaries: { total: number; recentlyAdded: number };
      legalAid: { total: number; pending: number };
      cases: { total: number; open: number };
      incidents: { total: number; reported: number };
    }>('/api/admin/analytics/dashboard');
  },

  /**
   * Get project analytics
   * GET /api/admin/analytics/projects
   */
  getProjectAnalytics: async (params?: {
    start_date?: string;
    end_date?: string;
    region_id?: string;
  }) => {
    const searchParams = new URLSearchParams(
      params as Record<string, string>
    ).toString();

    return authApi.get(
      `/api/admin/analytics/projects${searchParams ? `?${searchParams}` : ''}`
    );
  },

  /**
   * Get beneficiary analytics
   * GET /api/admin/analytics/beneficiaries
   */
  getBeneficiaryAnalytics: async (params?: {
    start_date?: string;
    end_date?: string;
    region_id?: string;
  }) => {
    const searchParams = new URLSearchParams(
      params as Record<string, string>
    ).toString();

    return authApi.get(
      `/api/admin/analytics/beneficiaries${searchParams ? `?${searchParams}` : ''}`
    );
  },

  /**
   * Get legal aid analytics
   * GET /api/admin/analytics/legal-aid
   */
  getLegalAidAnalytics: async (params?: {
    start_date?: string;
    end_date?: string;
  }) => {
    const searchParams = new URLSearchParams(
      params as Record<string, string>
    ).toString();

    return authApi.get(
      `/api/admin/analytics/legal-aid${searchParams ? `?${searchParams}` : ''}`
    );
  },

  /**
   * Export analytics report
   * GET /api/admin/analytics/export
   */
  exportReport: async (
    reportType: 'projects' | 'beneficiaries' | 'legal-aid' | 'cases' | 'incidents',
    params?: {
      start_date?: string;
      end_date?: string;
      format?: 'csv' | 'pdf';
    }
  ) => {
    const searchParams = new URLSearchParams({
      type: reportType,
      ...(params as Record<string, string>),
    }).toString();

    return authApi.get<{ file_url: string }>(
      `/api/admin/analytics/export?${searchParams}`
    );
  },
};
