/**
 * @file role.ts
 * @description Utilidades para resolver roles de usuario y etiquetas legibles en la UI.
 */
import type { AuthUser } from "../types/auth";

export type Role = AuthUser["role"];

/** Obtiene el rol del usuario autenticado o `null` si no hay sesión. */
export function resolveRole(user: AuthUser | null): Role | null {
  return user?.role ?? null;
}

/** Devuelve la etiqueta en español para mostrar el rol en la interfaz. */
export function roleLabel(role: Role | null): string {
  if (role === "super_admin") return "Super Admin";
  if (role === "admin_empresa") return "Admin Empresa";
  if (role === "portero") return "Portero";
  return "Usuario";
}

/** Indica si el rol corresponde a acceso administrativo. */
export function isTechnicianRole(role: Role | null): boolean {
  return role === "super_admin" || role === "admin_empresa";
}
