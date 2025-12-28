"use client";

import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { hasPermission, hasAnyPermission, hasAllPermissions } from '@/lib/auth/permissions';
import { RBAC_ENABLED } from '@/config/rbac';
import LoadingSpinner from '@/components/ui/loading/LoadingSpinner';

interface ProtectedRouteProps {
  /**
   * Required permission(s) to access this route
   */
  permission?: string | string[];

  /**
   * If true, user needs ALL specified permissions (AND logic)
   * If false, user needs ANY of the specified permissions (OR logic)
   * Default: false
   */
  requireAll?: boolean;

  /**
   * Custom redirect path when user doesn't have permission
   * Default: '/'
   */
  redirectTo?: string;

  /**
   * Custom component to show when loading
   */
  loadingComponent?: React.ReactNode;

  /**
   * Custom component to show when access is denied
   */
  accessDeniedComponent?: React.ReactNode;

  /**
   * Children to render when user has access
   */
  children: React.ReactNode;
}

/**
 * Component to protect routes based on user permissions
 *
 * @example
 * // Protect a page with single permission
 * <ProtectedRoute permission="user_view">
 *   <UserPage />
 * </ProtectedRoute>
 *
 * @example
 * // Protect a page requiring ANY of the permissions
 * <ProtectedRoute permission={['user_view', 'user_manage']}>
 *   <UserPage />
 * </ProtectedRoute>
 *
 * @example
 * // Protect a page requiring ALL permissions
 * <ProtectedRoute permission={['user_view', 'user_manage']} requireAll>
 *   <UserManagementPage />
 * </ProtectedRoute>
 *
 * @example
 * // Custom redirect and access denied message
 * <ProtectedRoute
 *   permission="admin_access"
 *   redirectTo="/unauthorized"
 *   accessDeniedComponent={<CustomAccessDenied />}
 * >
 *   <AdminPage />
 * </ProtectedRoute>
 */
export function ProtectedRoute({
  permission,
  requireAll = false,
  redirectTo = '/',
  loadingComponent,
  accessDeniedComponent,
  children,
}: ProtectedRouteProps) {
  const { user, loading, isAuthenticated } = useAuth();
  const router = useRouter();

  useEffect(() => {
    // Wait for auth to finish loading
    if (loading) return;

    // Redirect to signin if not authenticated
    if (!isAuthenticated) {
      router.push('/signin');
      return;
    }

    // ⚠️ RBAC DISABLED: Skip permission checks
    if (!RBAC_ENABLED) {
      return;
    }

    // Check permissions if specified
    if (permission) {
      let hasAccess = false;

      if (Array.isArray(permission)) {
        hasAccess = requireAll
          ? hasAllPermissions(user, permission)
          : hasAnyPermission(user, permission);
      } else {
        hasAccess = hasPermission(user, permission);
      }

      // Redirect if user doesn't have required permissions
      if (!hasAccess) {
        router.push(redirectTo);
      }
    }
  }, [user, loading, isAuthenticated, permission, requireAll, redirectTo, router]);

  // Show loading state
  if (loading) {
    return loadingComponent || (
      <div className="flex min-h-screen items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  // Not authenticated
  if (!isAuthenticated) {
    return null; // Will redirect in useEffect
  }

  // ⚠️ RBAC DISABLED: Allow all authenticated users
  if (!RBAC_ENABLED) {
    return <>{children}</>;
  }

  // Check permissions
  if (permission) {
    let hasAccess = false;

    if (Array.isArray(permission)) {
      hasAccess = requireAll
        ? hasAllPermissions(user, permission)
        : hasAnyPermission(user, permission);
    } else {
      hasAccess = hasPermission(user, permission);
    }

    // Access denied
    if (!hasAccess) {
      return accessDeniedComponent || (
        <div className="flex min-h-screen flex-col items-center justify-center">
          <div className="text-center">
            <svg
              className="mx-auto h-16 w-16 text-gray-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
              />
            </svg>
            <h1 className="mt-4 text-2xl font-bold text-gray-800 dark:text-white">
              Access Denied
            </h1>
            <p className="mt-2 text-gray-600 dark:text-gray-400">
              You don't have permission to access this page.
            </p>
            <button
              onClick={() => router.push('/')}
              className="mt-6 rounded-lg bg-brand-600 px-4 py-2 text-white hover:bg-brand-700"
            >
              Go to Dashboard
            </button>
          </div>
        </div>
      );
    }
  }

  // User has access, render children
  return <>{children}</>;
}
