/**
 * @file auth-access.ts
 * @description Utilidades para determinar acceso a módulos según rol local.
 */
import type { AuthUser } from "../types/auth";

/** Flags mínimos para evaluar permisos de módulos. */
export interface AccessFlags {
  role: AuthUser["role"] | null;
  sedes: AuthUser["sedes"];
}

/**
 * Indica si el usuario accede al módulo de aprobación de visitas.
 * Un usuario cuyas sedes se aprueban todas automáticamente no tiene nada que revisar.
 * @param flags - Flags de sesión del usuario.
 */
export function canAccessAprobacionVisitas(flags: AccessFlags): boolean {
  if (flags.role === "super_admin") return true;
  if (flags.role !== "admin_empresa" && flags.role !== "encargado_visita") return false;
  return flags.sedes.some((sede) => sede.visitaRequiereAprobacion);
}

/** Indica si el rol tiene acceso administrativo. */
export function isAdminRole(role: AuthUser["role"] | null): boolean {
  return role === "super_admin" || role === "admin_empresa" || role === "encargado_seguridad" || role === "encargado_porteria";
}

/** Indica si el rol tiene acceso al módulo Portería. */
export function isPorteroRole(role: AuthUser["role"] | null): boolean {
  return role === "portero" || role === "encargado_porteria";
}

/** Indica si el rol puede acceder al modulo Porteria. */
export function isPorteriaRole(role: AuthUser["role"] | null): boolean {
  return isPorteroRole(role) || role === "encargado_visita" || role === "super_admin" || role === "admin_empresa";
}

/**
 * Resuelve la ruta de inicio tras autenticación según el perfil del usuario.
 * @param flags - Flags de sesión del usuario.
 * @returns Ruta por defecto para usuarios autenticados.
 */
export function resolveDefaultAuthenticatedPath(
  flags: AccessFlags,
): "/porteria" | "/aprobacion-visitas" | "/porteria/historial" | "/admin/reporte-porteria" {
  if (flags.role === "encargado_visita") {
    // Sin aprobación que revisar, /aprobacion-visitas le queda bloqueada y redirigir
    // ahí produciría un bucle: su otra pantalla es el historial.
    return canAccessAprobacionVisitas(flags) ? "/aprobacion-visitas" : "/porteria/historial";
  }
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
    sedes: user?.sedes ?? [],
  };
}
