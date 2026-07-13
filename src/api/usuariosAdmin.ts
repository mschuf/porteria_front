/**
 * @file usuariosAdmin.ts
 * @description Cliente HTTP CRUD de usuarios del sistema.
 */
import { apiClient } from "./apiClient";

export type UsuarioAdminRol = "super_admin" | "admin_empresa" | "portero";

export interface UsuarioAdmin {
  id: number;
  usuario: string;
  nombre: string;
  correo: string | null;
  rol: UsuarioAdminRol;
  activo: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface UsuarioAdminListado {
  items: UsuarioAdmin[];
  total: number;
  page: number;
  limit: number;
}

export interface UsuarioAsignacionUsuario {
  id: number;
  usuario: string;
  nombre: string;
  rol: UsuarioAdminRol;
  activo: boolean;
}

export interface UsuarioAsignacionEntidad {
  id: number;
  nombre: string;
}

export type UsuarioAdminAsignacion =
  | {
      tipo: "global";
      usuario: UsuarioAsignacionUsuario;
    }
  | {
      tipo: "empresa";
      usuario: UsuarioAsignacionUsuario;
      empresas: UsuarioAsignacionEntidad[];
    }
  | {
      tipo: "porteria";
      usuario: UsuarioAsignacionUsuario;
      asignacion: {
        empresaPorteria: UsuarioAsignacionEntidad;
        sede: UsuarioAsignacionEntidad;
        empresa: UsuarioAsignacionEntidad;
      } | null;
    };

export type UsuarioAdminSortColumn = "id" | "usuario" | "nombre" | "correo" | "rol" | "createdAt";
export type UsuarioAdminSortOrder = "asc" | "desc";

export interface ListarUsuariosAdminQuery {
  page?: number;
  limit?: number;
  search?: string;
  usuario?: string;
  nombre?: string;
  correo?: string;
  rol?: UsuarioAdminRol;
  activo?: boolean;
  sortBy?: UsuarioAdminSortColumn;
  sortOrder?: UsuarioAdminSortOrder;
}

export interface CrearUsuarioAdminPayload {
  usuario: string;
  nombre: string;
  correo?: string;
  rol: UsuarioAdminRol;
  password: string;
  activo?: boolean;
}

export type ActualizarUsuarioAdminPayload = Partial<Omit<CrearUsuarioAdminPayload, "password">>;

/** Lista usuarios con paginacion, filtros y orden. */
export async function listarUsuariosAdmin(
  query: ListarUsuariosAdminQuery = {},
  options?: { signal?: AbortSignal },
): Promise<UsuarioAdminListado> {
  return apiClient.get<UsuarioAdminListado>("/usuarios-admin", {
    ...options,
    query: query as Record<string, string | number | boolean | undefined | null>,
  });
}

/** Obtiene un usuario por ID. */
export async function obtenerUsuarioAdmin(
  id: number,
  options?: { signal?: AbortSignal },
): Promise<UsuarioAdmin> {
  return apiClient.get<UsuarioAdmin>(`/usuarios-admin/${id}`, options);
}

/** Obtiene la explicación de las asignaciones vigentes de un usuario según su rol. */
export async function obtenerAsignacionUsuarioAdmin(
  id: number,
  options?: { signal?: AbortSignal },
): Promise<UsuarioAdminAsignacion> {
  return apiClient.get<UsuarioAdminAsignacion>(`/usuarios-admin/${id}/asignacion`, {
    ...options,
    showBackdrop: false,
  });
}

/** Crea un usuario nuevo. */
export async function crearUsuarioAdmin(payload: CrearUsuarioAdminPayload): Promise<UsuarioAdmin> {
  return apiClient.post<UsuarioAdmin>("/usuarios-admin", payload);
}

/** Actualiza un usuario existente. */
export async function actualizarUsuarioAdmin(
  id: number,
  payload: ActualizarUsuarioAdminPayload,
): Promise<UsuarioAdmin> {
  return apiClient.patch<UsuarioAdmin>(`/usuarios-admin/${id}`, payload);
}

/** Restablece la contraseña de un usuario. */
export async function resetearPasswordUsuarioAdmin(id: number, password: string): Promise<UsuarioAdmin> {
  return apiClient.patch<UsuarioAdmin>(`/usuarios-admin/${id}/reset-password`, { password });
}

/** Desactiva un usuario. */
export async function desactivarUsuarioAdmin(id: number): Promise<UsuarioAdmin> {
  return apiClient.patch<UsuarioAdmin>(`/usuarios-admin/${id}/deactivate`);
}

/** Reactiva un usuario previamente desactivado. */
export async function activarUsuarioAdmin(id: number): Promise<UsuarioAdmin> {
  return apiClient.patch<UsuarioAdmin>(`/usuarios-admin/${id}/activate`);
}
