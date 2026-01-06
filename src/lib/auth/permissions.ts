import { User } from '@/context/AuthContext';

/**
 * Check if user has a specific permission
 */
export function hasPermission(user: User | null, permission: string | null): boolean {
  // If no permission is required (null), allow access
  if (!permission) return true;

  // If user is not logged in, deny access
  if (!user) return false;

  // If user has no permissions, deny access
  if (!user.permissions || user.permissions.length === 0) return false;

  // Check if user has the required permission
  return user.permissions.includes(permission);
}

/**
 * Check if user has any of the specified permissions
 */
export function hasAnyPermission(user: User | null, permissions: string[]): boolean {
  if (!user || !user.permissions) return false;
  return permissions.some(permission => user.permissions!.includes(permission));
}

/**
 * Check if user has all of the specified permissions
 */
export function hasAllPermissions(user: User | null, permissions: string[]): boolean {
  if (!user || !user.permissions) return false;
  return permissions.every(permission => user.permissions!.includes(permission));
}

/**
 * Check if user has a specific role
 */
export function hasRole(user: User | null, roleName: string): boolean {
  if (!user || !user.role) return false;
  const userRoleName = typeof user.role === 'object' ? user.role.name : user.role;
  return userRoleName === roleName;
}

/**
 * Check if user has any of the specified roles
 */
export function hasAnyRole(user: User | null, roleNames: string[]): boolean {
  if (!user || !user.role) return false;
  const userRoleName = typeof user.role === 'object' ? user.role.name : user.role;
  return roleNames.includes(userRoleName);
}
