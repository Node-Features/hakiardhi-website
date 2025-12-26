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
 * All endpoints for content pages (About, Contact, etc.)
 */
export const contentService = {
  /**
   * Get all content pages
   * GET /api/admin/content
   */
  getAll: async () => {
    return authApi.get<
      Array<{
        id: string;
        slug: string;
        title: string;
        content: string;
        published: boolean;
        updated_at: string;
      }>
    >('/api/admin/content');
  },

  /**
   * Get single content page by slug
   * GET /api/admin/content/:slug
   */
  getBySlug: async (slug: string) => {
    return authApi.get<{
      id: string;
      slug: string;
      title: string;
      content: string;
      meta_description?: string;
      published: boolean;
      updated_at: string;
    }>(`/api/admin/content/${slug}`);
  },

  /**
   * Update content page
   * PUT /api/admin/content/:slug
   */
  update: async (
    slug: string,
    data: {
      title?: string;
      content?: string;
      meta_description?: string;
      published?: boolean;
    }
  ) => {
    return authApi.put<{
      id: string;
      slug: string;
      title: string;
      content: string;
      meta_description?: string;
      published: boolean;
      updated_at: string;
    }>(`/api/admin/content/${slug}`, data);
  },

  /**
   * Publish content page
   * POST /api/admin/content/:slug/publish
   */
  publish: async (slug: string) => {
    return authApi.post(`/api/admin/content/${slug}/publish`);
  },

  /**
   * Unpublish content page
   * POST /api/admin/content/:slug/unpublish
   */
  unpublish: async (slug: string) => {
    return authApi.post(`/api/admin/content/${slug}/unpublish`);
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
