/**
 * @file porteria-sedes.ts
 * @description Utilidades para el selector de sede en formularios de asignaciones sede-empresa de seguridad.
 */
import { listarSedes, obtenerSede } from "@/api/sedes";
import type { SearchableSelectOption } from "@/components/ui/searchable-select";

/**
 * Carga opciones de sedes activas para el selector.
 * @param query - Texto de búsqueda.
 * @param signal - Señal de aborto.
 * @returns Opciones para ServerSearchableSelect.
 */
export async function loadSedeSelectOptions(
  query: string,
  signal: AbortSignal,
): Promise<SearchableSelectOption[]> {
  const result = await listarSedes(
    {
      search: query.trim() || undefined,
      activo: true,
      limit: 20,
      sortBy: "nombre",
      sortOrder: "asc",
    },
    { signal },
  );

  return result.items.map((sede) => ({
    value: String(sede.id),
    label: `${sede.nombre} — ${sede.empresaNombre}`,
  }));
}

/**
 * Resuelve la opción seleccionada de sede por ID.
 * @param value - ID serializado.
 * @param signal - Señal de aborto.
 * @returns Opción resuelta o null.
 */
export async function resolveSedeSelectOption(
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
    const sede = await obtenerSede(id, { signal });
    return { value: String(sede.id), label: `${sede.nombre} — ${sede.empresaNombre}` };
  } catch {
    return null;
  }
}
