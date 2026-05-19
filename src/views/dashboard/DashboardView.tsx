'use client';

import React, { useMemo, useState } from 'react';
import dynamic from 'next/dynamic';
import {
  ArrowLeftRight,
  Banknote,
  Bell,
  CheckCircle,
  Clock,
  AlertTriangle,
  Users,
  Wallet,
  IdCard,
  Search,
  TrendingUp,
  XCircle,
  ArrowRight,
  Inbox,
} from 'lucide-react';
const DashboardVolumeChart = dynamic(
  () => import('@/components/dashboard/DashboardVolumeChart'),
  {
    ssr: false,
    loading: () => <div className="h-72 w-full shimmer rounded-lg" />,
  },
);
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import DataTable from '@/components/common/DataTable';
import StatusBadge from '@/components/common/StatusBadge';
import PageHeader from '@/components/common/PageHeader';
import EmptyState from '@/components/common/EmptyState';
import { useRouterStore } from '@/stores/router-store';
import { useTransactionsStore } from '@/stores/transactions-store';
import { useAgentsStore } from '@/stores/agents-store';
import { useUsersStore } from '@/stores/users-store';
import { useKycStore } from '@/stores/kyc-store';
import { useNotificationsStore } from '@/stores/notifications-store';
import { NOTIFICATION_TYPE_UI } from '@/lib/notification-ui';
import { LOW_FLOAT_THRESHOLD } from '@/lib/agent-ui';
import {
  computeDashboardStats,
  filterDashboardTransactions,
  generateChartData,
  getTxFilterCounts,
  type DashboardTxFilter,
} from '@/lib/dashboard-ui';
import { TRANSACTION_TYPE_LABELS, NOTIFICATION_TYPE_LABELS } from '@/types';
import { formatXOF, formatDate, formatTimeAgo } from '@/lib/format';
import { cn } from '@/lib/utils';

const TX_FILTERS: { id: DashboardTxFilter; label: string; icon: React.ElementType }[] = [
  { id: 'all', label: 'Toutes', icon: Inbox },
  { id: 'pending', label: 'En attente', icon: Clock },
  { id: 'success', label: 'Réussies', icon: CheckCircle },
  { id: 'failed', label: 'Échouées', icon: XCircle },
];

const RECENT_LIMIT = 10;

function StatCard({
  label,
  value,
  hint,
  accent,
  warning,
  onClick,
}: {
  label: string;
  value: React.ReactNode;
  hint?: string;
  accent?: boolean;
  warning?: boolean;
  onClick?: () => void;
}) {
  const Comp = onClick ? 'button' : 'div';
  return (
    <Comp
      type={onClick ? 'button' : undefined}
      onClick={onClick}
      className={cn(
        'rounded-xl border p-4 text-left transition-all w-full',
        onClick && 'hover:shadow-md hover:border-ricash-brand/30 cursor-pointer',
        accent && 'border-ricash-amber-border/60 bg-gradient-to-br from-ricash-amber-bg to-background',
        warning &&
          'border-[var(--ricash-warning-border)] bg-gradient-to-br from-[var(--ricash-warning-bg)] to-background',
        !accent && !warning && 'border-border/60 bg-card',
      )}
    >
      <p className="text-xs font-medium text-muted-foreground">{label}</p>
      <div
        className={cn(
          'mt-1 text-2xl font-bold tabular-nums',
          accent && 'text-ricash-amber',
          warning && 'text-ricash-warning',
          !accent && !warning && 'text-foreground',
        )}
      >
        {value}
      </div>
      {hint && <p className="mt-0.5 text-[11px] text-muted-foreground">{hint}</p>}
    </Comp>
  );
}

