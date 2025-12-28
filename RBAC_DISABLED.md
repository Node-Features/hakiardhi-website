# RBAC System - Currently Disabled

## ⚠️ Status: RBAC DISABLED

Role-Based Access Control (RBAC) is currently **disabled** system-wide. All authenticated users have full access to all features and API endpoints.

---

## What This Means

### Backend
- ✅ Authentication is **still required** (users must login)
- ⚠️ Permission checks are **bypassed** for all API routes
- ⚠️ All authenticated users can access all `/api/admin/*` endpoints

### Frontend
- ✅ Authentication is **still required** (login/logout works)
- ⚠️ All UI elements are **visible** to all users
- ⚠️ All sidebar menu items are **shown**
- ⚠️ All pages are **accessible**
- ⚠️ All buttons (Create, Edit, Delete) are **visible**

---

## Files Modified

### Backend
**File**: `Backend/v1/src/middleware.ts`

```typescript
// Line 11
const RBAC_ENABLED = false; // ⚠️ RBAC DISABLED
```

**Behavior**: When `RBAC_ENABLED = false`, middleware:
1. Validates authentication (token must be valid)
2. **Skips** permission checks
3. Allows all authenticated requests

### Frontend

**1. RBAC Config** (NEW)
**File**: `src/config/rbac.ts`

```typescript
export const RBAC_ENABLED = false; // ⚠️ RBAC DISABLED
```

**2. usePermissions Hook**
**File**: `src/hooks/usePermissions.ts`

```typescript
if (!RBAC_ENABLED) {
  return {
    can: () => true,      // Always returns true
    canAny: () => true,   // Always returns true
    canAll: () => true,   // Always returns true
    // ...
  };
}
```

**3. ProtectedRoute Component**
**File**: `src/components/auth/ProtectedRoute.tsx`

```typescript
// Skips permission checks when RBAC_ENABLED = false
if (!RBAC_ENABLED) {
  return <>{children}</>; // Always renders content
}
```

**4. PermissionGuard Component**
**File**: `src/components/auth/PermissionGuard.tsx`

- Uses `usePermissions` hook (which returns `true` for all checks)
- Automatically shows all content when RBAC is disabled

---

## How to Re-Enable RBAC

### Step 1: Update Configuration Flags

**Backend**:
```typescript
// Backend/v1/src/middleware.ts (line 11)
const RBAC_ENABLED = true; // ✅ RBAC ENABLED
```

**Frontend**:
```typescript
// Frontend/Admin_Portal/v1/src/config/rbac.ts
export const RBAC_ENABLED = true; // ✅ RBAC ENABLED
```

### Step 2: Database Setup

Ensure permissions are created and assigned:

```bash
# Run the migration to create user_session_data view
psql -U user -d database -f Backend/v1/migrations/create_user_session_data_view.sql
```

```sql
-- Create all 54 permissions (see RBAC_TESTING_CHECKLIST.md)
INSERT INTO permissions (name, description) VALUES
('super_admin', 'Full system access'),
('user_view', 'View users'),
('user_create', 'Create users'),
-- ... all permissions
```

```sql
-- Assign super_admin to Admin role
INSERT INTO role_permissions (role_id, permission_id)
SELECT r.id, p.id
FROM roles r
CROSS JOIN permissions p
WHERE r.name = 'Admin' AND p.name = 'super_admin';
```

### Step 3: Assign Permissions to Roles

Review each role and assign appropriate permissions based on their responsibilities.

### Step 4: Test

Follow the test scenarios in `RBAC_TESTING_CHECKLIST.md`:
1. Test admin login (should have full access)
2. Test limited user login (should see filtered sidebar)
3. Test unauthorized page access (should see Access Denied)
4. Test unauthorized API calls (should return 403)

---

## Current Behavior Examples

### Backend API

