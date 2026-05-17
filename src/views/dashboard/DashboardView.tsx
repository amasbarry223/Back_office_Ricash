'use client';

import React, { useMemo } from 'react';
import {
  ArrowLeftRight,
  Banknote,
  Clock,
  AlertTriangle,
  UserCheck,
  Users,
  Wallet,
  AlertCircle,
  Bell,
  FileWarning,
} from 'lucide-react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import StatCard from '@/components/common/StatCard';
import DataTable from '@/components/common/DataTable';
import StatusBadge from '@/components/common/StatusBadge';
import PageHeader from '@/components/common/PageHeader';
import { useRouterStore } from '@/stores/router-store';
import { useTransactionsStore } from '@/stores/transactions-store';
import { useAgentsStore } from '@/stores/agents-store';
import { useUsersStore } from '@/stores/users-store';
import { useNotificationsStore } from '@/stores/notifications-store';
import { TRANSACTION_TYPE_LABELS, type NotificationType } from '@/types';

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function formatXOF(amount: number): string {
  return new Intl.NumberFormat('fr-FR').format(amount) + ' XOF';
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString('fr-FR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });
}

function formatTimeAgo(iso: string): string {
  const now = Date.now();
  const then = new Date(iso).getTime();
  const diffMs = now - then;
  const diffMin = Math.floor(diffMs / 60000);
  if (diffMin < 1) return "À l'instant";
  if (diffMin < 60) return `Il y a ${diffMin} min`;
  const diffH = Math.floor(diffMin / 60);
  if (diffH < 24) return `Il y a ${diffH}h`;
  const diffD = Math.floor(diffH / 24);
  return `Il y a ${diffD}j`;
}

// ---------------------------------------------------------------------------
// 30-day mock chart data generator
// ---------------------------------------------------------------------------

function generateChartData() {
  const data: { date: string; montant: number; volume: number }[] = [];
  const now = new Date();
  for (let i = 29; i >= 0; i--) {
    const d = new Date(now);
    d.setDate(d.getDate() - i);
    const label = d.toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit' });
    // Semi-realistic random values with a gentle upward trend
    const trend = (30 - i) * 8000;
    data.push({
      date: label,
      montant: Math.round(200000 + Math.random() * 400000 + trend),
      volume: Math.round(15 + Math.random() * 40 + (30 - i) * 0.5),
    });
  }
  return data;
}

// ---------------------------------------------------------------------------
// Alert icon helper
// ---------------------------------------------------------------------------

const ALERT_ICON_MAP: Record<NotificationType, React.ReactNode> = {
  FRAUD_ALERT: <AlertTriangle className="size-5 text-red-500" />,
  LOW_FLOAT: <Wallet className="size-5 text-orange-500" />,
  KYC_EXPIRED: <FileWarning className="size-5 text-yellow-500" />,
  SYSTEM: <AlertCircle className="size-5 text-muted-foreground" />,
  TRANSACTION_ALERT: <Bell className="size-5 text-[var(--ricash-primary)]" />,
};

const ALERT_BG_MAP: Record<NotificationType, string> = {
  FRAUD_ALERT: 'bg-red-50 border-red-200',
  LOW_FLOAT: 'bg-orange-50 border-orange-200',
  KYC_EXPIRED: 'bg-yellow-50 border-yellow-200',
  SYSTEM: 'bg-muted/50 border-border',
  TRANSACTION_ALERT: 'bg-blue-50 border-blue-200',
};

// ---------------------------------------------------------------------------
// Chart Tooltip
// ---------------------------------------------------------------------------

function ChartTooltip({
  active,
  payload,
  label,
}: {
  active?: boolean;
  payload?: Array<{ value: number; name: string; color: string }>;
  label?: string;
}) {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-white rounded-lg shadow-lg border border-border/60 px-3 py-2 text-xs">
      <p className="font-medium text-foreground mb-1">{label}</p>
      {payload.map((p) => (
        <p key={p.name} style={{ color: p.color }} className="flex items-center gap-1.5">
          <span className="size-2 rounded-full" style={{ backgroundColor: p.color }} />
          {p.name === 'montant' ? 'Montant' : 'Volume'} :{' '}
          {p.name === 'montant' ? formatXOF(p.value) : p.value}
        </p>
      ))}
    </div>
  );
}

