'use client';

import { useState, useMemo, useCallback, useEffect } from 'react';
import {
  clampPage,
  paginateItems,
  getTotalPages,
  type TablePaginationState,
} from '@/lib/pagination';

export interface UseTablePaginationResult<T> {
  page: number;
  safePage: number;
  paginatedItems: T[];
  pagination: TablePaginationState;
  totalPages: number;
  setPage: (page: number) => void;
  resetPage: () => void;
  onPageChange: (page: number) => void;
}

/**
 * Pagination client avec reclampage synchrone et resynchronisation d'état.
 */
export function useTablePagination<T>(
  items: T[],
  perPage: number,
): UseTablePaginationResult<T> {
  const [page, setPage] = useState(1);
  const total = items.length;

  const safePage = useMemo(() => clampPage(page, total, perPage), [page, total, perPage]);

  useEffect(() => {
    if (safePage !== page) {
      setPage(safePage);
    }
  }, [safePage, page]);

  const paginatedItems = useMemo(
    () => paginateItems(items, safePage, perPage),
    [items, safePage, perPage],
  );

  const pagination = useMemo(
    (): TablePaginationState => ({
      page: safePage,
      perPage,
      total,
    }),
    [safePage, perPage, total],
  );

  const totalPages = useMemo(() => getTotalPages(total, perPage), [total, perPage]);

  const onPageChange = useCallback(
    (newPage: number) => {
      setPage(clampPage(newPage, total, perPage));
    },
    [total, perPage],
  );

  const resetPage = useCallback(() => setPage(1), []);

  return {
    page,
    safePage,
    paginatedItems,
    pagination,
    totalPages,
    setPage,
    resetPage,
    onPageChange,
  };
}
