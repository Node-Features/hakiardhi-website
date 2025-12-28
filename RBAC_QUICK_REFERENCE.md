# RBAC Quick Reference Guide

Quick reference for implementing permission checks in your code.

---

## 🎯 When to Use What

| Scenario | Use This | Example |
|----------|----------|---------|
| Protect entire page | `<ProtectedRoute>` | Wrap page component |
| Hide/show UI element | `<PermissionGuard>` | Buttons, links, sections |
| Check permission in code | `usePermissions()` hook | Conditional logic |
| Backend API protection | Already handled | Automatic via middleware |
| Sidebar menu items | Already handled | Automatic filtering |

---

## 📋 Component Usage

### 1. ProtectedRoute (Page Level)

**Use for**: Entire page protection

```typescript
// src/app/(admin)/users/page.tsx
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';

export default function UsersPage() {
  return (
    <ProtectedRoute permission="user_view">
      <UsersContent />
    </ProtectedRoute>
  );
}
```

**With multiple permissions (any)**:
```typescript
<ProtectedRoute permission={['user_view', 'user_create']}>
  <UsersContent />
</ProtectedRoute>
```

**With multiple permissions (all required)**:
```typescript
<ProtectedRoute permission={['user_view', 'user_create']} requireAll>
  <UsersContent />
</ProtectedRoute>
```

---

### 2. PermissionGuard (UI Element)

**Use for**: Buttons, links, form fields, sections

```typescript
import { PermissionGuard } from '@/components/auth/PermissionGuard';

// Hide Create button if user can't create
<PermissionGuard permission="user_create">
  <Button onClick={handleCreate}>Create User</Button>
</PermissionGuard>

// Hide Edit button if user can't edit
<PermissionGuard permission="user_update">
  <Button onClick={handleEdit}>Edit</Button>
</PermissionGuard>

// Hide Delete button if user can't delete
<PermissionGuard permission="user_delete">
  <Button onClick={handleDelete}>Delete</Button>
</PermissionGuard>
```

**With fallback**:
```typescript
<PermissionGuard
  permission="user_create"
  fallback={<p>You don't have permission to create users</p>}
>
  <Button onClick={handleCreate}>Create User</Button>
</PermissionGuard>
```

**Multiple permissions (any)**:
```typescript
<PermissionGuard permission={['user_update', 'user_delete']}>
  <ActionsMenu />
</PermissionGuard>
```

**Multiple permissions (all required)**:
```typescript
<PermissionGuard permission={['user_update', 'role_update']} requireAll>
  <AdvancedSettings />
</PermissionGuard>
```

---

### 3. usePermissions Hook (Programmatic)

**Use for**: Conditional logic, dynamic checks

```typescript
import { usePermissions } from '@/hooks/usePermissions';

function UsersPage() {
  const { can, canAny, canAll, permissions } = usePermissions();

  // Single permission check
  const handleCreate = () => {
    if (!can('user_create')) {
      showToast('No permission to create users', 'error');
      return;
    }
    // Proceed with creation
  };

  // Check if user has any of these permissions
  const showActions = canAny(['user_update', 'user_delete']);

  // Check if user has all permissions
  const showAdvanced = canAll(['user_update', 'role_update']);

  // Get all user permissions
  const allPermissions = permissions;

  return (
    <div>
      {can('user_create') && (
        <Button onClick={handleCreate}>Create User</Button>
      )}

      {showActions && <ActionsMenu />}

      {showAdvanced && <AdvancedSettings />}
    </div>
  );
}
```

---

## 🔐 Permission Names Reference

### User Management
```typescript
'user_view'      // View users list and details
'user_create'    // Create new users
'user_update'    // Edit existing users
'user_delete'    // Delete users
```

### Role Management
```typescript
'role_view'      // View roles
'role_create'    // Create roles
'role_update'    // Update roles (includes assigning permissions)
'role_delete'    // Delete roles
```

### Permission Management
```typescript
'permission_view'    // View permissions
'permission_create'  // Create permissions
'permission_update'  // Update permissions
'permission_delete'  // Delete permissions
```

### Settings
```typescript
'settings_manage'    // Manage system settings (includes locations)
```

### Project Management
```typescript
'project_view'      // View projects
'project_create'    // Create projects
'project_edit'      // Edit projects
'project_delete'    // Delete projects
'project_approve'   // Approve projects
```

### Activity Management
```typescript
'activity_view'     // View activities
'activity_create'   // Create activities
'activity_edit'     // Edit activities
'activity_delete'   // Delete activities
'activity_assign'   // Assign activities to users
```

