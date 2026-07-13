import { useCallback, useEffect, useMemo, useState } from "react";
import { ApiError } from "@/api/apiClient";
import { listarAreas, type Area, type AreaSortColumn, type SortOrder } from "@/api/areas";
import { PORTERIA_PAGE_SIZE, isPorteriaAllPageSize, isValidPorteriaPageSize, resolvePorteriaApiLimit, type PorteriaPageSize } from "@/lib/porteria";

export interface AreasFilters { search: string; sedeId: string; nombre: string; activo: "" | "true" | "false"; }
const empty = (): AreasFilters => ({ search: "", sedeId: "", nombre: "", activo: "" });

export function useAreas() {
  const [items, setItems] = useState<Area[]>([]);
  const [filters, setFilters] = useState<AreasFilters>(empty);
  const [applied, setApplied] = useState<AreasFilters>(empty);
  const [page, setPage] = useState(1);
  const [limit, setLimitState] = useState<PorteriaPageSize>(PORTERIA_PAGE_SIZE);
  const [sort, setSort] = useState<{ column: AreaSortColumn; order: SortOrder } | null>(null);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [token, setToken] = useState(0);
  const apiLimit = resolvePorteriaApiLimit(limit, total);
  const query = useMemo(() => ({ page, limit: apiLimit, search: applied.search || undefined, sedeId: applied.sedeId ? Number(applied.sedeId) : undefined, nombre: applied.nombre || undefined, activo: applied.activo === "" ? undefined : applied.activo === "true", sortBy: sort?.column, sortOrder: sort?.order }), [page, apiLimit, applied, sort]);
  useEffect(() => { let cancelled = false; setLoading(true); setError(""); void listarAreas(query).then((result) => { if (!cancelled) { setItems(result.items); setTotal(result.total); } }).catch((reason) => { if (!cancelled) { setItems([]); setTotal(0); setError(reason instanceof ApiError ? reason.message : "No se pudieron cargar las areas."); } }).finally(() => { if (!cancelled) setLoading(false); }); return () => { cancelled = true; }; }, [query, token]);
  const applyFilters = useCallback(() => { setApplied(filters); setPage(1); }, [filters]);
  const setPageLimit = useCallback((value: PorteriaPageSize) => { if (isValidPorteriaPageSize(value)) { setLimitState(value); setPage(1); } }, []);
  const setSortColumn = useCallback((column: AreaSortColumn) => { setSort((current) => !current || current.column !== column ? { column, order: "desc" } : current.order === "desc" ? { column, order: "asc" } : null); setPage(1); }, []);
  return { items, filters, setFilters, applyFilters, sort, setSortColumn, pagination: { page, limit, total, totalPages: isPorteriaAllPageSize(limit) ? 1 : Math.max(1, Math.ceil(total / limit)) }, setPage, setPageLimit, loading, error, reload: () => setToken((v) => v + 1) };
}
