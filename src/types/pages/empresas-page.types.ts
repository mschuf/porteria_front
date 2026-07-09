/**
 * @file empresas-page.types.ts
 * @description Tipos para la pagina CRUD de empresas.
 */
import type { Empresa, EmpresaSortColumn, EmpresaSortOrder } from "@/api/empresas";
import type { PorteriaPageSize } from "@/lib/porteria";

export interface EmpresasFilterState {
  search: string;
  nombre: string;
  ruc: string;
  direccion: string;
  telefono: string;
  correo: string;
  activo: "" | "true" | "false";
}

export interface EmpresasSortState {
  column: EmpresaSortColumn;
  order: EmpresaSortOrder;
}

export interface EmpresasPagination {
  page: number;
  limit: PorteriaPageSize;
  total: number;
  totalPages: number;
}

export interface UseEmpresasResult {
  items: Empresa[];
  filters: EmpresasFilterState;
  setFilters: (filters: EmpresasFilterState) => void;
  applyFilters: (filters?: EmpresasFilterState) => void;
  sort: EmpresasSortState | null;
  setSortColumn: (column: EmpresaSortColumn) => void;
  pagination: EmpresasPagination;
  setPage: (page: number) => void;
  setPageLimit: (limit: PorteriaPageSize) => void;
  loading: boolean;
  error: string;
  reload: () => Promise<void>;
}

