/**
 * @file PorteriaRoute.tsx
 * @description Guard de ruta para usuarios con acceso al modulo Porteria.
 */
import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import ProtectedRoute from "./ProtectedRoute";

interface PorteriaRouteProps {
  children: React.ReactNode;
  fallbackPath?: string;
}

/** Envuelve ProtectedRoute y exige acceso al modulo Porteria. */
export default function PorteriaRoute({
  children,
  fallbackPath = "/admin/reporte-porteria",
}: PorteriaRouteProps) {
  const { isPorteriaUser } = useAuth();
  const location = useLocation();

  return (
    <ProtectedRoute>
      {isPorteriaUser ? (
        children
      ) : (
        <Navigate to={fallbackPath} replace state={{ from: location.pathname }} />
      )}
    </ProtectedRoute>
  );
}
