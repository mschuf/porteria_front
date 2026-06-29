/**
 * @file auth-access.ts
 * @description Utilidades para determinar acceso a módulos según grupos y rol del usuario.
 */
import type { AuthUser } from "../types/auth";

/** Flags mínimos para evaluar permisos de módulos. */
export interface AccessFlags {
  isPorteriaUser: boolean;
  role: AuthUser["role"] | null;
  isSuperAdmin: boolean;
}

/**
 * Indica si el usuario pertenece solo al grupo portería (sin rol TI ni super-admin).
 * @param flags - Flags de sesión del usuario.
 * @returns `true` si debe acceder únicamente al módulo Portería.
 */
export function isPorteriaOnlyUser(flags: AccessFlags): boolean {
  return Boolean(flags.isPorteriaUser && flags.role === "final_user" && !flags.isSuperAdmin);
}

/**
 * Resuelve la ruta de inicio tras autenticación según el perfil del usuario.
 * @param flags - Flags de sesión del usuario.
 * @returns Ruta por defecto para usuarios autenticados.
 */
export function resolveDefaultAuthenticatedPath(flags: AccessFlags): "/porteria" | "/admin/reporte-porteria" {
  if (flags.isPorteriaUser || isPorteriaOnlyUser(flags)) {
    return "/porteria";
  }
  return "/admin/reporte-porteria";
}

/**
 * Mantiene compatibilidad con contexto antiguo; tickets ya no está habilitado.
 */
export function canAccessTickets(_flags: AccessFlags): boolean {
  return false;
}

/**
 * Extrae flags de acceso desde el usuario de sesión.
 * @param user - Usuario autenticado o `null`.
 * @returns Flags normalizados para evaluar permisos.
 */
export function accessFlagsFromUser(user: AuthUser | null): AccessFlags {
  return {
    isPorteriaUser: Boolean(user?.isPorteriaUser),
    role: user?.role ?? null,
    isSuperAdmin: Boolean(user?.isSuperAdmin),
  };
}
