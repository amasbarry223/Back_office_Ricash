import { create } from 'zustand';
import { KycRecord, KycStatus } from '@/types';
import { mockKycRecords } from '@/mocks/kyc.mock';
import { useUsersStore } from './users-store';

interface KycStore {
  records: KycRecord[];
  getRecordById: (id: string) => KycRecord | undefined;
  getRecordsByClient: (clientId: string) => KycRecord[];
  approveKyc: (id: string, verifiedBy: string) => void;
  rejectKyc: (id: string, verifiedBy: string, comment: string) => void;
  getPendingCount: () => number;
}

export const useKycStore = create<KycStore>((set, get) => ({
  records: [...mockKycRecords],

  getRecordById: (id) => {
    return get().records.find(r => r.id === id);
  },

  getRecordsByClient: (clientId) => {
    return get().records.filter(r => r.clientId === clientId);
  },

  approveKyc: (id, verifiedBy) => {
    const record = get().records.find(r => r.id === id);
    // Guard: only PENDING records can be approved
    if (!record || record.status !== 'PENDING') return;

    set(state => ({
      records: state.records.map(r =>
        r.id === id ? {
          ...r,
          status: 'VERIFIED' as KycStatus,
          verifiedAt: new Date().toISOString(),
          verifiedBy,
          smileIdentityResult: 'PASS',
        } : r
      ),
    }));

    // Cross-store sync: update the client's KYC level
    useUsersStore.getState().updateClientKyc(record.clientId, record.currentLevel);
  },

  rejectKyc: (id, verifiedBy, comment) => {
    const record = get().records.find(r => r.id === id);
    // Guard: only PENDING records can be rejected
    if (!record || record.status !== 'PENDING') return;

    set(state => ({
      records: state.records.map(r =>
        r.id === id ? {
          ...r,
          status: 'REJECTED' as KycStatus,
          verifiedAt: new Date().toISOString(),
          verifiedBy,
          comment,
          smileIdentityResult: 'FAIL',
        } : r
      ),
    }));
  },

  getPendingCount: () => {
    return get().records.filter(r => r.status === 'PENDING').length;
  },
}));
