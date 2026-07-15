import { useState } from "react";
import { Check,ChevronDown,Clock3,X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { AprobacionBadge } from "@/components/visitas/AprobacionBadge";
import { useRegisterPorteriaRefresh } from "@/context/PorteriaRefreshContext";
import { useEncargadoVisitaSummary } from "@/hooks/useEncargadoVisita";
import type { EncargadoVisitaRecord } from "@/api/encargadoVisita";

type Decide=(id:number,status:"aprobada"|"rechazada",motivoRechazo?:string)=>Promise<void>;

function VisitCard({visit,onDecide}:{visit:EncargadoVisitaRecord;onDecide:Decide}){
 const [saving,setSaving]=useState(false),[rejectOpen,setRejectOpen]=useState(false),[reason,setReason]=useState(""),[actionError,setActionError]=useState("");
 const approve=async()=>{setSaving(true);setActionError("");try{await onDecide(visit.id,"aprobada");}catch(e){setActionError(e instanceof Error?e.message:"No se pudo aprobar la visita");}finally{setSaving(false);}};
 const reject=async()=>{const trimmed=reason.trim();if(!trimmed){setActionError("El motivo del rechazo es obligatorio.");return;}setSaving(true);setActionError("");try{await onDecide(visit.id,"rechazada",trimmed);setRejectOpen(false);setReason("");}catch(e){setActionError(e instanceof Error?e.message:"No se pudo rechazar la visita");}finally{setSaving(false);}};
 return <>
  <article className="rounded-xl border bg-card p-4 shadow-soft">
   <div className="flex items-start justify-between gap-3"><div className="min-w-0"><p className="truncate font-semibold">{visit.visitante}</p><p className="truncate text-sm text-muted-foreground">{visit.empresa??"—"}</p></div><AprobacionBadge estado={visit.estadoAprobacion} motivoRechazo={visit.motivoRechazo}/></div>
   <div className="mt-3 grid gap-2 text-sm sm:grid-cols-2"><p><span className="text-muted-foreground">Motivo:</span> {visit.motivo}</p><p><span className="text-muted-foreground">Sede:</span> {visit.sedeNombre}</p><p className="flex items-center gap-1"><Clock3 className="h-4 w-4"/>{visit.entradaAt?new Date(visit.entradaAt).toLocaleTimeString("es-PY",{hour:"2-digit",minute:"2-digit"}):"—"}</p></div>
   {visit.estadoAprobacion==="rechazada"?<p className="mt-3 rounded-md border border-red-200 bg-red-50 p-2 text-sm text-red-800"><span className="font-medium">Motivo del rechazo:</span> {visit.motivoRechazo}</p>:null}
   {actionError&&!rejectOpen?<p className="mt-3 text-sm text-red-700">{actionError}</p>:null}
   {visit.estadoAprobacion!=="aprobada"?<div className="mt-4 flex gap-2"><Button size="sm" disabled={saving} onClick={()=>void approve()}><Check className="mr-1 h-4 w-4"/>Aprobar</Button>{visit.estadoAprobacion==="pendiente"?<Button size="sm" variant="outline" disabled={saving} onClick={()=>{setActionError("");setRejectOpen(true);}}><X className="mr-1 h-4 w-4"/>Rechazar</Button>:null}</div>:null}
  </article>
  <Dialog open={rejectOpen} onOpenChange={setRejectOpen} title={`Rechazar visita #${visit.id}`} description={`Ingresá el motivo del rechazo para ${visit.visitante}.`} className="max-w-lg">
   <div className="space-y-3"><label className="block space-y-1"><span className="text-sm font-medium">Motivo del rechazo</span><Textarea value={reason} maxLength={250} rows={5} autoFocus onChange={e=>{setReason(e.target.value);setActionError("");}} placeholder="Escribí el motivo..."/></label><div className="flex items-center justify-between text-xs text-muted-foreground"><span>{actionError?<span className="text-red-700">{actionError}</span>:"Campo obligatorio"}</span><span>{reason.length}/250</span></div><div className="flex justify-end gap-2"><Button variant="outline" disabled={saving} onClick={()=>setRejectOpen(false)}>Cancelar</Button><Button variant="destructive" disabled={saving||!reason.trim()} onClick={()=>void reject()}>Rechazar</Button></div></div>
  </Dialog>
 </>;
}
function Section({title,visits,onDecide}:{title:string;visits:EncargadoVisitaRecord[];onDecide:Decide}){return <section className="space-y-3"><h2 className="font-semibold">{title} <span className="text-muted-foreground">({visits.length})</span></h2>{visits.length?<div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">{visits.map(v=><VisitCard key={v.id} visit={v} onDecide={onDecide}/>)}</div>:<p className="rounded-xl border border-dashed p-6 text-center text-sm text-muted-foreground">No hay visitas en esta sección.</p>}</section>}
export default function EncargadoVisitaPage(){const {data,loading,error,refresh,decide}=useEncargadoVisitaSummary();const [rejectedOpen,setRejectedOpen]=useState(false);useRegisterPorteriaRefresh(refresh,loading);const approved=data.visits.filter(v=>v.estadoAprobacion==="aprobada"),pending=data.visits.filter(v=>v.estadoAprobacion==="pendiente"),rejected=data.visits.filter(v=>v.estadoAprobacion==="rechazada");return <div className="space-y-6">{error?<p className="rounded-md border border-red-200 bg-red-50 p-3 text-sm text-red-700">{error}</p>:null}<section className="grid gap-3 sm:grid-cols-3">{[["Tus visitas hoy",data.metrics.today],["Visitas aprobadas",data.metrics.approved],["Visitas por aprobar",data.metrics.pending]].map(([label,value])=><article key={String(label)} className="rounded-xl border bg-card p-4 shadow-soft"><p className="text-sm text-muted-foreground">{label}</p><p className="mt-2 text-3xl font-semibold tabular-nums">{value}</p></article>)}</section>{loading?<p className="rounded-xl border p-8 text-center text-sm text-muted-foreground">Cargando visitas...</p>:<><Section title="Visitas aprobadas" visits={approved} onDecide={decide}/><Section title="Por aprobar" visits={pending} onDecide={decide}/><section className="space-y-3"><button type="button" className="flex w-full items-center justify-center gap-2 rounded-md border bg-card p-3 text-sm font-medium" onClick={()=>setRejectedOpen(v=>!v)} aria-expanded={rejectedOpen}>Visitas rechazadas ({rejected.length})<ChevronDown className={`h-4 w-4 transition-transform ${rejectedOpen?"rotate-180":""}`}/></button>{rejectedOpen?<Section title="Rechazadas" visits={rejected} onDecide={decide}/>:null}</section></>}</div>}
