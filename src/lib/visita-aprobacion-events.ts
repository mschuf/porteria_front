import type { NotificacionAprobacion } from "@/api/notificacionesAprobacion";

export const VISITA_APROBACION_NOTIFICADA_EVENT = "porteria:visita-aprobacion-notificada";

export function notifyVisitaAprobacionShown(notification: NotificacionAprobacion): void {
  window.dispatchEvent(
    new CustomEvent<NotificacionAprobacion>(VISITA_APROBACION_NOTIFICADA_EVENT, {
      detail: notification,
    }),
  );
}
