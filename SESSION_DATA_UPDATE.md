# Session Data Update - Roles and Permissions

## ✅ Complete

User roles and permissions are now included in session data across all authentication endpoints.

---

## 📋 What Was Updated

### 1. Backend - Login Endpoint

**File**: `Backend/v1/src/app/api/admin/auth/login/route.ts`

**Changes**:
- ✅ Fetches all user roles (not just the first one)
- ✅ Fetches all permissions from all user's roles
- ✅ Returns `roles` array in user response
- ✅ Returns `permissions` array in user response
- ✅ Removes duplicate permissions (uses Set)

**Response Structure**:
```json
{
  "success": true,
  "message": "Login successful",
  "session": {
    "access_token": "...",
    "refresh_token": "...",
    "token_type": "Bearer",
    "expires_at": 1234567890
  },
  "user": {
    "id": "user-id",
    "email": "user@example.com",
    "first_name": "John",
    "last_name": "Doe",
    "phone_number": "+255...",
    "sex": "Male",
    "age_group": "25-34",
    "role": "Admin",
    "role_id": "role-id",
    "roles": ["Admin", "Project Manager"], // NEW ✅
    "permissions": [                         // NEW ✅
      "super_admin",
      "user_view",
      "user_create",
      "project_view",
      "project_create"
    ]
  }
}
```

---

### 2. Backend - Session Endpoint

**File**: `Backend/v1/src/app/api/admin/auth/session/route.ts`

**Changes**:
- ✅ Fetches all user roles (not just the first one)
- ✅ Fetches all permissions from all user's roles
- ✅ Returns `roles` array in user response
- ✅ Returns `permissions` array in user response
- ✅ Removes duplicate permissions (uses Set)

**Response Structure**:
```json
{
  "success": true,
  "user": {
    "id": "user-id",
    "email": "user@example.com",
    "first_name": "John",
    "last_name": "Doe",
    "phone_number": "+255...",
    "sex": "Male",
    "age_group": "25-34",
    "photo_consent": true,
    "created_at": "2024-01-01T00:00:00Z",
    "status": "Active",
    "role": "Admin",
    "role_id": "role-id",
    "roles": ["Admin", "Project Manager"], // NEW ✅
    "permissions": [                         // NEW ✅
      "super_admin",
      "user_view",
      "user_create",
      "project_view",
      "project_create"
    ]
  },
  "session": {
    "expires_at": "..."
  }
}
```

---

### 3. Database View

**File**: `Backend/v1/migrations/create_user_session_data_view.sql`

**Created**:
- ✅ New database view: `user_session_data`
- ✅ Efficiently joins users, roles, and permissions
- ✅ Returns aggregated roles and permissions as arrays
- ✅ Used by middleware for fast permission checks

**View Structure**:
```sql
CREATE OR REPLACE VIEW user_session_data AS
SELECT
    u.id AS user_id,
    u.email,
    u.first_name,
    u.last_name,
    -- ... other user fields

    -- Primary role
    (SELECT r.id FROM user_roles ur JOIN roles r ON r.id = ur.role_id
     WHERE ur.user_id = u.id LIMIT 1) AS role_id,

    (SELECT r.name FROM user_roles ur JOIN roles r ON r.id = ur.role_id
     WHERE ur.user_id = u.id LIMIT 1) AS role_name,

    -- All roles as array
    (SELECT array_agg(r.name) FROM user_roles ur JOIN roles r ON r.id = ur.role_id
     WHERE ur.user_id = u.id) AS roles,

    -- All permissions as array (distinct)
    (SELECT array_agg(DISTINCT p.name)
     FROM user_roles ur
     JOIN role_permissions rp ON rp.role_id = ur.role_id
     JOIN permissions p ON p.id = rp.permission_id
     WHERE ur.user_id = u.id) AS permissions

FROM users u;
```

**Usage**:
```sql
-- Get user session data with all roles and permissions
SELECT * FROM user_session_data WHERE user_id = 'user-id';
```

---

### 4. Frontend - Auth Service

