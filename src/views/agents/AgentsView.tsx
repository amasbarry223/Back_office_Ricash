'use client';

import React, { useState, useMemo, useCallback } from 'react';
import {
  Download,
  MoreHorizontal,
  Eye,
  Wallet,
  CheckCircle,
  Ban,
  RotateCcw,
  Search,
  Users,
  Clock,
  AlertTriangle,
  UserCheck,
} from 'lucide-react';
import PageHeader from '@/components/common/PageHeader';
import DataTable from '@/components/common/DataTable';
import StatusBadge from '@/components/common/StatusBadge';
import RoleGuard from '@/components/common/RoleGuard';
import ConfirmDialog from '@/components/common/ConfirmDialog';
import EmptyState from '@/components/common/EmptyState';
import { useRouterStore, buildBreadcrumb } from '@/stores/router-store';
import { useAgentsStore } from '@/stores/agents-store';
import {
  computeAgentStats,
  filterAgents,
  LOW_FLOAT_THRESHOLD,
  type AgentQuickFilter,
} from '@/lib/agent-ui';
import { toast } from 'sonner';
import { AGENT_STATUS_LABELS, type Agent, type AgentStatus } from '@/types';
import { formatXOF, formatDate } from '@/lib/format';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';
import { cn } from '@/lib/utils';
import { DEFAULT_TABLE_PER_PAGE } from '@/lib/pagination';
import { useTablePagination } from '@/hooks/use-table-pagination';

const PER_PAGE = DEFAULT_TABLE_PER_PAGE;

const QUICK_FILTERS: { id: AgentQuickFilter; label: string; icon: React.ElementType }[] = [
  { id: 'all', label: 'Tous', icon: Users },
  { id: 'approved', label: 'Approuvés', icon: UserCheck },
  { id: 'pending', label: 'En attente', icon: Clock },
  { id: 'suspended', label: 'Suspendus', icon: Ban },
  { id: 'low_float', label: 'Float bas', icon: AlertTriangle },
];

function StatCard({
  label,
  value,
  hint,
  accent,
  warning,
}: {
  label: string;
  value: number;
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
      <p
        className={cn(
          'mt-1 text-2xl font-bold tabular-nums',
          accent && 'text-ricash-brand',
          warning && 'text-ricash-warning',
          !accent && !warning && 'text-foreground',
        )}
      >
        {value}
      </p>
      {hint && <p className="mt-0.5 text-[11px] text-muted-foreground">{hint}</p>}
    </div>
  );
}

