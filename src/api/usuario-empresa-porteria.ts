/**
 * @file usuario-empresa-porteria.ts
 * @description Cliente HTTP CRUD de asignaciones usuario-empresa-porteria.
 */
import { apiClient } from "./apiClient";

export interface UsuarioEmpresaPorteria {
  id: number;
  usuarioId: number;
  usuarioNombre: string;
  empresaPorteriaId: number;
  empresaPorteriaNombre: string;
  sedeEmpresaPorteriaId: number;
  sedeId: number;
  sedeNombre: string;
  activo: boolean;
  createdAt: string;
}

export interface UsuarioEmpresaPorteriaListado {
  items: UsuarioEmpresaPorteria[];
  total: number;
  page: number;
  limit: number;
}

export type UsuarioEmpresaPorteriaSortColumn = "id" | "usuarioId" | "empresaPorteriaId" | "sedeId" | "createdAt";
export type UsuarioEmpresaPorteriaSortOrder = "asc" | "desc";

export interface ListarUsuarioEmpresaPorteriaQuery {
  page?: number;
  limit?: number;
  search?: string;
  usuarioId?: number;
  empresaPorteriaId?: number;
  sedeId?: number;
  activo?: boolean;
  sortBy?: UsuarioEmpresaPorteriaSortColumn;
  sortOrder?: UsuarioEmpresaPorteriaSortOrder;
}

export interface CrearUsuarioEmpresaPorteriaPayload {
  usuarioId: number;
  empresaPorteriaId: number;
  sedeEmpresaPorteriaId: number;
  activo?: boolean;
}

export type ActualizarUsuarioEmpresaPorteriaPayload = Partial<CrearUsuarioEmpresaPorteriaPayload>;

/** Lista asignaciones usuario-empresa-porteria con paginacion, filtros y orden. */
export async function listarUsuarioEmpresaPorteria(
  query: ListarUsuarioEmpresaPorteriaQuery = {},
  options?: { signal?: AbortSignal },
): Promise<UsuarioEmpresaPorteriaListado> {
  return apiClient.get<UsuarioEmpresaPorteriaListado>("/usuario-empresa-porteria", {
    ...options,
    query: query as Record<string, string | number | boolean | undefined | null>,
  });
}

/** Obtiene una asignacion usuario-empresa-porteria por ID. */
export async function obtenerUsuarioEmpresaPorteria(
  id: number,
  options?: { signal?: AbortSignal },
): Promise<UsuarioEmpresaPorteria> {
  return apiClient.get<UsuarioEmpresaPorteria>(`/usuario-empresa-porteria/${id}`, options);
}

/** Crea una asignacion usuario-empresa-porteria nueva. */
export async function crearUsuarioEmpresaPorteria(
  payload: CrearUsuarioEmpresaPorteriaPayload,
): Promise<UsuarioEmpresaPorteria> {
  return apiClient.post<UsuarioEmpresaPorteria>("/usuario-empresa-porteria", payload);
}

/** Actualiza una asignacion usuario-empresa-porteria existente. */
export async function actualizarUsuarioEmpresaPorteria(
  id: number,
  payload: ActualizarUsuarioEmpresaPorteriaPayload,
): Promise<UsuarioEmpresaPorteria> {
  return apiClient.patch<UsuarioEmpresaPorteria>(`/usuario-empresa-porteria/${id}`, payload);
}

/** Desactiva una asignacion usuario-empresa-porteria. */
export async function desactivarUsuarioEmpresaPorteria(id: number): Promise<UsuarioEmpresaPorteria> {
  return apiClient.patch<UsuarioEmpresaPorteria>(`/usuario-empresa-porteria/${id}/deactivate`);
}

/** Reactiva una asignacion usuario-empresa-porteria previamente desactivada. */
export async function activarUsuarioEmpresaPorteria(id: number): Promise<UsuarioEmpresaPorteria> {
  return apiClient.patch<UsuarioEmpresaPorteria>(`/usuario-empresa-porteria/${id}/activate`);
}

/** Elimina definitivamente una asignacion usuario-empresa-porteria. */
export async function eliminarUsuarioEmpresaPorteria(id: number): Promise<{ id: number; deleted: true }> {
  return apiClient.delete<{ id: number; deleted: true }>(`/usuario-empresa-porteria/${id}`);
}
