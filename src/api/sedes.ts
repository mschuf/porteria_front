/**
 * @file sedes.ts
 * @description Cliente HTTP CRUD de sedes.
 */
import { apiClient } from "./apiClient";

export interface Sede {
  id: number;
  empresaId: number;
  empresaNombre: string;
  nombre: string;
  direccion: string | null;
  telefono: string | null;
  activo: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface SedeListado {
  items: Sede[];
  total: number;
  page: number;
  limit: number;
}

export type SedeSortColumn = "id" | "nombre" | "direccion" | "telefono" | "empresaId" | "createdAt";
export type SedeSortOrder = "asc" | "desc";

export interface ListarSedesQuery {
  page?: number;
  limit?: number;
  search?: string;
  nombre?: string;
  direccion?: string;
  telefono?: string;
  empresaId?: number;
  activo?: boolean;
  sortBy?: SedeSortColumn;
  sortOrder?: SedeSortOrder;
}

export interface CrearSedePayload {
  empresaId: number;
  nombre: string;
  direccion?: string;
  telefono?: string;
  activo?: boolean;
}

export type ActualizarSedePayload = Partial<CrearSedePayload>;

/** Lista sedes con paginacion, filtros y orden. */
export async function listarSedes(
  query: ListarSedesQuery = {},
  options?: { signal?: AbortSignal },
): Promise<SedeListado> {
  return apiClient.get<SedeListado>("/sedes", {
    ...options,
    query: query as Record<string, string | number | boolean | undefined | null>,
  });
}

/** Obtiene una sede por ID. */
export async function obtenerSede(id: number, options?: { signal?: AbortSignal }): Promise<Sede> {
  return apiClient.get<Sede>(`/sedes/${id}`, options);
}

/** Crea una sede nueva. */
export async function crearSede(payload: CrearSedePayload): Promise<Sede> {
  return apiClient.post<Sede>("/sedes", payload);
}

/** Actualiza una sede existente. */
export async function actualizarSede(id: number, payload: ActualizarSedePayload): Promise<Sede> {
  return apiClient.patch<Sede>(`/sedes/${id}`, payload);
}

/** Desactiva una sede. */
export async function desactivarSede(id: number): Promise<Sede> {
  return apiClient.patch<Sede>(`/sedes/${id}/deactivate`);
}

/** Reactiva una sede previamente desactivada. */
export async function activarSede(id: number): Promise<Sede> {
  return apiClient.patch<Sede>(`/sedes/${id}/activate`);
}

/** Elimina definitivamente una sede sin relaciones. */
export async function eliminarSede(id: number): Promise<{ id: number; deleted: true }> {
  return apiClient.delete<{ id: number; deleted: true }>(`/sedes/${id}`);
}
