/**
 * @file porteria.ts
 * @description Tipos de autenticación del dominio de Portería.
 */

/** Rol de usuario en el sistema. */
export type PorteriaRole = "super_admin" | "admin_empresa" | "encargado_seguridad" | "encargado_porteria" | "portero";

/** Usuario autenticado con datos de sesión y permisos. */
export interface AuthUser {
  id: number;
  login: string;
  name: string;
  email: string | null;
  role: PorteriaRole;
  sedeId: number | null;
  empresaSeguridadId: number | null;
  sedeName: string | null;
  empresaName: string | null;
  empresaPorteriaName: string | null;
  sedes: Array<{ id: number; nombre: string; empresaId: number; empresaNombre: string }>;
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
