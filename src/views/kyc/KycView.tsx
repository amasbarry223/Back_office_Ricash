'use client';

import React, { useState, useMemo, useCallback } from 'react';
import {
  Eye,
  IdCard,
  CheckCircle2,
  XCircle,
  Search,
  ShieldCheck,
  Clock,
  FileWarning,
  MoreHorizontal,
  Download,
  Users,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import DataTable from '@/components/common/DataTable';
import StatusBadge from '@/components/common/StatusBadge';
import PageHeader from '@/components/common/PageHeader';
import RoleGuard from '@/components/common/RoleGuard';
import ConfirmDialog from '@/components/common/ConfirmDialog';
import EmptyState from '@/components/common/EmptyState';
import { useRouterStore, buildBreadcrumb } from '@/stores/router-store';
import { useKycStore } from '@/stores/kyc-store';
import { useAuthStore } from '@/stores/auth-store';
import {
  computeKycStats,
  filterKycRecords,
  KYC_LEVEL_BADGE_CLASS,
  type KycQuickFilter,
} from '@/lib/kyc-ui';
import {
  DOCUMENT_TYPE_LABELS,
  type DocumentType,
  type KycRecord,
} from '@/types';
import { formatDate } from '@/lib/format';
import { toast } from 'sonner';
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

const QUICK_FILTERS: { id: KycQuickFilter; label: string; icon: React.ElementType }[] = [
  { id: 'all', label: 'Tous', icon: Users },
  { id: 'pending', label: 'En attente', icon: Clock },
  { id: 'verified', label: 'Vérifiés', icon: CheckCircle2 },
  { id: 'rejected', label: 'Rejetés', icon: XCircle },
  { id: 'expired', label: 'Expirés', icon: FileWarning },
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

function KycLevelBadge({ level }: { level: number }) {
  return (
    <span
      className={cn(
        'inline-flex items-center px-2 py-0.5 rounded-md border text-xs font-medium',
        KYC_LEVEL_BADGE_CLASS[level] ?? 'bg-gray-100 text-gray-600 border-gray-200',
      )}
    >
      Niveau {level}
    </span>
  );
}

export default function KycView() {
  const records = useKycStore((s) => s.records);
  const approveKyc = useKycStore((s) => s.approveKyc);
  const rejectKyc = useKycStore((s) => s.rejectKyc);
  const navigate = useRouterStore((s) => s.navigate);
  const user = useAuthStore((s) => s.user);

  const [searchQuery, setSearchQuery] = useState('');
  const [quickFilter, setQuickFilter] = useState<KycQuickFilter>('all');
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [confirmAction, setConfirmAction] = useState<{
    id: string;
    action: 'approve' | 'reject';
    label: string;
  } | null>(null);

  const stats = useMemo(() => computeKycStats(records), [records]);

  const filteredRecords = useMemo(
    () => filterKycRecords(records, searchQuery, quickFilter),
    [records, searchQuery, quickFilter],
  );

  const {
    paginatedItems: paginatedRecords,
    pagination,
    onPageChange,
    resetPage,
  } = useTablePagination(filteredRecords, PER_PAGE);

  const filterCounts = useMemo(
    () => ({
      all: records.length,
      pending: records.filter((r) => r.status === 'PENDING').length,
      verified: records.filter((r) => r.status === 'VERIFIED').length,
      rejected: records.filter((r) => r.status === 'REJECTED').length,
      expired: records.filter((r) => r.status === 'EXPIRED').length,
    }),
    [records],
  );

  const handleQuickFilter = (id: KycQuickFilter) => {
    setQuickFilter(id);
    resetPage();
  };

  const handleSearchChange = (value: string) => {
    setSearchQuery(value);
    resetPage();
  };

  const handleApprove = useCallback((id: string) => {
    setConfirmAction({ id, action: 'approve', label: 'Approuver le dossier KYC' });
    setConfirmOpen(true);
  }, []);

  const handleReject = useCallback((id: string) => {
    setConfirmAction({ id, action: 'reject', label: 'Rejeter le dossier KYC' });
    setConfirmOpen(true);
  }, []);

  const handleConfirmAction = useCallback(() => {
    if (!confirmAction || !user) return;
    if (confirmAction.action === 'approve') {
      approveKyc(confirmAction.id, user.id);
      toast.success('Dossier KYC approuvé avec succès');
    } else {
      rejectKyc(confirmAction.id, user.id, 'Rejeté par un administrateur');
      toast.error('Dossier KYC rejeté');
    }
    setConfirmOpen(false);
    setConfirmAction(null);
  }, [confirmAction, user, approveKyc, rejectKyc]);

  const handleExportCSV = useCallback(() => {
    if (filteredRecords.length === 0) return;
    const headers = [
      'ID',
      'Client',
      'Téléphone',
      'Niveau',
      'Statut',
      'Document',
      'Soumis le',
    ].join(',');
    const rows = filteredRecords.map((r) =>
      [
        r.id,
        `"${r.clientName}"`,
        r.clientPhone,
        r.currentLevel,
        r.status,
        DOCUMENT_TYPE_LABELS[r.documentType],
        r.submittedAt,
      ].join(','),
    );
    const csv = [headers, ...rows].join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `kyc-export-${new Date().toISOString().slice(0, 10)}.csv`;
    link.click();
    URL.revokeObjectURL(url);
    toast.success('Export CSV généré');
  }, [filteredRecords]);

  const navigateToDetail = (record: KycRecord) => {
    navigate(
      'kyc-detail',
      { id: record.id },
      buildBreadcrumb([
        { label: 'KYC & Conformité', route: 'kyc' },
        { label: record.clientName },
      ]),
    );
  };

  const tableData = useMemo(
    () =>
      paginatedRecords.map((r) => ({
        id: r.id,
        clientId: r.clientId,
        clientPhone: r.clientPhone,
        clientName: r.clientName,
        currentLevel: r.currentLevel,
        status: r.status,
        documentType: r.documentType,
        submittedAt: r.submittedAt,
      })),
    [paginatedRecords],
  );

  const columns = useMemo(
    () => [
      {
        key: 'clientName',
        label: 'Client',
        sortable: true,
        render: (_val: unknown, row: Record<string, unknown>) => (
          <div className="min-w-0">
            <p className="font-medium text-sm truncate">{String(row.clientName)}</p>
            <p className="text-xs text-muted-foreground">{String(row.clientPhone)}</p>
          </div>
        ),
      },
      {
        key: 'clientId',
        label: 'ID client',
        width: '100px',
        render: (val: unknown) => (
          <span className="font-mono text-xs text-muted-foreground">{String(val)}</span>
        ),
      },
      {
        key: 'currentLevel',
        label: 'Niveau',
        width: '100px',
        render: (val: unknown) => <KycLevelBadge level={Number(val)} />,
      },
      {
        key: 'status',
        label: 'Statut',
        width: '120px',
        render: (val: unknown) => <StatusBadge status={String(val)} type="kyc" />,
      },
      {
        key: 'documentType',
        label: 'Document',
        width: '160px',
        render: (val: unknown) => (
          <span className="text-sm">
            {DOCUMENT_TYPE_LABELS[val as DocumentType] ?? String(val)}
          </span>
        ),
      },
      {
        key: 'submittedAt',
        label: 'Soumis le',
        width: '120px',
        render: (val: unknown) => (
          <span className="text-sm text-muted-foreground">{formatDate(String(val))}</span>
        ),
      },
      {
        key: 'actions',
        label: '',
        width: '56px',
        render: (_val: unknown, row: Record<string, unknown>) => {
          const record = records.find((r) => r.id === row.id);
          if (!record) return null;
          const isPending = record.status === 'PENDING';

          return (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon-sm" onClick={(e) => e.stopPropagation()}>
                  <MoreHorizontal className="size-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48">
                <DropdownMenuItem onClick={() => navigateToDetail(record)}>
                  <Eye className="size-4 mr-2" />
                  Voir dossier
                </DropdownMenuItem>
                {isPending && (
                  <>
                    <DropdownMenuSeparator />
                    <RoleGuard roles={['super_admin', 'admin']}>
                      <DropdownMenuItem onClick={() => handleApprove(record.id)}>
                        <CheckCircle2 className="size-4 mr-2 text-emerald-600" />
                        Valider
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => handleReject(record.id)}>
                        <XCircle className="size-4 mr-2 text-red-600" />
                        Rejeter
                      </DropdownMenuItem>
                    </RoleGuard>
                  </>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
          );
        },
      },
    ],
    [records, navigateToDetail, handleApprove, handleReject],
  );

  const hasActiveFilters = searchQuery.trim() !== '' || quickFilter !== 'all';

  return (
    <div className="space-y-6">
      <PageHeader
        title="KYC & Conformité"
        subtitle="Vérification d'identité, documents et conformité réglementaire"
        breadcrumb={[
          { label: 'Tableau de bord', onClick: () => navigate('dashboard') },
          { label: 'KYC & Conformité' },
        ]}
      >
        <Button
          variant="outline"
          size="sm"
          onClick={handleExportCSV}
          disabled={filteredRecords.length === 0}
          className="gap-1.5"
        >
          <Download className="size-4" />
          Exporter
        </Button>
      </PageHeader>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
        <StatCard label="Total dossiers" value={stats.total} hint="Enregistrés" accent />
        <StatCard
          label="En attente"
          value={stats.pending}
          hint="À traiter en priorité"
          warning={stats.pending > 0}
        />
        <StatCard label="Vérifiés" value={stats.verified} hint="Conformes" />
        <StatCard label="Rejetés" value={stats.rejected} hint="Non conformes" />
        <StatCard label="Expirés" value={stats.expired} hint="À renouveler" />
      </div>

      {stats.pending > 0 && (
        <div className="flex gap-3 rounded-xl border border-amber-200/80 bg-amber-50/80 px-4 py-3 dark:border-amber-900/40 dark:bg-amber-950/30">
          <Clock className="size-5 shrink-0 text-amber-700 dark:text-amber-400 mt-0.5" aria-hidden />
          <div className="min-w-0">
            <p className="text-sm font-medium text-amber-900 dark:text-amber-100">
              {stats.pending} dossier{stats.pending > 1 ? 's' : ''} en attente de validation
            </p>
            <p className="mt-0.5 text-xs text-amber-800/90 dark:text-amber-200/80">
              Traitez les soumissions en attente pour maintenir la conformité des comptes clients.
            </p>
          </div>
        </div>
      )}

      <div className="flex gap-3 rounded-xl border border-sky-200/80 bg-sky-50/80 px-4 py-3 dark:border-sky-900/40 dark:bg-sky-950/30">
        <ShieldCheck className="size-5 shrink-0 text-sky-700 dark:text-sky-400 mt-0.5" aria-hidden />
        <div className="min-w-0">
          <p className="text-sm font-medium text-sky-900 dark:text-sky-100">
            Conformité KYC / AML
          </p>
          <p className="mt-0.5 text-xs text-sky-800/90 dark:text-sky-200/80">
            Vérifiez les pièces d&apos;identité, validez ou rejetez les dossiers. Les niveaux 0 à 3
            déterminent les plafonds opérationnels du client.
          </p>
        </div>
      </div>

      <Card className="shadow-sm border-border/80 overflow-hidden">
        <CardHeader className="border-b bg-muted/20 pb-4 space-y-4">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <CardTitle className="text-base font-semibold">
              Dossiers KYC
              <span className="ml-2 text-sm font-normal text-muted-foreground">
                ({filteredRecords.length})
              </span>
            </CardTitle>
            <div className="relative w-full sm:max-w-xs">
              <Search
                className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground"
                aria-hidden
              />
              <Input
                type="search"
                placeholder="Rechercher client, téléphone, ID…"
                value={searchQuery}
                onChange={(e) => handleSearchChange(e.target.value)}
                className="pl-9"
                aria-label="Rechercher un dossier KYC"
              />
            </div>
          </div>

          <div className="flex flex-wrap gap-2" role="tablist" aria-label="Filtrer les dossiers KYC">
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
                    id === 'pending' &&
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
                      id === 'pending' && isActive && 'bg-amber-200/60 dark:bg-amber-900/40',
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
          {filteredRecords.length === 0 ? (
            <EmptyState
              title={hasActiveFilters ? 'Aucun résultat' : 'Aucun dossier KYC'}
              description={
                hasActiveFilters
                  ? 'Modifiez la recherche ou réinitialisez les filtres.'
                  : 'Les soumissions clients apparaîtront ici.'
              }
              icon={<IdCard className="size-8 text-muted-foreground" />}
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
              emptyMessage="Aucun dossier KYC trouvé"
            />
          )}
        </CardContent>
      </Card>

      <ConfirmDialog
        open={confirmOpen}
        onOpenChange={setConfirmOpen}
        title={confirmAction?.label ?? 'Confirmer'}
        description={
          confirmAction?.action === 'approve'
            ? 'Le niveau de vérification du client sera mis à jour après approbation.'
            : 'Le client devra soumettre de nouveaux documents conformes.'
        }
        confirmLabel={confirmAction?.action === 'approve' ? 'Approuver' : 'Rejeter'}
        variant={confirmAction?.action === 'reject' ? 'destructive' : 'default'}
        onConfirm={handleConfirmAction}
      />
    </div>
  );
}
