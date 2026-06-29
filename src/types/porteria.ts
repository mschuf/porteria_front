/**
 * @file porteria.ts
 * @description Tipos de autenticación del dominio de Portería.
 */

/** Rol de usuario en el sistema. */
export type PorteriaRole = "final_user" | "technician";

/** Usuario autenticado con datos de sesión y permisos. */
export interface AuthUser {
  id: number;
  login: string;
  name: string;
  email: string | null;
  role: PorteriaRole;
  locationId: number | null;
  entityId?: number | null;
  entityName?: string | null;
  groupIds?: number[];
  isSuperAdmin?: boolean;
  isPorteriaUser?: boolean;
}

/** Credenciales enviadas al endpoint de login. */
export interface LoginPayload {
  username: string;
  password: string;
}

/** Respuesta exitosa del login con usuario y tiempo de expiración. */
export interface LoginResponse {
  expiresIn: string;
  user: AuthUser;
}

/** Estado de sesión activa con fecha de expiración en epoch. */
export interface SessionResponse {
  user: AuthUser;
  expiresAt: number;
}
