'use client';

import React, { useState, useMemo, useCallback } from 'react';
import {
  Download,
  MoreHorizontal,
  Eye,
  Ban,
  CheckCircle,
  ShieldCheck,
  Search,
  Users,
  UserCheck,
  UserX,
  IdCard,
  Wallet,
} from 'lucide-react';
import PageHeader from '@/components/common/PageHeader';
import DataTable from '@/components/common/DataTable';
import StatusBadge from '@/components/common/StatusBadge';
import RoleGuard from '@/components/common/RoleGuard';
import ConfirmDialog from '@/components/common/ConfirmDialog';
import EmptyState from '@/components/common/EmptyState';
import { useRouterStore, buildBreadcrumb } from '@/stores/router-store';
import { useUsersStore } from '@/stores/users-store';
import {
  computeClientStats,
  filterClients,
  KYC_VERIFIED_LEVEL,
  type ClientQuickFilter,
} from '@/lib/client-ui';
import { toast } from 'sonner';
import { COUNTRY_LABELS, type Client, type UserStatus } from '@/types';
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

const QUICK_FILTERS: { id: ClientQuickFilter; label: string; icon: React.ElementType }[] = [
  { id: 'all', label: 'Tous', icon: Users },
  { id: 'active', label: 'Actifs', icon: UserCheck },
  { id: 'suspended', label: 'Suspendus', icon: Ban },
  { id: 'inactive', label: 'Inactifs', icon: UserX },
  { id: 'kyc_pending', label: 'KYC incomplet', icon: IdCard },
  { id: 'kyc_verified', label: 'KYC validé', icon: ShieldCheck },
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
        warning && 'border-amber-300/60 bg-gradient-to-br from-amber-50/80 to-background dark:from-amber-950/20',
        !accent && !warning && 'border-border/60 bg-card',
      )}
    >
      <p className="text-xs font-medium text-muted-foreground">{label}</p>
      <p
        className={cn(
          'mt-1 text-2xl font-bold tabular-nums',
          accent && 'text-ricash-brand',
          warning && 'text-amber-600',
          !accent && !warning && 'text-foreground',
        )}
      >
        {value}
      </p>
      {hint && <p className="mt-0.5 text-[11px] text-muted-foreground">{hint}</p>}
    </div>
  );
}

