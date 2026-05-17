'use client';

import React, { useState, useMemo, useCallback } from 'react';
import { Download, MoreHorizontal, Eye, Ban, CheckCircle, ShieldCheck } from 'lucide-react';
import PageHeader from '@/components/common/PageHeader';
import SearchBar from '@/components/common/SearchBar';
import DataTable from '@/components/common/DataTable';
import StatusBadge from '@/components/common/StatusBadge';
import RoleGuard from '@/components/common/RoleGuard';
import { useRouterStore, buildBreadcrumb } from '@/stores/router-store';
import { useUsersStore } from '@/stores/users-store';
import { toast } from 'sonner';
import { COUNTRY_LABELS, USER_STATUS_LABELS, type UserStatus } from '@/types';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';
import { Badge } from '@/components/ui/badge';

const PER_PAGE = 10;

const KYC_LEVEL_OPTIONS = [
  { value: '0', label: 'Niveau 0' },
  { value: '1', label: 'Niveau 1' },
  { value: '2', label: 'Niveau 2' },
];

const STATUS_OPTIONS = Object.entries(USER_STATUS_LABELS).map(([value, label]) => ({
  value,
  label,
}));

const COUNTRY_OPTIONS = Object.entries(COUNTRY_LABELS).map(([value, label]) => ({
  value,
  label,
}));

const FILTER_CONFIGS = [
  { key: 'status', label: 'Statut', type: 'select' as const, options: STATUS_OPTIONS },
  { key: 'country', label: 'Pays', type: 'select' as const, options: COUNTRY_OPTIONS },
  { key: 'kycLevel', label: 'Niveau KYC', type: 'select' as const, options: KYC_LEVEL_OPTIONS },
];

function formatXOF(amount: number): string {
  return new Intl.NumberFormat('fr-FR', { style: 'decimal', minimumFractionDigits: 0, maximumFractionDigits: 0 }).format(amount) + ' XOF';
}

function formatDate(dateStr: string): string {
  try {
    return new Date(dateStr).toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit', year: 'numeric' });
  } catch {
    return dateStr;
  }
}

