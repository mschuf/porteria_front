/**
 * @file usuario-empresa-page.types.ts
 * @description Tipos para la pagina CRUD de asignaciones usuario-empresa.
 */
import type {
  UsuarioEmpresa,
  UsuarioEmpresaSortColumn,
  UsuarioEmpresaSortOrder,
} from "@/api/usuario-empresa";
import type { PorteriaPageSize } from "@/lib/porteria";

export interface UsuarioEmpresaFilterState {
  search: string;
  usuarioId: string;
  empresaId: string;
  activo: "" | "true" | "false";
}

export interface UsuarioEmpresaSortState {
  column: UsuarioEmpresaSortColumn;
  order: UsuarioEmpresaSortOrder;
}

export interface UsuarioEmpresaPagination {
  page: number;
  limit: PorteriaPageSize;
  total: number;
  totalPages: number;
}

export interface UseUsuarioEmpresaResult {
  items: UsuarioEmpresa[];
  filters: UsuarioEmpresaFilterState;
  setFilters: (filters: UsuarioEmpresaFilterState) => void;
  applyFilters: (filters?: UsuarioEmpresaFilterState) => void;
  sort: UsuarioEmpresaSortState | null;
  setSortColumn: (column: UsuarioEmpresaSortColumn) => void;
  pagination: UsuarioEmpresaPagination;
  setPage: (page: number) => void;
  setPageLimit: (limit: PorteriaPageSize) => void;
  loading: boolean;
  error: string;
  reload: () => Promise<void>;
}
