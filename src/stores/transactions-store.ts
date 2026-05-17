import { create } from 'zustand';
import { Transaction, TransactionStatus } from '@/types';
import { mockTransactions } from '@/mocks/transactions.mock';

interface TransactionsStore {
  transactions: Transaction[];
  getTransactionById: (id: string) => Transaction | undefined;
  getTransactionByRef: (ref: string) => Transaction | undefined;
  updateTransactionStatus: (id: string, status: TransactionStatus) => void;
  getRecentTransactions: (limit: number) => Transaction[];
  getStats: () => { total: number; totalAmount: number; pending: number; failed: number };
}

export const useTransactionsStore = create<TransactionsStore>((set, get) => ({
  transactions: [...mockTransactions],

  getTransactionById: (id) => {
    return get().transactions.find(t => t.id === id);
  },

  getTransactionByRef: (ref) => {
    return get().transactions.find(t => t.ref === ref);
  },

  updateTransactionStatus: (id, status) => {
    set(state => ({
      transactions: state.transactions.map(t =>
        t.id === id ? { ...t, status } : t
      ),
    }));
  },

  getRecentTransactions: (limit) => {
    return [...get().transactions]
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .slice(0, limit);
  },

  getStats: () => {
    const txns = get().transactions;
    return {
      total: txns.length,
      totalAmount: txns.filter(t => t.status === 'SUCCESS').reduce((sum, t) => sum + t.amount, 0),
      pending: txns.filter(t => t.status === 'PENDING' || t.status === 'IN_PROGRESS').length,
      failed: txns.filter(t => t.status === 'FAILED').length,
    };
  },
}));
