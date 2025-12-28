# Role-Based Access Control (RBAC) Implementation Guide

This guide explains how to use the Role-Based Access Control system in the admin portal.

## Overview

The RBAC system provides comprehensive permission management based on user roles. Users are assigned roles, and each role has a set of permissions that control access to different features.

## Architecture

```
User → Role → Permissions
```

- **User**: Individual user account
- **Role**: Group of permissions (e.g., Admin, Editor, Viewer)
- **Permissions**: Specific actions (e.g., `user_view`, `user_create`, `user_update`, `user_delete`)

## Backend Changes

### Session Endpoint Enhancement

The `/api/admin/auth/session` endpoint now returns user permissions:

```typescript
{
  success: true,
  user: {
    id: "...",
    email: "user@example.com",
    first_name: "John",
    last_name: "Doe",
    role: "Admin",
    role_id: "...",
    permissions: [
      "user_view",
      "user_create",
      "user_update",
      "user_delete",
      "role_view",
      "role_create",
      // ... other permissions
    ]
  }
}
```

## Frontend Implementation

### 1. Permission Hooks

#### `usePermissions()`

Use this hook to check permissions in your components:

```tsx
import { usePermissions } from '@/hooks/usePermissions';

function MyComponent() {
  const { can, canAny, canAll, permissions, role } = usePermissions();

  // Check single permission
  if (can('user_create')) {
    // User can create users
  }

  // Check if user has ANY of the permissions
  if (canAny(['user_view', 'user_manage'])) {
    // User can either view OR manage users
  }

  // Check if user has ALL permissions
  if (canAll(['user_view', 'user_update'])) {
    // User can both view AND update users
  }

  // Check role
  if (hasRole('Admin')) {
    // User is an admin
  }

  // Get all permissions
  console.log(permissions); // ['user_view', 'user_create', ...]

  // Get user role
  console.log(role); // 'Admin'
}
```

### 2. PermissionGuard Component

Use this component to conditionally render UI elements based on permissions:

#### Basic Usage

```tsx
import { PermissionGuard } from '@/components/auth/PermissionGuard';

// Show content only if user has permission
<PermissionGuard permission="user_create">
  <button>Create User</button>
</PermissionGuard>
```

#### Multiple Permissions (OR logic)

```tsx
// Show content if user has ANY of the permissions
<PermissionGuard permission={['user_view', 'user_manage']}>
  <UserList />
</PermissionGuard>
```

#### Multiple Permissions (AND logic)

```tsx
// Show content only if user has ALL permissions
<PermissionGuard permission={['user_view', 'user_update']} requireAll>
  <UserEditForm />
</PermissionGuard>
```

#### With Fallback Content

```tsx
<PermissionGuard
  permission="admin_access"
  fallback={<div>You don't have admin access</div>}
>
  <AdminPanel />
</PermissionGuard>
```

#### Role-Based Access

```tsx
// Show content based on role
<PermissionGuard role="Admin">
  <AdminOnlyContent />
</PermissionGuard>

// Show content if user has ANY of the roles
<PermissionGuard role={['Admin', 'Moderator']}>
  <ModeratedContent />
</PermissionGuard>
```

### 3. ProtectedRoute Component

Use this component to protect entire pages:

#### Basic Usage

```tsx
// app/(admin)/users/page.tsx
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';

export default function UsersPage() {
  return (
    <ProtectedRoute permission="user_view">
      <div>
        <h1>Users</h1>
        {/* Your page content */}
      </div>
    </ProtectedRoute>
  );
}
```

#### Multiple Permissions

```tsx
// Require ANY of the permissions
<ProtectedRoute permission={['user_view', 'user_manage']}>
  <UsersPage />
</ProtectedRoute>

// Require ALL permissions
<ProtectedRoute permission={['user_view', 'user_update']} requireAll>
  <UserManagementPage />
</ProtectedRoute>
```

#### Custom Redirect & Access Denied

```tsx
<ProtectedRoute
  permission="admin_access"
  redirectTo="/unauthorized"
  accessDeniedComponent={<CustomAccessDenied />}
>
  <AdminPage />
</ProtectedRoute>
```

### 4. Sidebar Navigation

