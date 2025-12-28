"use client";

import React from 'react';
import { usePermissions } from '@/hooks/usePermissions';

/**
 * ⚠️ RBAC Status: When RBAC is disabled (RBAC_ENABLED = false in @/config/rbac),
 * this component will always render children and never show fallback.
 * The usePermissions hook automatically handles RBAC state.
 */

interface PermissionGuardProps {
  /**
   * Required permission(s) to show children
   */
  permission?: string | string[];

  /**
   * Required role(s) to show children
   */
  role?: string | string[];

  /**
   * If true, user needs ALL specified permissions (AND logic)
   * If false, user needs ANY of the specified permissions (OR logic)
   * Default: false
   */
  requireAll?: boolean;

  /**
   * Content to show when user doesn't have permission
   */
  fallback?: React.ReactNode;

  /**
   * Children to show when user has permission
   */
  children: React.ReactNode;
}

/**
 * Component to conditionally render content based on user permissions
 *
 * @example
 * // Show content only if user has 'user_view' permission
 * <PermissionGuard permission="user_view">
 *   <UserList />
 * </PermissionGuard>
 *
 * @example
 * // Show content if user has ANY of the specified permissions
 * <PermissionGuard permission={['user_view', 'user_manage']}>
 *   <UserList />
 * </PermissionGuard>
 *
 * @example
 * // Show content only if user has ALL specified permissions
 * <PermissionGuard permission={['user_view', 'user_manage']} requireAll>
 *   <UserManagement />
 * </PermissionGuard>
 *
 * @example
 * // Show content based on role
 * <PermissionGuard role="Admin">
 *   <AdminPanel />
 * </PermissionGuard>
 *
 * @example
 * // Show fallback content when permission is denied
 * <PermissionGuard
 *   permission="settings_manage"
 *   fallback={<div>You don't have access to settings</div>}
 * >
 *   <Settings />
 * </PermissionGuard>
 */
export function PermissionGuard({
  permission,
  role,
  requireAll = false,
  fallback = null,
  children,
}: PermissionGuardProps) {
  const { can, canAny, canAll, hasRole, hasAnyRole } = usePermissions();

  // Check role-based access
  if (role) {
    const hasAccess = Array.isArray(role)
      ? hasAnyRole(role)
      : hasRole(role);

    return hasAccess ? <>{children}</> : <>{fallback}</>;
  }

  // Check permission-based access
  if (permission) {
    let hasAccess = false;

    if (Array.isArray(permission)) {
      hasAccess = requireAll ? canAll(permission) : canAny(permission);
    } else {
      hasAccess = can(permission);
    }

    return hasAccess ? <>{children}</> : <>{fallback}</>;
  }

  // If no permission or role specified, show children
  return <>{children}</>;
}
