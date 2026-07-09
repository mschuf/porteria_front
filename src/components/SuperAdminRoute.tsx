/**
 * @file SuperAdminRoute.tsx
 * @description Guard de ruta para roles administrativos.
 */
import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import ProtectedRoute from "./ProtectedRoute";

interface SuperAdminRouteProps {
  children: React.ReactNode;
}

/** Envuelve ProtectedRoute y exige rol `super_admin` o `admin_empresa`. */
export default function SuperAdminRoute({ children }: SuperAdminRouteProps) {
  const { isSuperAdmin } = useAuth();
  const location = useLocation();

  return (
    <ProtectedRoute>
      {isSuperAdmin ? children : <Navigate to="/porteria" replace state={{ from: location.pathname }} />}
    </ProtectedRoute>
  );
}
