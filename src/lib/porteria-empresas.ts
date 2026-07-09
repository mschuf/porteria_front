/**
 * @file porteria-empresas.ts
 * @description Utilidades para el selector de empresa en formularios de sedes.
 */
import { listarEmpresas, obtenerEmpresa } from "@/api/empresas";
import type { SearchableSelectOption } from "@/components/ui/searchable-select";

/**
 * Carga opciones de empresas activas para el selector.
 * @param query - Texto de búsqueda.
 * @param signal - Señal de aborto.
 * @returns Opciones para ServerSearchableSelect.
 */
export async function loadEmpresaSelectOptions(
  query: string,
  signal: AbortSignal,
): Promise<SearchableSelectOption[]> {
  const result = await listarEmpresas(
    {
      search: query.trim() || undefined,
      activo: true,
      limit: 20,
      sortBy: "nombre",
      sortOrder: "asc",
    },
    { signal },
  );

  return result.items.map((empresa) => ({
    value: String(empresa.id),
    label: empresa.nombre,
  }));
}

/**
 * Resuelve la opción seleccionada de empresa por ID.
 * @param value - ID serializado.
 * @param signal - Señal de aborto.
 * @returns Opción resuelta o null.
 */
export async function resolveEmpresaSelectOption(
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
    const empresa = await obtenerEmpresa(id, { signal });
    return { value: String(empresa.id), label: empresa.nombre };
  } catch {
    return null;
  }
}
