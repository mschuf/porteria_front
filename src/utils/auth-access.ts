/**
 * @file auth-access.ts
 * @description Utilidades para determinar acceso a módulos según rol local.
 */
import type { AuthUser } from "../types/auth";

/** Flags mínimos para evaluar permisos de módulos. */
export interface AccessFlags {
  role: AuthUser["role"] | null;
}

/** Indica si el rol tiene acceso administrativo. */
export function isAdminRole(role: AuthUser["role"] | null): boolean {
  return role === "super_admin" || role === "admin_empresa";
}

/** Indica si el rol tiene acceso al módulo Portería. */
export function isPorteroRole(role: AuthUser["role"] | null): boolean {
  return role === "portero";
}

/** Indica si el rol puede acceder al modulo Porteria. */
export function isPorteriaRole(role: AuthUser["role"] | null): boolean {
  return isPorteroRole(role) || isAdminRole(role);
}

/**
 * Resuelve la ruta de inicio tras autenticación según el perfil del usuario.
 * @param flags - Flags de sesión del usuario.
 * @returns Ruta por defecto para usuarios autenticados.
 */
export function resolveDefaultAuthenticatedPath(flags: AccessFlags): "/porteria" | "/admin/reporte-porteria" {
  return isPorteroRole(flags.role) ? "/porteria" : "/admin/reporte-porteria";
}

/**
 * Extrae flags de acceso desde el usuario de sesión.
 * @param user - Usuario autenticado o `null`.
 * @returns Flags normalizados para evaluar permisos.
 */
export function accessFlagsFromUser(user: AuthUser | null): AccessFlags {
  return {
    role: user?.role ?? null,
  };
}
