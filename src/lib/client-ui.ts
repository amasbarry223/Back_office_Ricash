import type { Client } from '@/types';

/** Niveau KYC considéré comme vérifié pour les opérations étendues */
export const KYC_VERIFIED_LEVEL = 2;

export type ClientQuickFilter =
  | 'all'
  | 'active'
  | 'suspended'
  | 'inactive'
  | 'kyc_pending'
  | 'kyc_verified';

export interface ClientStats {
  total: number;
  active: number;
  suspended: number;
  kycPending: number;
}

export function computeClientStats(clients: Client[]): ClientStats {
  return {
    total: clients.length,
    active: clients.filter((c) => c.status === 'ACTIVE').length,
    suspended: clients.filter((c) => c.status === 'SUSPENDED').length,
    kycPending: clients.filter((c) => c.kycLevel < KYC_VERIFIED_LEVEL).length,
  };
}

export function filterClients(
  clients: Client[],
  query: string,
  quickFilter: ClientQuickFilter,
): Client[] {
  let result = [...clients];

  switch (quickFilter) {
    case 'active':
      result = result.filter((c) => c.status === 'ACTIVE');
      break;
    case 'suspended':
      result = result.filter((c) => c.status === 'SUSPENDED');
      break;
    case 'inactive':
      result = result.filter((c) => c.status === 'INACTIVE');
      break;
    case 'kyc_pending':
      result = result.filter((c) => c.kycLevel < KYC_VERIFIED_LEVEL);
      break;
    case 'kyc_verified':
      result = result.filter((c) => c.kycLevel >= KYC_VERIFIED_LEVEL);
      break;
    default:
      break;
  }

  const q = query.trim().toLowerCase();
  if (!q) return result;

  return result.filter(
    (c) =>
      c.id.toLowerCase().includes(q) ||
      c.phone.toLowerCase().includes(q) ||
      c.firstName.toLowerCase().includes(q) ||
      c.lastName.toLowerCase().includes(q) ||
      `${c.firstName} ${c.lastName}`.toLowerCase().includes(q) ||
      (c.email?.toLowerCase().includes(q) ?? false),
  );
}