export default function AgentsView() {
  const agents = useAgentsStore((s) => s.agents);
  const updateAgentStatus = useAgentsStore((s) => s.updateAgentStatus);
  const navigate = useRouterStore((s) => s.navigate);

  const [searchQuery, setSearchQuery] = useState('');
  const [quickFilter, setQuickFilter] = useState<AgentQuickFilter>('all');
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [confirmAction, setConfirmAction] = useState<{
    id: string;
    action: 'suspend' | 'reactivate';
    label: string;
  } | null>(null);

  const stats = useMemo(() => computeAgentStats(agents), [agents]);

  const filteredAgents = useMemo(
    () => filterAgents(agents, searchQuery, quickFilter),
    [agents, searchQuery, quickFilter],
  );

  const {
    paginatedItems: paginatedAgents,
    pagination,
    onPageChange,
    resetPage,
  } = useTablePagination(filteredAgents, PER_PAGE);

  const filterCounts = useMemo(
    () => ({
      all: agents.length,
      approved: agents.filter((a) => a.status === 'APPROVED').length,
      pending: agents.filter((a) => a.status === 'PENDING').length,
      suspended: agents.filter((a) => a.status === 'SUSPENDED').length,
      low_float: agents.filter((a) => a.floatBalance < LOW_FLOAT_THRESHOLD).length,
    }),
    [agents],
  );

  const handleQuickFilter = (id: AgentQuickFilter) => {
    setQuickFilter(id);
    resetPage();
  };

  const handleSearchChange = (value: string) => {
    setSearchQuery(value);
    resetPage();
  };

  const handleToggleStatus = useCallback((agentId: string, currentStatus: AgentStatus) => {
    if (currentStatus === 'APPROVED') {
      setConfirmAction({ id: agentId, action: 'suspend', label: 'Suspendre cet agent' });
      setConfirmOpen(true);
    } else if (currentStatus === 'SUSPENDED') {
      setConfirmAction({ id: agentId, action: 'reactivate', label: 'Réactiver cet agent' });
      setConfirmOpen(true);
    }
  }, []);

  const handleConfirmAction = useCallback(() => {
    if (!confirmAction) return;
    if (confirmAction.action === 'suspend') {
      updateAgentStatus(confirmAction.id, 'SUSPENDED');
      toast.success('Agent suspendu', { description: 'Le statut a été mis à jour avec succès.' });
    } else {
      updateAgentStatus(confirmAction.id, 'APPROVED');
      toast.success('Agent réactivé', { description: 'Le statut a été mis à jour avec succès.' });
    }
    setConfirmOpen(false);
    setConfirmAction(null);
  }, [confirmAction, updateAgentStatus]);

  const handleExportCSV = useCallback(() => {
    if (filteredAgents.length === 0) return;
    const headers = [
      'Code Agent',
      'Nom',
      'Float actuel',
      'Statut',
      'Tx du mois',
      'Commission',
      'Date inscription',
    ].join(',');
    const rows = filteredAgents.map((a) =>
      [
        a.code,
        `"${a.firstName} ${a.lastName}"`,
        a.floatBalance,
        AGENT_STATUS_LABELS[a.status],
        a.monthlyTransactions,
        `${a.commissionRate}%`,
        a.createdAt,
      ].join(','),
    );
    const csv = [headers, ...rows].join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `agents-export-${new Date().toISOString().slice(0, 10)}.csv`;
    link.click();
    URL.revokeObjectURL(url);
    toast.success('Export CSV généré');
  }, [filteredAgents]);

  const navigateToDetail = (agent: Agent) => {
    const fullName = `${agent.firstName} ${agent.lastName}`;
    navigate(
      'agent-detail',
      { id: agent.id },
      buildBreadcrumb([
        { label: 'Agents', route: 'agents' },
        { label: fullName },
      ]),
    );
  };

  const navigateToFloat = (agent: Agent) => {
    const fullName = `${agent.firstName} ${agent.lastName}`;
    navigate(
      'agent-float',
      { id: agent.id },
      buildBreadcrumb([
        { label: 'Agents', route: 'agents' },
        { label: fullName, route: 'agent-detail', params: { id: agent.id } },
        { label: 'Gestion Float' },
      ]),
    );
  };

  const tableData = useMemo(
    () =>
      paginatedAgents.map((a) => ({
        id: a.id,
        code: a.code,
        fullName: `${a.firstName} ${a.lastName}`,
        floatBalance: a.floatBalance,
        status: a.status,
        monthlyTransactions: a.monthlyTransactions,
        commissionRate: a.commissionRate,
        createdAt: a.createdAt,
      })),
    [paginatedAgents],
  );

  const columns = [
    {
      key: 'fullName',
      label: 'Agent',
      sortable: true,
      render: (_value: unknown, row: Record<string, unknown>) => {
        const code = row.code as string;
        const name = row.fullName as string;
        return (
          <div className="min-w-0">
            <p className="font-medium text-foreground truncate">{name}</p>
            <p className="font-mono text-xs text-muted-foreground">{code}</p>
          </div>
        );
      },
    },
    {
      key: 'floatBalance',
      label: 'Float actuel',
      sortable: true,
      width: '150px',
      render: (value: unknown) => {
        const amount = value as number;
        const isLow = amount < LOW_FLOAT_THRESHOLD;
        return (
          <div className="flex flex-col gap-0.5">
            <span className={cn('font-medium tabular-nums', isLow && 'text-ricash-warning')}>
              {formatXOF(amount)}
            </span>
            {isLow && (
              <Badge variant="warning" className="w-fit text-[10px] px-1.5 py-0">
                Float bas
              </Badge>
            )}
          </div>
        );
      },
    },
    {
      key: 'status',
      label: 'Statut',
      width: '120px',
      render: (value: unknown) => <StatusBadge status={value as string} type="agent" />,
    },
    {
      key: 'monthlyTransactions',
      label: 'Tx du mois',
      sortable: true,
      width: '100px',
      render: (value: unknown) => (
        <span className="tabular-nums font-medium">{value as number}</span>
      ),
    },
    {
      key: 'commissionRate',
      label: 'Commission',
      width: '100px',
      render: (value: unknown) => (
        <span className="font-medium tabular-nums">{(value as number)}%</span>
      ),
    },
    {
      key: 'createdAt',
      label: 'Inscription',
      sortable: true,
      width: '120px',
      render: (value: unknown) => (
        <span className="text-sm text-muted-foreground">{formatDate(value as string)}</span>
      ),
    },
    {
      key: 'actions',
      label: '',
      width: '56px',
      render: (_value: unknown, row: Record<string, unknown>) => {
        const agent = agents.find((a) => a.id === row.id);
        if (!agent) return null;
        const currentStatus = agent.status;

        return (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon-sm" onClick={(e) => e.stopPropagation()}>
                <MoreHorizontal className="size-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              <DropdownMenuItem onClick={() => navigateToDetail(agent)}>
                <Eye className="size-4 mr-2" />
                Voir profil
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => navigateToFloat(agent)}>
                <Wallet className="size-4 mr-2" />
                Gérer float
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              {currentStatus === 'PENDING' && (
                <RoleGuard roles={['super_admin', 'admin']}>
                  <DropdownMenuItem onClick={() => navigateToDetail(agent)}>
                    <CheckCircle className="size-4 mr-2 text-ricash-success" />
                    Approuver
                  </DropdownMenuItem>
                </RoleGuard>
              )}
              {currentStatus === 'APPROVED' && (
                <RoleGuard roles={['super_admin', 'admin']}>
                  <DropdownMenuItem
                    onClick={() => handleToggleStatus(agent.id, currentStatus)}
                  >
                    <Ban className="size-4 mr-2 text-ricash-warning" />
                    Suspendre
                  </DropdownMenuItem>
                </RoleGuard>
              )}
              {currentStatus === 'SUSPENDED' && (
                <RoleGuard roles={['super_admin', 'admin']}>
                  <DropdownMenuItem
                    onClick={() => handleToggleStatus(agent.id, currentStatus)}
                  >
                    <RotateCcw className="size-4 mr-2 text-ricash-success" />
                    Réactiver
                  </DropdownMenuItem>
                </RoleGuard>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        );
      },
    },
  ];

  const hasActiveFilters = searchQuery.trim() !== '' || quickFilter !== 'all';

  return (
    <div className="space-y-6">
      <PageHeader
        title="Agents"
        subtitle="Réseau d'agents — float, commissions et statuts opérationnels"
        breadcrumb={[
          { label: 'Tableau de bord', onClick: () => navigate('dashboard') },
          { label: 'Agents' },
        ]}
      >
        <Button
          variant="outline"
          size="sm"
          onClick={handleExportCSV}
          disabled={filteredAgents.length === 0}
          className="gap-1.5"
        >
          <Download className="size-4" />
          Exporter
        </Button>
      </PageHeader>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
        <StatCard label="Total" value={stats.total} hint="Agents enregistrés" accent />
        <StatCard label="Approuvés" value={stats.approved} hint="Opérationnels" />
        <StatCard label="En attente" value={stats.pending} hint="À valider" />
        <StatCard label="Suspendus" value={stats.suspended} hint="Accès bloqué" />
        <StatCard
          label="Float bas"
          value={stats.lowFloat}
          hint={`< ${formatXOF(LOW_FLOAT_THRESHOLD)}`}
          warning
        />
      </div>

      <div className="flex gap-3 rounded-xl border border ricash-alert-warning px-4 py-3">
        <Wallet className="size-5 shrink-0 text-ricash-info mt-0.5" aria-hidden />
        <div className="min-w-0">
          <p className="text-sm font-medium text-foreground">
            Gestion du réseau agents
          </p>
          <p className="mt-0.5 text-xs text-muted-foreground">
            Consultez le float, approuvez les nouveaux agents et suivez les commissions. Les agents
            avec un float inférieur à {formatXOF(LOW_FLOAT_THRESHOLD)} sont signalés automatiquement.
          </p>
        </div>
      </div>

      <Card className="shadow-sm border-border/80 overflow-hidden">
        <CardHeader className="border-b bg-muted/20 pb-4 space-y-4">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <CardTitle className="text-base font-semibold">
              Liste des agents
              <span className="ml-2 text-sm font-normal text-muted-foreground">
                ({filteredAgents.length})
              </span>
            </CardTitle>
            <div className="relative w-full sm:max-w-xs">
              <Search
                className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground"
                aria-hidden
              />
              <Input
                type="search"
                placeholder="Rechercher par nom, code ou téléphone…"
                value={searchQuery}
                onChange={(e) => handleSearchChange(e.target.value)}
                className="pl-9"
                aria-label="Rechercher un agent"
              />
            </div>
          </div>

          <div
            className="flex flex-wrap gap-2"
            role="tablist"
            aria-label="Filtrer les agents"
          >
            {QUICK_FILTERS.map(({ id, label, icon: Icon }) => {
              const count = filterCounts[id];
              const isActive = quickFilter === id;
              return (
                <button
                  key={id}
                  type="button"
                  role="tab"
                  aria-selected={isActive}
                  onClick={() => handleQuickFilter(id)}
                  className={cn(
                    'inline-flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-xs font-medium transition-all',
                    isActive
                      ? 'border-ricash-brand/40 bg-ricash-brand/10 text-ricash-brand shadow-sm'
                      : 'border-border bg-card text-muted-foreground hover:border-ricash-brand/30 hover:text-foreground',
                    id === 'low_float' &&
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
                      id === 'low_float' && isActive && 'bg-[var(--ricash-warning-bg)]',
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
          {filteredAgents.length === 0 ? (
            <EmptyState
              title={hasActiveFilters ? 'Aucun résultat' : 'Aucun agent'}
              description={
                hasActiveFilters
                  ? 'Modifiez la recherche ou réinitialisez les filtres.'
                  : 'Aucun agent n\'est enregistré pour le moment.'
              }
              icon={<Users className="size-8 text-muted-foreground" />}
              action={
                hasActiveFilters ? (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setSearchQuery('');
                      setQuickFilter('all');
                      resetPage();
                    }}
                  >
                    Réinitialiser les filtres
                  </Button>
                ) : undefined
              }
            />
          ) : (
            <DataTable
              columns={columns}
              data={tableData as unknown as Record<string, unknown>[]}
              pagination={pagination}
              onPageChange={onPageChange}
              emptyMessage="Aucun agent trouvé"
            />
          )}
        </CardContent>
      </Card>

      <ConfirmDialog
        open={confirmOpen}
        onOpenChange={setConfirmOpen}
        title={confirmAction?.label ?? 'Confirmer'}
        description={
          confirmAction?.action === 'suspend'
            ? 'Cet agent ne pourra plus traiter de transactions tant qu\'il est suspendu.'
            : 'Cet agent retrouvera ses droits opérationnels après réactivation.'
        }
        confirmLabel={confirmAction?.action === 'suspend' ? 'Suspendre' : 'Réactiver'}
        variant={confirmAction?.action === 'suspend' ? 'destructive' : 'default'}
        onConfirm={handleConfirmAction}
      />
    </div>
  );
}