export default function UsersView() {
  const clients = useUsersStore((s) => s.clients);
  const updateClientStatus = useUsersStore((s) => s.updateClientStatus);
  const updateClientKyc = useUsersStore((s) => s.updateClientKyc);
  const navigate = useRouterStore((s) => s.navigate);


  const [query, setQuery] = useState('');
  const [activeFilters, setActiveFilters] = useState<Record<string, unknown>>({});
  const [page, setPage] = useState(1);

  // Filtering logic
  const filteredClients = useMemo(() => {
    let result = [...clients];

    // Text search
    if (query) {
      const q = query.toLowerCase();
      result = result.filter(
        (c) =>
          c.id.toLowerCase().includes(q) ||
          c.phone.toLowerCase().includes(q) ||
          c.firstName.toLowerCase().includes(q) ||
          c.lastName.toLowerCase().includes(q) ||
          `${c.firstName} ${c.lastName}`.toLowerCase().includes(q)
      );
    }

    // Status filter
    if (activeFilters.status) {
      result = result.filter((c) => c.status === activeFilters.status);
    }

    // Country filter
    if (activeFilters.country) {
      result = result.filter((c) => c.country === activeFilters.country);
    }

    // KYC level filter
    if (activeFilters.kycLevel !== undefined && activeFilters.kycLevel !== null) {
      const level = Number(activeFilters.kycLevel);
      result = result.filter((c) => c.kycLevel === level);
    }

    return result;
  }, [clients, query, activeFilters]);

  // Pagination
  const paginatedData = useMemo(() => {
    const start = (page - 1) * PER_PAGE;
    return filteredClients.slice(start, start + PER_PAGE);
  }, [filteredClients, page]);

  const handleSearch = useCallback((q: string, filters: Record<string, unknown>) => {
    setQuery(q);
    setActiveFilters(filters);
    setPage(1);
  }, []);

  const handleToggleStatus = useCallback(
    (clientId: string, currentStatus: UserStatus) => {
      const newStatus: UserStatus = currentStatus === 'ACTIVE' ? 'SUSPENDED' : 'ACTIVE';
      updateClientStatus(clientId, newStatus);
      toast.success(newStatus === 'SUSPENDED' ? 'Client suspendu' : 'Client activé', {
        description: 'Le statut a été mis à jour avec succès.',
      });
    },
    [updateClientStatus]
  );

  const handleForceKyc = useCallback(
    (clientId: string) => {
      updateClientKyc(clientId, 2);
      toast.success('KYC forcé', {
        description: 'Le niveau KYC du client a été forcé à Niveau 2.',
      });
    },
    [updateClientKyc]
  );

  const handleExportCSV = useCallback(() => {
    if (filteredClients.length === 0) return;
    const headers = ['ID', 'Téléphone', 'Nom Complet', 'Pays', 'Statut', 'Niveau KYC', 'Solde', 'Date inscription'].join(',');
    const rows = filteredClients.map((c) =>
      [c.id, c.phone, `"${c.firstName} ${c.lastName}"`, COUNTRY_LABELS[c.country] ?? c.country, USER_STATUS_LABELS[c.status], `Niveau ${c.kycLevel}`, c.balance, c.createdAt].join(',')
    );
    const csv = [headers, ...rows].join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `clients-export-${new Date().toISOString().slice(0, 10)}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  }, [filteredClients]);

  const tableData = useMemo(
    () =>
      paginatedData.map((c) => ({
        id: c.id,
        phone: c.phone,
        fullName: `${c.firstName} ${c.lastName}`,
        country: c.country,
        status: c.status,
        kycLevel: c.kycLevel,
        balance: c.balance,
        createdAt: c.createdAt,
      })),
    [paginatedData]
  );

  const columns = [
    {
      key: 'id',
      label: 'ID',
      sortable: true,
      width: '100px',
    },
    {
      key: 'phone',
      label: 'Téléphone',
      sortable: true,
      width: '140px',
    },
    {
      key: 'fullName',
      label: 'Nom Complet',
      sortable: true,
    },
    {
      key: 'country',
      label: 'Pays',
      sortable: true,
      width: '120px',
      render: (value: unknown) => COUNTRY_LABELS[value as string] ?? (value as string),
    },
    {
      key: 'status',
      label: 'Statut',
      width: '120px',
      render: (value: unknown) => <StatusBadge status={value as string} type="user" />,
    },
    {
      key: 'kycLevel',
      label: 'Niveau KYC',
      width: '110px',
      render: (value: unknown) => (
        <Badge variant="outline" className="text-xs font-medium border-[var(--ricash-accent)]/30 bg-[var(--ricash-accent)]/5 text-[var(--ricash-accent)]">
          Niveau {value as number}
        </Badge>
      ),
    },
    {
      key: 'balance',
      label: 'Solde',
      sortable: true,
      width: '130px',
      render: (value: unknown) => (
        <span className="font-medium">{formatXOF(value as number)}</span>
      ),
    },
    {
      key: 'createdAt',
      label: 'Date inscription',
      sortable: true,
      width: '120px',
      render: (value: unknown) => formatDate(value as string),
    },
    {
      key: 'actions',
      label: 'Actions',
      width: '60px',
      render: (_value: unknown, row: Record<string, unknown>) => {
        const clientId = row.id as string;
        const currentStatus = row.status as UserStatus;
        return (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="size-8" onClick={(e) => e.stopPropagation()}>
                <MoreHorizontal className="size-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              <DropdownMenuItem
                onClick={() =>
                  navigate('client-detail', { id: clientId }, buildBreadcrumb([
                    { label: 'Clients', route: 'clients' },
                    { label: row.fullName as string },
                  ]))
                }
              >
                <Eye className="size-4 mr-2" />
                Voir profil
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <RoleGuard roles={['super_admin', 'admin']}>
                {currentStatus === 'ACTIVE' ? (
                  <DropdownMenuItem
                    onClick={() => handleToggleStatus(clientId, currentStatus)}
                  >
                    <Ban className="size-4 mr-2 text-orange-600" />
                    Suspendre
                  </DropdownMenuItem>
                ) : (
                  <DropdownMenuItem
                    onClick={() => handleToggleStatus(clientId, currentStatus)}
                  >
                    <CheckCircle className="size-4 mr-2 text-emerald-600" />
                    Activer
                  </DropdownMenuItem>
                )}
              </RoleGuard>
              <RoleGuard roles={['super_admin', 'admin']}>
                <DropdownMenuItem onClick={() => handleForceKyc(clientId)}>
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

  return (
    <div className="space-y-6">
      <PageHeader title="Clients" subtitle={`${filteredClients.length} client(s) trouvé(s)`}>
        <Button
          variant="outline"
          size="sm"
          onClick={handleExportCSV}
          disabled={filteredClients.length === 0}
          className="gap-1.5"
        >
          <Download className="size-4" />
          Exporter CSV
        </Button>
      </PageHeader>

      <SearchBar
        placeholder="Rechercher un client (ID, nom, téléphone)…"
        filters={FILTER_CONFIGS}
        onSearch={handleSearch}
      />

      <DataTable
        columns={columns}
        data={tableData as unknown as Record<string, unknown>[]}
        pagination={{
          page,
          perPage: PER_PAGE,
          total: filteredClients.length,
        }}
        onPageChange={setPage}
        emptyMessage="Aucun client trouvé"
      />
    </div>
  );
}