**File**: `Frontend/Admin_Portal/v1/src/lib/api/services/auth.ts`

**Changes**:
- ✅ Updated `signin` response type to include `roles?: string[]`
- ✅ Updated `signin` response type to include `permissions?: string[]`

**TypeScript Interface**:
```typescript
signin: async (data: { email: string; password: string }) => {
  const response = await api.post<{
    success: boolean;
    message: string;
    session: {
      access_token: string;
      refresh_token: string;
      token_type: string;
      expires_at: number;
    };
    user: {
      id: string;
      email: string;
      first_name: string;
      last_name: string;
      phone_number?: string;
      sex?: string;
      age_group?: string;
      role?: string;
      role_id?: string;
      roles?: string[]; // NEW ✅
      permissions?: string[]; // NEW ✅
    };
  }>('/api/admin/auth/login', data);

  // ...
}
```

---

### 5. Frontend - Auth Context

**File**: `Frontend/Admin_Portal/v1/src/context/AuthContext.tsx`

**Changes**:
- ✅ Updated `User` interface to include `roles?: string[]`
- ✅ Added documentation comments for clarity

**TypeScript Interface**:
```typescript
export interface User {
  id: string;
  email: string;
  first_name: string;
  last_name: string;
  phone_number?: string | null;
  sex?: string | null;
  age_group?: string | null;
  photo_consent?: boolean;
  status?: string;
  created_at?: string;
  role?: string; // Primary role name
  role_id?: string; // Primary role ID
  roles?: string[]; // All user roles (for users with multiple roles) ✅ NEW
  image_url?: string | null;
  permissions?: string[]; // All user permissions (from all roles)
}
```

---

## 🔄 Data Flow

### Login Flow
```
1. User logs in
   ↓
2. Backend validates credentials
   ↓
3. Backend fetches user data
   ↓
4. Backend fetches ALL roles for user
   ↓
5. Backend fetches ALL permissions for ALL roles
   ↓
6. Backend returns user with roles + permissions
   ↓
7. Frontend stores in localStorage
   ↓
8. Frontend sets user in AuthContext
   ↓
9. usePermissions hook can now check permissions
```

### Session Validation Flow
```
1. Frontend calls session endpoint
   ↓
2. Backend validates token
   ↓
3. Backend fetches user data
   ↓
4. Backend fetches ALL roles for user
   ↓
5. Backend fetches ALL permissions for ALL roles
   ↓
6. Backend returns user with roles + permissions
   ↓
7. Frontend updates user in AuthContext
   ↓
8. Permissions available for UI/route protection
```

### Middleware Permission Check Flow
```
1. Request to protected API route
   ↓
2. Middleware extracts token
   ↓
3. Middleware validates token
   ↓
4. Middleware queries user_session_data view
   ↓
5. View returns user with roles + permissions
   ↓
6. Middleware checks if user has required permission
   ↓
7. Allow (200) or Deny (403)
```

---

## 🎯 Benefits

### 1. **Complete Permission Context**
- Users with multiple roles get ALL permissions
- No missing permissions from secondary roles
- Proper permission merging

### 2. **Performance**
- Single query to get all permissions (using view)
- No N+1 queries
- Cached in user session

### 3. **Consistency**
- Login and session endpoints return same structure
- Frontend and backend use same permission data
- Middleware uses optimized view

### 4. **Flexibility**
- Supports users with single role
- Supports users with multiple roles
- Automatically aggregates permissions

---

## 📊 Example Scenarios

### Scenario 1: User with Single Role

**Database**:
```
user_roles:
  user_id: abc-123
  role_id: role-admin

roles:
  id: role-admin
  name: Admin

role_permissions:
  role_id: role-admin
  permission_id: perm-super-admin

permissions:
  id: perm-super-admin
  name: super_admin
```

**Response**:
```json
{
  "role": "Admin",
  "role_id": "role-admin",
  "roles": ["Admin"],
  "permissions": ["super_admin"]
}
```

---

### Scenario 2: User with Multiple Roles

