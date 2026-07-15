import { apiClient } from "./apiClient";
import type { Visita } from "./visitas";

export type EstadoAprobacion = "pendiente" | "aprobada" | "rechazada";
export interface EncargadoVisitaRecord extends Visita { estadoAprobacion: EstadoAprobacion; }
export interface EncargadoVisitaSummary { metrics:{today:number;approved:number;pending:number};visits:EncargadoVisitaRecord[]; }
export interface EncargadoVisitaHistory {items:EncargadoVisitaRecord[];total:number;page:number;limit:number;}
export interface EncargadoVisitaHistoryQuery {page:number;limit:number;search?:string;visitante?:string;documento?:string;empresa?:string;motivo?:string;entradaFrom?:string;entradaTo?:string;estadoAprobacion?:EstadoAprobacion;sortBy?:"id"|"visitante"|"documento"|"empresa"|"motivo"|"entradaAt";sortOrder?:"asc"|"desc";}

export const getEncargadoVisitaSummary=()=>apiClient.get<EncargadoVisitaSummary>("/encargado-visita/visitas/resumen",{showBackdrop:false});
export const getEncargadoVisitaHistory=(query:EncargadoVisitaHistoryQuery)=>apiClient.get<EncargadoVisitaHistory>("/encargado-visita/visitas/historial",{query:{...query,entradaFrom:query.entradaFrom?`${query.entradaFrom}T00:00:00.000`:undefined,entradaTo:query.entradaTo?`${query.entradaTo}T23:59:59.999`:undefined} as unknown as Record<string,string|number|undefined>});
export const decideEncargadoVisita=(id:number,estadoAprobacion:"aprobada"|"rechazada")=>apiClient.patch<EncargadoVisitaRecord>(`/encargado-visita/visitas/${id}/aprobacion`,{estadoAprobacion});
