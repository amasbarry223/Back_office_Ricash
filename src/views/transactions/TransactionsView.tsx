'use client';

import React, { useState, useMemo, useCallback } from 'react';
import { Download, ArrowUpDown, Eye } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import DataTable from '@/components/common/DataTable';
import SearchBar from '@/components/common/SearchBar';
import StatusBadge from '@/components/common/StatusBadge';
import PageHeader from '@/components/common/PageHeader';
import { useRouterStore, buildBreadcrumb } from '@/stores/router-store';
import { useTransactionsStore } from '@/stores/transactions-store';
import {
  TRANSACTION_TYPE_LABELS,
  TRANSACTION_STATUS_LABELS,
  CHANNEL_LABELS,
  OPERATOR_LABELS,
  type TransactionType,
  type TransactionStatus,
  type Channel,
  type Operator,
  type Transaction,
} from '@/types';

// Format XOF amount
function formatXOF(amount: number): string {
  return amount.toLocaleString('fr-FR') + ' XOF';
}

// Format date
function formatDate(dateStr: string): string {
  const d = new Date(dateStr);
  return d.toLocaleDateString('fr-FR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

// Transaction type badge color mapping
const TYPE_COLORS: Record<TransactionType, string> = {
  DEPOSIT: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  WITHDRAWAL: 'bg-orange-50 text-orange-700 border-orange-200',
  TRANSFER: 'bg-sky-50 text-sky-700 border-sky-200',
  MERCHANT_PAYMENT: 'bg-violet-50 text-violet-700 border-violet-200',
  REFUND: 'bg-rose-50 text-rose-700 border-rose-200',
};

export default function TransactionsView() {
  const transactions = useTransactionsStore((s) => s.transactions);
  const navigate = useRouterStore((s) => s.navigate);

  // Filter state
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilters, setActiveFilters] = useState<Record<string, unknown>>({});
  const [minAmount, setMinAmount] = useState('');
  const [maxAmount, setMaxAmount] = useState('');

  // Pagination
  const [page, setPage] = useState(1);
  const perPage = 10;

  // Build filter configs for SearchBar
  const filterConfigs = useMemo(
    () => [
      {
        key: 'type',
        label: 'Type',
        type: 'select' as const,
        options: Object.entries(TRANSACTION_TYPE_LABELS).map(([value, label]) => ({
          value,
          label,
        })),
      },
      {
        key: 'status',
        label: 'Statut',
        type: 'select' as const,
        options: Object.entries(TRANSACTION_STATUS_LABELS).map(([value, label]) => ({
          value,
          label,
        })),
      },
      {
        key: 'channel',
        label: 'Canal',
        type: 'select' as const,
        options: Object.entries(CHANNEL_LABELS).map(([value, label]) => ({
          value,
          label,
        })),
      },
      {
        key: 'operator',
        label: 'Opérateur',
        type: 'select' as const,
        options: Object.entries(OPERATOR_LABELS).map(([value, label]) => ({
          value,
          label,
        })),
      },
      {
        key: 'period',
        label: 'Période',
        type: 'select' as const,
        options: [
          { value: 'today', label: "Aujourd'hui" },
          { value: '7days', label: '7 derniers jours' },
          { value: '30days', label: '30 derniers jours' },
          { value: '3months', label: '3 derniers mois' },
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

  // Handle amount range changes
  const handleMinAmountChange = useCallback((val: string) => {
    setMinAmount(val);
    setPage(1);
  }, []);
  const handleMaxAmountChange = useCallback((val: string) => {
    setMaxAmount(val);
    setPage(1);
  }, []);

  // Filter and sort transactions
  const filteredTransactions = useMemo(() => {
    let result = [...transactions];

    // Text search
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      result = result.filter(
        (t) =>
          t.ref.toLowerCase().includes(q) ||
          t.clientName.toLowerCase().includes(q) ||
          t.clientPhone.toLowerCase().includes(q) ||
          (t.agentCode && t.agentCode.toLowerCase().includes(q)) ||
          t.id.toLowerCase().includes(q)
      );
    }

    // Type filter
    if (activeFilters.type) {
      result = result.filter((t) => t.type === activeFilters.type);
    }

    // Status filter
    if (activeFilters.status) {
      result = result.filter((t) => t.status === activeFilters.status);
    }

    // Channel filter
    if (activeFilters.channel) {
      result = result.filter((t) => t.channel === activeFilters.channel);
    }

    // Operator filter
    if (activeFilters.operator) {
      result = result.filter((t) => t.operator === activeFilters.operator);
    }

    // Period filter
    if (activeFilters.period) {
      const now = new Date();
      let startDate: Date;
      switch (activeFilters.period) {
        case 'today':
          startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
          break;
        case '7days':
          startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
          break;
        case '30days':
          startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
          break;
        case '3months':
          startDate = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
          break;
        default:
          startDate = new Date(0);
      }
      result = result.filter((t) => new Date(t.createdAt) >= startDate);
    }

    // Amount range filter
    if (minAmount) {
      const min = parseFloat(minAmount);
      if (!isNaN(min)) {
        result = result.filter((t) => t.amount >= min);
      }
    }
    if (maxAmount) {
      const max = parseFloat(maxAmount);
      if (!isNaN(max)) {
        result = result.filter((t) => t.amount <= max);
      }
    }

    // Sort by date descending by default
    result.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

    return result;
  }, [transactions, searchQuery, activeFilters, minAmount, maxAmount]);

  // Paginated data
  const paginatedData = useMemo(() => {
    const start = (page - 1) * perPage;
    return filteredTransactions.slice(start, start + perPage);
  }, [filteredTransactions, page, perPage]);

  // DataTable columns
  const columns = useMemo(
    () => [
      {
        key: 'ref',
        label: 'Référence',
        sortable: true,
        width: '160px',
        render: (_val: unknown, row: Record<string, unknown>) => (
          <span className="font-mono text-xs font-semibold text-[var(--ricash-primary)]">
            {String(row.ref)}
          </span>
        ),
      },
      {
        key: 'type',
        label: 'Type',
        sortable: true,
        width: '150px',
        render: (_val: unknown, row: Record<string, unknown>) => {
          const type = row.type as TransactionType;
          return (
            <span
              className={`inline-flex items-center px-2 py-0.5 rounded-md border text-xs font-medium ${TYPE_COLORS[type] ?? 'bg-gray-50 text-gray-700 border-gray-200'}`}
            >
              {TRANSACTION_TYPE_LABELS[type] ?? type}
            </span>
          );
        },
      },
      {
        key: 'channel',
        label: 'Canal',
        sortable: true,
        width: '110px',
        render: (_val: unknown, row: Record<string, unknown>) =>
          CHANNEL_LABELS[row.channel as Channel] ?? String(row.channel),
      },
      {
        key: 'amount',
        label: 'Montant',
        sortable: true,
        width: '140px',
        render: (_val: unknown, row: Record<string, unknown>) => {
          const amount = row.amount as number;
          const status = row.status as TransactionStatus;
          return (
            <span
              className={`font-semibold text-sm ${status === 'FAILED' ? 'text-red-600' : status === 'SUCCESS' ? 'text-emerald-600' : 'text-foreground'}`}
            >
              {formatXOF(amount)}
            </span>
          );
        },
      },
      {
        key: 'fees',
        label: 'Frais',
        width: '110px',
        render: (_val: unknown, row: Record<string, unknown>) => (
          <span className="text-sm text-muted-foreground">{formatXOF(row.fees as number)}</span>
        ),
      },
      {
        key: 'status',
        label: 'Statut',
        sortable: true,
        width: '120px',
        render: (_val: unknown, row: Record<string, unknown>) => (
          <StatusBadge status={String(row.status)} type="transaction" />
        ),
      },
      {
        key: 'clientName',
        label: 'Client',
        sortable: true,
        width: '150px',
        render: (_val: unknown, row: Record<string, unknown>) => (
          <div>
            <div className="font-medium text-sm">{String(row.clientName)}</div>
            <div className="text-xs text-muted-foreground">{String(row.clientPhone)}</div>
          </div>
        ),
      },
      {
        key: 'agentCode',
        label: 'Agent',
        width: '110px',
        render: (_val: unknown, row: Record<string, unknown>) =>
          row.agentCode ? (
            <span className="font-mono text-xs text-[var(--ricash-accent)]">
              {String(row.agentCode)}
            </span>
          ) : (
            <span className="text-muted-foreground">—</span>
          ),
      },
      {
        key: 'createdAt',
        label: 'Date',
        sortable: true,
        width: '150px',
        render: (_val: unknown, row: Record<string, unknown>) => (
          <span className="text-sm">{formatDate(String(row.createdAt))}</span>
        ),
      },
      {
        key: 'actions',
        label: 'Actions',
        width: '110px',
        render: (_val: unknown, row: Record<string, unknown>) => (
          <Button
            variant="ghost"
            size="sm"
            className="h-8 text-xs text-[var(--ricash-primary)] hover:text-[var(--ricash-primary)]/80"
            onClick={(e) => {
              e.stopPropagation();
              navigate('transaction-detail', { id: String(row.id) }, buildBreadcrumb([
                { label: 'Transactions', route: 'transactions' },
                { label: String(row.ref) },
              ]));
            }}
          >
            <Eye className="size-3.5 mr-1" />
            Voir détail
          </Button>
        ),
      },
    ],
    [navigate]
  );

  // CSV Export
  const handleExportCSV = useCallback(() => {
    if (filteredTransactions.length === 0) return;
    const headers = [
      'Référence',
      'Type',
      'Canal',
      'Montant',
      'Frais',
      'Statut',
      'Client',
      'Téléphone',
      'Agent',
      'Opérateur',
      'Date',
    ].join(',');
    const rows = filteredTransactions.map((t) =>
      [
        `"${t.ref}"`,
        TRANSACTION_TYPE_LABELS[t.type],
        CHANNEL_LABELS[t.channel],
        t.amount,
        t.fees,
        TRANSACTION_STATUS_LABELS[t.status],
        `"${t.clientName}"`,
        `"${t.clientPhone}"`,
        t.agentCode ?? '',
        OPERATOR_LABELS[t.operator],
        `"${formatDate(t.createdAt)}"`,
      ].join(',')
    );
    const csv = [headers, ...rows].join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `transactions-${new Date().toISOString().slice(0, 10)}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  }, [filteredTransactions]);

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <PageHeader title="Transactions" subtitle="Gestion et suivi des opérations financières">
        <Button
          variant="outline"
          size="sm"
          onClick={handleExportCSV}
          disabled={filteredTransactions.length === 0}
          className="gap-1.5"
        >
          <Download className="size-4" />
          Exporter CSV
        </Button>
      </PageHeader>

      {/* Search and Filters */}
      <Card className="p-4 ricash-card-shadow">
        <SearchBar
          placeholder="Rechercher par référence, client, téléphone…"
          filters={filterConfigs}
          onSearch={handleSearch}
        />

        {/* Amount range inputs */}
        <div className="flex items-center gap-2 mt-3">
          <span className="text-xs text-muted-foreground whitespace-nowrap">Montant :</span>
          <Input
            type="number"
            placeholder="Min"
            value={minAmount}
            onChange={(e) => handleMinAmountChange(e.target.value)}
            className="h-8 w-28 text-sm"
          />
          <span className="text-xs text-muted-foreground">—</span>
          <Input
            type="number"
            placeholder="Max"
            value={maxAmount}
            onChange={(e) => handleMaxAmountChange(e.target.value)}
            className="h-8 w-28 text-sm"
          />
          {(minAmount || maxAmount) && (
            <Button
              variant="ghost"
              size="sm"
              className="h-8 text-xs text-muted-foreground"
              onClick={() => {
                setMinAmount('');
                setMaxAmount('');
              }}
            >
              Réinitialiser
            </Button>
          )}
        </div>
      </Card>

      {/* Data Table */}
      <DataTable
        columns={columns}
        data={paginatedData as unknown as Record<string, unknown>[]}
        pagination={{
          page,
          perPage,
          total: filteredTransactions.length,
        }}
        onPageChange={setPage}
        onSort={(key, direction) => {
          // Sort is handled internally by DataTable
          console.log(`Sorting by ${key} ${direction}`);
        }}
        emptyMessage="Aucune transaction trouvée"
      />
    </div>
  );
}
