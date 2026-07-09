/**
 * @file useSedes.ts
 * @description Hook del listado CRUD de sedes con filtros, orden y paginacion.
 */
import { useCallback, useEffect, useMemo, useState } from "react";
import { ApiError } from "@/api/apiClient";
import { listarSedes, type SedeSortColumn, type ListarSedesQuery } from "@/api/sedes";
import {
  PORTERIA_PAGE_SIZE,
  isPorteriaAllPageSize,
  isValidPorteriaPageSize,
  resolvePorteriaApiLimit,
  type PorteriaPageSize,
} from "@/lib/porteria";
import type { SedesFilterState, SedesSortState, UseSedesResult } from "@/types/pages/sedes-page.types";

/** @returns Estado inicial de filtros de sedes. */
function createInitialFilters(): SedesFilterState {
  return {
    search: "",
    nombre: "",
    direccion: "",
    telefono: "",
    empresaId: "",
    activo: "",
  };
}

/** Mapea filtros UI a query params del backend. */
function toListParams(
  filters: SedesFilterState,
  page: number,
  limit: number,
  sort: SedesSortState | null,
): ListarSedesQuery {
  return {
    page,
    limit,
    search: filters.search || undefined,
    nombre: filters.nombre || undefined,
    direccion: filters.direccion || undefined,
    telefono: filters.telefono || undefined,
    empresaId: filters.empresaId ? Number(filters.empresaId) : undefined,
    activo: filters.activo === "" ? undefined : filters.activo === "true",
    sortBy: sort?.column,
    sortOrder: sort?.order,
  };
}

/** Orquesta estado, listado y paginacion de sedes. */
export function useSedes(): UseSedesResult {
  const [items, setItems] = useState<UseSedesResult["items"]>([]);
  const [filters, setFiltersState] = useState<SedesFilterState>(createInitialFilters);
  const [appliedFilters, setAppliedFilters] = useState<SedesFilterState>(createInitialFilters);
  const [page, setPageState] = useState(1);
  const [pageLimit, setPageLimitState] = useState<PorteriaPageSize>(PORTERIA_PAGE_SIZE);
  const [sort, setSortState] = useState<SedesSortState | null>(null);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [reloadToken, setReloadToken] = useState(0);

  const listParams = useMemo(
    () => toListParams(appliedFilters, page, resolvePorteriaApiLimit(pageLimit, total), sort),
    [appliedFilters, page, pageLimit, sort, total],
  );

  const totalPages = isPorteriaAllPageSize(pageLimit)
    ? 1
    : Math.max(1, Math.ceil(total / pageLimit));

  const setFilters = useCallback((value: SedesFilterState) => {
    setFiltersState(value);
  }, []);

  const applyFilters = useCallback((nextFilters?: SedesFilterState) => {
    setAppliedFilters(nextFilters ?? filters);
    setPageState(1);
  }, [filters]);

  const setPage = useCallback((nextPage: number) => {
    setPageState(Math.max(1, nextPage));
  }, []);

  const setPageLimit = useCallback((limit: PorteriaPageSize) => {
    if (!isValidPorteriaPageSize(limit)) return;
    setPageLimitState(limit);
    setPageState(1);
  }, []);

  const setSortColumn = useCallback((column: SedeSortColumn) => {
    setSortState((current) => {
      if (!current || current.column !== column) {
        return { column, order: "desc" };
      }
      if (current.order === "desc") {
        return { column, order: "asc" };
      }
      return null;
    });
    setPageState(1);
  }, []);

  const reload = useCallback(async () => {
    setReloadToken((value) => value + 1);
  }, []);

  useEffect(() => {
    let cancelled = false;

    async function fetchItems() {
      setLoading(true);
      setError("");
      try {
        const result = await listarSedes(listParams);
        if (cancelled) return;
        setItems(result.items);
        setTotal(result.total);
      } catch (fetchError) {
        if (cancelled) return;
        const message =
          fetchError instanceof ApiError ? fetchError.message : "No se pudieron cargar las sedes.";
        setError(message);
        setItems([]);
        setTotal(0);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    void fetchItems();
    return () => {
      cancelled = true;
    };
  }, [listParams, reloadToken]);

  return {
    items,
    filters,
    setFilters,
    applyFilters,
    sort,
    setSortColumn,
    pagination: {
      page,
      limit: pageLimit,
      total,
      totalPages,
    },
    setPage,
    setPageLimit,
    loading,
    error,
    reload,
  };
}
