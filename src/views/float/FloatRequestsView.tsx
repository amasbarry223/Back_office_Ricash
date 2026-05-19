'use client';

import React, { useState, useMemo, useCallback } from 'react';
import {
  CheckCircle,
  XCircle,
  MessageSquare,
  Search,
  Wallet,
  Clock,
  History,
  Download,
  Ban,
} from 'lucide-react';
import { toast } from 'sonner';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import DataTable from '@/components/common/DataTable';
import StatusBadge from '@/components/common/StatusBadge';
import PageHeader from '@/components/common/PageHeader';
import RoleGuard from '@/components/common/RoleGuard';
import ConfirmDialog from '@/components/common/ConfirmDialog';
import EmptyState from '@/components/common/EmptyState';
import { useRouterStore } from '@/stores/router-store';
import { useAuthStore } from '@/stores/auth-store';
import { useAgentsStore } from '@/stores/agents-store';
import {
  computeFloatRequestStats,
  filterFloatRequests,
  FLOAT_REQUESTS_PER_PAGE,
  type FloatRequestQuickFilter,
} from '@/lib/float-request-ui';
import { useTablePagination } from '@/hooks/use-table-pagination';
import type { FloatRequest } from '@/types';
import { formatXOF, formatDateTime } from '@/lib/format';
import { cn } from '@/lib/utils';

const TAB_META: Record<string, { label: string; description: string }> = {
  pending: {
    label: 'En attente',
    description: 'Demandes à approuver ou rejeter — traitement prioritaire',
  },
  history: {
    label: 'Historique',
    description: 'Toutes les demandes de recharge float, tous statuts confondus',
  },
};

const HISTORY_FILTERS: { id: FloatRequestQuickFilter; label: string; icon: React.ElementType }[] = [
  { id: 'all', label: 'Toutes', icon: History },
  { id: 'pending', label: 'En attente', icon: Clock },
  { id: 'approved', label: 'Approuvées', icon: CheckCircle },
  { id: 'rejected', label: 'Rejetées', icon: Ban },
];

function StatCard({
  label,
  value,
  hint,
  accent,
  warning,
}: {
  label: string;
  value: React.ReactNode;
  hint?: string;
  accent?: boolean;
  warning?: boolean;
}) {
  return (
    <div
      className={cn(
        'rounded-xl border p-4 transition-colors',
        accent && 'border-ricash-brand/30 bg-gradient-to-br from-ricash-brand/10 to-background',
        warning && 'border-[var(--ricash-warning-border)] bg-gradient-to-br from-[var(--ricash-warning-bg)] to-background',
        !accent && !warning && 'border-border/60 bg-card',
      )}
    >
      <p className="text-xs font-medium text-muted-foreground">{label}</p>
      <div
        className={cn(
          'mt-1 text-2xl font-bold tabular-nums',
          accent && 'text-ricash-brand',
          warning && 'text-ricash-warning',
          !accent && !warning && 'text-foreground',
        )}
      >
        {value}
      </div>
      {hint && <p className="mt-0.5 text-[11px] text-muted-foreground">{hint}</p>}
    </div>
  );
}

function AgentCell({ code, name }: { code: string; name: string }) {
  return (
    <div className="min-w-0">
      <p className="font-mono text-xs font-medium">{code}</p>
      <p className="text-xs text-muted-foreground truncate">{name}</p>
    </div>
  );
}

