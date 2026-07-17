/**
 * @file AprobacionVisitasRoute.tsx
 * @description Guard del módulo de aprobación de visitas: exige rol habilitado y al menos
 * una sede que exija aprobación. Aplica la misma regla que decide el ítem del menú.
 */
import { Navigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { accessFlagsFromUser, resolveDefaultAuthenticatedPath } from "@/utils/auth-access";

export default function AprobacionVisitasRoute({ children }: { children: React.ReactNode }) {
  const { user, canApproveVisitas } = useAuth();
  return canApproveVisitas ? (
    <>{children}</>
  ) : (
    <Navigate to={resolveDefaultAuthenticatedPath(accessFlagsFromUser(user))} replace />
  );
}
