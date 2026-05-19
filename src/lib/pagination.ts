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

/**
 * Numéros de page à afficher dans la barre de pagination.
 * Insère « ellipsis » entre les blocs lorsque la liste est longue.
 */
export function computePageNumbers(
  totalPages: number,
  currentPage: number,
  siblingCount = 1,
): (number | 'ellipsis')[] {
  if (totalPages <= 0) return [];
  if (totalPages === 1) return [1];

  const safePage = clampPage(currentPage, totalPages, 1);
  const totalNumbers = siblingCount * 2 + 5;

  if (totalPages <= totalNumbers) {
    return Array.from({ length: totalPages }, (_, i) => i + 1);
  }

  const leftSibling = Math.max(safePage - siblingCount, 1);
  const rightSibling = Math.min(safePage + siblingCount, totalPages);
  const showLeftEllipsis = leftSibling > 2;
  const showRightEllipsis = rightSibling < totalPages - 1;

  const pages: (number | 'ellipsis')[] = [1];

  if (showLeftEllipsis) {
    pages.push('ellipsis');
  } else {
    for (let i = 2; i < leftSibling; i++) pages.push(i);
  }

  for (let i = leftSibling; i <= rightSibling; i++) {
    if (i !== 1 && i !== totalPages) pages.push(i);
  }

  if (showRightEllipsis) {
    pages.push('ellipsis');
  } else {
    for (let i = rightSibling + 1; i < totalPages; i++) pages.push(i);
  }

  if (totalPages > 1) pages.push(totalPages);

  return pages;
}