export default function FloatRequestsView() {
  const navigate = useRouterStore((s) => s.navigate);
  const user = useAuthStore((s) => s.user);
  const floatRequests = useAgentsStore((s) => s.floatRequests);
  const approveFloatRequest = useAgentsStore((s) => s.approveFloatRequest);
  const rejectFloatRequest = useAgentsStore((s) => s.rejectFloatRequest);

  const [rejectingId, setRejectingId] = useState<string | null>(null);
  const [rejectComment, setRejectComment] = useState('');
  const [activeTab, setActiveTab] = useState('pending');
  const [searchQuery, setSearchQuery] = useState('');
  const [historyFilter, setHistoryFilter] = useState<FloatRequestQuickFilter>('all');

  const [confirmOpen, setConfirmOpen] = useState(false);
  const [confirmAction, setConfirmAction] = useState<{ id: string; action: 'approve' } | null>(
    null,
  );

  const stats = useMemo(() => computeFloatRequestStats(floatRequests), [floatRequests]);

  const pendingRequests = useMemo(
    () => floatRequests.filter((r) => r.status === 'PENDING'),
    [floatRequests],
  );

  const filteredHistory = useMemo(
    () => filterFloatRequests(floatRequests, searchQuery, historyFilter),
    [floatRequests, searchQuery, historyFilter],
  );

  const {
    paginatedItems: paginatedPending,
    pagination: pendingPagination,
    onPageChange: onPendingPageChange,
    resetPage: resetPendingPage,
  } = useTablePagination(pendingRequests, FLOAT_REQUESTS_PER_PAGE);

  const {
    paginatedItems: paginatedHistory,
    pagination: historyPagination,
    onPageChange: onHistoryPageChange,
    resetPage: resetHistoryPage,
  } = useTablePagination(filteredHistory, FLOAT_REQUESTS_PER_PAGE);

  const handleTabChange = useCallback(
    (tab: string) => {
      setActiveTab(tab);
      if (tab === 'pending') resetPendingPage();
      else resetHistoryPage();
    },
    [resetPendingPage, resetHistoryPage],
  );

  const historyFilterCounts = useMemo(
    () => ({
      all: floatRequests.length,
      pending: floatRequests.filter((r) => r.status === 'PENDING').length,
      approved: floatRequests.filter((r) => r.status === 'APPROVED').length,
      rejected: floatRequests.filter((r) => r.status === 'REJECTED').length,
    }),
    [floatRequests],
  );

  const activeTabMeta = TAB_META[activeTab];

  const handleApprove = useCallback((id: string) => {
    setConfirmAction({ id, action: 'approve' });
    setConfirmOpen(true);
  }, []);

  const handleConfirmApprove = useCallback(() => {
    if (!confirmAction || !user?.email) return;
    approveFloatRequest(confirmAction.id, user.email);
    toast.success('Demande de float approuvée', {
      description: 'Le montant sera crédité sur le float de l\'agent.',
    });
    setConfirmOpen(false);
    setConfirmAction(null);
  }, [confirmAction, user?.email, approveFloatRequest]);

  const handleReject = useCallback(
    (id: string) => {
      if (!user?.email) return;
      if (!rejectComment.trim()) {
        toast.error('Veuillez saisir un commentaire de refus');
        return;
      }
      rejectFloatRequest(id, user.email, rejectComment.trim());
      setRejectingId(null);
      setRejectComment('');
      toast.success('Demande de float rejetée');
    },
    [user?.email, rejectComment, rejectFloatRequest],
  );

  const handleExportCSV = useCallback(() => {
    const data = activeTab === 'pending' ? pendingRequests : filteredHistory;
    if (data.length === 0) return;
    const headers = ['ID', 'Agent', 'Nom', 'Montant', 'Statut', 'Justification', 'Date'].join(',');
    const rows = data.map((r) =>
      [
        r.id,
        r.agentCode,
        `"${r.agentName}"`,
        r.amount,
        r.status,
        `"${r.justification}"`,
        r.requestedAt,
      ].join(','),
    );
    const csv = [headers, ...rows].join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `float-demandes-${new Date().toISOString().slice(0, 10)}.csv`;
    link.click();
    URL.revokeObjectURL(url);
    toast.success('Export CSV généré');
  }, [activeTab, pendingRequests, filteredHistory]);

  const pendingColumns = useMemo(
    () => [
      {
        key: 'id',
        label: 'N°',
        width: '90px',
        render: (val: unknown) => (
          <span className="font-mono text-xs text-muted-foreground">{String(val)}</span>
        ),
      },
      {
        key: 'agentCode',
        label: 'Agent',
        render: (_: unknown, row: Record<string, unknown>) => {
          const req = row as unknown as FloatRequest;
          return <AgentCell code={req.agentCode} name={req.agentName} />;
        },
      },
      {
        key: 'amount',
        label: 'Montant',
        sortable: true,
        width: '130px',
        render: (_: unknown, row: Record<string, unknown>) => {
          const req = row as unknown as FloatRequest;
          return <span className="font-semibold tabular-nums text-sm">{formatXOF(req.amount)}</span>;
        },
      },
      {
        key: 'justification',
        label: 'Justification',
        render: (_: unknown, row: Record<string, unknown>) => {
          const req = row as unknown as FloatRequest;
          return (
            <p className="text-sm text-muted-foreground max-w-xs truncate" title={req.justification}>
              {req.justification}
            </p>
          );
        },
      },
      {
        key: 'requestedAt',
        label: 'Demandé le',
        width: '150px',
        render: (_: unknown, row: Record<string, unknown>) => {
          const req = row as unknown as FloatRequest;
          return <span className="text-sm">{formatDateTime(req.requestedAt)}</span>;
        },
      },
      {
        key: 'actions',
        label: 'Actions',
        width: '280px',
        render: (_: unknown, row: Record<string, unknown>) => {
          const req = row as unknown as FloatRequest;

          if (rejectingId === req.id) {
            return (
              <div className="space-y-2 min-w-[220px]" onClick={(e) => e.stopPropagation()}>
                <Textarea
                  placeholder="Motif du refus (obligatoire)…"
                  value={rejectComment}
                  onChange={(e) => setRejectComment(e.target.value)}
                  className="min-h-[60px] text-sm"
                  autoFocus
                />
                <div className="flex items-center gap-1.5">
                  <Button
                    size="sm"
                    variant="destructive"
                    className="h-7 text-xs"
                    onClick={() => handleReject(req.id)}
                  >
                    <XCircle className="size-3.5 mr-1" />
                    Confirmer le refus
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    className="h-7 text-xs"
                    onClick={() => {
                      setRejectingId(null);
                      setRejectComment('');
                    }}
                  >
                    Annuler
                  </Button>
                </div>
              </div>
            );
          }

          return (
            <div className="flex items-center gap-1.5" onClick={(e) => e.stopPropagation()}>
              <RoleGuard roles={['super_admin', 'admin']}>
                <Button
                  size="sm"
                  variant="outline"
                  className="h-8 text-xs border-[var(--ricash-success-border)] text-ricash-success hover:bg-[var(--ricash-success-bg)]"
                  onClick={() => handleApprove(req.id)}
                >
                  <CheckCircle className="size-3.5 mr-1" />
                  Approuver
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  className="h-8 text-xs border-[var(--ricash-danger-border)] text-ricash-danger hover:bg-[var(--ricash-danger-bg)]"
                  onClick={() => setRejectingId(req.id)}
                >
                  <XCircle className="size-3.5 mr-1" />
                  Rejeter
                </Button>
              </RoleGuard>
            </div>
          );
        },
      },
    ],
    [rejectingId, rejectComment, handleApprove, handleReject],
  );

  const historyColumns = useMemo(
    () => [
      {
        key: 'id',
        label: 'N°',
        width: '90px',
        render: (val: unknown) => (
          <span className="font-mono text-xs text-muted-foreground">{String(val)}</span>
        ),
      },
      {
        key: 'agentCode',
        label: 'Agent',
        render: (_: unknown, row: Record<string, unknown>) => {
          const req = row as unknown as FloatRequest;
          return <AgentCell code={req.agentCode} name={req.agentName} />;
        },
      },
      {
        key: 'amount',
        label: 'Montant',
        width: '130px',
        render: (_: unknown, row: Record<string, unknown>) => {
          const req = row as unknown as FloatRequest;
          return <span className="font-medium tabular-nums text-sm">{formatXOF(req.amount)}</span>;
        },
      },
      {
        key: 'status',
        label: 'Statut',
        width: '120px',
        render: (_: unknown, row: Record<string, unknown>) => {
          const req = row as unknown as FloatRequest;
          return <StatusBadge status={req.status} type="float_request" />;
        },
      },
      {
        key: 'requestedAt',
        label: 'Date',
        width: '150px',
        render: (_: unknown, row: Record<string, unknown>) => {
          const req = row as unknown as FloatRequest;
          return <span className="text-sm text-muted-foreground">{formatDateTime(req.requestedAt)}</span>;
        },
      },
      {
        key: 'justification',
        label: 'Justification',
        render: (_: unknown, row: Record<string, unknown>) => {
          const req = row as unknown as FloatRequest;
          return (
            <p className="text-sm text-muted-foreground max-w-[200px] truncate" title={req.justification}>
              {req.justification}
            </p>
          );
        },
      },
      {
        key: 'comment',
        label: 'Commentaire',
        render: (_: unknown, row: Record<string, unknown>) => {
          const req = row as unknown as FloatRequest;
          return req.comment ? (
            <div className="flex items-start gap-1.5 max-w-[180px]">
              <MessageSquare className="size-3.5 text-muted-foreground shrink-0 mt-0.5" />
              <p className="text-sm text-muted-foreground truncate" title={req.comment}>
                {req.comment}
              </p>
            </div>
          ) : (
            <span className="text-muted-foreground text-sm">—</span>
          );
        },
      },
    ],
    [],
  );

  const hasHistoryFilters = searchQuery.trim() !== '' || historyFilter !== 'all';

  return (
    <div className="space-y-6">
      <PageHeader
        title="Demandes de Float"
        subtitle="Recharge de trésorerie agents — validation et suivi des demandes"
        breadcrumb={[
          { label: 'Tableau de bord', onClick: () => navigate('dashboard') },
          { label: 'Demandes de Float' },
        ]}
      >
        <Button
          variant="outline"
          size="sm"
          onClick={handleExportCSV}
          disabled={
            (activeTab === 'pending' && pendingRequests.length === 0) ||
            (activeTab === 'history' && filteredHistory.length === 0)
          }
          className="gap-1.5"
        >
          <Download className="size-4" />
          Exporter
        </Button>
      </PageHeader>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <StatCard label="Total" value={stats.total} hint="Demandes enregistrées" accent />
        <StatCard
          label="En attente"
          value={stats.pending}
          hint={stats.pendingAmount > 0 ? formatXOF(stats.pendingAmount) : 'Aucun montant'}
          warning={stats.pending > 0}
        />
        <StatCard label="Approuvées" value={stats.approved} hint="Créditées" />
        <StatCard label="Rejetées" value={stats.rejected} hint="Non traitées" />
      </div>

      {stats.pending > 0 && (
        <div className="flex gap-3 rounded-xl border border ricash-alert-warning px-4 py-3">
          <Clock className="size-5 shrink-0 text-ricash-warning mt-0.5" aria-hidden />
          <div className="min-w-0">
            <p className="text-sm font-medium text-foreground">
              {stats.pending} demande{stats.pending > 1 ? 's' : ''} en attente —{' '}
              {formatXOF(stats.pendingAmount)} à valider
            </p>
            <p className="mt-0.5 text-xs text-muted-foreground">
              Traitez les demandes rapidement pour éviter l&apos;interruption d&apos;activité des
              agents.
            </p>
          </div>
        </div>
      )}

      <div className="flex gap-3 rounded-xl border border ricash-alert-warning px-4 py-3">
        <Wallet className="size-5 shrink-0 text-ricash-info mt-0.5" aria-hidden />
        <div className="min-w-0">
          <p className="text-sm font-medium text-foreground">
            Gestion du float agents
          </p>
          <p className="mt-0.5 text-xs text-muted-foreground">
            Approuvez pour créditer le float de l&apos;agent. En cas de rejet, un commentaire
            explicatif est obligatoire.
          </p>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <div className="overflow-hidden rounded-xl border bg-card shadow-sm">
          <div className="overflow-x-auto border-b bg-muted/20 px-3 py-2 sm:px-4 ricash-scroll">
            <TabsList className="h-auto min-w-max w-full justify-start gap-1 bg-transparent p-0">
              <TabsTrigger
                value="pending"
                className="gap-2 px-3 py-2 h-auto data-[state=active]:bg-background data-[state=active]:text-ricash-brand data-[state=active]:shadow-sm border border-transparent data-[state=active]:border-border/60"
              >
                <Clock className="size-4 shrink-0" />
                En attente
                {stats.pending > 0 && (
                  <Badge variant="warning" className="h-5 min-w-[20px] px-1.5 text-[10px]">
                    {stats.pending}
                  </Badge>
                )}
              </TabsTrigger>
              <TabsTrigger
                value="history"
                className="gap-2 px-3 py-2 h-auto data-[state=active]:bg-background data-[state=active]:text-ricash-brand data-[state=active]:shadow-sm border border-transparent data-[state=active]:border-border/60"
              >
                <History className="size-4 shrink-0" />
                Historique
              </TabsTrigger>
            </TabsList>
          </div>
          {activeTabMeta && (
            <div className="border-b bg-muted/10 px-4 py-3">
              <p className="text-sm font-medium text-foreground">{activeTabMeta.label}</p>
              <p className="mt-0.5 text-xs text-muted-foreground">{activeTabMeta.description}</p>
            </div>
          )}
        </div>

        <TabsContent value="pending" className="mt-0 focus-visible:outline-none">
          <Card className="shadow-sm border-border/80 overflow-hidden">
            <CardHeader className="border-b bg-muted/20 pb-3">
              <CardTitle className="text-base font-semibold">
                File d&apos;attente
                <span className="ml-2 text-sm font-normal text-muted-foreground">
                  ({pendingRequests.length})
                </span>
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              {pendingRequests.length === 0 ? (
                <EmptyState
                  title="Aucune demande en attente"
                  description="Toutes les demandes de float ont été traitées."
                  icon={<CheckCircle className="size-8 text-ricash-success" />}
                />
              ) : (
                <DataTable
                  columns={pendingColumns}
                  data={paginatedPending as unknown as Record<string, unknown>[]}
                  pagination={pendingPagination}
                  onPageChange={onPendingPageChange}
                  emptyMessage="Aucune demande en attente"
                />
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="history" className="mt-0 focus-visible:outline-none">
          <Card className="shadow-sm border-border/80 overflow-hidden">
            <CardHeader className="border-b bg-muted/20 pb-4 space-y-4">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <CardTitle className="text-base font-semibold">
                  Historique complet
                  <span className="ml-2 text-sm font-normal text-muted-foreground">
                    ({filteredHistory.length})
                  </span>
                </CardTitle>
                <div className="relative w-full sm:max-w-xs">
                  <Search
                    className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground"
                    aria-hidden
                  />
                  <Input
                    type="search"
                    placeholder="Agent, N°, justification…"
                    value={searchQuery}
                    onChange={(e) => {
                      setSearchQuery(e.target.value);
                      resetHistoryPage();
                    }}
                    className="pl-9"
                    aria-label="Rechercher dans l'historique"
                  />
                </div>
              </div>
              <div className="flex flex-wrap gap-2" role="tablist" aria-label="Filtrer l'historique">
                {HISTORY_FILTERS.map(({ id, label, icon: Icon }) => {
                  const count = historyFilterCounts[id];
                  const isActive = historyFilter === id;
                  return (
                    <button
                      key={id}
                      type="button"
                      role="tab"
                      aria-selected={isActive}
                      onClick={() => {
                        setHistoryFilter(id);
                        resetHistoryPage();
                      }}
                      className={cn(
                        'inline-flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-xs font-medium transition-all',
                        isActive
                          ? 'border-ricash-brand/40 bg-ricash-brand/10 text-ricash-brand shadow-sm'
                          : 'border-border bg-card text-muted-foreground hover:border-ricash-brand/30 hover:text-foreground',
                        id === 'pending' &&
                          isActive &&
                          'border-[var(--ricash-warning-border)] bg-[var(--ricash-warning-bg)] text-ricash-warning',
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
                        {count}
                      </span>
                    </button>
                  );
                })}
              </div>
            </CardHeader>
            <CardContent className="p-0">
              {filteredHistory.length === 0 ? (
                <EmptyState
                  title={hasHistoryFilters ? 'Aucun résultat' : 'Aucune demande'}
                  description={
                    hasHistoryFilters
                      ? 'Modifiez la recherche ou les filtres.'
                      : 'Les demandes de recharge apparaîtront ici.'
                  }
                  icon={<Wallet className="size-8 text-muted-foreground" />}
                  action={
                    hasHistoryFilters ? (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setSearchQuery('');
                          setHistoryFilter('all');
                          resetHistoryPage();
                        }}
                      >
                        Réinitialiser
                      </Button>
                    ) : undefined
                  }
                />
              ) : (
                <DataTable
                  columns={historyColumns}
                  data={paginatedHistory as unknown as Record<string, unknown>[]}
                  pagination={historyPagination}
                  onPageChange={onHistoryPageChange}
                  emptyMessage="Aucune demande de float"
                />
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <ConfirmDialog
        open={confirmOpen}
        onOpenChange={setConfirmOpen}
        title="Approuver la demande"
        description="Le montant demandé sera crédité sur le float de l'agent. Cette action est irréversible."
        confirmLabel="Approuver"
        variant="default"
        onConfirm={handleConfirmApprove}
      />
    </div>
  );
}
