/**
 * @file useSedeEmpresaPorteria.ts
 * @description Hook del listado CRUD de asignaciones sede-empresa de seguridad con filtros, orden y paginacion.
 */
import { useCallback, useEffect, useMemo, useState } from "react";
import { ApiError } from "@/api/apiClient";
import {
  listarSedeEmpresaPorteria,
  type SedeEmpresaPorteriaSortColumn,
  type ListarSedeEmpresaPorteriaQuery,
} from "@/api/sede-empresa-porteria";
import {
  PORTERIA_PAGE_SIZE,
  isPorteriaAllPageSize,
  isValidPorteriaPageSize,
  resolvePorteriaApiLimit,
  type PorteriaPageSize,
} from "@/lib/porteria";
import type {
  SedeEmpresaPorteriaFilterState,
  SedeEmpresaPorteriaSortState,
  UseSedeEmpresaPorteriaResult,
} from "@/types/pages/sede-empresa-porteria-page.types";

/** @returns Estado inicial de filtros de asignaciones sede-empresa de seguridad. */
function createInitialFilters(): SedeEmpresaPorteriaFilterState {
  return {
    search: "",
    sedeId: "",
    empresaPorteriaId: "",
    activo: "",
  };
}

/** Mapea filtros UI a query params del backend. */
function toListParams(
  filters: SedeEmpresaPorteriaFilterState,
  page: number,
  limit: number,
  sort: SedeEmpresaPorteriaSortState | null,
): ListarSedeEmpresaPorteriaQuery {
  return {
    page,
    limit,
    search: filters.search || undefined,
    sedeId: filters.sedeId ? Number(filters.sedeId) : undefined,
    empresaPorteriaId: filters.empresaPorteriaId ? Number(filters.empresaPorteriaId) : undefined,
    activo: filters.activo === "" ? undefined : filters.activo === "true",
    sortBy: sort?.column,
    sortOrder: sort?.order,
  };
}

/** Orquesta estado, listado y paginacion de asignaciones sede-empresa de seguridad. */
export function useSedeEmpresaPorteria(): UseSedeEmpresaPorteriaResult {
  const [items, setItems] = useState<UseSedeEmpresaPorteriaResult["items"]>([]);
  const [filters, setFiltersState] = useState<SedeEmpresaPorteriaFilterState>(createInitialFilters);
  const [appliedFilters, setAppliedFilters] =
    useState<SedeEmpresaPorteriaFilterState>(createInitialFilters);
  const [page, setPageState] = useState(1);
  const [pageLimit, setPageLimitState] = useState<PorteriaPageSize>(PORTERIA_PAGE_SIZE);
  const [sort, setSortState] = useState<SedeEmpresaPorteriaSortState | null>(null);
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

  const setFilters = useCallback((value: SedeEmpresaPorteriaFilterState) => {
    setFiltersState(value);
  }, []);

  const applyFilters = useCallback(
    (nextFilters?: SedeEmpresaPorteriaFilterState) => {
      setAppliedFilters(nextFilters ?? filters);
      setPageState(1);
    },
    [filters],
  );

  const setPage = useCallback((nextPage: number) => {
    setPageState(Math.max(1, nextPage));
  }, []);

  const setPageLimit = useCallback((limit: PorteriaPageSize) => {
    if (!isValidPorteriaPageSize(limit)) return;
    setPageLimitState(limit);
    setPageState(1);
  }, []);

  const setSortColumn = useCallback((column: SedeEmpresaPorteriaSortColumn) => {
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
        const result = await listarSedeEmpresaPorteria(listParams);
        if (cancelled) return;
        setItems(result.items);
        setTotal(result.total);
      } catch (fetchError) {
        if (cancelled) return;
        const message =
          fetchError instanceof ApiError
            ? fetchError.message
            : "No se pudieron cargar las asignaciones.";
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
