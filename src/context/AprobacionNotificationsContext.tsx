import { useCallback,useEffect,useRef,useState,type ReactNode } from "react";
import { CheckCircle2,XCircle } from "lucide-react";
import { confirmarNotificacionAprobacion,listarNotificacionesAprobacionPendientes,notificacionesAprobacionStreamUrl,type NotificacionAprobacion,type NotificacionAprobacionConfirmada,type NotificacionCorreoFallido } from "@/api/notificacionesAprobacion";
import { Button } from "@/components/ui/button";
import { notifyVisitaAprobacionShown } from "@/lib/visita-aprobacion-events";
import { useAuth } from "./AuthContext";
import { useToast } from "./ToastContext";

function mergeQueue(current:NotificacionAprobacion[],incoming:NotificacionAprobacion[]){
 const map=new Map(current.map(item=>[item.id,item]));for(const item of incoming)map.set(item.id,item);
 return [...map.values()].sort((a,b)=>a.createdAt.localeCompare(b.createdAt)||a.id-b.id);
}

export function AprobacionNotificationsProvider({children}:{children:ReactNode}){
 const {user}=useAuth(),[queue,setQueue]=useState<NotificacionAprobacion[]>([]),[confirming,setConfirming]=useState(false),[error,setError]=useState("");
 const confirmedGroupsRef=useRef(new Set<number>());
 const toast=useToast();
 const enabled=Boolean(user);
 const add=useCallback((items:NotificacionAprobacion[])=>setQueue(current=>mergeQueue(current,items.filter(item=>!confirmedGroupsRef.current.has(item.grupoDecisionId)))),[]);
 useEffect(()=>{
  if(!enabled){setQueue([]);confirmedGroupsRef.current.clear();return;}
  confirmedGroupsRef.current.clear();
  let cancelled=false;const source=new EventSource(notificacionesAprobacionStreamUrl(),{withCredentials:true});
  void listarNotificacionesAprobacionPendientes().then(items=>{if(!cancelled)add(items);}).catch(()=>undefined);
  const receive=(event:Event)=>{try{const item=JSON.parse((event as MessageEvent<string>).data) as NotificacionAprobacion;add([item]);}catch{/* Ignorar eventos inválidos. */}};
  const receiveConfirmation=(event:Event)=>{try{const item=JSON.parse((event as MessageEvent<string>).data) as NotificacionAprobacionConfirmada;confirmedGroupsRef.current.add(item.grupoDecisionId);setQueue(items=>items.filter(notification=>notification.grupoDecisionId!==item.grupoDecisionId));}catch{/* Ignorar eventos inválidos. */}};
  const receiveMailFailure=(event:Event)=>{try{const item=JSON.parse((event as MessageEvent<string>).data) as NotificacionCorreoFallido;toast.error(item.mensaje,"Notificación por correo");}catch{/* Ignorar eventos inválidos. */}};
  source.addEventListener("visita.aprobacion",receive);
  source.addEventListener("visita.aprobacion-confirmada",receiveConfirmation);
  source.addEventListener("visita.correo-fallido",receiveMailFailure);
  return()=>{cancelled=true;source.removeEventListener("visita.aprobacion",receive);source.removeEventListener("visita.aprobacion-confirmada",receiveConfirmation);source.removeEventListener("visita.correo-fallido",receiveMailFailure);source.close();};
 },[add,enabled,toast,user?.id]);
 const current=queue[0];
 useEffect(()=>{
  if(current)notifyVisitaAprobacionShown(current);
 },[current]);
 const confirm=async()=>{if(!current||confirming)return;setConfirming(true);setError("");try{const result=await confirmarNotificacionAprobacion(current.id);confirmedGroupsRef.current.add(result.grupoDecisionId);setQueue(items=>items.filter(item=>item.grupoDecisionId!==result.grupoDecisionId));}catch(e){setError(e instanceof Error?e.message:"No se pudo confirmar la notificación");}finally{setConfirming(false);}};
 const dismiss=()=>{if(!current||confirming)return;setError("");setQueue(items=>items.filter(item=>item.id!==current.id));};
 return <>{children}{current?<div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/90 p-5 text-white" role="alertdialog" aria-modal="true" aria-labelledby="approval-notification-title"><div className="w-full max-w-2xl text-center">{current.estadoAprobacion==="aprobada"?<CheckCircle2 className="mx-auto h-24 w-24 text-emerald-400" aria-hidden="true"/>:<XCircle className="mx-auto h-24 w-24 text-red-400" aria-hidden="true"/>}<p className="mt-6 text-sm font-semibold uppercase tracking-[0.25em] text-slate-300">Visita #{current.visitaId} · {current.sedeNombre}</p><h2 id="approval-notification-title" className="mt-3 text-3xl font-bold sm:text-5xl">La visita de {current.visitante} fue {current.estadoAprobacion==="aprobada"?"aprobada":"rechazada"}</h2>{current.estadoAprobacion==="rechazada"?<div className="mx-auto mt-7 max-w-xl rounded-xl border border-red-400/40 bg-red-950/50 p-5"><p className="text-sm uppercase tracking-wide text-red-200">Motivo del rechazo</p><p className="mt-2 text-xl font-medium">{current.motivoRechazo}</p></div>:null}{error?<p className="mt-5 text-red-300">{error}</p>:null}<div className="mt-8 flex flex-wrap items-center justify-center gap-3"><Button size="default" variant="outline" className="min-w-40 border-slate-500 bg-transparent text-white hover:bg-slate-800 hover:text-white" disabled={confirming} onClick={dismiss}>Cerrar</Button><Button size="default" className="min-w-40 bg-white text-slate-950 hover:bg-slate-200" disabled={confirming} onClick={()=>void confirm()}>{confirming?"Confirmando...":"Entendido"}</Button></div>{queue.length>1?<p className="mt-4 text-sm text-slate-400">Quedan {queue.length-1} avisos pendientes</p>:null}</div></div>:null}</>;
}
