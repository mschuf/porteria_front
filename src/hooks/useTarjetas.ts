import { useCallback, useEffect, useMemo, useState } from "react";
import { ApiError } from "@/api/apiClient";
import { listarTarjetas, type Tarjeta, type TarjetaSortColumn, type SortOrder } from "@/api/tarjetas";
import { PORTERIA_PAGE_SIZE, isPorteriaAllPageSize, isValidPorteriaPageSize, resolvePorteriaApiLimit, type PorteriaPageSize } from "@/lib/porteria";

export interface TarjetasFilters { search: string; sedeId: string; numero: string; color: string; icono: string; areaId: string; activo: "" | "true" | "false"; enUso: "" | "true" | "false"; }
const empty = (): TarjetasFilters => ({ search: "", sedeId: "", numero: "", color: "", icono: "", areaId: "", activo: "", enUso: "" });

export function useTarjetas() {
  const [items, setItems] = useState<Tarjeta[]>([]);
  const [filters, setFilters] = useState<TarjetasFilters>(empty);
  const [applied, setApplied] = useState<TarjetasFilters>(empty);
  const [page, setPage] = useState(1);
  const [limit, setLimitState] = useState<PorteriaPageSize>(PORTERIA_PAGE_SIZE);
  const [sort, setSort] = useState<{ column: TarjetaSortColumn; order: SortOrder } | null>(null);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [token, setToken] = useState(0);
  const apiLimit = resolvePorteriaApiLimit(limit, total);
  const query = useMemo(() => ({ page, limit: apiLimit, search: applied.search || undefined, sedeId: applied.sedeId ? Number(applied.sedeId) : undefined, numero: applied.numero ? Number(applied.numero) : undefined, color: applied.color || undefined, icono: applied.icono || undefined, areaId: applied.areaId ? Number(applied.areaId) : undefined, activo: applied.activo === "" ? undefined : applied.activo === "true", enUso: applied.enUso === "" ? undefined : applied.enUso === "true", sortBy: sort?.column, sortOrder: sort?.order }), [page, apiLimit, applied, sort]);
  useEffect(() => { let cancelled = false; setLoading(true); setError(""); void listarTarjetas(query).then((result) => { if (!cancelled) { setItems(result.items); setTotal(result.total); } }).catch((reason) => { if (!cancelled) { setItems([]); setTotal(0); setError(reason instanceof ApiError ? reason.message : "No se pudieron cargar las tarjetas."); } }).finally(() => { if (!cancelled) setLoading(false); }); return () => { cancelled = true; }; }, [query, token]);
  const applyFilters = useCallback(() => { setApplied(filters); setPage(1); }, [filters]);
  const setPageLimit = useCallback((value: PorteriaPageSize) => { if (isValidPorteriaPageSize(value)) { setLimitState(value); setPage(1); } }, []);
  const setSortColumn = useCallback((column: TarjetaSortColumn) => { setSort((current) => !current || current.column !== column ? { column, order: "desc" } : current.order === "desc" ? { column, order: "asc" } : null); setPage(1); }, []);
  return { items, filters, setFilters, applyFilters, sort, setSortColumn, pagination: { page, limit, total, totalPages: isPorteriaAllPageSize(limit) ? 1 : Math.max(1, Math.ceil(total / limit)) }, setPage, setPageLimit, loading, error, reload: () => setToken((v) => v + 1) };
}
