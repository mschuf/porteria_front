/**
 * @file sedes-page.types.ts
 * @description Tipos para la pagina CRUD de sedes.
 */
import type { Sede, SedeSortColumn, SedeSortOrder } from "@/api/sedes";
import type { PorteriaPageSize } from "@/lib/porteria";

export interface SedesFilterState {
  search: string;
  nombre: string;
  direccion: string;
  telefono: string;
  empresaId: string;
  activo: "" | "true" | "false";
}

export interface SedesSortState {
  column: SedeSortColumn;
  order: SedeSortOrder;
}

export interface SedesPagination {
  page: number;
  limit: PorteriaPageSize;
  total: number;
  totalPages: number;
}

export interface UseSedesResult {
  items: Sede[];
  filters: SedesFilterState;
  setFilters: (filters: SedesFilterState) => void;
  applyFilters: (filters?: SedesFilterState) => void;
  sort: SedesSortState | null;
  setSortColumn: (column: SedeSortColumn) => void;
  pagination: SedesPagination;
  setPage: (page: number) => void;
  setPageLimit: (limit: PorteriaPageSize) => void;
  loading: boolean;
  error: string;
  reload: () => Promise<void>;
}
