/**
 * Centralized cache keys for SWR
 * This ensures consistent cache key usage across the application
 */
export const CACHE_KEYS = {
  // Projects
  PROJECTS: {
    ALL: '/api/admin/projects',
    DETAIL: (id: string) => `/api/admin/projects/${id}`,
    STATS: '/api/admin/projects/stats',
    LOCATIONS: (id: string) => `/api/admin/projects/${id}/locations`,
    FILES: (id: string) => `/api/admin/projects/${id}/files`,
  },

  // Activities
  ACTIVITIES: {
    ALL: '/api/admin/activities',
    DETAIL: (id: string) => `/api/admin/activities/${id}`,
    BY_PROJECT: (projectId: string) => `/api/admin/activities?project_id=${projectId}`,
    ASSIGNMENTS: (id: string) => `/api/admin/activities/${id}/assignments`,
    BENEFICIARIES: (id: string) => `/api/admin/activities/${id}/beneficiaries`,
    LOCATIONS: (id: string) => `/api/admin/activities/${id}/locations`,
    FILES: (id: string) => `/api/admin/activities/${id}/files`,
  },

  // Legal Aid
  LEGAL_AID: {
    ALL: '/api/admin/legal-aid',
    DETAIL: (id: string) => `/api/admin/legal-aid/${id}`,
    QUEUE: '/api/admin/legal-aid/queue',
    STATISTICS: '/api/admin/legal-aid/statistics',
    WORKLOAD: '/api/admin/legal-aid/workload',
  },

  // Cases
  CASES: {
    ALL: '/api/admin/cases',
    DETAIL: (id: string) => `/api/admin/cases/${id}`,
    STAGES: (id: string) => `/api/admin/cases/${id}/stages`,
    STAGE_DETAIL: (caseId: string, stageId: string) => `/api/admin/cases/${caseId}/stages/${stageId}`,
    ATTACHMENTS: (id: string) => `/api/admin/cases/${id}/attachments`,
  },

  // Incidents
  INCIDENTS: {
    ALL: '/api/admin/incidents',
    DETAIL: (id: string) => `/api/admin/incidents/${id}`,
    PENDING: '/api/admin/incidents?status=verification_pending',
    FILES: (id: string) => `/api/admin/incidents/${id}/files`,
  },

  // Beneficiaries
  BENEFICIARIES: {
    ALL: '/api/admin/beneficiaries',
    DETAIL: (id: string) => `/api/admin/beneficiaries/${id}`,
    STATISTICS: '/api/admin/beneficiaries/statistics',
    ACTIVITIES: (id: string) => `/api/admin/beneficiaries/${id}/activities`,
  },

  // Analytics
  ANALYTICS: {
    OVERVIEW: '/api/admin/analytics/overview',
    SUMMARY: '/api/admin/analytics/summary',
  },

  // Users
  USERS: {
    ALL: '/api/admin/users',
    DETAIL: (id: string) => `/api/admin/users/${id}`,
    ROLES: (id: string) => `/api/admin/users/${id}/roles`,
    PERMISSIONS: (id: string) => `/api/admin/users/${id}/permissions`,
  },

  // Roles
  ROLES: {
    ALL: '/api/admin/roles',
    DETAIL: (id: string) => `/api/admin/roles/${id}`,
    PERMISSIONS: (id: string) => `/api/admin/roles/${id}/permissions`,
  },

  // Permissions
  PERMISSIONS: {
    ALL: '/api/admin/permissions',
    DETAIL: (id: string) => `/api/admin/permissions/${id}`,
  },

  // Content
  CONTENT: {
    BLOGS: '/api/admin/content/blogs',
    BLOG_DETAIL: (id: string) => `/api/admin/content/blogs/${id}`,
    FAQS: '/api/admin/content/faqs',
    FAQ_DETAIL: (id: string) => `/api/admin/content/faqs/${id}`,
    KNOWLEDGE_HUB: '/api/admin/content/knowledge-hub',
    GALLERY: '/api/admin/content/gallery',
    RESOURCES: '/api/admin/content/resources',
  },

  // Jobs
  JOBS: {
    ALL: '/api/admin/jobs',
    UPLOADS: '/api/admin/jobs/uploads',
    UPLOAD_DETAIL: (id: string) => `/api/admin/jobs/uploads/${id}`,
    MESSAGES: '/api/admin/jobs/messages',
    MESSAGE_DETAIL: (id: string) => `/api/admin/jobs/messages/${id}`,
  },

  // Settings
  SETTINGS: {
    REGIONS: '/api/admin/settings/locations/regions',
    REGION_DETAIL: (id: string) => `/api/admin/settings/locations/regions/${id}`,
    DISTRICTS: '/api/admin/settings/locations/districts',
    DISTRICT_DETAIL: (id: string) => `/api/admin/settings/locations/districts/${id}`,
    VILLAGES: '/api/admin/settings/locations/villages',
    VILLAGE_DETAIL: (id: string) => `/api/admin/settings/locations/villages/${id}`,
    CATEGORIES: '/api/admin/settings/categories',
    CATEGORY_DETAIL: (id: string) => `/api/admin/settings/categories/${id}`,
  },

  // Navigation
  NAVIGATION: {
    BADGES: '/api/admin/navigation/badges',
  },
} as const;
