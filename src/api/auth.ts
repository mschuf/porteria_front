/**
 * @file auth.ts
 * @description Llamadas al backend para el flujo de recuperación y cambio de contraseña.
 */
import { apiClient } from "./apiClient";

/** Subordinado asociado a un token de reseteo por superior. */
export interface SubordinadoReseteo {
  usuario: string;
  nombre: string;
}

/**
 * Solicita la recuperación de contraseña por usuario o correo.
 * @param identificador - Login o correo de la cuenta.
 */
export async function recuperarContrasena(identificador: string): Promise<void> {
  await apiClient.post("/auth/recuperar-contrasena", { identificador }, { auth: false, timeoutMs: 15000 });
}

/**
 * Restablece la contraseña con un token recibido por correo.
 * @param token - Token del enlace.
 * @param contrasena - Nueva contraseña.
 */
export async function restablecerContrasena(token: string, contrasena: string): Promise<void> {
  await apiClient.post("/auth/restablecer-contrasena", { token, contrasena }, { auth: false, timeoutMs: 15000 });
}

/**
 * Obtiene el subordinado asociado a un token de reseteo por superior (sin consumirlo).
 * @param token - Token del enlace.
 * @returns Datos del subordinado.
 */
export async function obtenerSubordinadoReseteo(token: string): Promise<SubordinadoReseteo> {
  return apiClient.get<SubordinadoReseteo>("/auth/restablecer-subordinado", {
    auth: false,
    query: { token },
    timeoutMs: 15000,
  });
}

/**
 * Confirma el reseteo de un subordinado a la contraseña temporal.
 * @param token - Token del enlace.
 * @returns Datos del subordinado reseteado.
 */
export async function restablecerPorSuperior(token: string): Promise<SubordinadoReseteo> {
  return apiClient.post<SubordinadoReseteo>(
    "/auth/restablecer-por-superior",
    { token },
    { auth: false, timeoutMs: 15000 },
  );
}

/**
 * Cambia la propia contraseña (usuario autenticado).
 * @param contrasenaActual - Contraseña vigente.
 * @param contrasenaNueva - Nueva contraseña.
 */
export async function cambiarContrasena(contrasenaActual: string, contrasenaNueva: string): Promise<void> {
  await apiClient.post(
    "/auth/cambiar-contrasena",
    { contrasenaActual, contrasenaNueva },
    { timeoutMs: 15000 },
  );
}
