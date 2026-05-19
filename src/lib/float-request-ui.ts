import type { FloatRequest } from '@/types';
/** Nombre de lignes par page dans les tableaux demandes float */
export const FLOAT_REQUESTS_PER_PAGE = 5;

export type FloatRequestQuickFilter = 'all' | 'pending' | 'approved' | 'rejected';

export interface FloatRequestStats {
  total: number;
  pending: number;
  approved: number;
  rejected: number;
  pendingAmount: number;
}

export function computeFloatRequestStats(requests: FloatRequest[]): FloatRequestStats {
  const pending = requests.filter((r) => r.status === 'PENDING');
  return {
    total: requests.length,
    pending: pending.length,
    approved: requests.filter((r) => r.status === 'APPROVED').length,
    rejected: requests.filter((r) => r.status === 'REJECTED').length,
    pendingAmount: pending.reduce((sum, r) => sum + r.amount, 0),
  };
}

export function filterFloatRequests(
  requests: FloatRequest[],
  query: string,
  quickFilter: FloatRequestQuickFilter,
): FloatRequest[] {
  let result = [...requests];

  switch (quickFilter) {
    case 'pending':
      result = result.filter((r) => r.status === 'PENDING');
      break;
    case 'approved':
      result = result.filter((r) => r.status === 'APPROVED');
      break;
    case 'rejected':
      result = result.filter((r) => r.status === 'REJECTED');
      break;
    default:
      break;
  }

  const q = query.trim().toLowerCase();
  if (!q) {
    return result.sort(
      (a, b) => new Date(b.requestedAt).getTime() - new Date(a.requestedAt).getTime(),
    );
  }

  return result
    .filter(
      (r) =>
        r.id.toLowerCase().includes(q) ||
        r.agentCode.toLowerCase().includes(q) ||
        r.agentName.toLowerCase().includes(q) ||
        r.justification.toLowerCase().includes(q),
    )
    .sort((a, b) => new Date(b.requestedAt).getTime() - new Date(a.requestedAt).getTime());
}
