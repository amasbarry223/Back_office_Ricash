/** Taille de page par défaut des tableaux back-office */
export const DEFAULT_TABLE_PER_PAGE = 10;

export function getTotalPages(total: number, perPage = DEFAULT_TABLE_PER_PAGE): number {
  if (total <= 0) return 1;
  return Math.ceil(total / perPage);
}

export function clampPage(
  page: number,
  total: number,
  perPage = DEFAULT_TABLE_PER_PAGE,
): number {
  if (!Number.isFinite(page) || page < 1) return 1;
  return Math.min(Math.max(1, page), getTotalPages(total, perPage));
}

export function paginateItems<T>(
  items: T[],
  page: number,
  perPage = DEFAULT_TABLE_PER_PAGE,
): T[] {
  const safePage = clampPage(page, items.length, perPage);
  const start = (safePage - 1) * perPage;
  return items.slice(start, start + perPage);
}

/** Plage affichée « X–Y sur Z » (1-indexed, cohérente même si page hors limites) */
export function getPaginationRange(
  page: number,
  total: number,
  perPage = DEFAULT_TABLE_PER_PAGE,
): { start: number; end: number; safePage: number; totalPages: number } {
  if (total <= 0) {
    return { start: 0, end: 0, safePage: 1, totalPages: 1 };
  }
  const safePage = clampPage(page, total, perPage);
  const totalPages = getTotalPages(total, perPage);
  const start = (safePage - 1) * perPage + 1;
  const end = Math.min(safePage * perPage, total);
  return { start, end, safePage, totalPages };
}

export interface TablePaginationState {
  page: number;
  perPage: number;
  total: number;
}
