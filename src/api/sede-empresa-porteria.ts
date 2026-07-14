/**
 * @file sede-empresa-porteria.ts
 * @description Cliente HTTP CRUD de asignaciones sede-empresa de seguridad.
 */
import { apiClient } from "./apiClient";

export interface SedeEmpresaPorteria {
  id: number;
  sedeId: number;
  sedeNombre: string;
  empresaPorteriaId: number;
  empresaPorteriaNombre: string;
  activo: boolean;
  asignadoDesde: string;
  asignadoHasta: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface SedeEmpresaPorteriaListado {
  items: SedeEmpresaPorteria[];
  total: number;
  page: number;
  limit: number;
}

export type SedeEmpresaPorteriaSortColumn =
  | "id"
  | "sedeId"
  | "empresaPorteriaId"
  | "asignadoDesde"
  | "asignadoHasta"
  | "createdAt";
export type SedeEmpresaPorteriaSortOrder = "asc" | "desc";

export interface ListarSedeEmpresaPorteriaQuery {
  page?: number;
  limit?: number;
  search?: string;
  sedeId?: number;
  empresaPorteriaId?: number;
  activo?: boolean;
  sortBy?: SedeEmpresaPorteriaSortColumn;
  sortOrder?: SedeEmpresaPorteriaSortOrder;
}

export interface CrearSedeEmpresaPorteriaPayload {
  sedeId: number;
  empresaPorteriaId: number;
  activo?: boolean;
  asignadoDesde?: string;
  asignadoHasta?: string | null;
}

export type ActualizarSedeEmpresaPorteriaPayload = Partial<CrearSedeEmpresaPorteriaPayload>;

/** Lista asignaciones sede-empresa de seguridad con paginacion, filtros y orden. */
export async function listarSedeEmpresaPorteria(
  query: ListarSedeEmpresaPorteriaQuery = {},
  options?: { signal?: AbortSignal },
): Promise<SedeEmpresaPorteriaListado> {
  return apiClient.get<SedeEmpresaPorteriaListado>("/sede-empresa-porteria", {
    ...options,
    query: query as Record<string, string | number | boolean | undefined | null>,
  });
}

/** Obtiene una asignacion sede-empresa de seguridad por ID. */
export async function obtenerSedeEmpresaPorteria(
  id: number,
  options?: { signal?: AbortSignal },
): Promise<SedeEmpresaPorteria> {
  return apiClient.get<SedeEmpresaPorteria>(`/sede-empresa-porteria/${id}`, options);
}

/** Crea una asignacion sede-empresa de seguridad nueva. */
export async function crearSedeEmpresaPorteria(
  payload: CrearSedeEmpresaPorteriaPayload,
): Promise<SedeEmpresaPorteria> {
  return apiClient.post<SedeEmpresaPorteria>("/sede-empresa-porteria", payload);
}

/** Actualiza una asignacion sede-empresa de seguridad existente. */
export async function actualizarSedeEmpresaPorteria(
  id: number,
  payload: ActualizarSedeEmpresaPorteriaPayload,
): Promise<SedeEmpresaPorteria> {
  return apiClient.patch<SedeEmpresaPorteria>(`/sede-empresa-porteria/${id}`, payload);
}

/** Desactiva una asignacion sede-empresa de seguridad. */
export async function desactivarSedeEmpresaPorteria(id: number): Promise<SedeEmpresaPorteria> {
  return apiClient.patch<SedeEmpresaPorteria>(`/sede-empresa-porteria/${id}/deactivate`);
}

/** Reactiva una asignacion sede-empresa de seguridad previamente desactivada. */
export async function activarSedeEmpresaPorteria(id: number): Promise<SedeEmpresaPorteria> {
  return apiClient.patch<SedeEmpresaPorteria>(`/sede-empresa-porteria/${id}/activate`);
}

/** Elimina definitivamente una asignacion sede-empresa de seguridad. */
export async function eliminarSedeEmpresaPorteria(id: number): Promise<{ id: number; deleted: true }> {
  return apiClient.delete<{ id: number; deleted: true }>(`/sede-empresa-porteria/${id}`);
}