**Before (RBAC Disabled)**:
```bash
# User without user_view permission
curl -X GET http://localhost:3001/api/admin/users \
  -H "Authorization: Bearer $TOKEN"

# Response: 200 OK ✅ (allowed)
```

**After (RBAC Enabled)**:
```bash
# Same user without user_view permission
curl -X GET http://localhost:3001/api/admin/users \
  -H "Authorization: Bearer $TOKEN"

# Response: 403 Forbidden ❌
# { "message": "Forbidden: insufficient permissions" }
```

### Frontend UI

**Before (RBAC Disabled)**:
```typescript
// All users see this button
<PermissionGuard permission="user_delete">
  <Button>Delete User</Button>
</PermissionGuard>
// Result: Button VISIBLE to everyone ✅
```

**After (RBAC Enabled)**:
```typescript
// Only users with user_delete permission see this
<PermissionGuard permission="user_delete">
  <Button>Delete User</Button>
</PermissionGuard>
// Result: Button HIDDEN if user lacks permission ❌
```

---

## Security Implications

### ⚠️ While RBAC is Disabled

**Risks**:
- Any authenticated user can perform any action
- No granular access control
- Users can access sensitive data they shouldn't see
- UI doesn't reflect actual permissions

**Mitigations**:
- Authentication is still required
- Audit logs still track actions
- Enable RBAC before production deployment

### ✅ When RBAC is Enabled

**Benefits**:
- Granular permission control
- Users see only what they're authorized for
- API calls are validated
- Principle of least privilege enforced

---

## RBAC Components Status

All RBAC components are **installed and ready** - just disabled:

| Component | Status | Location |
|-----------|--------|----------|
| Backend Middleware | ✅ Installed, ⚠️ Disabled | `Backend/v1/src/middleware.ts` |
| Route Permissions Map | ✅ Installed | `Backend/v1/src/utils/routes_permission.ts` |
| Session Data View | ✅ SQL Ready | `Backend/v1/migrations/create_user_session_data_view.sql` |
| RBAC Config | ✅ Installed | `src/config/rbac.ts` |
| usePermissions Hook | ✅ Installed, ⚠️ Disabled | `src/hooks/usePermissions.ts` |
| ProtectedRoute | ✅ Installed, ⚠️ Disabled | `src/components/auth/ProtectedRoute.tsx` |
| PermissionGuard | ✅ Installed, ⚠️ Disabled | `src/components/auth/PermissionGuard.tsx` |
| Permission Utils | ✅ Installed | `src/lib/auth/permissions.ts` |

---

## Documentation

Complete RBAC documentation is available:

1. **RBAC_QUICK_REFERENCE.md** - Developer quick reference
2. **RBAC_GUIDE.md** - Complete usage guide
3. **SECURITY_RBAC_IMPLEMENTATION.md** - Security analysis
4. **RBAC_TESTING_CHECKLIST.md** - Testing procedures
5. **RBAC_IMPLEMENTATION_STATUS.md** - Implementation details
6. **SESSION_DATA_UPDATE.md** - Session data structure

---

## Quick Enable/Disable

### Disable RBAC (Current State)

```typescript
// Backend: Backend/v1/src/middleware.ts
const RBAC_ENABLED = false;

// Frontend: src/config/rbac.ts
export const RBAC_ENABLED = false;
```

### Enable RBAC

```typescript
// Backend: Backend/v1/src/middleware.ts
const RBAC_ENABLED = true;

// Frontend: src/config/rbac.ts
export const RBAC_ENABLED = true;
```

Then restart both servers:
```bash
# Backend
npm run dev

# Frontend
npm run dev
```

---

## Summary

- ✅ **Authentication**: Still working (login required)
- ⚠️ **Authorization**: Disabled (all users have full access)
- ✅ **RBAC Components**: Installed and ready
- 🔧 **To Enable**: Change 2 flags + setup database + test

**Recommendation**: Enable RBAC before production deployment for proper security.
