import type { Admin, Role } from '@/types';

export const ADMIN_ROLE_CAPABILITIES: Record<
  Role,
  { title: string; description: string; items: string[] }
> = {
  super_admin: {
    title: 'Super Admin',
    description: 'Accès complet à la plateforme Ricash et à la gestion des autres administrateurs.',
    items: [
      'Gestion des comptes administrateurs',
      'Configuration système et paramètres plateforme',
      'Approbation des agents et supervision globale',
      'Accès aux zones sensibles (audit, maintenance)',
    ],
  },
  admin: {
    title: 'Admin',
    description: 'Gestion opérationnelle du réseau sans accès à l\'administration des comptes admin.',
    items: [
      'Clients, agents et transactions',
      'Validation KYC et demandes de float',
      'Notifications et paramètres personnels',
      'Pas d\'accès à la création d\'administrateurs',
    ],
  },
};

export type AdminQuickFilter = 'all' | 'active' | 'suspended' | 'super_admin' | 'admin';

export interface AdminStats {
  total: number;
  active: number;
  suspended: number;
  superAdmins: number;
}

export function computeAdminStats(admins: Admin[]): AdminStats {
  return {
    total: admins.length,
    active: admins.filter((a) => a.status === 'ACTIVE').length,
    suspended: admins.filter((a) => a.status === 'SUSPENDED').length,
    superAdmins: admins.filter((a) => a.role === 'super_admin').length,
  };
}

export function filterAdmins(
  admins: Admin[],
  query: string,
  quickFilter: AdminQuickFilter,
): Admin[] {
  let result = [...admins];

  switch (quickFilter) {
    case 'active':
      result = result.filter((a) => a.status === 'ACTIVE');
      break;
    case 'suspended':
      result = result.filter((a) => a.status === 'SUSPENDED');
      break;
    case 'super_admin':
      result = result.filter((a) => a.role === 'super_admin');
      break;
    case 'admin':
      result = result.filter((a) => a.role === 'admin');
      break;
    default:
      break;
  }

  const q = query.trim().toLowerCase();
  if (!q) return result;

  return result.filter(
    (a) =>
      a.name.toLowerCase().includes(q) ||
      a.email.toLowerCase().includes(q) ||
      a.id.toLowerCase().includes(q) ||
      (a.phone?.toLowerCase().includes(q) ?? false),
  );
}
