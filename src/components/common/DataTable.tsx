'use client';

import React, { useState, useMemo } from 'react';
import { ArrowUpDown, ArrowUp, ArrowDown, Inbox } from 'lucide-react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';

interface Column {
  key: string;
  label: string;
  sortable?: boolean;
  width?: string;
  render?: (value: unknown, row: Record<string, unknown>) => React.ReactNode;
}

interface DataTableProps {
  columns: Column[];
  data: Record<string, unknown>[];
  loading?: boolean;
  pagination?: {
    page: number;
    perPage: number;
    total: number;
  };
  onPageChange?: (page: number) => void;
  onSort?: (key: string, direction: 'asc' | 'desc') => void;
  onRowClick?: (row: Record<string, unknown>) => void;
  emptyMessage?: string;
}

export default function DataTable({
  columns,
  data,
  loading = false,
  pagination,
  onPageChange,
  onSort,
  onRowClick,
  emptyMessage = 'Aucune donnée disponible',
}: DataTableProps) {
  const [sortKey, setSortKey] = useState<string | null>(null);
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');

  const sortedData = useMemo(() => {
    if (!sortKey) return data;
    return [...data].sort((a, b) => {
      const aVal = a[sortKey];
      const bVal = b[sortKey];
      if (aVal === null || aVal === undefined) return 1;
      if (bVal === null || bVal === undefined) return -1;
      let comparison = 0;
      if (typeof aVal === 'number' && typeof bVal === 'number') {
        comparison = aVal - bVal;
      } else {
        comparison = String(aVal).localeCompare(String(bVal));
      }
      return sortDirection === 'desc' ? -comparison : comparison;
    });
  }, [data, sortKey, sortDirection]);

  const handleSort = (key: string) => {
    const newDirection = sortKey === key && sortDirection === 'asc' ? 'desc' : 'asc';
    setSortKey(key);
    setSortDirection(newDirection);
    onSort?.(key, newDirection);
  };

  const totalPages = pagination ? Math.ceil(pagination.total / pagination.perPage) : 1;
  const currentPage = pagination?.page ?? 1;

  const startItem = pagination ? (currentPage - 1) * pagination.perPage + 1 : 0;
  const endItem = pagination ? Math.min(currentPage * pagination.perPage, pagination.total) : 0;

  const getPageNumbers = (): (number | string)[] => {
    const pages: (number | string)[] = [];
    const total = totalPages;

    if (total <= 7) {
      for (let i = 1; i <= total; i++) pages.push(i);
    } else {
      pages.push(1);
      if (currentPage > 3) pages.push('...');

      const start = Math.max(2, currentPage - 1);
      const end = Math.min(total - 1, currentPage + 1);

      for (let i = start; i <= end; i++) pages.push(i);

      if (currentPage < total - 2) pages.push('...');
      pages.push(total);
    }

    return pages;
  };

  const renderSortIcon = (col: Column) => {
    if (!col.sortable) return null;
    if (sortKey !== col.key) {
      return <ArrowUpDown className="size-3.5 ml-1 text-muted-foreground/50" />;
    }
    return sortDirection === 'asc' ? (
      <ArrowUp className="size-3.5 ml-1 text-ricash-accent" />
    ) : (
      <ArrowDown className="size-3.5 ml-1 text-ricash-accent" />
    );
  };

  // Loading skeleton rows
  if (loading) {
    return (
      <div className="bg-card rounded-xl ricash-card-shadow overflow-hidden">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/30 hover:bg-muted/30">
                {columns.map((col) => (
                  <TableHead key={col.key} style={col.width ? { width: col.width } : undefined}>
                    {col.label}
                  </TableHead>
                ))}
              </TableRow>
            </TableHeader>
            <TableBody>
              {Array.from({ length: 5 }).map((_, rowIdx) => (
                <TableRow key={`skeleton-${rowIdx}`} className="hover:bg-transparent">
                  {columns.map((col) => (
                    <TableCell key={`skeleton-${rowIdx}-${col.key}`}>
                      <div className="shimmer h-4 w-3/4 rounded" />
                    </TableCell>
                  ))}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>
    );
  }

  // Empty state
  if (!loading && sortedData.length === 0) {
    return (
      <div className="bg-card rounded-xl ricash-card-shadow overflow-hidden">
        <div className="flex flex-col items-center justify-center py-16 px-4">
          <div className="flex items-center justify-center size-12 rounded-full bg-muted mb-4">
            <Inbox className="size-6 text-muted-foreground" />
          </div>
          <p className="text-muted-foreground text-sm">{emptyMessage}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-card rounded-xl ricash-card-shadow overflow-hidden">
      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/30 hover:bg-muted/30">
              {columns.map((col) => (
                <TableHead
                  key={col.key}
                  style={col.width ? { width: col.width } : undefined}
                  className={col.sortable ? 'cursor-pointer select-none hover:bg-muted/50' : ''}
                  onClick={col.sortable ? () => handleSort(col.key) : undefined}
                >
                  <div className="flex items-center">
                    {col.label}
                    {renderSortIcon(col)}
                  </div>
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {sortedData.map((row, rowIdx) => (
              <TableRow
                key={row.id ? String(row.id) : `row-${rowIdx}`}
                className={`
                  ${rowIdx % 2 === 1 ? 'bg-muted/20' : ''}
                  ${onRowClick ? 'cursor-pointer hover:bg-muted/40' : ''}
                `}
                onClick={onRowClick ? () => onRowClick(row) : undefined}
              >
                {columns.map((col) => (
                  <TableCell key={`cell-${row.id ?? rowIdx}-${col.key}`}>
                    {col.render
                      ? col.render(row[col.key], row)
                      : row[col.key] !== null && row[col.key] !== undefined
                        ? String(row[col.key])
                        : '—'}
                  </TableCell>
                ))}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* Pagination */}
      {pagination && pagination.total > 0 && (
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 px-4 py-3 border-t border-border/50">
          <p className="text-sm text-muted-foreground">
            Affichage {startItem}–{endItem} sur {pagination.total.toLocaleString('fr-FR')} résultats
          </p>
          <div className="flex items-center gap-1">
            <Button
              variant="outline"
              size="sm"
              disabled={currentPage <= 1}
              onClick={() => onPageChange?.(currentPage - 1)}
              className="h-8 text-xs"
            >
              Précédent
            </Button>
            {getPageNumbers().map((page, idx) =>
              typeof page === 'string' ? (
                <span key={`ellipsis-${idx}`} className="px-1 text-muted-foreground text-sm">
                  …
                </span>
              ) : (
                <Button
                  key={`page-${page}`}
                  variant={page === currentPage ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => onPageChange?.(page)}
                  className={`h-8 w-8 text-xs p-0 ${page === currentPage ? 'bg-ricash-brand hover:bg-ricash-brand/90 text-white' : ''}`}
                >
                  {page}
                </Button>
              )
            )}
            <Button
              variant="outline"
              size="sm"
              disabled={currentPage >= totalPages}
              onClick={() => onPageChange?.(currentPage + 1)}
              className="h-8 text-xs"
            >
              Suivant
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
