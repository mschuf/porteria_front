import { Navigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
export default function NonEncargadoVisitaRoute({children}:{children:React.ReactNode}){const {role}=useAuth();return role==="encargado_visita"?<Navigate to="/porteria" replace/>:children;}
