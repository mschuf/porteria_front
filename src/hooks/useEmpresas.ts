/**
 * @file useEmpresas.ts
 * @description Hook del listado CRUD de empresas con filtros, orden y paginacion.
 */
import { useCallback, useEffect, useMemo, useState } from "react";
import { ApiError } from "@/api/apiClient";
import { listarEmpresas, type EmpresaSortColumn, type ListarEmpresasQuery } from "@/api/empresas";
import {
  PORTERIA_PAGE_SIZE,
  isPorteriaAllPageSize,
  isValidPorteriaPageSize,
  resolvePorteriaApiLimit,
  type PorteriaPageSize,
} from "@/lib/porteria";
import type {
  EmpresasFilterState,
  EmpresasSortState,
  UseEmpresasResult,
} from "@/types/pages/empresas-page.types";

/** @returns Estado inicial de filtros de empresas. */
function createInitialFilters(): EmpresasFilterState {
  return {
    search: "",
    nombre: "",
    ruc: "",
    direccion: "",
    telefono: "",
    correo: "",
    activo: "",
  };
}

/** Mapea filtros UI a query params del backend. */
function toListParams(
  filters: EmpresasFilterState,
  page: number,
  limit: number,
  sort: EmpresasSortState | null,
): ListarEmpresasQuery {
  return {
    page,
    limit,
    search: filters.search || undefined,
    nombre: filters.nombre || undefined,
    ruc: filters.ruc || undefined,
    direccion: filters.direccion || undefined,
    telefono: filters.telefono || undefined,
    correo: filters.correo || undefined,
    activo: filters.activo === "" ? undefined : filters.activo === "true",
    sortBy: sort?.column,
    sortOrder: sort?.order,
  };
}

/** Orquesta estado, listado y paginacion de empresas. */
export function useEmpresas(): UseEmpresasResult {
  const [items, setItems] = useState<UseEmpresasResult["items"]>([]);
  const [filters, setFiltersState] = useState<EmpresasFilterState>(createInitialFilters);
  const [appliedFilters, setAppliedFilters] = useState<EmpresasFilterState>(createInitialFilters);
  const [page, setPageState] = useState(1);
  const [pageLimit, setPageLimitState] = useState<PorteriaPageSize>(PORTERIA_PAGE_SIZE);
  const [sort, setSortState] = useState<EmpresasSortState | null>(null);
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

  const setFilters = useCallback((value: EmpresasFilterState) => {
    setFiltersState(value);
  }, []);

  const applyFilters = useCallback((nextFilters?: EmpresasFilterState) => {
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

  const setSortColumn = useCallback((column: EmpresaSortColumn) => {
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
        const result = await listarEmpresas(listParams);
        if (cancelled) return;
        setItems(result.items);
        setTotal(result.total);
      } catch (fetchError) {
        if (cancelled) return;
        const message =
          fetchError instanceof ApiError ? fetchError.message : "No se pudieron cargar las empresas.";
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

