/**
 * @file empresa-porteria.ts
 * @description Cliente HTTP CRUD de empresas de porteria (seguridad).
 */
import { apiClient } from "./apiClient";

export interface EmpresaPorteria {
  id: number;
  nombre: string;
  ruc: string | null;
  telefono: string | null;
  correo: string | null;
  activo: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface EmpresaPorteriaListado {
  items: EmpresaPorteria[];
  total: number;
  page: number;
  limit: number;
}

export type EmpresaPorteriaSortColumn = "id" | "nombre" | "ruc" | "telefono" | "correo" | "createdAt";
export type EmpresaPorteriaSortOrder = "asc" | "desc";

export interface ListarEmpresaPorteriaQuery {
  page?: number;
  limit?: number;
  search?: string;
  nombre?: string;
  ruc?: string;
  telefono?: string;
  correo?: string;
  activo?: boolean;
  sortBy?: EmpresaPorteriaSortColumn;
  sortOrder?: EmpresaPorteriaSortOrder;
}

export interface CrearEmpresaPorteriaPayload {
  nombre: string;
  ruc?: string;
  telefono?: string;
  correo?: string;
  activo?: boolean;
}

export type ActualizarEmpresaPorteriaPayload = Partial<CrearEmpresaPorteriaPayload>;

/** Lista empresas de porteria con paginacion, filtros y orden. */
export async function listarEmpresasPorteria(
  query: ListarEmpresaPorteriaQuery = {},
  options?: { signal?: AbortSignal },
): Promise<EmpresaPorteriaListado> {
  return apiClient.get<EmpresaPorteriaListado>("/empresa-porteria", {
    ...options,
    query: query as Record<string, string | number | boolean | undefined | null>,
  });
}

/** Obtiene una empresa de porteria por ID. */
export async function obtenerEmpresaPorteria(
  id: number,
  options?: { signal?: AbortSignal },
): Promise<EmpresaPorteria> {
  return apiClient.get<EmpresaPorteria>(`/empresa-porteria/${id}`, options);
}

/** Crea una empresa de porteria nueva. */
export async function crearEmpresaPorteria(
  payload: CrearEmpresaPorteriaPayload,
): Promise<EmpresaPorteria> {
  return apiClient.post<EmpresaPorteria>("/empresa-porteria", payload);
}

/** Actualiza una empresa de porteria existente. */
export async function actualizarEmpresaPorteria(
  id: number,
  payload: ActualizarEmpresaPorteriaPayload,
): Promise<EmpresaPorteria> {
  return apiClient.patch<EmpresaPorteria>(`/empresa-porteria/${id}`, payload);
}

/** Desactiva una empresa de porteria. */
export async function desactivarEmpresaPorteria(id: number): Promise<EmpresaPorteria> {
  return apiClient.patch<EmpresaPorteria>(`/empresa-porteria/${id}/deactivate`);
}

/** Reactiva una empresa de porteria previamente desactivada. */
export async function activarEmpresaPorteria(id: number): Promise<EmpresaPorteria> {
  return apiClient.patch<EmpresaPorteria>(`/empresa-porteria/${id}/activate`);
}

/** Elimina definitivamente una empresa de porteria sin relaciones. */
export async function eliminarEmpresaPorteria(id: number): Promise<{ id: number; deleted: true }> {
  return apiClient.delete<{ id: number; deleted: true }>(`/empresa-porteria/${id}`);
}
