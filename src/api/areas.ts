import { apiClient } from "./apiClient";

export interface Area { id: number; sedeId: number; sedeNombre: string; empresaNombre: string; nombre: string; activo: boolean; createdAt: string; updatedAt: string; }
export interface AreaListado { items: Area[]; total: number; page: number; limit: number; }
export type AreaSortColumn = "id" | "sedeId" | "nombre" | "activo" | "createdAt";
export type SortOrder = "asc" | "desc";
export interface ListarAreasQuery { page?: number; limit?: number; search?: string; sedeId?: number; nombre?: string; activo?: boolean; sortBy?: AreaSortColumn; sortOrder?: SortOrder; }
export interface CrearAreaPayload { sedeId: number; nombre: string; activo?: boolean; }
export type ActualizarAreaPayload = Partial<Omit<CrearAreaPayload, "sedeId">>;

export const listarAreas = (query: ListarAreasQuery = {}) => apiClient.get<AreaListado>("/areas", { query: query as Record<string, string | number | boolean | undefined> });
export const crearArea = (payload: CrearAreaPayload) => apiClient.post<Area>("/areas", payload);
export const actualizarArea = (id: number, payload: ActualizarAreaPayload) => apiClient.patch<Area>(`/areas/${id}`, payload);
export const activarArea = (id: number) => apiClient.patch<Area>(`/areas/${id}/activate`);
export const desactivarArea = (id: number) => apiClient.patch<Area>(`/areas/${id}/deactivate`);
export const eliminarArea = (id: number) => apiClient.delete<{ id: number; deleted: true }>(`/areas/${id}`);