export default function DashboardView() {
  const navigate = useRouterStore((s) => s.navigate);

  const transactions = useTransactionsStore((s) => s.transactions);
  const agentsCount = useAgentsStore((s) => s.agents.length);
  const activeAgentsCount = useAgentsStore(
    (s) => s.agents.filter((a) => a.status === 'APPROVED').length,
  );
  const globalFloat = useAgentsStore((s) =>
    s.agents.reduce((sum, a) => sum + a.floatBalance, 0),
  );
  const lowFloatAgents = useAgentsStore(
    (s) => s.agents.filter((a) => a.floatBalance < LOW_FLOAT_THRESHOLD).length,
  );
  const floatRequestsPending = useAgentsStore(
    (s) => s.floatRequests.filter((r) => r.status === 'PENDING').length,
  );
  const clientsCount = useUsersStore((s) => s.clients.length);
  const unreadCount = useNotificationsStore(
    (s) => s.notifications.filter((n) => !n.read).length,
  );
  const fraudAlerts = useNotificationsStore(
    (s) => s.notifications.filter((n) => !n.read && n.type === 'FRAUD_ALERT').length,
  );
  const kycPending = useKycStore((s) => s.records.filter((r) => r.status === 'PENDING').length);
  const notifications = useNotificationsStore((s) => s.notifications);
  const unreadNotifications = useMemo(
    () => notifications.filter((n) => !n.read),
    [notifications],
  );

  const [txFilter, setTxFilter] = useState<DashboardTxFilter>('all');
  const [txSearch, setTxSearch] = useState('');

  const stats = useMemo(
    () =>
      computeDashboardStats(
        transactions,
        unreadCount,
        fraudAlerts,
        activeAgentsCount,
        clientsCount,
        globalFloat,
        kycPending,
        lowFloatAgents,
        floatRequestsPending,
      ),
    [
      transactions,
      unreadCount,
      fraudAlerts,
      activeAgentsCount,
      clientsCount,
      globalFloat,
      kycPending,
      lowFloatAgents,
      floatRequestsPending,
    ],
  );

  const chartData = useMemo(() => generateChartData(), []);

  const filteredRecentTx = useMemo(() => {
    const filtered = filterDashboardTransactions(transactions, txSearch, txFilter);
    return filtered.slice(0, RECENT_LIMIT);
  }, [transactions, txSearch, txFilter]);

  const txFilterCounts = useMemo(() => getTxFilterCounts(transactions), [transactions]);

  const hasPriorityAlerts =
    stats.fraudAlerts > 0 ||
    stats.txPending > 0 ||
    stats.kycPending > 0 ||
    stats.lowFloatAgents > 0 ||
    stats.floatRequestsPending > 0;

  const columns = useMemo(
    () => [
      {
        key: 'ref' as const,
        label: 'Référence',
        width: '160px',
        render: (_: unknown, row: Record<string, unknown>) => (
          <span className="font-mono text-xs text-ricash-brand">{String(row.ref)}</span>
        ),
      },
      {
        key: 'type' as const,
        label: 'Type',
        render: (_: unknown, row: Record<string, unknown>) => (
          <span className="text-sm">
            {TRANSACTION_TYPE_LABELS[row.type as keyof typeof TRANSACTION_TYPE_LABELS] ??
              String(row.type)}
          </span>
        ),
      },
      {
        key: 'amount' as const,
        label: 'Montant',
        sortable: true,
        render: (_: unknown, row: Record<string, unknown>) => (
          <span className="font-semibold tabular-nums">{formatXOF(Number(row.amount))}</span>
        ),
      },
      {
        key: 'status' as const,
        label: 'Statut',
        width: '120px',
        render: (_: unknown, row: Record<string, unknown>) => (
          <StatusBadge status={String(row.status)} type="transaction" />
        ),
      },
      {
        key: 'clientName' as const,
        label: 'Client',
        render: (val: unknown) => (
          <span className="text-sm truncate max-w-[140px] block">{String(val)}</span>
        ),
      },
      {
        key: 'createdAt' as const,
        label: 'Date',
        width: '120px',
        render: (_: unknown, row: Record<string, unknown>) => (
          <span className="text-sm text-muted-foreground">{formatDate(String(row.createdAt))}</span>
        ),
      },
    ],
    [],
  );

  const handleRowClick = (row: Record<string, unknown>) => {
    navigate('transaction-detail', { id: String(row.id) }, [
      { label: 'Tableau de bord', route: 'dashboard' },
      { label: 'Transactions', route: 'transactions' },
      { label: String(row.ref) },
    ]);
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Tableau de bord"
        subtitle="Vue d'ensemble de l'activité Ricash — indicateurs clés, alertes et transactions récentes"
        breadcrumb={[{ label: 'Tableau de bord' }]}
      >
        <Badge variant="brand" className="gap-1.5">
          <TrendingUp className="size-3.5" aria-hidden />
          Temps réel (mock)
        </Badge>
      </PageHeader>

      {/* KPI principaux */}
      <section aria-label="Indicateurs principaux">
        <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
          <StatCard
            label="Volume transactions"
            value={stats.txTotal}
            hint="Toutes opérations"
            accent
            onClick={() => navigate('transactions')}
          />
          <StatCard
            label="Montant traité"
            value={formatXOF(stats.txSuccessAmount)}
            hint="Transactions réussies"
            onClick={() => navigate('transactions')}
          />
          <StatCard
            label="En attente"
            value={stats.txPending}
            hint="À valider ou traiter"
            warning={stats.txPending > 0}
            onClick={() => navigate('transactions')}
          />
          <StatCard
            label="Alertes non lues"
            value={stats.unreadAlerts}
            hint={stats.fraudAlerts > 0 ? `${stats.fraudAlerts} fraude(s)` : 'Boîte de réception'}
            warning={stats.unreadAlerts > 0}
            onClick={() => navigate('notifications')}
          />
        </div>
      </section>

      {/* KPI réseau & conformité */}
      <section aria-label="Réseau et conformité">
        <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
          <StatCard
            label="Agents actifs"
            value={stats.activeAgents}
            hint={`${agentsCount} au total`}
            onClick={() => navigate('agents')}
          />
          <StatCard
            label="Clients"
            value={stats.totalClients}
            hint="Comptes enregistrés"
            onClick={() => navigate('clients')}
          />
          <StatCard
            label="Float global"
            value={formatXOF(stats.globalFloat)}
            hint={
              stats.lowFloatAgents > 0
                ? `${stats.lowFloatAgents} agent(s) sous seuil`
                : 'Réseau agents'
            }
            warning={stats.lowFloatAgents > 0}
            onClick={() => navigate('float')}
          />
          <StatCard
            label="KYC en attente"
            value={stats.kycPending}
            hint="Dossiers à traiter"
            warning={stats.kycPending > 0}
            onClick={() => navigate('kyc')}
          />
        </div>
      </section>

      {/* Bandeaux contextuels */}
      {hasPriorityAlerts && (
        <div className="space-y-2" role="region" aria-label="Alertes prioritaires">
          {stats.fraudAlerts > 0 && (
            <div className="flex flex-col gap-2 rounded-xl border ricash-alert-danger px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-start gap-3">
                <AlertTriangle className="size-5 shrink-0 text-ricash-danger mt-0.5" aria-hidden />
                <div>
                  <p className="text-sm font-medium text-foreground">
                    {stats.fraudAlerts} alerte{stats.fraudAlerts > 1 ? 's' : ''} de fraude active{stats.fraudAlerts > 1 ? 's' : ''}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Activité suspecte détectée — vérification recommandée
                  </p>
                </div>
              </div>
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="shrink-0 border-[var(--ricash-danger-border)] text-ricash-danger hover:bg-[var(--ricash-danger-bg)]"
                onClick={() => navigate('notifications')}
              >
                Voir les alertes
              </Button>
            </div>
          )}
          {stats.txPending > 0 && (
            <div className="flex flex-col gap-2 rounded-xl border ricash-alert-warning px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-start gap-3">
                <Clock className="size-5 shrink-0 text-ricash-warning mt-0.5" aria-hidden />
                <div>
                  <p className="text-sm font-medium text-foreground">
                    {stats.txPending} transaction{stats.txPending > 1 ? 's' : ''} en attente
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Traitement ou validation en cours
                  </p>
                </div>
              </div>
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="shrink-0"
                onClick={() => navigate('transactions')}
              >
                Consulter
              </Button>
            </div>
          )}
          {stats.floatRequestsPending > 0 && (
            <div className="flex flex-col gap-2 rounded-xl border border-ricash-brand/25 bg-ricash-brand/5 px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-start gap-3">
                <Wallet className="size-5 shrink-0 text-ricash-brand mt-0.5" aria-hidden />
                <div>
                  <p className="text-sm font-medium text-foreground">
                    {stats.floatRequestsPending} demande{stats.floatRequestsPending > 1 ? 's' : ''}{' '}
                    de float en attente
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Recharges agents à approuver
                  </p>
                </div>
              </div>
              <Button
                type="button"
                variant="primary"
                size="sm"
                className="shrink-0"
                onClick={() => navigate('float')}
              >
                Traiter
              </Button>
            </div>
          )}
        </div>
      )}

      {/* Graphique + alertes */}
      <section className="grid grid-cols-1 gap-6 xl:grid-cols-3">
        <Card className="xl:col-span-2 shadow-sm border-border/80">
          <CardHeader className="border-b bg-muted/20 pb-4">
            <CardTitle className="text-base font-semibold flex items-center gap-2">
              <ArrowLeftRight className="size-4 text-ricash-brand" aria-hidden />
              Évolution des transactions (30 jours)
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-4">
            <DashboardVolumeChart data={chartData} />
          </CardContent>
        </Card>

        <Card className="flex flex-col shadow-sm border-border/80">
          <CardHeader className="border-b bg-muted/20 pb-4">
            <CardTitle className="text-base font-semibold flex items-center gap-2">
              <Bell className="size-4 text-ricash-brand" aria-hidden />
              Alertes actives
              {unreadNotifications.length > 0 && (
                <Badge variant="error" className="ml-auto h-5 min-w-[20px] justify-center px-1.5 text-[10px]">
                  {unreadNotifications.length}
                </Badge>
              )}
            </CardTitle>
          </CardHeader>
          <CardContent className="flex-1 overflow-y-auto max-h-80 p-4 ricash-scroll">
            {unreadNotifications.length === 0 ? (
              <EmptyState
                title="Aucune alerte"
                description="Tout est à jour pour le moment."
                icon={<Bell className="size-8 text-muted-foreground" />}
              />
            ) : (
              <ul className="space-y-2">
                {unreadNotifications.slice(0, 6).map((notif) => {
                  const cfg = NOTIFICATION_TYPE_UI[notif.type];
                  const Icon = cfg.icon;
                  return (
                    <li key={notif.id}>
                      <button
                        type="button"
                        onClick={() => navigate('notifications')}
                        className="flex w-full gap-3 rounded-lg border border-border/60 bg-card p-3 text-left transition-colors hover:border-ricash-brand/30 hover:bg-muted/30"
                      >
                        <span
                          className={cn(
                            'flex size-9 shrink-0 items-center justify-center rounded-lg',
                            cfg.bgClass,
                          )}
                        >
                          <Icon className={cn('size-4', cfg.colorClass)} aria-hidden />
                        </span>
                        <div className="min-w-0 flex-1">
                          <p className="text-sm font-medium text-foreground line-clamp-1">
                            {notif.title}
                          </p>
                          <p className="text-[11px] text-muted-foreground">
                            {NOTIFICATION_TYPE_LABELS[notif.type]}
                          </p>
                          <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">
                            {notif.message}
                          </p>
                          <p className="text-[10px] text-muted-foreground/70 mt-1">
                            {formatTimeAgo(notif.createdAt)}
                          </p>
                        </div>
                      </button>
                    </li>
                  );
                })}
              </ul>
            )}
            {unreadNotifications.length > 6 && (
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="mt-3 w-full text-ricash-brand"
                onClick={() => navigate('notifications')}
              >
                Voir toutes ({unreadNotifications.length})
              </Button>
            )}
          </CardContent>
        </Card>
      </section>

      {/* Transactions récentes */}
      <section aria-label="Transactions récentes">
        <Card className="shadow-sm border-border/80 overflow-hidden">
          <CardHeader className="border-b bg-muted/20 pb-4">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <CardTitle className="text-base font-semibold flex items-center gap-2">
                <Banknote className="size-4 text-ricash-brand" aria-hidden />
                Transactions récentes
              </CardTitle>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => navigate('transactions')}
              >
                Voir tout
                <ArrowRight className="size-4 ml-1" />
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-4 p-4 sm:p-6">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex flex-wrap gap-2" role="tablist" aria-label="Filtrer les transactions">
                {TX_FILTERS.map(({ id, label, icon: Icon }) => {
                  const isActive = txFilter === id;
                  return (
                    <button
                      key={id}
                      type="button"
                      role="tab"
                      aria-selected={isActive}
                      onClick={() => setTxFilter(id)}
                      className={cn(
                        'inline-flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-xs font-medium transition-all',
                        isActive
                          ? 'border-ricash-brand/40 bg-ricash-brand/10 text-ricash-brand shadow-sm'
                          : 'border-border bg-card text-muted-foreground hover:border-ricash-brand/30 hover:text-foreground',
                      )}
                    >
                      <Icon className="size-3.5" aria-hidden />
                      {label}
                      <span
                        className={cn(
                          'rounded-full px-1.5 py-0.5 text-[10px] tabular-nums',
                          isActive ? 'bg-ricash-brand/15' : 'bg-muted',
                        )}
                      >
                        {txFilterCounts[id]}
                      </span>
                    </button>
                  );
                })}
              </div>

              <div className="relative w-full sm:max-w-xs">
                <Search
                  className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground"
                  aria-hidden
                />
                <Input
                  type="search"
                  placeholder="Réf., client, agent…"
                  value={txSearch}
                  onChange={(e) => setTxSearch(e.target.value)}
                  className="pl-9"
                  aria-label="Rechercher une transaction"
                />
              </div>
            </div>

            {filteredRecentTx.length === 0 ? (
              <EmptyState
                title={txSearch || txFilter !== 'all' ? 'Aucun résultat' : 'Aucune transaction'}
                description={
                  txSearch
                    ? 'Essayez un autre mot-clé.'
                    : 'Les dernières opérations apparaîtront ici.'
                }
                icon={<ArrowLeftRight className="size-8 text-muted-foreground" />}
                action={
                  txSearch || txFilter !== 'all' ? (
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setTxSearch('');
                        setTxFilter('all');
                      }}
                    >
                      Réinitialiser
                    </Button>
                  ) : (
                    <Button
                      type="button"
                      variant="primary"
                      size="sm"
                      onClick={() => navigate('transactions')}
                    >
                      Voir les transactions
                    </Button>
                  )
                }
              />
            ) : (
              <DataTable
                columns={columns}
                data={filteredRecentTx as unknown as Record<string, unknown>[]}
                onRowClick={handleRowClick}
                emptyMessage="Aucune transaction"
              />
            )}
          </CardContent>
        </Card>
      </section>
    </div>
  );
}