// ---------------------------------------------------------------------------
// DashboardView
// ---------------------------------------------------------------------------

export default function DashboardView() {
  const navigate = useRouterStore((s) => s.navigate);

  // Store data
  const txStats = useTransactionsStore((s) => s.getStats());
  const recentTx = useTransactionsStore((s) => s.getRecentTransactions(10));
  const agents = useAgentsStore((s) => s.agents);
  const clients = useUsersStore((s) => s.clients);
  const unreadNotifications = useNotificationsStore((s) =>
    s.notifications.filter((n) => !n.read),
  );

  // Derived stats
  const activeAgents = agents.filter((a) => a.status === 'APPROVED').length;
  const globalFloat = agents.reduce((sum, a) => sum + a.floatBalance, 0);
  const fraudAlerts = unreadNotifications.filter((n) => n.type === 'FRAUD_ALERT').length;

  // Chart data – generated once
  const chartData = useMemo(() => generateChartData(), []);

  // ---- Table columns for recent transactions ----
  const columns = useMemo(
    () => [
      {
        key: 'ref' as const,
        label: 'Référence',
        width: '180px',
        render: (_: unknown, row: Record<string, unknown>) => (
          <span className="font-mono text-xs text-[var(--ricash-primary)]">
            {String(row.ref)}
          </span>
        ),
      },
      {
        key: 'type' as const,
        label: 'Type',
        render: (_: unknown, row: Record<string, unknown>) => (
          <span>{TRANSACTION_TYPE_LABELS[row.type as keyof typeof TRANSACTION_TYPE_LABELS] ?? String(row.type)}</span>
        ),
      },
      {
        key: 'amount' as const,
        label: 'Montant (XOF)',
        sortable: true,
        render: (_: unknown, row: Record<string, unknown>) => (
          <span className="font-semibold">{formatXOF(Number(row.amount))}</span>
        ),
      },
      {
        key: 'status' as const,
        label: 'Statut',
        render: (_: unknown, row: Record<string, unknown>) => (
          <StatusBadge status={String(row.status)} type="transaction" />
        ),
      },
      {
        key: 'clientName' as const,
        label: 'Client',
      },
      {
        key: 'createdAt' as const,
        label: 'Date',
        render: (_: unknown, row: Record<string, unknown>) => (
          <span className="text-sm text-muted-foreground">{formatDate(String(row.createdAt))}</span>
        ),
      },
    ],
    [],
  );

  // ---- Handlers ----
  const handleRowClick = (row: Record<string, unknown>) => {
    navigate('transaction-detail', { id: String(row.id) }, [
      { label: 'Tableau de bord', route: 'dashboard' },
      { label: 'Transactions', route: 'transactions' },
      { label: String(row.ref) },
    ]);
  };

  // ---- Render ----
  return (
    <div className="space-y-6">
      {/* Page Header */}
      <PageHeader title="Tableau de bord" subtitle="Vue d'ensemble de l'activité Ricash" />

      {/* ---- Stat Cards Grid ---- */}
      <section className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Volume transactions"
          value={txStats.total}
          icon={<ArrowLeftRight className="size-5" />}
          color="blue"
          trend={{ value: 12, direction: 'up' }}
        />
        <StatCard
          title="Montant traité"
          value={formatXOF(txStats.totalAmount)}
          icon={<Banknote className="size-5" />}
          color="green"
          trend={{ value: 8, direction: 'up' }}
        />
        <StatCard
          title="Transactions en attente"
          value={txStats.pending}
          icon={<Clock className="size-5" />}
          color="orange"
        />
        <StatCard
          title="Alertes fraude"
          value={Math.max(fraudAlerts, 2)}
          icon={<AlertTriangle className="size-5" />}
          color="red"
        />
        <StatCard
          title="Agents actifs"
          value={activeAgents}
          icon={<UserCheck className="size-5" />}
          color="blue"
        />
        <StatCard
          title="Clients enregistrés"
          value={clients.length}
          icon={<Users className="size-5" />}
          color="green"
          trend={{ value: 15, direction: 'up' }}
        />
        <StatCard
          title="Float global"
          value={formatXOF(globalFloat)}
          icon={<Wallet className="size-5" />}
          color="green"
        />
      </section>

      {/* ---- Chart + Alerts Row ---- */}
      <section className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Line Chart */}
        <Card className="xl:col-span-2 bg-white ricash-card-shadow">
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-semibold">
              Évolution des transactions (30 jours)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-72 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={chartData} margin={{ top: 5, right: 20, left: 10, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                  <XAxis
                    dataKey="date"
                    tick={{ fontSize: 11, fill: 'var(--muted-foreground)' }}
                    tickLine={false}
                    axisLine={{ stroke: 'var(--border)' }}
                  />
                  <YAxis
                    yAxisId="montant"
                    tick={{ fontSize: 11, fill: 'var(--muted-foreground)' }}
                    tickLine={false}
                    axisLine={false}
                    tickFormatter={(v: number) => `${(v / 1000).toFixed(0)}k`}
                  />
                  <YAxis
                    yAxisId="volume"
                    orientation="right"
                    tick={{ fontSize: 11, fill: 'var(--muted-foreground)' }}
                    tickLine={false}
                    axisLine={false}
                  />
                  <Tooltip content={<ChartTooltip />} />
                  <Line
                    yAxisId="montant"
                    type="monotone"
                    dataKey="montant"
                    name="montant"
                    stroke="#1A3C6E"
                    strokeWidth={2.5}
                    dot={false}
                    activeDot={{ r: 5, strokeWidth: 0, fill: '#1A3C6E' }}
                  />
                  <Line
                    yAxisId="volume"
                    type="monotone"
                    dataKey="volume"
                    name="volume"
                    stroke="#00B0A0"
                    strokeWidth={2}
                    dot={false}
                    activeDot={{ r: 4, strokeWidth: 0, fill: '#00B0A0' }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
            {/* Legend */}
            <div className="flex items-center justify-center gap-6 mt-2 text-xs text-muted-foreground">
              <span className="flex items-center gap-1.5">
                <span className="size-3 rounded-full bg-[#1A3C6E]" />
                Montant (XOF)
              </span>
              <span className="flex items-center gap-1.5">
                <span className="size-3 rounded-full bg-[#00B0A0]" />
                Volume
              </span>
            </div>
          </CardContent>
        </Card>

        {/* Active Alerts */}
        <Card className="bg-white ricash-card-shadow flex flex-col">
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-semibold flex items-center gap-2">
              <AlertTriangle className="size-4 text-orange-500" />
              Alertes actives
              {unreadNotifications.length > 0 && (
                <span className="ml-auto bg-red-500 text-white text-[10px] font-bold rounded-full size-5 flex items-center justify-center">
                  {unreadNotifications.length}
                </span>
              )}
            </CardTitle>
          </CardHeader>
          <CardContent className="flex-1 overflow-y-auto max-h-80 ricash-scroll">
            {unreadNotifications.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-8 text-muted-foreground">
                <Bell className="size-8 mb-2 opacity-40" />
                <p className="text-sm">Aucune alerte active</p>
              </div>
            ) : (
              <ul className="space-y-3">
                {unreadNotifications.map((notif) => (
                  <li
                    key={notif.id}
                    className={`rounded-lg border p-3 ${ALERT_BG_MAP[notif.type] ?? 'bg-muted/50 border-border'}`}
                  >
                    <div className="flex items-start gap-3">
                      <div className="shrink-0 mt-0.5">
                        {ALERT_ICON_MAP[notif.type] ?? <Bell className="size-5 text-muted-foreground" />}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-foreground leading-tight">
                          {notif.title}
                        </p>
                        <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">
                          {notif.message}
                        </p>
                        <p className="text-[10px] text-muted-foreground/70 mt-1">
                          {formatTimeAgo(notif.createdAt)}
                        </p>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>
      </section>

      {/* ---- Recent Transactions Table ---- */}
      <section>
        <h2 className="text-base font-semibold text-foreground mb-3">
          Transactions récentes
        </h2>
        <DataTable
          columns={columns}
          data={recentTx as unknown as Record<string, unknown>[]}
          onRowClick={handleRowClick}
          emptyMessage="Aucune transaction récente"
        />
      </section>
    </div>
  );
}
