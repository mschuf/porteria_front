/**
 * @file useUsuariosAdmin.ts
 * @description Hook del listado CRUD de usuarios con filtros, orden y paginacion.
 */
import { useCallback, useEffect, useMemo, useState } from "react";
import { ApiError } from "@/api/apiClient";
import {
  listarUsuariosAdmin,
  type UsuarioAdminSortColumn,
  type ListarUsuariosAdminQuery,
} from "@/api/usuariosAdmin";
import {
  PORTERIA_PAGE_SIZE,
  isPorteriaAllPageSize,
  isValidPorteriaPageSize,
  resolvePorteriaApiLimit,
  type PorteriaPageSize,
} from "@/lib/porteria";
import type {
  UsuariosAdminFilterState,
  UsuariosAdminSortState,
  UseUsuariosAdminResult,
} from "@/types/pages/usuarios-admin-page.types";

/** @returns Estado inicial de filtros de usuarios. */
function createInitialFilters(): UsuariosAdminFilterState {
  return {
    search: "",
    usuario: "",
    nombre: "",
    correo: "",
    rol: "",
    activo: "",
  };
}

/** Mapea filtros UI a query params del backend. */
function toListParams(
  filters: UsuariosAdminFilterState,
  page: number,
  limit: number,
  sort: UsuariosAdminSortState | null,
): ListarUsuariosAdminQuery {
  return {
    page,
    limit,
    search: filters.search || undefined,
    usuario: filters.usuario || undefined,
    nombre: filters.nombre || undefined,
    correo: filters.correo || undefined,
    rol: filters.rol || undefined,
    activo: filters.activo === "" ? undefined : filters.activo === "true",
    sortBy: sort?.column,
    sortOrder: sort?.order,
  };
}

/** Orquesta estado, listado y paginacion de usuarios. */
export function useUsuariosAdmin(): UseUsuariosAdminResult {
  const [items, setItems] = useState<UseUsuariosAdminResult["items"]>([]);
  const [filters, setFiltersState] = useState<UsuariosAdminFilterState>(createInitialFilters);
  const [appliedFilters, setAppliedFilters] = useState<UsuariosAdminFilterState>(createInitialFilters);
  const [page, setPageState] = useState(1);
  const [pageLimit, setPageLimitState] = useState<PorteriaPageSize>(PORTERIA_PAGE_SIZE);
  const [sort, setSortState] = useState<UsuariosAdminSortState | null>(null);
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

  const setFilters = useCallback((value: UsuariosAdminFilterState) => {
    setFiltersState(value);
  }, []);

  const applyFilters = useCallback((nextFilters?: UsuariosAdminFilterState) => {
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

  const setSortColumn = useCallback((column: UsuarioAdminSortColumn) => {
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
        const result = await listarUsuariosAdmin(listParams);
        if (cancelled) return;
        setItems(result.items);
        setTotal(result.total);
      } catch (fetchError) {
        if (cancelled) return;
        const message =
          fetchError instanceof ApiError ? fetchError.message : "No se pudieron cargar los usuarios.";
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