**Database**:
```
user_roles:
  1. user_id: abc-123, role_id: role-project-manager
  2. user_id: abc-123, role_id: role-case-officer

roles:
  1. id: role-project-manager, name: Project Manager
  2. id: role-case-officer, name: Case Officer

role_permissions:
  1. role_id: role-project-manager, permission_id: perm-project-view
  2. role_id: role-project-manager, permission_id: perm-project-create
  3. role_id: role-case-officer, permission_id: perm-case-view
  4. role_id: role-case-officer, permission_id: perm-case-create

permissions:
  1. id: perm-project-view, name: project_view
  2. id: perm-project-create, name: project_create
  3. id: perm-case-view, name: case_view
  4. id: perm-case-create, name: case_create
```

**Response**:
```json
{
  "role": "Project Manager",
  "role_id": "role-project-manager",
  "roles": ["Project Manager", "Case Officer"],
  "permissions": [
    "project_view",
    "project_create",
    "case_view",
    "case_create"
  ]
}
```

---

## 🚀 How to Use

### Frontend - Check Permissions

```typescript
import { usePermissions } from '@/hooks/usePermissions';

function MyComponent() {
  const { can, permissions, role, roles } = usePermissions();

  // Check single permission
  if (can('user_create')) {
    // Show create button
  }

  // Check user's primary role
  if (role === 'Admin') {
    // Show admin features
  }

  // Check if user has any of these roles
  if (roles?.includes('Project Manager')) {
    // Show project management features
  }

  // Get all permissions
  console.log('User permissions:', permissions);
  // Output: ["super_admin", "user_view", "user_create", ...]

  // Get all roles
  console.log('User roles:', roles);
  // Output: ["Admin", "Project Manager"]
}
```

### Backend - Middleware

The middleware automatically uses `user_session_data` view:

```typescript
const { data: session_data } = await db
  .from('user_session_data')
  .select('*')
  .eq('user_id', user.id)
  .single();

const userPermissions: string[] = session_data?.permissions || [];
const userRoles: string[] = session_data?.roles || [];

// Check permission
if (userPermissions.includes(requiredPermission)) {
  // Allow access
}
```

---

## ✅ Testing

### Test Login Response

```bash
curl -X POST http://localhost:3001/api/admin/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@example.com","password":"password"}'
```

**Expected Response**:
```json
{
  "success": true,
  "user": {
    "id": "...",
    "email": "admin@example.com",
    "role": "Admin",
    "roles": ["Admin"],
    "permissions": ["super_admin", "user_view", "user_create", ...]
  }
}
```

### Test Session Response

```bash
TOKEN="your-access-token"

curl -X GET http://localhost:3001/api/admin/auth/session \
  -H "Authorization: Bearer $TOKEN"
```

**Expected Response**:
```json
{
  "success": true,
  "user": {
    "id": "...",
    "email": "admin@example.com",
    "role": "Admin",
    "roles": ["Admin"],
    "permissions": ["super_admin", "user_view", "user_create", ...]
  }
}
```

### Test Database View

```sql
-- Run this in your database
SELECT
  user_id,
  email,
  role_name,
  roles,
  permissions
FROM user_session_data
WHERE email = 'admin@example.com';
```

---

## 📝 Migration Steps

### 1. Run Database Migration

```bash
# Run the SQL migration
psql -U your_user -d your_database -f Backend/v1/migrations/create_user_session_data_view.sql
```

### 2. Test Endpoints

```bash
# Test login
npm run test:login

# Test session
npm run test:session
```

### 3. Verify Frontend

1. Login to the admin portal
2. Open browser console
3. Check localStorage: `localStorage.getItem('user')`
4. Should see `roles` and `permissions` arrays

---

## 🎉 Summary

✅ **Login endpoint** now returns `roles` and `permissions`
✅ **Session endpoint** now returns `roles` and `permissions`
✅ **Database view** created for efficient permission queries
✅ **Frontend types** updated to include `roles` array
✅ **AuthContext** updated with documented User interface
✅ **Middleware** can use optimized view for permission checks

**Result**: Complete session data with all user roles and permissions available everywhere.
