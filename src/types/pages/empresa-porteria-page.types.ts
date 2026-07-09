/**
 * @file empresa-porteria-page.types.ts
 * @description Tipos para la pagina CRUD de empresas de porteria.
 */
import type {
  EmpresaPorteria,
  EmpresaPorteriaSortColumn,
  EmpresaPorteriaSortOrder,
} from "@/api/empresa-porteria";
import type { PorteriaPageSize } from "@/lib/porteria";

export interface EmpresaPorteriaFilterState {
  search: string;
  nombre: string;
  ruc: string;
  telefono: string;
  correo: string;
  activo: "" | "true" | "false";
}

export interface EmpresaPorteriaSortState {
  column: EmpresaPorteriaSortColumn;
  order: EmpresaPorteriaSortOrder;
}

export interface EmpresaPorteriaPagination {
  page: number;
  limit: PorteriaPageSize;
  total: number;
  totalPages: number;
}

export interface UseEmpresaPorteriaResult {
  items: EmpresaPorteria[];
  filters: EmpresaPorteriaFilterState;
  setFilters: (filters: EmpresaPorteriaFilterState) => void;
  applyFilters: (filters?: EmpresaPorteriaFilterState) => void;
  sort: EmpresaPorteriaSortState | null;
  setSortColumn: (column: EmpresaPorteriaSortColumn) => void;
  pagination: EmpresaPorteriaPagination;
  setPage: (page: number) => void;
  setPageLimit: (limit: PorteriaPageSize) => void;
  loading: boolean;
  error: string;
  reload: () => Promise<void>;
}
