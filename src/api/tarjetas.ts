import { apiClient } from "./apiClient";
import type { Area } from "./areas";

export const TARJETA_ICONOS = ["Badge", "BadgeCheck", "Building", "Building2", "CircleUserRound", "Contact", "CreditCard", "DoorClosed", "DoorOpen", "Factory", "Fingerprint", "IdCard", "KeyRound", "Landmark", "LockKeyhole", "MapPin", "ScanFace", "Shield", "ShieldCheck", "Tag", "TicketCheck", "UserRoundCheck", "Warehouse"] as const;
export type TarjetaIcono = (typeof TARJETA_ICONOS)[number];
export interface Tarjeta { id: number; sedeId: number; sedeNombre: string; empresaNombre: string; numero: number; color: string; icono: TarjetaIcono; activo: boolean; enUso: boolean; areas: Area[]; createdAt: string; updatedAt: string; }
export interface TarjetaListado { items: Tarjeta[]; total: number; page: number; limit: number; }
export type TarjetaSortColumn = "id" | "sedeId" | "numero" | "color" | "icono" | "activo" | "enUso" | "createdAt";
export type SortOrder = "asc" | "desc";
export interface ListarTarjetasQuery { page?: number; limit?: number; search?: string; sedeId?: number; numero?: number; color?: string; icono?: string; areaId?: number; activo?: boolean; enUso?: boolean; sortBy?: TarjetaSortColumn; sortOrder?: SortOrder; }
export interface CrearTarjetaPayload { sedeId: number; numero: number; color: string; icono: TarjetaIcono; areaIds: number[]; activo?: boolean; enUso?: boolean; }
export type ActualizarTarjetaPayload = Partial<Omit<CrearTarjetaPayload, "sedeId">>;

export const listarTarjetas = (query: ListarTarjetasQuery = {}) => apiClient.get<TarjetaListado>("/tarjetas", { query: query as Record<string, string | number | boolean | undefined> });
export const crearTarjeta = (payload: CrearTarjetaPayload) => apiClient.post<Tarjeta>("/tarjetas", payload);
export const actualizarTarjeta = (id: number, payload: ActualizarTarjetaPayload) => apiClient.patch<Tarjeta>(`/tarjetas/${id}`, payload);
export const activarTarjeta = (id: number) => apiClient.patch<Tarjeta>(`/tarjetas/${id}/activate`);
export const desactivarTarjeta = (id: number) => apiClient.patch<Tarjeta>(`/tarjetas/${id}/deactivate`);
export const eliminarTarjeta = (id: number) => apiClient.delete<{ id: number; deleted: true }>(`/tarjetas/${id}`);
