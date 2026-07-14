/**
 * @file sede-empresa-porteria-page.types.ts
 * @description Tipos para la pagina CRUD de asignaciones sede-empresa de seguridad.
 */
import type {
  SedeEmpresaPorteria,
  SedeEmpresaPorteriaSortColumn,
  SedeEmpresaPorteriaSortOrder,
} from "@/api/sede-empresa-porteria";
import type { PorteriaPageSize } from "@/lib/porteria";

export interface SedeEmpresaPorteriaFilterState {
  search: string;
  sedeId: string;
  empresaPorteriaId: string;
  activo: "" | "true" | "false";
}

export interface SedeEmpresaPorteriaSortState {
  column: SedeEmpresaPorteriaSortColumn;
  order: SedeEmpresaPorteriaSortOrder;
}

export interface SedeEmpresaPorteriaPagination {
  page: number;
  limit: PorteriaPageSize;
  total: number;
  totalPages: number;
}

export interface UseSedeEmpresaPorteriaResult {
  items: SedeEmpresaPorteria[];
  filters: SedeEmpresaPorteriaFilterState;
  setFilters: (filters: SedeEmpresaPorteriaFilterState) => void;
  applyFilters: (filters?: SedeEmpresaPorteriaFilterState) => void;
  sort: SedeEmpresaPorteriaSortState | null;
  setSortColumn: (column: SedeEmpresaPorteriaSortColumn) => void;
  pagination: SedeEmpresaPorteriaPagination;
  setPage: (page: number) => void;
  setPageLimit: (limit: PorteriaPageSize) => void;
  loading: boolean;
  error: string;
  reload: () => Promise<void>;
}
