/**
 * @file usuario-empresa-porteria-page.types.ts
 * @description Tipos para la pagina CRUD de asignaciones usuario-empresa-porteria.
 */
import type {
  UsuarioEmpresaPorteria,
  UsuarioEmpresaPorteriaSortColumn,
  UsuarioEmpresaPorteriaSortOrder,
} from "@/api/usuario-empresa-porteria";
import type { PorteriaPageSize } from "@/lib/porteria";

export interface UsuarioEmpresaPorteriaFilterState {
  search: string;
  usuarioId: string;
  empresaPorteriaId: string;
  sedeId: string;
  activo: "" | "true" | "false";
}

export interface UsuarioEmpresaPorteriaSortState {
  column: UsuarioEmpresaPorteriaSortColumn;
  order: UsuarioEmpresaPorteriaSortOrder;
}

export interface UsuarioEmpresaPorteriaPagination {
  page: number;
  limit: PorteriaPageSize;
  total: number;
  totalPages: number;
}

export interface UseUsuarioEmpresaPorteriaResult {
  items: UsuarioEmpresaPorteria[];
  filters: UsuarioEmpresaPorteriaFilterState;
  setFilters: (filters: UsuarioEmpresaPorteriaFilterState) => void;
  applyFilters: (filters?: UsuarioEmpresaPorteriaFilterState) => void;
  sort: UsuarioEmpresaPorteriaSortState | null;
  setSortColumn: (column: UsuarioEmpresaPorteriaSortColumn) => void;
  pagination: UsuarioEmpresaPorteriaPagination;
  setPage: (page: number) => void;
  setPageLimit: (limit: PorteriaPageSize) => void;
  loading: boolean;
  error: string;
  reload: () => Promise<void>;
}
