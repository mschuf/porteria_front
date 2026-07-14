/**
 * @file useEmpresaPorteria.ts
 * @description Hook del listado CRUD de empresas de porteria con filtros, orden y paginacion.
 */
import { useCallback, useEffect, useMemo, useState } from "react";
import { ApiError } from "@/api/apiClient";
import {
  listarEmpresasPorteria,
  type EmpresaPorteriaSortColumn,
  type ListarEmpresaPorteriaQuery,
} from "@/api/empresa-porteria";
import {
  PORTERIA_PAGE_SIZE,
  isPorteriaAllPageSize,
  isValidPorteriaPageSize,
  resolvePorteriaApiLimit,
  type PorteriaPageSize,
} from "@/lib/porteria";
import type {
  EmpresaPorteriaFilterState,
  EmpresaPorteriaSortState,
  UseEmpresaPorteriaResult,
} from "@/types/pages/empresa-porteria-page.types";

/** @returns Estado inicial de filtros de empresas de porteria. */
function createInitialFilters(): EmpresaPorteriaFilterState {
  return {
    search: "",
    nombre: "",
    ruc: "",
    telefono: "",
    correo: "",
    nombreContacto: "",
    telefonoContacto: "",
    correoContacto: "",
    activo: "",
  };
}

/** Mapea filtros UI a query params del backend. */
function toListParams(
  filters: EmpresaPorteriaFilterState,
  page: number,
  limit: number,
  sort: EmpresaPorteriaSortState | null,
): ListarEmpresaPorteriaQuery {
  return {
    page,
    limit,
    search: filters.search || undefined,
    nombre: filters.nombre || undefined,
    ruc: filters.ruc || undefined,
    telefono: filters.telefono || undefined,
    correo: filters.correo || undefined,
    nombreContacto: filters.nombreContacto || undefined,
    telefonoContacto: filters.telefonoContacto || undefined,
    correoContacto: filters.correoContacto || undefined,
    activo: filters.activo === "" ? undefined : filters.activo === "true",
    sortBy: sort?.column,
    sortOrder: sort?.order,
  };
}

/** Orquesta estado, listado y paginacion de empresas de porteria. */
export function useEmpresaPorteria(): UseEmpresaPorteriaResult {
  const [items, setItems] = useState<UseEmpresaPorteriaResult["items"]>([]);
  const [filters, setFiltersState] = useState<EmpresaPorteriaFilterState>(createInitialFilters);
  const [appliedFilters, setAppliedFilters] = useState<EmpresaPorteriaFilterState>(createInitialFilters);
  const [page, setPageState] = useState(1);
  const [pageLimit, setPageLimitState] = useState<PorteriaPageSize>(PORTERIA_PAGE_SIZE);
  const [sort, setSortState] = useState<EmpresaPorteriaSortState | null>(null);
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

  const setFilters = useCallback((value: EmpresaPorteriaFilterState) => {
    setFiltersState(value);
  }, []);

  const applyFilters = useCallback((nextFilters?: EmpresaPorteriaFilterState) => {
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

  const setSortColumn = useCallback((column: EmpresaPorteriaSortColumn) => {
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
        const result = await listarEmpresasPorteria(listParams);
        if (cancelled) return;
        setItems(result.items);
        setTotal(result.total);
      } catch (fetchError) {
        if (cancelled) return;
        const message =
          fetchError instanceof ApiError
            ? fetchError.message
            : "No se pudieron cargar las empresas de porteria.";
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
