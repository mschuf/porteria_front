/**
 * @file usuarios-admin-page.types.ts
 * @description Tipos para la pagina CRUD de usuarios.
 */
import type { UsuarioAdmin, UsuarioAdminRol, UsuarioAdminSortColumn, UsuarioAdminSortOrder } from "@/api/usuariosAdmin";
import type { PorteriaPageSize } from "@/lib/porteria";

export interface UsuariosAdminFilterState {
  search: string;
  usuario: string;
  nombre: string;
  correo: string;
  rol: "" | UsuarioAdminRol;
  activo: "" | "true" | "false";
}

export interface UsuariosAdminSortState {
  column: UsuarioAdminSortColumn;
  order: UsuarioAdminSortOrder;
}

export interface UsuariosAdminPagination {
  page: number;
  limit: PorteriaPageSize;
  total: number;
  totalPages: number;
}

export interface UseUsuariosAdminResult {
  items: UsuarioAdmin[];
  filters: UsuariosAdminFilterState;
  setFilters: (filters: UsuariosAdminFilterState) => void;
  applyFilters: (filters?: UsuariosAdminFilterState) => void;
  sort: UsuariosAdminSortState | null;
  setSortColumn: (column: UsuarioAdminSortColumn) => void;
  pagination: UsuariosAdminPagination;
  setPage: (page: number) => void;
  setPageLimit: (limit: PorteriaPageSize) => void;
  loading: boolean;
  error: string;
  reload: () => Promise<void>;
}
