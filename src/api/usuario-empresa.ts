/**
 * @file usuario-empresa.ts
 * @description Cliente HTTP CRUD de asignaciones usuario-empresa.
 */
import { apiClient } from "./apiClient";

export interface UsuarioEmpresa {
  id: number;
  usuarioId: number;
  usuarioNombre: string;
  empresaId: number;
  empresaNombre: string;
  activo: boolean;
  createdAt: string;
}

export interface UsuarioEmpresaListado {
  items: UsuarioEmpresa[];
  total: number;
  page: number;
  limit: number;
}

export type UsuarioEmpresaSortColumn = "id" | "usuarioId" | "empresaId" | "createdAt";
export type UsuarioEmpresaSortOrder = "asc" | "desc";

export interface ListarUsuarioEmpresaQuery {
  page?: number;
  limit?: number;
  search?: string;
  usuarioId?: number;
  empresaId?: number;
  activo?: boolean;
  sortBy?: UsuarioEmpresaSortColumn;
  sortOrder?: UsuarioEmpresaSortOrder;
}

export interface CrearUsuarioEmpresaPayload {
  usuarioId: number;
  empresaId: number;
  activo?: boolean;
}

export type ActualizarUsuarioEmpresaPayload = Partial<CrearUsuarioEmpresaPayload>;

/** Lista asignaciones usuario-empresa con paginacion, filtros y orden. */
export async function listarUsuarioEmpresa(
  query: ListarUsuarioEmpresaQuery = {},
  options?: { signal?: AbortSignal },
): Promise<UsuarioEmpresaListado> {
  return apiClient.get<UsuarioEmpresaListado>("/usuario-empresa", {
    ...options,
    query: query as Record<string, string | number | boolean | undefined | null>,
  });
}

/** Obtiene una asignacion usuario-empresa por ID. */
export async function obtenerUsuarioEmpresa(
  id: number,
  options?: { signal?: AbortSignal },
): Promise<UsuarioEmpresa> {
  return apiClient.get<UsuarioEmpresa>(`/usuario-empresa/${id}`, options);
}

/** Crea una asignacion usuario-empresa nueva. */
export async function crearUsuarioEmpresa(payload: CrearUsuarioEmpresaPayload): Promise<UsuarioEmpresa> {
  return apiClient.post<UsuarioEmpresa>("/usuario-empresa", payload);
}

/** Actualiza una asignacion usuario-empresa existente. */
export async function actualizarUsuarioEmpresa(
  id: number,
  payload: ActualizarUsuarioEmpresaPayload,
): Promise<UsuarioEmpresa> {
  return apiClient.patch<UsuarioEmpresa>(`/usuario-empresa/${id}`, payload);
}

/** Desactiva una asignacion usuario-empresa. */
export async function desactivarUsuarioEmpresa(id: number): Promise<UsuarioEmpresa> {
  return apiClient.patch<UsuarioEmpresa>(`/usuario-empresa/${id}/deactivate`);
}

/** Reactiva una asignacion usuario-empresa previamente desactivada. */
export async function activarUsuarioEmpresa(id: number): Promise<UsuarioEmpresa> {
  return apiClient.patch<UsuarioEmpresa>(`/usuario-empresa/${id}/activate`);
}

/** Elimina definitivamente una asignacion usuario-empresa. */
export async function eliminarUsuarioEmpresa(id: number): Promise<{ id: number; deleted: true }> {
  return apiClient.delete<{ id: number; deleted: true }>(`/usuario-empresa/${id}`);
}
