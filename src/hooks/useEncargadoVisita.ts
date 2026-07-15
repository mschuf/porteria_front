import { useCallback,useEffect,useState } from "react";
import { ApiError } from "@/api/apiClient";
import { decideEncargadoVisita,getEncargadoVisitaHistory,getEncargadoVisitaSummary,type EncargadoVisitaHistoryQuery,type EncargadoVisitaRecord,type EncargadoVisitaSummary } from "@/api/encargadoVisita";

export function useEncargadoVisitaSummary(){
 const [data,setData]=useState<EncargadoVisitaSummary>({metrics:{today:0,approved:0,pending:0},visits:[]});const [loading,setLoading]=useState(true);const [error,setError]=useState("");
 const refresh=useCallback(async()=>{setLoading(true);setError("");try{setData(await getEncargadoVisitaSummary());}catch(e){setError(e instanceof ApiError?e.message:"No se pudo cargar la vista rápida");}finally{setLoading(false);}},[]);
 const decide=useCallback(async(id:number,status:"aprobada"|"rechazada")=>{await decideEncargadoVisita(id,status);await refresh();},[refresh]);
 useEffect(()=>{void refresh();},[refresh]); return {data,loading,error,refresh,decide};
}
export function useEncargadoVisitaHistory(){
 const [draft,setDraft]=useState<Omit<EncargadoVisitaHistoryQuery,"page"|"limit">>({});const [applied,setApplied]=useState(draft);const [page,setPage]=useState(1);const [limit,setLimit]=useState(15);const [sort,setSort]=useState<Pick<EncargadoVisitaHistoryQuery,"sortBy"|"sortOrder">>({});const [items,setItems]=useState<EncargadoVisitaRecord[]>([]);const [total,setTotal]=useState(0);const [loading,setLoading]=useState(true);const [error,setError]=useState("");
 const load=useCallback(async()=>{setLoading(true);setError("");try{const r=await getEncargadoVisitaHistory({page,limit,...applied,...sort});setItems(r.items);setTotal(r.total);}catch(e){setError(e instanceof ApiError?e.message:"No se pudo cargar el historial");}finally{setLoading(false);}},[page,limit,applied,sort]);useEffect(()=>{void load();},[load]);
 const apply=()=>{setPage(1);setApplied({...draft});}; const toggleSort=(column:NonNullable<EncargadoVisitaHistoryQuery["sortBy"]>)=>{setPage(1);setSort(s=>s.sortBy!==column?{sortBy:column,sortOrder:"desc"}:s.sortOrder==="desc"?{sortBy:column,sortOrder:"asc"}:{});};
 return {draft,setDraft,apply,page,setPage,limit,setLimit,sort,toggleSort,items,total,loading,error,refresh:load};
}
