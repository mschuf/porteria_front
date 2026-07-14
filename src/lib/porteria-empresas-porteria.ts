/**
 * @file porteria-empresas-porteria.ts
 * @description Utilidades para el selector de empresa de seguridad en formularios de asignaciones sede-empresa de seguridad.
 */
import { listarEmpresasPorteria, obtenerEmpresaPorteria } from "@/api/empresa-porteria";
import type { SearchableSelectOption } from "@/components/ui/searchable-select";

/**
 * Carga opciones de empresas de porteria activas para el selector.
 * @param query - Texto de búsqueda.
 * @param signal - Señal de aborto.
 * @returns Opciones para ServerSearchableSelect.
 */
export async function loadEmpresaPorteriaSelectOptions(
  query: string,
  signal: AbortSignal,
): Promise<SearchableSelectOption[]> {
  const result = await listarEmpresasPorteria(
    {
      search: query.trim() || undefined,
      activo: true,
      limit: 20,
      sortBy: "nombre",
      sortOrder: "asc",
    },
    { signal },
  );

  return result.items.map((empresaPorteria) => ({
    value: String(empresaPorteria.id),
    label: empresaPorteria.nombre,
  }));
}

/**
 * Resuelve la opción seleccionada de empresa de seguridad por ID.
 * @param value - ID serializado.
 * @param signal - Señal de aborto.
 * @returns Opción resuelta o null.
 */
export async function resolveEmpresaPorteriaSelectOption(
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
    const empresaPorteria = await obtenerEmpresaPorteria(id, { signal });
    return { value: String(empresaPorteria.id), label: empresaPorteria.nombre };
  } catch {
    return null;
  }
}
