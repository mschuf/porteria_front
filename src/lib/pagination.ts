/**
 * @file pagination.ts
 * @description Utilidades de paginación compartidas para listados server-side.
 */

export const PAGE_SIZE_OPTIONS = [15, 25, 50, 100] as const;
export const PAGE_SIZE_ALL = "all" as const;

export type PageSize = (typeof PAGE_SIZE_OPTIONS)[number] | typeof PAGE_SIZE_ALL;

export const DEFAULT_PAGE_SIZE: PageSize = PAGE_SIZE_OPTIONS[0];

export function isAllPageSize(value: PageSize): value is typeof PAGE_SIZE_ALL {
  return value === PAGE_SIZE_ALL;
}

export function isValidPageSize(value: unknown): value is PageSize {
  return value === PAGE_SIZE_ALL || PAGE_SIZE_OPTIONS.includes(value as (typeof PAGE_SIZE_OPTIONS)[number]);
}

export function resolveApiLimit(limit: PageSize, total: number): number {
  if (isAllPageSize(limit)) {
    return Math.max(1, total || PAGE_SIZE_OPTIONS[PAGE_SIZE_OPTIONS.length - 1]);
  }
  return limit;
}

export function parsePageSize(value: string): PageSize | null {
  if (value === PAGE_SIZE_ALL) return PAGE_SIZE_ALL;
  const parsed = Number(value);
  return isValidPageSize(parsed) ? parsed : null;
}

export function toApiDateFrom(ymd: string): string | undefined {
  const trimmed = ymd.trim();
  if (!trimmed) return undefined;
  return `${trimmed}T00:00:00.000Z`;
}

export function toApiDateTo(ymd: string): string | undefined {
  const trimmed = ymd.trim();
  if (!trimmed) return undefined;
  return `${trimmed}T23:59:59.999Z`;
}
