/**
 * @file empresas.ts
 * @description Cliente HTTP CRUD de empresas receptoras.
 */
import { apiClient } from "./apiClient";

export interface Empresa {
  id: number;
  nombre: string;
  ruc: string | null;
  direccion: string | null;
  telefono: string | null;
  correo: string | null;
  activo: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface EmpresaListado {
  items: Empresa[];
  total: number;
  page: number;
  limit: number;
}

export type EmpresaSortColumn =
  | "id"
  | "nombre"
  | "ruc"
  | "direccion"
  | "telefono"
  | "correo"
  | "createdAt";
export type EmpresaSortOrder = "asc" | "desc";

export interface ListarEmpresasQuery {
  page?: number;
  limit?: number;
  search?: string;
  nombre?: string;
  ruc?: string;
  direccion?: string;
  telefono?: string;
  correo?: string;
  activo?: boolean;
  sortBy?: EmpresaSortColumn;
  sortOrder?: EmpresaSortOrder;
}

export interface CrearEmpresaPayload {
  nombre: string;
  ruc?: string;
  direccion?: string;
  telefono?: string;
  correo?: string;
  activo?: boolean;
}

export type ActualizarEmpresaPayload = Partial<CrearEmpresaPayload>;

/** Lista empresas con paginacion, filtros y orden. */
export async function listarEmpresas(
  query: ListarEmpresasQuery = {},
  options?: { signal?: AbortSignal },
): Promise<EmpresaListado> {
  return apiClient.get<EmpresaListado>("/empresas", {
    ...options,
    query: query as Record<string, string | number | boolean | undefined | null>,
  });
}

/** Obtiene una empresa por ID. */
export async function obtenerEmpresa(id: number, options?: { signal?: AbortSignal }): Promise<Empresa> {
  return apiClient.get<Empresa>(`/empresas/${id}`, options);
}

/** Crea una empresa nueva. */
export async function crearEmpresa(payload: CrearEmpresaPayload): Promise<Empresa> {
  return apiClient.post<Empresa>("/empresas", payload);
}

/** Actualiza una empresa existente. */
export async function actualizarEmpresa(
  id: number,
  payload: ActualizarEmpresaPayload,
): Promise<Empresa> {
  return apiClient.patch<Empresa>(`/empresas/${id}`, payload);
}

/** Desactiva una empresa. */
export async function desactivarEmpresa(id: number): Promise<Empresa> {
  return apiClient.patch<Empresa>(`/empresas/${id}/deactivate`);
}

/** Reactiva una empresa previamente desactivada. */
export async function activarEmpresa(id: number): Promise<Empresa> {
  return apiClient.patch<Empresa>(`/empresas/${id}/activate`);
}

/** Elimina definitivamente una empresa sin relaciones. */
export async function eliminarEmpresa(id: number): Promise<{ id: number; deleted: true }> {
  return apiClient.delete<{ id: number; deleted: true }>(`/empresas/${id}`);
}

