import type { EstadoAprobacion } from "@/api/visitas";
import { Badge } from "@/components/ui/badge";

const LABEL:Record<EstadoAprobacion,string>={pendiente:"Pendiente",aprobada:"Aprobado",rechazada:"Rechazado",cancelada:"Cancelada"};
const VARIANT:Record<EstadoAprobacion,"default"|"warning"|"success"|"danger">={pendiente:"warning",aprobada:"success",rechazada:"danger",cancelada:"default"};

export function AprobacionBadge({estado,motivoRechazo}:{estado:EstadoAprobacion;motivoRechazo:string|null}){
  const title=estado==="rechazada"&&motivoRechazo?motivoRechazo:undefined;
  const ariaLabel=title?`${LABEL[estado]}. Motivo: ${title}`:LABEL[estado];
  return <Badge variant={VARIANT[estado]} title={title} aria-label={ariaLabel}>{LABEL[estado]}</Badge>;
}
