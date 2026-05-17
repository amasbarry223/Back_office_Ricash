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
} from 'lucide-react';
import PageHeader from '@/components/common/PageHeader';
import SearchBar from '@/components/common/SearchBar';
import DataTable from '@/components/common/DataTable';
import StatusBadge from '@/components/common/StatusBadge';
import RoleGuard from '@/components/common/RoleGuard';
import { useRouterStore, buildBreadcrumb } from '@/stores/router-store';
import { useAgentsStore } from '@/stores/agents-store';
import { toast } from 'sonner';
import { AGENT_STATUS_LABELS, type AgentStatus } from '@/types';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';

const PER_PAGE = 10;

const STATUS_OPTIONS = Object.entries(AGENT_STATUS_LABELS).map(([value, label]) => ({
  value,
  label,
}));

const FILTER_CONFIGS = [
  { key: 'status', label: 'Statut', type: 'select' as const, options: STATUS_OPTIONS },
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

export default function AgentsView() {
  const { agents, updateAgentStatus } = useAgentsStore();
  const navigate = useRouterStore((s) => s.navigate);

  const [query, setQuery] = useState('');
  const [activeFilters, setActiveFilters] = useState<Record<string, unknown>>({});
  const [page, setPage] = useState(1);

  // Filtering logic — NO geographic filter (règle: pas de filtre localisation agents)
  const filteredAgents = useMemo(() => {
    let result = [...agents];

    // Text search: nom, code agent
    if (query) {
      const q = query.toLowerCase();
      result = result.filter(
        (a) =>
          a.code.toLowerCase().includes(q) ||
          a.firstName.toLowerCase().includes(q) ||
          a.lastName.toLowerCase().includes(q) ||
          `${a.firstName} ${a.lastName}`.toLowerCase().includes(q)
      );
    }

    // Status filter
    if (activeFilters.status) {
      result = result.filter((a) => a.status === activeFilters.status);
    }

    return result;
  }, [agents, query, activeFilters]);

  // Pagination
  const paginatedData = useMemo(() => {
    const start = (page - 1) * PER_PAGE;
    return filteredAgents.slice(start, start + PER_PAGE);
  }, [filteredAgents, page]);

  const handleSearch = useCallback((q: string, filters: Record<string, unknown>) => {
    setQuery(q);
    setActiveFilters(filters);
    setPage(1);
  }, []);

  const handleToggleStatus = useCallback(
    (agentId: string, currentStatus: AgentStatus) => {
      let newStatus: AgentStatus;
      if (currentStatus === 'APPROVED') {
        newStatus = 'SUSPENDED';
      } else if (currentStatus === 'SUSPENDED') {
        newStatus = 'APPROVED';
      } else {
        return; // PENDING — use Approve instead
      }
      updateAgentStatus(agentId, newStatus);
      toast.success(newStatus === 'SUSPENDED' ? 'Agent suspendu' : 'Agent réactivé', {
        description: 'Le statut a été mis à jour avec succès.',
      });
    },
    [updateAgentStatus]
  );

  const handleExportCSV = useCallback(() => {
    if (filteredAgents.length === 0) return;
    const headers = ['Code Agent', 'Nom', 'Float actuel', 'Statut', 'Tx du mois', 'Commission', 'Date inscription'].join(',');
    const rows = filteredAgents.map((a) =>
      [a.code, `"${a.firstName} ${a.lastName}"`, a.floatBalance, AGENT_STATUS_LABELS[a.status], a.monthlyTransactions, `${a.commissionRate}%`, a.createdAt].join(',')
    );
    const csv = [headers, ...rows].join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `agents-export-${new Date().toISOString().slice(0, 10)}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  }, [filteredAgents]);

  const tableData = useMemo(
    () =>
      paginatedData.map((a) => ({
        code: a.code,
        fullName: `${a.firstName} ${a.lastName}`,
        floatBalance: a.floatBalance,
        status: a.status,
        monthlyTransactions: a.monthlyTransactions,
        commissionRate: a.commissionRate,
        createdAt: a.createdAt,
        id: a.id,
      })),
    [paginatedData]
  );

  const columns = [
    {
      key: 'code',
      label: 'Code Agent',
      sortable: true,
      width: '120px',
      render: (value: unknown) => (
        <span className="font-mono text-xs font-medium">{value as string}</span>
      ),
    },
    {
      key: 'fullName',
      label: 'Nom',
      sortable: true,
    },
    {
      key: 'floatBalance',
      label: 'Float actuel',
      sortable: true,
      width: '130px',
      render: (value: unknown) => {
        const amount = value as number;
        const isLow = amount < 200000;
        return (
          <span className={`font-medium ${isLow ? 'text-orange-600' : ''}`}>
            {formatXOF(amount)}
          </span>
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
    },
    {
      key: 'commissionRate',
      label: 'Commission',
      width: '100px',
      render: (value: unknown) => (
        <span className="font-medium">{(value as number)}%</span>
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
      key: 'id',
      label: 'Actions',
      width: '60px',
      render: (_value: unknown, row: Record<string, unknown>) => {
        const agentId = row.id as string;
        const currentStatus = row.status as AgentStatus;
        const agentCode = row.code as string;
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
                  navigate('agent-detail', { id: agentId }, buildBreadcrumb([
                    { label: 'Agents', route: 'agents' },
                    { label: row.fullName as string },
                  ]))
                }
              >
                <Eye className="size-4 mr-2" />
                Voir profil
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() =>
                  navigate('agent-float', { id: agentId }, buildBreadcrumb([
                    { label: 'Agents', route: 'agents' },
                    { label: row.fullName as string, route: 'agent-detail', params: { id: agentId } },
                    { label: 'Gestion Float' },
                  ]))
                }
              >
                <Wallet className="size-4 mr-2" />
                Gérer float
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              {currentStatus === 'PENDING' && (
                <RoleGuard roles={['super_admin', 'admin']}>
                  <DropdownMenuItem
                    onClick={() => {
                      navigate('agent-detail', { id: agentId }, buildBreadcrumb([
                        { label: 'Agents', route: 'agents' },
                        { label: row.fullName as string },
                      ]));
                    }}
                  >
                    <CheckCircle className="size-4 mr-2 text-emerald-600" />
                    Approuver
                  </DropdownMenuItem>
                </RoleGuard>
              )}
              {currentStatus === 'APPROVED' && (
                <RoleGuard roles={['super_admin', 'admin']}>
                  <DropdownMenuItem
                    onClick={() => handleToggleStatus(agentId, currentStatus)}
                  >
                    <Ban className="size-4 mr-2 text-orange-600" />
                    Suspendre
                  </DropdownMenuItem>
                </RoleGuard>
              )}
              {currentStatus === 'SUSPENDED' && (
                <RoleGuard roles={['super_admin', 'admin']}>
                  <DropdownMenuItem
                    onClick={() => handleToggleStatus(agentId, currentStatus)}
                  >
                    <RotateCcw className="size-4 mr-2 text-emerald-600" />
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

  return (
    <div className="space-y-6">
      <PageHeader title="Agents" subtitle={`${filteredAgents.length} agent(s) trouvé(s)`}>
        <Button
          variant="outline"
          size="sm"
          onClick={handleExportCSV}
          disabled={filteredAgents.length === 0}
          className="gap-1.5"
        >
          <Download className="size-4" />
          Exporter CSV
        </Button>
      </PageHeader>

      <SearchBar
        placeholder="Rechercher un agent (nom, code agent)…"
        filters={FILTER_CONFIGS}
        onSearch={handleSearch}
      />

      <DataTable
        columns={columns}
        data={tableData as unknown as Record<string, unknown>[]}
        pagination={{
          page,
          perPage: PER_PAGE,
          total: filteredAgents.length,
        }}
        onPageChange={setPage}
        emptyMessage="Aucun agent trouvé"
      />
    </div>
  );
}
