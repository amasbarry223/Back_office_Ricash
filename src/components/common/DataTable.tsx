'use client';

import React, { useState, useMemo, useCallback, memo } from 'react';
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
import { computePageNumbers, getPaginationRange } from '@/lib/pagination';

export interface Column {
  key: string;
  label: string;
  sortable?: boolean;
  width?: string;
  render?: (value: unknown, row: Record<string, unknown>) => React.ReactNode;
}

export interface DataTableProps {
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

const DataTableRow = memo(function DataTableRow({
  row,
  rowIdx,
  columns,
  onRowClick,
}: {
  row: Record<string, unknown>;
  rowIdx: number;
  columns: Column[];
  onRowClick?: (row: Record<string, unknown>) => void;
}) {
  const handleClick = useCallback(() => {
    onRowClick?.(row);
  }, [onRowClick, row]);

  return (
    <TableRow
      className={`
        row-interactive
        ${rowIdx % 2 === 1 ? 'bg-ricash-surface-table/60' : ''}
        ${onRowClick ? 'cursor-pointer hover:bg-ricash-surface-table' : ''}
      `}
      onClick={onRowClick ? handleClick : undefined}
      style={{ animationDelay: `${Math.min(rowIdx * 30, 300)}ms` }}
    >
      {columns.map((col) => (
        <TableCell key={`cell-${String(row.id ?? rowIdx)}-${col.key}`}>
          {col.render
            ? col.render(row[col.key], row)
            : row[col.key] !== null && row[col.key] !== undefined
              ? String(row[col.key])
              : '—'}
        </TableCell>
      ))}
    </TableRow>
  );
});

function DataTable({
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

  const handleSort = useCallback(
    (key: string) => {
      const newDirection = sortKey === key && sortDirection === 'asc' ? 'desc' : 'asc';
      setSortKey(key);
      setSortDirection(newDirection);
      onSort?.(key, newDirection);
    },
    [sortKey, sortDirection, onSort],
  );

  const paginationRange = pagination
    ? getPaginationRange(pagination.page, pagination.total, pagination.perPage)
    : null;
  const totalPages = paginationRange?.totalPages ?? 1;
  const currentPage = paginationRange?.safePage ?? 1;
  const startItem = paginationRange?.start ?? 0;
  const endItem = paginationRange?.end ?? 0;

  const pageNumbers = useMemo(
    () => computePageNumbers(totalPages, currentPage),
    [totalPages, currentPage],
  );

  const isSortEnabled = useCallback(
    (col: Column) => col.sortable && !pagination,
    [pagination],
  );

  const renderSortIcon = useCallback(
    (col: Column) => {
      if (!isSortEnabled(col)) return null;
      if (sortKey !== col.key) {
        return <ArrowUpDown className="size-3.5 ml-1 text-muted-foreground/50" />;
      }
      return sortDirection === 'asc' ? (
        <ArrowUp className="size-3.5 ml-1 text-ricash-accent" />
      ) : (
        <ArrowDown className="size-3.5 ml-1 text-ricash-accent" />
      );
    },
    [isSortEnabled, sortKey, sortDirection],
  );

  if (loading) {
    return (
      <div className="bg-card rounded-xl ricash-card-shadow overflow-hidden animate-in">
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
                  className={isSortEnabled(col) ? 'cursor-pointer select-none hover:bg-muted/50' : ''}
                  onClick={isSortEnabled(col) ? () => handleSort(col.key) : undefined}
                  title={
                    col.sortable && pagination
                      ? 'Tri disponible sur la liste complète (filtrez puis changez de page)'
                      : undefined
                  }
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
              <DataTableRow
                key={row.id ? String(row.id) : `row-${rowIdx}`}
                row={row}
                rowIdx={rowIdx}
                columns={columns}
                onRowClick={onRowClick}
              />
            ))}
          </TableBody>
        </Table>
      </div>

      {pagination && pagination.total > 0 && (
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 px-4 py-3 border-t border-border/50">
          <p className="text-sm text-muted-foreground">
            Affichage {startItem}–{endItem} sur {pagination.total.toLocaleString('fr-FR')} résultat
            {pagination.total > 1 ? 's' : ''}
          </p>
          {totalPages > 1 && (
            <div className="flex items-center gap-1">
              <Button
                type="button"
                variant="outline"
                size="xs"
                disabled={currentPage <= 1}
                onClick={() => onPageChange?.(currentPage - 1)}
              >
                Précédent
              </Button>
              {pageNumbers.map((page, idx) =>
                typeof page === 'string' ? (
                  <span key={`ellipsis-${idx}`} className="px-1 text-muted-foreground text-sm">
                    …
                  </span>
                ) : (
                  <Button
                    key={`page-${page}`}
                    type="button"
                    variant={page === currentPage ? 'primary' : 'outline'}
                    size="xs"
                    onClick={() => onPageChange?.(page)}
                    className="w-8 p-0"
                  >
                    {page}
                  </Button>
                ),
              )}
              <Button
                type="button"
                variant="outline"
                size="xs"
                disabled={currentPage >= totalPages}
                onClick={() => onPageChange?.(currentPage + 1)}
              >
                Suivant
              </Button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default memo(DataTable);