The `AppSidebar` component automatically filters menu items based on user permissions. Navigation items are defined with a `permission` field:

```tsx
const navItems: NavItem[] = [
  {
    name: "Users",
    path: "/users",
    icon: <UserIcon />,
    permission: "user_view", // Only shown if user has this permission
  },
  {
    name: "Settings",
    icon: <SettingsIcon />,
    permission: "settings_manage",
    subItems: [
      {
        name: "Roles & Permissions",
        path: "/settings/roles",
        permission: "role_view",
      },
      {
        name: "Locations",
        path: "/settings/locations",
        permission: "settings_manage",
      },
    ],
  },
];
```

**Important**: Items without a `permission` field (or with `permission: null`) are visible to all authenticated users.

### 5. Permission Utilities

For more advanced use cases, you can use the utility functions directly:

```tsx
import { hasPermission, hasAnyPermission, hasAllPermissions } from '@/lib/auth/permissions';
import { useAuth } from '@/context/AuthContext';

function MyComponent() {
  const { user } = useAuth();

  // Check single permission
  if (hasPermission(user, 'user_create')) {
    // ...
  }

  // Check multiple permissions (OR)
  if (hasAnyPermission(user, ['user_view', 'user_manage'])) {
    // ...
  }

  // Check multiple permissions (AND)
  if (hasAllPermissions(user, ['user_view', 'user_update'])) {
    // ...
  }
}
```

## Common Permission Names

Here are the common permission naming conventions:

### Users Module
- `user_view` - View users
- `user_create` - Create new users
- `user_update` - Update existing users
- `user_delete` - Delete users
- `user_manage` - Full user management (includes all above)

### Roles & Permissions Module
- `role_view` - View roles
- `role_create` - Create new roles
- `role_update` - Update existing roles
- `role_delete` - Delete roles
- `permission_view` - View permissions
- `permission_assign` - Assign permissions to roles

### Settings Module
- `settings_view` - View settings
- `settings_manage` - Manage system settings

### Content Management
- `content_view` - View content
- `content_create` - Create content
- `content_update` - Update content
- `content_delete` - Delete content
- `content_manage` - Full content management

### Projects & Activities
- `project_view` - View projects
- `project_create` - Create projects
- `project_update` - Update projects
- `project_delete` - Delete projects
- `activity_view` - View activities
- `activity_manage` - Manage activities

### Legal Services
- `case_view` - View cases
- `case_create` - Create cases
- `case_update` - Update cases
- `case_delete` - Delete cases

### Incidents
- `incident_view` - View incidents
- `incident_create` - Create incidents
- `incident_update` - Update incidents
- `incident_delete` - Delete incidents

### Beneficiaries
- `beneficiary_view` - View beneficiaries
- `beneficiary_create` - Create beneficiaries
- `beneficiary_update` - Update beneficiaries
- `beneficiary_delete` - Delete beneficiaries

## Complete Example

Here's a complete example of a protected page with permission-based UI:

```tsx
// app/(admin)/users/page.tsx
"use client";

import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import { PermissionGuard } from '@/components/auth/PermissionGuard';
import { usePermissions } from '@/hooks/usePermissions';

export default function UsersPage() {
  const { can } = usePermissions();

  return (
    <ProtectedRoute permission="user_view">
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold">Users</h1>

          {/* Only show create button if user can create users */}
          <PermissionGuard permission="user_create">
            <button className="btn-primary">Create User</button>
          </PermissionGuard>
        </div>

        <div className="users-list">
          {users.map(user => (
            <div key={user.id} className="user-item">
              <span>{user.name}</span>

              <div className="actions">
                {/* Show edit button only if user can update */}
                <PermissionGuard permission="user_update">
                  <button>Edit</button>
                </PermissionGuard>

                {/* Show delete button only if user can delete */}
                <PermissionGuard permission="user_delete">
                  <button>Delete</button>
                </PermissionGuard>
              </div>
            </div>
          ))}
        </div>

        {/* Complex permission check */}
        <PermissionGuard
          permission={['user_create', 'user_update', 'user_delete']}
          requireAll
          fallback={<p>You need full user management access to see this section</p>}
        >
          <AdvancedUserManagement />
        </PermissionGuard>
      </div>
    </ProtectedRoute>
  );
}
```

