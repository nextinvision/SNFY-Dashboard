/**
 * Role-based access control utilities
 */

import { authApi } from '../api/auth';
import type { UserRole } from '../types/user';

/**
 * Check if the current user has administrator role
 */
export function isAdministrator(): boolean {
  const user = authApi.getCurrentUser();
  return user?.role === 'administrator';
}

/**
 * Check if the current user has a specific role
 */
export function hasRole(role: UserRole): boolean {
  const user = authApi.getCurrentUser();
  return user?.role === role;
}

/**
 * Check if the current user has any of the specified roles
 */
export function hasAnyRole(...roles: UserRole[]): boolean {
  const user = authApi.getCurrentUser();
  if (!user) return false;
  return roles.includes(user.role);
}

