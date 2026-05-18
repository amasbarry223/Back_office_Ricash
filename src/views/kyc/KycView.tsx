'use client';

import React, { useState, useMemo, useCallback } from 'react';
import { Eye, IdCard, CheckCircle2, XCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import DataTable from '@/components/common/DataTable';
import SearchBar from '@/components/common/SearchBar';
import StatusBadge from '@/components/common/StatusBadge';
import PageHeader from '@/components/common/PageHeader';
import RoleGuard from '@/components/common/RoleGuard';
import ConfirmDialog from '@/components/common/ConfirmDialog';
import { useRouterStore, buildBreadcrumb } from '@/stores/router-store';
import { useKycStore } from '@/stores/kyc-store';
import { useAuthStore } from '@/stores/auth-store';
import {
  KYC_STATUS_LABELS,
  DOCUMENT_TYPE_LABELS,
  type KycStatus,
  type DocumentType,
  type KycLevel,
  type KycRecord,
} from '@/types';
import { formatDate } from '@/lib/format';
import { toast } from 'sonner';

// KYC Level badge colors
const KYC_LEVEL_COLORS: Record<number, string> = {
  0: 'bg-gray-100 text-gray-600 border-gray-200',
  1: 'bg-sky-50 text-sky-700 border-sky-200',
  2: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  3: 'bg-violet-50 text-violet-700 border-violet-200',
};

export default function KycView() {
  const records = useKycStore((s) => s.records);
  const approveKyc = useKycStore((s) => s.approveKyc);
  const rejectKyc = useKycStore((s) => s.rejectKyc);
  const navigate = useRouterStore((s) => s.navigate);
  const user = useAuthStore((s) => s.user);

  // Filter state
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilters, setActiveFilters] = useState<Record<string, unknown>>({});

  // Pagination
  const [page, setPage] = useState(1);
  const perPage = 10;

  // Confirm dialog state
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [confirmAction, setConfirmAction] = useState<{ id: string; action: 'approve' | 'reject'; label: string } | null>(null);

  // Build filter configs for SearchBar
  const filterConfigs = useMemo(
    () => [
      {
        key: 'status',
        label: 'Statut',
        type: 'select' as const,
        options: Object.entries(KYC_STATUS_LABELS).map(([value, label]) => ({
          value,
          label,
        })),
      },
      {
        key: 'documentType',
        label: 'Type de document',
        type: 'select' as const,
        options: Object.entries(DOCUMENT_TYPE_LABELS).map(([value, label]) => ({
          value,
          label,
        })),
      },
      {
        key: 'kycLevel',
        label: 'Niveau KYC',
        type: 'select' as const,
        options: [
          { value: '0', label: 'Niveau 0' },
          { value: '1', label: 'Niveau 1' },
          { value: '2', label: 'Niveau 2' },
          { value: '3', label: 'Niveau 3' },
        ],
      },
    ],
    []
  );

  // Handle search + filter changes
  const handleSearch = useCallback((query: string, filters: Record<string, unknown>) => {
    setSearchQuery(query);
    setActiveFilters(filters);
    setPage(1);
  }, []);

  // Filter records
  const filteredRecords = useMemo(() => {
    let result = [...records];

    // Text search
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      result = result.filter(
        (r) =>
          r.clientId.toLowerCase().includes(q) ||
          r.clientName.toLowerCase().includes(q) ||
          r.clientPhone.toLowerCase().includes(q) ||
          r.id.toLowerCase().includes(q)
      );
    }

    // Status filter
    if (activeFilters.status) {
      result = result.filter((r) => r.status === activeFilters.status);
    }

    // Document type filter
    if (activeFilters.documentType) {
      result = result.filter((r) => r.documentType === activeFilters.documentType);
    }

    // KYC level filter
    if (activeFilters.kycLevel !== undefined && activeFilters.kycLevel !== '') {
      const level = parseInt(String(activeFilters.kycLevel), 10);
      if (!isNaN(level)) {
        result = result.filter((r) => r.currentLevel === level);
      }
    }

    // Sort by submission date descending
    result.sort((a, b) => new Date(b.submittedAt).getTime() - new Date(a.submittedAt).getTime());

    return result;
  }, [records, searchQuery, activeFilters]);

  // Paginated data
  const paginatedData = useMemo(() => {
    const start = (page - 1) * perPage;
    return filteredRecords.slice(start, start + perPage);
  }, [filteredRecords, page, perPage]);

  // Action handlers
  const handleApprove = useCallback(
    (id: string) => {
      setConfirmAction({ id, action: 'approve', label: 'Approuver le dossier KYC' });
      setConfirmOpen(true);
    },
    []
  );

  const handleReject = useCallback(
    (id: string) => {
      setConfirmAction({ id, action: 'reject', label: 'Rejeter le dossier KYC' });
      setConfirmOpen(true);
    },
    []
  );

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

  // DataTable columns
  const columns = useMemo(
    () => [
      {
        key: 'clientId',
        label: 'Client ID',
        sortable: true,
        width: '110px',
        render: (_val: unknown, row: Record<string, unknown>) => (
          <span className="font-mono text-xs text-muted-foreground">{String(row.clientId)}</span>
        ),
      },
      {
        key: 'clientPhone',
        label: 'Téléphone',
        width: '130px',
        render: (_val: unknown, row: Record<string, unknown>) => (
          <span className="text-sm">{String(row.clientPhone)}</span>
        ),
      },
      {
        key: 'clientName',
        label: 'Nom client',
        sortable: true,
        width: '160px',
        render: (_val: unknown, row: Record<string, unknown>) => (
          <span className="font-medium text-sm">{String(row.clientName)}</span>
        ),
      },
      {
        key: 'currentLevel',
        label: 'Niveau actuel',
        sortable: true,
        width: '110px',
        render: (_val: unknown, row: Record<string, unknown>) => {
          const level = Number(row.currentLevel);
          return (
            <span
              className={`inline-flex items-center px-2 py-0.5 rounded-md border text-xs font-medium ${KYC_LEVEL_COLORS[level] ?? 'bg-gray-100 text-gray-600 border-gray-200'}`}
            >
              Niveau {level}
            </span>
          );
        },
      },
      {
        key: 'status',
        label: 'Statut',
        sortable: true,
        width: '120px',
        render: (_val: unknown, row: Record<string, unknown>) => (
          <StatusBadge status={String(row.status)} type="kyc" />
        ),
      },
      {
        key: 'documentType',
        label: 'Type document',
        width: '180px',
        render: (_val: unknown, row: Record<string, unknown>) => (
          <span className="text-sm">{DOCUMENT_TYPE_LABELS[row.documentType as DocumentType] ?? String(row.documentType)}</span>
        ),
      },
      {
        key: 'documentImage',
        label: 'Image',
        width: '70px',
        render: (_val: unknown, row: Record<string, unknown>) => (
          <button
            onClick={() =>
              navigate('kyc-detail', { id: String(row.id) }, buildBreadcrumb([
                { label: 'KYC & Conformité', route: 'kyc' },
                { label: `Dossier ${row.clientName}` },
              ]))
            }
            className="relative flex items-center justify-center size-10 rounded-lg border-2 border-dashed border-gray-300 hover:border-ricash-accent hover:bg-ricash-accent/5 transition-colors cursor-pointer overflow-hidden"
            title="Voir le document"
            aria-label={`Voir le document de ${String(row.clientName)}`}
          >
            <div className="absolute inset-0 bg-gradient-to-br from-ricash-brand/10 to-ricash-accent/10" />
            <IdCard className="size-5 text-ricash-brand/60 relative z-10" />
          </button>
        ),
      },
      {
        key: 'submittedAt',
        label: 'Date soumission',
        sortable: true,
        width: '130px',
        render: (_val: unknown, row: Record<string, unknown>) => (
          <span className="text-sm">{formatDate(String(row.submittedAt))}</span>
        ),
      },
      {
        key: 'actions',
        label: 'Actions',
        width: '200px',
        render: (_val: unknown, row: Record<string, unknown>) => (
          <div className="flex items-center gap-1">
            <Button
              variant="ghost"
              size="sm"
              className="h-8 text-xs text-ricash-brand hover:text-ricash-brand/80"
              onClick={(e) => {
                e.stopPropagation();
                navigate('kyc-detail', { id: String(row.id) }, buildBreadcrumb([
                  { label: 'KYC & Conformité', route: 'kyc' },
                  { label: `Dossier ${row.clientName}` },
                ]));
              }}
            >
              <Eye className="size-3.5 mr-1" />
              Voir dossier
            </Button>
            {row.status === 'PENDING' && (
              <RoleGuard roles={['super_admin', 'admin']}>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-8 text-xs text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleApprove(String(row.id));
                  }}
                >
                  <CheckCircle2 className="size-3.5 mr-1" />
                  Valider
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-8 text-xs text-red-600 hover:text-red-700 hover:bg-red-50"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleReject(String(row.id));
                  }}
                >
                  <XCircle className="size-3.5 mr-1" />
                  Rejeter
                </Button>
              </RoleGuard>
            )}
          </div>
        ),
      },
    ],
    [navigate, handleApprove, handleReject]
  );

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <PageHeader title="KYC & Conformité" subtitle="Vérification d'identité et gestion de la conformité" />

      {/* Search and Filters */}
      <Card className="p-4 ricash-card-shadow">
        <SearchBar
          placeholder="Rechercher par client, téléphone, ID…"
          filters={filterConfigs}
          onSearch={handleSearch}
        />
      </Card>

      {/* Data Table */}
      <DataTable
        columns={columns}
        data={paginatedData as unknown as Record<string, unknown>[]}
        pagination={{
          page,
          perPage,
          total: filteredRecords.length,
        }}
        onPageChange={setPage}
        emptyMessage="Aucun dossier KYC trouvé"
      />

      {/* Confirmation dialog */}
      <ConfirmDialog
        open={confirmOpen}
        onOpenChange={setConfirmOpen}
        title={confirmAction?.label ?? 'Confirmer'}
        description={
          confirmAction?.action === 'approve'
            ? 'Êtes-vous sûr de vouloir approuver ce dossier KYC ? Le niveau de vérification du client sera mis à jour.'
            : 'Êtes-vous sûr de vouloir rejeter ce dossier KYC ? Le client devra soumettre de nouveaux documents.'
        }
        confirmLabel={confirmAction?.action === 'approve' ? 'Approuver' : 'Rejeter'}
        variant={confirmAction?.action === 'reject' ? 'destructive' : 'primary'}
        onConfirm={handleConfirmAction}
      />
    </div>
  );
}
