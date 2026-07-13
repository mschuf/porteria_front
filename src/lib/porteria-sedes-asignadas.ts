import {
  listarSedeEmpresaPorteria,
  obtenerSedeEmpresaPorteria,
} from "@/api/sede-empresa-porteria";
import type { SearchableSelectOption } from "@/components/ui/searchable-select";

export async function loadSedeEmpresaPorteriaOptions(
  empresaPorteriaId: string,
  query: string,
  signal: AbortSignal,
): Promise<SearchableSelectOption[]> {
  const empresaId = Number(empresaPorteriaId);
  if (!Number.isFinite(empresaId) || empresaId <= 0) return [];
  const result = await listarSedeEmpresaPorteria({
    search: query.trim() || undefined,
    empresaPorteriaId: empresaId,
    activo: true,
    limit: 50,
    sortBy: "sedeId",
    sortOrder: "asc",
  }, { signal });
  const now = Date.now();
  return result.items
    .filter((item) => new Date(item.asignadoDesde).getTime() <= now)
    .filter((item) => !item.asignadoHasta || new Date(item.asignadoHasta).getTime() >= now)
    .map((item) => ({ value: String(item.id), label: item.sedeNombre }));
}

export async function resolveSedeEmpresaPorteriaOption(
  value: string,
  signal: AbortSignal,
): Promise<SearchableSelectOption | null> {
  const id = Number(value);
  if (!Number.isFinite(id) || id <= 0) return null;
  try {
    const item = await obtenerSedeEmpresaPorteria(id, { signal });
    return { value: String(item.id), label: item.sedeNombre };
  } catch {
    return null;
  }
}
