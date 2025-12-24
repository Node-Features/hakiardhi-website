export const routePermissionMap: { [key: string]: string } = {
  // Projects
  'POST /api/admin/projects': 'project_create',
  'GET /api/admin/projects/:id': 'project_view',
  'PUT /api/admin/projects/:id': 'project_edit',
  'PATCH /api/admin/projects/:id': 'project_edit',
  'POST /api/admin/projects/:id/approve': 'project_approve',

  // Activities
  'POST /api/admin/activities': 'activity_create',
  'POST /api/admin/activities/:id/assign': 'activity_assign',
  'GET /api/admin/activities/:id': 'activity_view',

  // Beneficiaries
  'POST /api/admin/beneficiaries': 'beneficiary_register',
  'GET /api/admin/beneficiaries/:id': 'beneficiary_view',

  // Cases (Legal Aid)
  'POST /api/admin/cases': 'case_create',
  'POST /api/admin/cases/:id/assign': 'case_assign',
  'PATCH /api/admin/cases/:id': 'case_handle',
  'POST /api/admin/cases/:id/close': 'case_close',

  // Incidents
  'POST /api/admin/incidents': 'incident_create',
  'GET /api/admin/incidents/:id': 'incident_view',

  // Users
  'GET /api/admin/users/:id': 'user_manage',
  'PUT /api/admin/users/:id': 'user_manage',
  'DELETE /api/admin/users/:id': 'user_manage',

  // Roles
  'POST /api/admin/roles': 'role_manage',
  // 'GET /api/admin/roles': 'role_manage', // Public endpoint for registration

  // Permissions
  'POST /api/admin/permissions': 'permission_manage',
  'GET /api/admin/permissions': 'permission_manage',

  // Content / Blog
  'POST /api/admin/blogs': 'content_publish',

  // Chatbot
  'POST /api/admin/chatbot/logs': 'chatbot_moderate',
  'GET /api/admin/chatbot/logs': 'chatbot_moderate',
} as const

type RoutePermissionMap = Record<string, string>;
const map: RoutePermissionMap = routePermissionMap;
