/**
 * rbac.ts
 * Very small RBAC skeleton used for Phase 1.
 * Replace with a robust permissions system in Phase 2.
 */

export type Role = 'admin' | 'editor' | 'member' | 'viewer';

export function hasRole(userRoles: Role[] | undefined, required: Role) {
  if (!userRoles) return false;
  if (userRoles.includes('admin')) return true;
  return userRoles.includes(required);
}

export const RoleDefaults: Record<Role, string> = {
  admin: 'Full access',
  editor: 'Create and edit',
  member: 'Limited edit',
  viewer: 'Read only',
};

Co-authored-by: Copilot App <223556219+Copilot@users.noreply.github.com>