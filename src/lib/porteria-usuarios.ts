/**
 * @file porteria-usuarios.ts
 * @description Utilidades para el selector de usuario en formularios de asignaciones usuario-empresa.
 */
import { listarUsuariosAdmin, obtenerUsuarioAdmin } from "@/api/usuariosAdmin";
import type { SearchableSelectOption } from "@/components/ui/searchable-select";

/**
 * Carga opciones de usuarios activos para el selector.
 * @param query - Texto de búsqueda.
 * @param signal - Señal de aborto.
 * @returns Opciones para ServerSearchableSelect.
 */
export async function loadUsuarioSelectOptions(
  query: string,
  signal: AbortSignal,
): Promise<SearchableSelectOption[]> {
  const result = await listarUsuariosAdmin(
    {
      search: query.trim() || undefined,
      activo: true,
      limit: 20,
      sortBy: "nombre",
      sortOrder: "asc",
    },
    { signal },
  );

  return result.items.map((usuario) => ({
    value: String(usuario.id),
    label: usuario.nombre,
  }));
}

/**
 * Resuelve la opción seleccionada de usuario por ID.
 * @param value - ID serializado.
 * @param signal - Señal de aborto.
 * @returns Opción resuelta o null.
 */
export async function resolveUsuarioSelectOption(
  value: string,
  signal: AbortSignal,
): Promise<SearchableSelectOption | null> {
  const trimmed = value.trim();
  if (!trimmed) {
    return null;
  }

  const id = Number(trimmed);
  if (!Number.isFinite(id) || id <= 0) {
    return null;
  }

  try {
    const usuario = await obtenerUsuarioAdmin(id, { signal });
    return { value: String(usuario.id), label: usuario.nombre };
  } catch {
    return null;
  }
}
