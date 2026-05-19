import type { KycRecord } from '@/types';

export type KycQuickFilter = 'all' | 'pending' | 'verified' | 'rejected' | 'expired';

export interface KycStats {
  total: number;
  pending: number;
  verified: number;
  rejected: number;
  expired: number;
}

export const KYC_LEVEL_BADGE_CLASS: Record<number, string> = {
  0: 'bg-ricash-neutral-bg text-ricash-neutral border-ricash-neutral-border',
  1: 'bg-ricash-info-bg text-ricash-info border-ricash-info-border',
  2: 'bg-ricash-success-bg text-ricash-success border-ricash-success-border',
  3: 'bg-ricash-brand-bg text-ricash-brand border-ricash-brand-border',
};

export function computeKycStats(records: KycRecord[]): KycStats {
  return {
    total: records.length,
    pending: records.filter((r) => r.status === 'PENDING').length,
    verified: records.filter((r) => r.status === 'VERIFIED').length,
    rejected: records.filter((r) => r.status === 'REJECTED').length,
    expired: records.filter((r) => r.status === 'EXPIRED').length,
  };
}

export function filterKycRecords(
  records: KycRecord[],
  query: string,
  quickFilter: KycQuickFilter,
): KycRecord[] {
  let result = [...records];

  switch (quickFilter) {
    case 'pending':
      result = result.filter((r) => r.status === 'PENDING');
      break;
    case 'verified':
      result = result.filter((r) => r.status === 'VERIFIED');
      break;
    case 'rejected':
      result = result.filter((r) => r.status === 'REJECTED');
      break;
    case 'expired':
      result = result.filter((r) => r.status === 'EXPIRED');
      break;
    default:
      break;
  }

  const q = query.trim().toLowerCase();
  if (!q) {
    return result.sort(
      (a, b) => new Date(b.submittedAt).getTime() - new Date(a.submittedAt).getTime(),
    );
  }

  return result
    .filter(
      (r) =>
        r.clientId.toLowerCase().includes(q) ||
        r.clientName.toLowerCase().includes(q) ||
        r.clientPhone.toLowerCase().includes(q) ||
        r.id.toLowerCase().includes(q),
    )
    .sort((a, b) => new Date(b.submittedAt).getTime() - new Date(a.submittedAt).getTime());
}
