import type { Transaction } from '@/types';

export type DashboardTxFilter = 'all' | 'pending' | 'success' | 'failed';

export interface DashboardStats {
  txTotal: number;
  txSuccessAmount: number;
  txPending: number;
  txFailed: number;
  unreadAlerts: number;
  fraudAlerts: number;
  activeAgents: number;
  totalClients: number;
  globalFloat: number;
  kycPending: number;
  lowFloatAgents: number;
  floatRequestsPending: number;
}

export function computeDashboardStats(
  transactions: Transaction[],
  unreadCount: number,
  fraudAlerts: number,
  activeAgents: number,
  totalClients: number,
  globalFloat: number,
  kycPending: number,
  lowFloatAgents: number,
  floatRequestsPending: number,
): DashboardStats {
  const successTx = transactions.filter((t) => t.status === 'SUCCESS');
  return {
    txTotal: transactions.length,
    txSuccessAmount: successTx.reduce((sum, t) => sum + t.amount, 0),
    txPending: transactions.filter(
      (t) => t.status === 'PENDING' || t.status === 'IN_PROGRESS',
    ).length,
    txFailed: transactions.filter((t) => t.status === 'FAILED').length,
    unreadAlerts: unreadCount,
    fraudAlerts,
    activeAgents,
    totalClients,
    globalFloat,
    kycPending,
    lowFloatAgents,
    floatRequestsPending,
  };
}

export function filterDashboardTransactions(
  transactions: Transaction[],
  query: string,
  filter: DashboardTxFilter,
): Transaction[] {
  let result = [...transactions].sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
  );

  switch (filter) {
    case 'pending':
      result = result.filter((t) => t.status === 'PENDING' || t.status === 'IN_PROGRESS');
      break;
    case 'success':
      result = result.filter((t) => t.status === 'SUCCESS');
      break;
    case 'failed':
      result = result.filter((t) => t.status === 'FAILED');
      break;
    default:
      break;
  }

  const q = query.trim().toLowerCase();
  if (!q) return result;

  return result.filter(
    (t) =>
      t.ref.toLowerCase().includes(q) ||
      t.clientName.toLowerCase().includes(q) ||
      (t.agentName?.toLowerCase().includes(q) ?? false),
  );
}

export function getTxFilterCounts(transactions: Transaction[]): Record<DashboardTxFilter, number> {
  return {
    all: transactions.length,
    pending: transactions.filter((t) => t.status === 'PENDING' || t.status === 'IN_PROGRESS').length,
    success: transactions.filter((t) => t.status === 'SUCCESS').length,
    failed: transactions.filter((t) => t.status === 'FAILED').length,
  };
}

export function generateChartData() {
  const data: { date: string; montant: number; volume: number }[] = [];
  const now = new Date();
  for (let i = 29; i >= 0; i--) {
    const d = new Date(now);
    d.setDate(d.getDate() - i);
    const label = d.toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit' });
    const trend = (30 - i) * 8000;
    data.push({
      date: label,
      montant: Math.round(200000 + Math.random() * 400000 + trend),
      volume: Math.round(15 + Math.random() * 40 + (30 - i) * 0.5),
    });
  }
  return data;
}
