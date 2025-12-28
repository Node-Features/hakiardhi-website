export const routePermissionMap: { [key: string]: string } = {
  // ========== PROJECTS ==========
  'GET /api/admin/projects': 'project_view',
  'POST /api/admin/projects': 'project_create',
  'GET /api/admin/projects/:id': 'project_view',
  'PUT /api/admin/projects/:id': 'project_edit',
  'PATCH /api/admin/projects/:id': 'project_edit',
  'DELETE /api/admin/projects/:id': 'project_delete',
  'POST /api/admin/projects/:id/approve': 'project_approve',

  // ========== ACTIVITIES ==========
  'GET /api/admin/activities': 'activity_view',
  'POST /api/admin/activities': 'activity_create',
  'GET /api/admin/activities/:id': 'activity_view',
  'PUT /api/admin/activities/:id': 'activity_edit',
  'PATCH /api/admin/activities/:id': 'activity_edit',
  'DELETE /api/admin/activities/:id': 'activity_delete',
  'POST /api/admin/activities/:id/assign': 'activity_assign',

  // ========== BENEFICIARIES ==========
  'GET /api/admin/beneficiaries': 'beneficiary_view',
  'POST /api/admin/beneficiaries': 'beneficiary_create',
  'GET /api/admin/beneficiaries/:id': 'beneficiary_view',
  'PUT /api/admin/beneficiaries/:id': 'beneficiary_edit',
  'PATCH /api/admin/beneficiaries/:id': 'beneficiary_edit',
  'DELETE /api/admin/beneficiaries/:id': 'beneficiary_delete',
  'POST /api/admin/beneficiaries/:id/profile-picture': 'beneficiary_edit',
  'DELETE /api/admin/beneficiaries/:id/profile-picture': 'beneficiary_edit',

  // ========== CASES (Legal Aid) ==========
  'GET /api/admin/cases': 'case_view',
  'POST /api/admin/cases': 'case_create',
  'GET /api/admin/cases/:id': 'case_view',
  'PUT /api/admin/cases/:id': 'case_edit',
  'PATCH /api/admin/cases/:id': 'case_handle',
  'DELETE /api/admin/cases/:id': 'case_delete',
  'POST /api/admin/cases/:id/assign': 'case_assign',
  'POST /api/admin/cases/:id/close': 'case_close',

  // ========== INCIDENTS ==========
  'GET /api/admin/incidents': 'incident_view',
  'POST /api/admin/incidents': 'incident_create',
  'GET /api/admin/incidents/:id': 'incident_view',
  'PUT /api/admin/incidents/:id': 'incident_edit',
  'PATCH /api/admin/incidents/:id': 'incident_edit',
  'DELETE /api/admin/incidents/:id': 'incident_delete',

  // ========== USERS ==========
  'GET /api/admin/users': 'user_view',
  'POST /api/admin/users': 'user_create',
  'GET /api/admin/users/:id': 'user_view',
  'PUT /api/admin/users/:id': 'user_update',
  'PATCH /api/admin/users/:id': 'user_update',
  'DELETE /api/admin/users/:id': 'user_delete',
  'POST /api/admin/users/:id/profile-picture': 'user_update',
  'DELETE /api/admin/users/:id/profile-picture': 'user_update',

  // ========== ROLES ==========
  'GET /api/admin/roles': 'role_view',
  'POST /api/admin/roles': 'role_create',
  'GET /api/admin/roles/:id': 'role_view',
  'PUT /api/admin/roles/:id': 'role_update',
  'PATCH /api/admin/roles/:id': 'role_update',
  'DELETE /api/admin/roles/:id': 'role_delete',
  'POST /api/admin/roles/:id/permissions': 'role_update',
  'DELETE /api/admin/roles/:id/permissions/:id': 'role_update',

  // ========== PERMISSIONS ==========
  'GET /api/admin/permissions': 'permission_view',
  'POST /api/admin/permissions': 'permission_create',
  'GET /api/admin/permissions/:id': 'permission_view',
  'PUT /api/admin/permissions/:id': 'permission_update',
  'PATCH /api/admin/permissions/:id': 'permission_update',
  'DELETE /api/admin/permissions/:id': 'permission_delete',

  // ========== LOCATIONS ==========
  'GET /api/admin/regions': 'settings_manage',
  'POST /api/admin/regions': 'settings_manage',
  'GET /api/admin/regions/:id': 'settings_manage',
  'PUT /api/admin/regions/:id': 'settings_manage',
  'DELETE /api/admin/regions/:id': 'settings_manage',

  'GET /api/admin/districts': 'settings_manage',
  'POST /api/admin/districts': 'settings_manage',
  'GET /api/admin/districts/:id': 'settings_manage',
  'PUT /api/admin/districts/:id': 'settings_manage',
  'DELETE /api/admin/districts/:id': 'settings_manage',

  'GET /api/admin/villages': 'settings_manage',
  'POST /api/admin/villages': 'settings_manage',
  'GET /api/admin/villages/:id': 'settings_manage',
  'PUT /api/admin/villages/:id': 'settings_manage',
  'DELETE /api/admin/villages/:id': 'settings_manage',

  // ========== CONTENT / BLOGS ==========
  'GET /api/admin/blogs': 'content_manage',
  'POST /api/admin/blogs': 'content_manage',
  'GET /api/admin/blogs/:id': 'content_manage',
  'PUT /api/admin/blogs/:id': 'content_manage',
  'PATCH /api/admin/blogs/:id': 'content_manage',
  'DELETE /api/admin/blogs/:id': 'content_manage',

  // ========== CHATBOT ==========
  'GET /api/admin/chatbot/logs': 'chatbot_moderate',
  'POST /api/admin/chatbot/logs': 'chatbot_moderate',
  'DELETE /api/admin/chatbot/logs/:id': 'chatbot_moderate',

  // ========== JOBS ==========
  'GET /api/admin/jobs': 'jobs_view',
  'GET /api/admin/jobs/:id': 'jobs_view',
  'POST /api/admin/jobs/:id/retry': 'jobs_manage',
  'DELETE /api/admin/jobs/:id': 'jobs_manage',
} as const

type RoutePermissionMap = Record<string, string>;
const map: RoutePermissionMap = routePermissionMap;
