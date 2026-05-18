/**
 * Shared utility functions for the Ricash Back-Office
 */

/** Get initials from a full name (e.g., "Moussa Konaté" → "MK") */
export function getInitials(name: string): string {
  return name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
}

/** Get display label for a user role */
export function roleLabel(role: string): string {
  switch (role) {
    case 'super_admin':
      return 'Super Admin';
    case 'admin':
      return 'Admin';
    default:
      return role;
  }
}

/** Mobile breakpoint for sidebar collapse */
export const MOBILE_BREAKPOINT = 1280;
