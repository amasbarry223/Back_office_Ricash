import { create } from 'zustand';
import { FeeConfig, KycLimitConfig, GeneralConfig, TransactionType, Operator } from '@/types';

interface ConfigStore {
  fees: FeeConfig[];
  kycLimits: KycLimitConfig[];
  general: GeneralConfig;
  // Actions
  updateFee: (id: string, updates: Partial<FeeConfig>) => void;
  updateKycLimit: (level: number, updates: Partial<KycLimitConfig>) => void;
  updateGeneral: (updates: Partial<GeneralConfig>) => void;
}

export const useConfigStore = create<ConfigStore>((set) => ({
  fees: [
    { id: 'FEE-001', operationType: 'DEPOSIT' as TransactionType, minAmount: 1000, maxAmount: 50000, feePercent: 0.5, fixedFee: 0 },
    { id: 'FEE-002', operationType: 'DEPOSIT' as TransactionType, minAmount: 50001, maxAmount: 500000, feePercent: 1.0, fixedFee: 0 },
    { id: 'FEE-003', operationType: 'DEPOSIT' as TransactionType, minAmount: 500001, maxAmount: 2000000, feePercent: 0.8, fixedFee: 500 },
    { id: 'FEE-004', operationType: 'WITHDRAWAL' as TransactionType, minAmount: 1000, maxAmount: 50000, feePercent: 1.0, fixedFee: 0 },
    { id: 'FEE-005', operationType: 'WITHDRAWAL' as TransactionType, minAmount: 50001, maxAmount: 500000, feePercent: 1.5, fixedFee: 0 },
    { id: 'FEE-006', operationType: 'WITHDRAWAL' as TransactionType, minAmount: 500001, maxAmount: 2000000, feePercent: 1.2, fixedFee: 1000 },
    { id: 'FEE-007', operationType: 'TRANSFER' as TransactionType, minAmount: 1000, maxAmount: 100000, feePercent: 1.5, fixedFee: 0 },
    { id: 'FEE-008', operationType: 'TRANSFER' as TransactionType, minAmount: 100001, maxAmount: 500000, feePercent: 1.0, fixedFee: 500 },
    { id: 'FEE-009', operationType: 'TRANSFER' as TransactionType, minAmount: 500001, maxAmount: 2000000, feePercent: 0.8, fixedFee: 2000 },
    { id: 'FEE-010', operationType: 'MERCHANT_PAYMENT' as TransactionType, minAmount: 100, maxAmount: 100000, feePercent: 1.0, fixedFee: 0 },
    { id: 'FEE-011', operationType: 'REFUND' as TransactionType, minAmount: 0, maxAmount: 0, feePercent: 0, fixedFee: 0 },
  ],

  kycLimits: [
    { level: 0, label: 'Non vérifié', dailyLimit: 0, monthlyLimit: 0, maxBalance: 0 },
    { level: 1, label: 'Niveau 1 - Basique', dailyLimit: 100000, monthlyLimit: 500000, maxBalance: 200000 },
    { level: 2, label: 'Niveau 2 - Standard', dailyLimit: 500000, monthlyLimit: 2000000, maxBalance: 1000000 },
    { level: 3, label: 'Niveau 3 - Premium', dailyLimit: 2000000, monthlyLimit: 10000000, maxBalance: 5000000 },
  ],

  general: {
    currency: 'XOF',
    activeCountries: ['ML', 'SN', 'CI', 'BF', 'GN', 'NE', 'TG', 'BJ'],
    activeOperators: ['ORANGE_MONEY' as Operator, 'MOOV' as Operator, 'MTN' as Operator, 'WAVE' as Operator, 'FREE_MONEY' as Operator],
  },

  updateFee: (id, updates) => {
    set(state => ({
      fees: state.fees.map(f => f.id === id ? { ...f, ...updates } : f),
    }));
  },

  updateKycLimit: (level, updates) => {
    set(state => ({
      kycLimits: state.kycLimits.map(k => k.level === level ? { ...k, ...updates } : k),
    }));
  },

  updateGeneral: (updates) => {
    set(state => ({
      general: { ...state.general, ...updates },
    }));
  },
}));