### Beneficiary Management
```typescript
'beneficiary_view'   // View beneficiaries
'beneficiary_create' // Register beneficiaries
'beneficiary_edit'   // Edit beneficiaries
'beneficiary_delete' // Delete beneficiaries
```

### Case Management
```typescript
'case_view'      // View cases
'case_create'    // Create cases
'case_edit'      // Edit cases
'case_delete'    // Delete cases
'case_assign'    // Assign cases
'case_handle'    // Handle/process cases
'case_close'     // Close cases
```

### Incident Management
```typescript
'incident_view'    // View incidents
'incident_create'  // Create incidents
'incident_edit'    // Edit incidents
'incident_delete'  // Delete incidents
```

### Content Management
```typescript
'content_manage'   // Full content management (news, gallery, resources)
```

### Jobs
```typescript
'jobs_view'    // View background jobs
'jobs_manage'  // Manage jobs (retry, delete)
```

### Chatbot
```typescript
'chatbot_moderate'  // Moderate chatbot logs
```

### Super Admin
```typescript
'super_admin'  // Full system access - bypasses all checks
```

---

## 📝 Common Patterns

### Pattern 1: CRUD Page

```typescript
export default function UsersPage() {
  const { can } = usePermissions();

  return (
    <ProtectedRoute permission="user_view">
      <div>
        <h1>Users</h1>

        {/* Create button */}
        <PermissionGuard permission="user_create">
          <Button onClick={handleCreate}>Create User</Button>
        </PermissionGuard>

        {/* Table with actions */}
        <Table>
          {users.map(user => (
            <TableRow key={user.id}>
              <TableCell>{user.name}</TableCell>
              <TableCell>
                {/* Edit button */}
                <PermissionGuard permission="user_update">
                  <IconButton onClick={() => handleEdit(user.id)}>
                    <EditIcon />
                  </IconButton>
                </PermissionGuard>

                {/* Delete button */}
                <PermissionGuard permission="user_delete">
                  <IconButton onClick={() => handleDelete(user.id)}>
                    <DeleteIcon />
                  </IconButton>
                </PermissionGuard>
              </TableCell>
            </TableRow>
          ))}
        </Table>
      </div>
    </ProtectedRoute>
  );
}
```

### Pattern 2: Form with Conditional Fields

```typescript
export default function UserForm() {
  const { can, canAny } = usePermissions();

  return (
    <ProtectedRoute permission={['user_create', 'user_update']}>
      <form>
        <Input name="name" label="Name" />
        <Input name="email" label="Email" />

        {/* Only admins can set roles */}
        <PermissionGuard permission="role_update">
          <Select name="role" label="Role" />
        </PermissionGuard>

        {/* Only users with specific permissions can activate/deactivate */}
        <PermissionGuard permission={['user_update', 'super_admin']}>
          <Checkbox name="is_active" label="Active" />
        </PermissionGuard>

        <Button type="submit">
          {can('user_create') ? 'Create' : 'Update'}
        </Button>
      </form>
    </ProtectedRoute>
  );
}
```

### Pattern 3: Settings Page with Tabs

```typescript
export default function SettingsPage() {
  const { can } = usePermissions();

  return (
    <ProtectedRoute permission={['settings_manage', 'user_view', 'role_view']}>
      <Tabs>
        {/* General settings - everyone with settings_manage */}
        {can('settings_manage') && (
          <Tab label="General">
            <GeneralSettings />
          </Tab>
        )}

        {/* Users - requires user_view */}
        {can('user_view') && (
          <Tab label="Users">
            <UsersSettings />
          </Tab>
        )}

        {/* Roles - requires role_view */}
        {can('role_view') && (
          <Tab label="Roles">
            <RolesSettings />
          </Tab>
        )}
      </Tabs>
    </ProtectedRoute>
  );
}
```

### Pattern 4: API Call with Permission Check

```typescript
const handleDelete = async (userId: string) => {
  const { can } = usePermissions();

  // Check permission before making API call
  if (!can('user_delete')) {
    showToast('You do not have permission to delete users', 'error');
    return;
  }

  // Confirm action
  const confirmed = await confirm('Are you sure you want to delete this user?');
  if (!confirmed) return;

  try {
    // API call (backend will also check permission)
    await usersService.deleteUser(userId);
    showToast('User deleted successfully', 'success');
    refreshUsers();
  } catch (error) {
    if (error.status === 403) {
      showToast('Permission denied', 'error');
    } else {
      showToast('Failed to delete user', 'error');
    }
  }
};
```

### Pattern 5: Sidebar Menu Items

**Already handled automatically** in `src/components/layout/AppSidebar.tsx`