## Best Practices

### 1. Always Protect Routes
Always wrap pages that require authentication with `ProtectedRoute`:

```tsx
// ✅ Good
export default function UsersPage() {
  return (
    <ProtectedRoute permission="user_view">
      <PageContent />
    </ProtectedRoute>
  );
}

// ❌ Bad - No protection
export default function UsersPage() {
  return <PageContent />;
}
```

### 2. Use Permission Names from Backend
Always use the exact permission names that exist in your database:

```tsx
// ✅ Good
<PermissionGuard permission="user_create">

// ❌ Bad - typo or non-existent permission
<PermissionGuard permission="create_user">
```

### 3. Provide Fallback UI
When hiding important UI elements, consider providing feedback:

```tsx
// ✅ Good - User knows why they can't see content
<PermissionGuard
  permission="admin_access"
  fallback={<p>This feature requires admin access</p>}
>
  <AdminPanel />
</PermissionGuard>

// ⚠️ Acceptable - Content just disappears
<PermissionGuard permission="admin_access">
  <AdminPanel />
</PermissionGuard>
```

### 4. Check Permissions for API Calls
Always verify permissions before making sensitive API calls:

```tsx
const { can } = usePermissions();

const handleDelete = async (id: string) => {
  // Check permission before calling API
  if (!can('user_delete')) {
    showToast('You don't have permission to delete users', 'error');
    return;
  }

  try {
    await userService.delete(id);
    showToast('User deleted successfully', 'success');
  } catch (error) {
    showToast('Failed to delete user', 'error');
  }
};
```

### 5. Use Specific Permissions Over Roles
Prefer checking specific permissions over roles:

```tsx
// ✅ Good - More flexible
<PermissionGuard permission="user_create">

// ⚠️ Acceptable for role-specific features
<PermissionGuard role="Admin">
```

## Testing RBAC

### 1. Create Test Roles

Create different roles with different permission sets:
- **Admin**: All permissions
- **Editor**: View and edit permissions, no delete
- **Viewer**: Only view permissions

### 2. Test Each Role

1. Sign in with each role
2. Verify sidebar shows/hides correct menu items
3. Verify pages are protected correctly
4. Verify UI elements show/hide based on permissions
5. Verify API calls are rejected for unauthorized actions

### 3. Test Edge Cases

- User with no role assigned
- User with role but no permissions
- User trying to access protected routes directly via URL
- User trying to access API endpoints without permissions

## Troubleshooting

### Issue: User has no permissions

**Problem**: User's `permissions` array is empty even though role has permissions.

**Solutions**:
1. Check that user is assigned to a role in `user_roles` table
2. Check that role has permissions in `role_permissions` table
3. Verify backend session endpoint is fetching permissions correctly
4. Clear localStorage and re-login

### Issue: Protected route not working

**Problem**: Users can access pages they shouldn't have access to.

**Solutions**:
1. Ensure page is wrapped with `<ProtectedRoute>`
2. Check that correct permission is specified
3. Verify user actually has the permission (check `user.permissions` array)
4. Check browser console for errors

### Issue: Sidebar items not filtering

**Problem**: All menu items show regardless of permissions.

**Solutions**:
1. Ensure each nav item has correct `permission` field
2. Check that `usePermissions` hook is working
3. Verify `filterNavItems` function is being called
4. Check that permissions array is loaded in user object

## Security Notes

⚠️ **Important**: Frontend permission checks are for UX only. Always enforce permissions on the backend!

- Frontend checks hide UI elements and prevent unnecessary API calls
- Backend must validate permissions for all API endpoints
- Never trust permissions from client-side only
- Always verify user permissions server-side before performing sensitive operations

## Summary

The RBAC system provides:
- ✅ Automatic permission loading from backend
- ✅ Easy-to-use hooks for permission checks
- ✅ Declarative components for conditional rendering
- ✅ Route protection with customizable redirects
- ✅ Automatic sidebar filtering
- ✅ Type-safe permission checking
- ✅ Flexible permission logic (AND/OR)

Use this system to build a secure, permission-aware admin portal where users only see and access features they're authorized to use.