export default function UsersView() {
  const clients = useUsersStore((s) => s.clients);
  const updateClientStatus = useUsersStore((s) => s.updateClientStatus);
  const updateClientKyc = useUsersStore((s) => s.updateClientKyc);
  const navigate = useRouterStore((s) => s.navigate);

  const [searchQuery, setSearchQuery] = useState('');
  const [quickFilter, setQuickFilter] = useState<ClientQuickFilter>('all');
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [confirmAction, setConfirmAction] = useState<{
    id: string;
    action: 'suspend' | 'activate' | 'forceKyc';
    label: string;
  } | null>(null);

  const stats = useMemo(() => computeClientStats(clients), [clients]);

  const filteredClients = useMemo(
    () => filterClients(clients, searchQuery, quickFilter),
    [clients, searchQuery, quickFilter],
  );

  const {
    paginatedItems: paginatedClients,
    pagination,
    onPageChange,
    resetPage,
  } = useTablePagination(filteredClients, PER_PAGE);

  const filterCounts = useMemo(
    () => ({
      all: clients.length,
      active: clients.filter((c) => c.status === 'ACTIVE').length,
      suspended: clients.filter((c) => c.status === 'SUSPENDED').length,
      inactive: clients.filter((c) => c.status === 'INACTIVE').length,
      kyc_pending: clients.filter((c) => c.kycLevel < KYC_VERIFIED_LEVEL).length,
      kyc_verified: clients.filter((c) => c.kycLevel >= KYC_VERIFIED_LEVEL).length,
    }),
    [clients],
  );

  const handleQuickFilter = (id: ClientQuickFilter) => {
    setQuickFilter(id);
    resetPage();
  };

  const handleSearchChange = (value: string) => {
    setSearchQuery(value);
    resetPage();
  };

  const handleToggleStatus = useCallback((clientId: string, currentStatus: UserStatus) => {
    const isSuspend = currentStatus === 'ACTIVE';
    setConfirmAction({
      id: clientId,
      action: isSuspend ? 'suspend' : 'activate',
      label: isSuspend ? 'Suspendre ce client' : 'Activer ce client',
    });
    setConfirmOpen(true);
  }, []);

  const handleForceKyc = useCallback((clientId: string) => {
    setConfirmAction({
      id: clientId,
      action: 'forceKyc',
      label: 'Forcer le KYC',
    });
    setConfirmOpen(true);
  }, []);

  const handleConfirmAction = useCallback(() => {
    if (!confirmAction) return;
    if (confirmAction.action === 'suspend') {
      updateClientStatus(confirmAction.id, 'SUSPENDED');
      toast.success('Client suspendu', { description: 'Le statut a été mis à jour avec succès.' });
    } else if (confirmAction.action === 'activate') {
      updateClientStatus(confirmAction.id, 'ACTIVE');
      toast.success('Client activé', { description: 'Le statut a été mis à jour avec succès.' });
    } else if (confirmAction.action === 'forceKyc') {
      updateClientKyc(confirmAction.id, 2);
      toast.success('KYC forcé', {
        description: `Le niveau KYC du client a été fixé au niveau ${KYC_VERIFIED_LEVEL}.`,
      });
    }
    setConfirmOpen(false);
    setConfirmAction(null);
  }, [confirmAction, updateClientStatus, updateClientKyc]);

  const handleExportCSV = useCallback(() => {
    if (filteredClients.length === 0) return;
    const headers = [
      'ID',
      'Téléphone',
      'Nom Complet',
      'Pays',
      'Statut',
      'Niveau KYC',
      'Solde',
      'Date inscription',
    ].join(',');
    const rows = filteredClients.map((c) =>
      [
        c.id,
        c.phone,
        `"${c.firstName} ${c.lastName}"`,
        COUNTRY_LABELS[c.country] ?? c.country,
        c.status,
        `Niveau ${c.kycLevel}`,
        c.balance,
        c.createdAt,
      ].join(','),
    );
    const csv = [headers, ...rows].join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `clients-export-${new Date().toISOString().slice(0, 10)}.csv`;
    link.click();
    URL.revokeObjectURL(url);
    toast.success('Export CSV généré');
  }, [filteredClients]);

  const navigateToClient = (client: Client) => {
    const fullName = `${client.firstName} ${client.lastName}`;
    navigate(
      'client-detail',
      { id: client.id },
      buildBreadcrumb([
        { label: 'Clients', route: 'clients' },
        { label: fullName },
      ]),
    );
  };

  const tableData = useMemo(
    () =>
      paginatedClients.map((c) => ({
        id: c.id,
        phone: c.phone,
        fullName: `${c.firstName} ${c.lastName}`,
        country: c.country,
        status: c.status,
        kycLevel: c.kycLevel,
        balance: c.balance,
        createdAt: c.createdAt,
      })),
    [paginatedClients],
  );

  const columns = [
    {
      key: 'fullName',
      label: 'Client',
      sortable: true,
      render: (_value: unknown, row: Record<string, unknown>) => {
        const phone = row.phone as string;
        const name = row.fullName as string;
        return (
          <div className="min-w-0">
            <p className="font-medium text-foreground truncate">{name}</p>
            <p className="text-xs text-muted-foreground">{phone}</p>
          </div>
        );
      },
    },
    {
      key: 'id',
      label: 'ID',
      sortable: true,
      width: '100px',
      render: (value: unknown) => (
        <span className="font-mono text-xs text-muted-foreground">{value as string}</span>
      ),
    },
    {
      key: 'country',
      label: 'Pays',
      sortable: true,
      width: '110px',
      render: (value: unknown) => (
        <span className="text-sm">{COUNTRY_LABELS[value as string] ?? (value as string)}</span>
      ),
    },
    {
      key: 'status',
      label: 'Statut',
      width: '120px',
      render: (value: unknown) => <StatusBadge status={value as string} type="user" />,
    },
    {
      key: 'kycLevel',
      label: 'KYC',
      width: '100px',
      render: (value: unknown) => {
        const level = value as number;
        const verified = level >= KYC_VERIFIED_LEVEL;
        return (
          <Badge variant={verified ? 'success' : 'warning'} className="text-xs font-medium">
            Niv. {level}
          </Badge>
        );
      },
    },
    {
      key: 'balance',
      label: 'Solde',
      sortable: true,
      width: '130px',
      render: (value: unknown) => (
        <span className="font-medium tabular-nums">{formatXOF(value as number)}</span>
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
        const client = clients.find((c) => c.id === row.id);
        if (!client) return null;
        const currentStatus = client.status;

        return (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon-sm" onClick={(e) => e.stopPropagation()}>
                <MoreHorizontal className="size-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              <DropdownMenuItem onClick={() => navigateToClient(client)}>
                <Eye className="size-4 mr-2" />
                Voir profil
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <RoleGuard roles={['super_admin', 'admin']}>
                {currentStatus === 'ACTIVE' ? (
                  <DropdownMenuItem
                    onClick={() => handleToggleStatus(client.id, currentStatus)}
                  >
                    <Ban className="size-4 mr-2 text-orange-600" />
                    Suspendre
                  </DropdownMenuItem>
                ) : (
                  <DropdownMenuItem
                    onClick={() => handleToggleStatus(client.id, currentStatus)}
                  >
                    <CheckCircle className="size-4 mr-2 text-emerald-600" />
                    Activer
                  </DropdownMenuItem>
                )}
              </RoleGuard>
              <RoleGuard roles={['super_admin', 'admin']}>
                <DropdownMenuItem onClick={() => handleForceKyc(client.id)}>
                  <ShieldCheck className="size-4 mr-2" />
                  Forcer KYC
                </DropdownMenuItem>
              </RoleGuard>
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
        title="Clients"
        subtitle="Base clients — identité, KYC, soldes et statuts de compte"
        breadcrumb={[
          { label: 'Tableau de bord', onClick: () => navigate('dashboard') },
          { label: 'Clients' },
        ]}
      >
        <Button
          variant="outline"
          size="sm"
          onClick={handleExportCSV}
          disabled={filteredClients.length === 0}
          className="gap-1.5"
        >
          <Download className="size-4" />
          Exporter
        </Button>
      </PageHeader>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <StatCard label="Total" value={stats.total} hint="Clients enregistrés" accent />
        <StatCard label="Actifs" value={stats.active} hint="Comptes opérationnels" />
        <StatCard label="Suspendus" value={stats.suspended} hint="Accès restreint" />
        <StatCard
          label="KYC incomplet"
          value={stats.kycPending}
          hint={`< niveau ${KYC_VERIFIED_LEVEL}`}
          warning
        />
      </div>

      <div className="flex gap-3 rounded-xl border border-sky-200/80 bg-sky-50/80 px-4 py-3 dark:border-sky-900/40 dark:bg-sky-950/30">
        <Wallet className="size-5 shrink-0 text-sky-700 dark:text-sky-400 mt-0.5" aria-hidden />
        <div className="min-w-0">
          <p className="text-sm font-medium text-sky-900 dark:text-sky-100">
            Gestion de la base clients
          </p>
          <p className="mt-0.5 text-xs text-sky-800/90 dark:text-sky-200/80">
            Consultez les profils, vérifiez le KYC et gérez les statuts. Les clients sous le niveau{' '}
            {KYC_VERIFIED_LEVEL} nécessitent une validation KYC complémentaire.
          </p>
        </div>
      </div>

      <Card className="shadow-sm border-border/80 overflow-hidden">
        <CardHeader className="border-b bg-muted/20 pb-4 space-y-4">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <CardTitle className="text-base font-semibold">
              Liste des clients
              <span className="ml-2 text-sm font-normal text-muted-foreground">
                ({filteredClients.length})
              </span>
            </CardTitle>
            <div className="relative w-full sm:max-w-xs">
              <Search
                className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground"
                aria-hidden
              />
              <Input
                type="search"
                placeholder="Rechercher par nom, téléphone ou ID…"
                value={searchQuery}
                onChange={(e) => handleSearchChange(e.target.value)}
                className="pl-9"
                aria-label="Rechercher un client"
              />
            </div>
          </div>

          <div className="flex flex-wrap gap-2" role="tablist" aria-label="Filtrer les clients">
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
                    id === 'kyc_pending' &&
                      isActive &&
                      'border-amber-400/50 bg-amber-50 text-amber-800 dark:bg-amber-950/40 dark:text-amber-300',
                  )}
                >
                  <Icon className="size-3.5" aria-hidden />
                  {label}
                  <span
                    className={cn(
                      'rounded-full px-1.5 py-0.5 text-[10px] tabular-nums',
                      isActive ? 'bg-ricash-brand/15' : 'bg-muted',
                      id === 'kyc_pending' && isActive && 'bg-amber-200/60 dark:bg-amber-900/40',
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
          {filteredClients.length === 0 ? (
            <EmptyState
              title={hasActiveFilters ? 'Aucun résultat' : 'Aucun client'}
              description={
                hasActiveFilters
                  ? 'Modifiez la recherche ou réinitialisez les filtres.'
                  : 'Aucun client enregistré pour le moment.'
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
              emptyMessage="Aucun client trouvé"
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
            ? 'Ce client ne pourra plus effectuer de transactions tant qu\'il est suspendu.'
            : confirmAction?.action === 'forceKyc'
              ? `Le niveau KYC sera forcé au niveau ${KYC_VERIFIED_LEVEL} sans validation documentaire.`
              : 'Ce client retrouvera l\'accès à ses opérations.'
        }
        confirmLabel={
          confirmAction?.action === 'suspend'
            ? 'Suspendre'
            : confirmAction?.action === 'forceKyc'
              ? 'Forcer KYC'
              : 'Activer'
        }
        variant={confirmAction?.action === 'suspend' ? 'destructive' : 'default'}
        onConfirm={handleConfirmAction}
      />
    </div>
  );
}
