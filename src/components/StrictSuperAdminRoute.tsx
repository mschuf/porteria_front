/**
 * @file StrictSuperAdminRoute.tsx
 * @description Guard de ruta para rol exacto super_admin.
 */
import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import ProtectedRoute from "./ProtectedRoute";

interface StrictSuperAdminRouteProps {
  children: React.ReactNode;
}

/** Envuelve ProtectedRoute y exige rol exacto `super_admin`. */
export default function StrictSuperAdminRoute({ children }: StrictSuperAdminRouteProps) {
  const { role } = useAuth();
  const location = useLocation();

  return (
    <ProtectedRoute>
      {role === "super_admin" ? children : <Navigate to="/porteria" replace state={{ from: location.pathname }} />}
    </ProtectedRoute>
  );
}