Just add `permission` property to nav items:

```typescript
// src/config/navigation.ts
export const navItems: NavItem[] = [
  {
    label: 'Dashboard',
    href: '/',
    icon: DashboardIcon,
    // No permission = accessible to all authenticated users
  },
  {
    label: 'Users',
    href: '/users',
    icon: UsersIcon,
    permission: 'user_view', // ✅ Requires permission
  },
  {
    label: 'Settings',
    icon: SettingsIcon,
    permission: 'settings_manage',
    subItems: [
      {
        label: 'Locations',
        href: '/settings/locations',
        permission: 'settings_manage',
      },
      {
        label: 'Roles',
        href: '/settings/roles',
        permission: 'role_view',
      },
    ],
  },
];
```

---

## ⚠️ Important Notes

### DO's ✅

1. **Always check permissions on backend**
   - Frontend checks are for UX only
   - Backend middleware validates all API calls

2. **Use specific permissions, not roles**
   ```typescript
   // ✅ GOOD
   <PermissionGuard permission="user_create">

   // ❌ BAD
   if (user.role === 'Admin')
   ```

3. **Wrap protected pages with ProtectedRoute**
   ```typescript
   // ✅ GOOD
   export default function UsersPage() {
     return (
       <ProtectedRoute permission="user_view">
         <Content />
       </ProtectedRoute>
     );
   }
   ```

4. **Hide UI elements users can't use**
   ```typescript
   // ✅ GOOD
   <PermissionGuard permission="user_delete">
     <DeleteButton />
   </PermissionGuard>
   ```

### DON'Ts ❌

1. **Don't rely on frontend checks alone**
   ```typescript
   // ❌ BAD - Backend must also check!
   if (can('user_delete')) {
     await api.delete(`/users/${id}`);
   }
   ```

2. **Don't use role-based access**
   ```typescript
   // ❌ BAD
   if (user.role === 'Admin') { ... }

   // ✅ GOOD
   if (can('admin_feature')) { ... }
   ```

3. **Don't hardcode role bypasses**
   ```typescript
   // ❌ BAD
   if (role === 'Admin') return true;

   // ✅ GOOD
   if (can('super_admin')) return true;
   ```

4. **Don't forget to check permissions before API calls**
   ```typescript
   // ❌ BAD - No permission check
   const handleDelete = async () => {
     await api.delete(`/users/${id}`);
   };

   // ✅ GOOD - Check first
   const handleDelete = async () => {
     if (!can('user_delete')) {
       showToast('No permission', 'error');
       return;
     }
     await api.delete(`/users/${id}`);
   };
   ```

---

## 🐛 Troubleshooting

### Permission check always returns false

**Check**:
1. User is authenticated
2. User has role assigned in database
3. Role has permissions in `role_permissions` table
4. Session endpoint returns permissions array
5. Permission name matches exactly (case-sensitive)

### Page shows "Access Denied" but user should have access

**Check**:
1. User has the exact permission required
2. Check session endpoint: `GET /api/admin/auth/session`
3. Verify permission name in ProtectedRoute matches database
4. Clear localStorage and re-login

### API call returns 403 but frontend shows button

**This is expected behavior**:
- Frontend checks prevent accidental clicks (UX)
- Backend enforces security
- User may have manipulated frontend or permissions changed

**Fix**: Ensure frontend and backend check same permission

---

## 📚 Related Files

- **Permission Utilities**: `src/lib/auth/permissions.ts`
- **usePermissions Hook**: `src/hooks/usePermissions.ts`
- **ProtectedRoute Component**: `src/components/auth/ProtectedRoute.tsx`
- **PermissionGuard Component**: `src/components/auth/PermissionGuard.tsx`
- **Backend Middleware**: `Backend/v1/src/middleware.ts`
- **Route Permissions Map**: `Backend/v1/src/utils/routes_permission.ts`

---

## 🚀 Quick Start Checklist

When implementing a new protected feature:

- [ ] Add route to `Backend/v1/src/utils/routes_permission.ts`
- [ ] Create permission in database if needed
- [ ] Wrap page with `<ProtectedRoute permission="...">`
- [ ] Hide/show UI elements with `<PermissionGuard permission="...">`
- [ ] Check permission before API calls with `can('...')`
- [ ] Test with user who has permission
- [ ] Test with user who doesn't have permission
- [ ] Test direct API call without permission (should return 403)

---

**For complete documentation, see**:
- `RBAC_GUIDE.md` - Complete usage guide
- `SECURITY_RBAC_IMPLEMENTATION.md` - Security details
- `RBAC_TESTING_CHECKLIST.md` - Testing procedures
