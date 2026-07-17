import { apiClient, buildApiUrl } from "./apiClient";
import type { EstadoAprobacion } from "./visitas";

export interface NotificacionAprobacion {
  id:number;
  grupoDecisionId:number;
  visitaId:number;
  estadoAprobacion:Exclude<EstadoAprobacion,"pendiente">;
  motivoRechazo:string|null;
  visitante:string;
  sedeNombre:string;
  createdAt:string;
}

export interface NotificacionAprobacionConfirmada {
  grupoDecisionId:number;
}

export interface NotificacionCorreoFallido {
  visitaId:number;
  mensaje:string;
  createdAt:string;
}

export const listarNotificacionesAprobacionPendientes=()=>apiClient.get<NotificacionAprobacion[]>("/porteria/notificaciones-aprobacion/pendientes",{showBackdrop:false});
export const confirmarNotificacionAprobacion=(id:number)=>apiClient.patch<{id:number;grupoDecisionId:number;confirmed:true}>(`/porteria/notificaciones-aprobacion/${id}/confirmacion`,undefined,{showBackdrop:false});
export const notificacionesAprobacionStreamUrl=()=>buildApiUrl("/porteria/notificaciones-aprobacion/stream");
