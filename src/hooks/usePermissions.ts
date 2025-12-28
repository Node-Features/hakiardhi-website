import { useAuth } from '@/context/AuthContext';
import { hasPermission, hasAnyPermission, hasAllPermissions, hasRole, hasAnyRole } from '@/lib/auth/permissions';
import { RBAC_ENABLED } from '@/config/rbac';

/**
 * Hook to check permissions for the current user
 */
export function usePermissions() {
  const { user } = useAuth();

  // ⚠️ RBAC DISABLED: Always return true for all permission checks
  if (!RBAC_ENABLED) {
    return {
      can: (permission: string | null) => true,
      canAny: (permissions: string[]) => true,
      canAll: (permissions: string[]) => true,
      hasRole: (roleName: string) => true,
      hasAnyRole: (roleNames: string[]) => true,
      permissions: user?.permissions || [],
      role: user?.role || null,
    };
  }

  // RBAC ENABLED: Perform actual permission checks
  return {
    /**
     * Check if user has a specific permission
     */
    can: (permission: string | null) => hasPermission(user, permission),

    /**
     * Check if user has any of the specified permissions
     */
    canAny: (permissions: string[]) => hasAnyPermission(user, permissions),

    /**
     * Check if user has all of the specified permissions
     */
    canAll: (permissions: string[]) => hasAllPermissions(user, permissions),

    /**
     * Check if user has a specific role
     */
    hasRole: (roleName: string) => hasRole(user, roleName),

    /**
     * Check if user has any of the specified roles
     */
    hasAnyRole: (roleNames: string[]) => hasAnyRole(user, roleNames),

    /**
     * Get all user permissions
     */
    permissions: user?.permissions || [],

    /**
     * Get user role
     */
    role: user?.role || null,
  };
}
