/**
 * @file PorteriaHistorialPage.tsx
 * @description Vista de historial de visitas en Porteria.
 */
import { Button } from "@/components/ui/button";
import { ExcelFileIcon, PdfFileIcon } from "@/components/ui/file-type-icons";
import { useSearchParams } from "react-router-dom";
import { Select } from "@/components/ui/select";
import { PorteriaHistoryFilters } from "@/components/porteria/PorteriaHistoryFilters";
import { PorteriaHistoryTable } from "@/components/porteria/PorteriaHistoryTable";
import { PorteriaVisitDetailModal } from "@/components/porteria/PorteriaVisitDetailModal";
import { useRegisterPorteriaRefresh } from "@/context/PorteriaRefreshContext";
import { usePorteriaHistorial } from "@/hooks/usePorteria";
import {
  isPorteriaAllPageSize,
  parsePorteriaPageSize,
  PORTERIA_PAGE_SIZE_ALL,
  PORTERIA_PAGE_SIZE_OPTIONS,
} from "@/lib/porteria";

/** @returns Tabla paginada del historial de visitas. */
export default function PorteriaHistorialPage() {
  const [searchParams] = useSearchParams();
  const initialEntradaFrom = searchParams.get("entradaFrom");
  const initialEntradaTo = searchParams.get("entradaTo");
  const {
    historyRows,
    historyPagination,
    historyLoading,
    historyError,
    filters,
    setFilters,
    applyFilters,
    sort,
    setSortColumn,
    setPage,
    setPageLimit,
    selectedRecord,
    selectRecord,
    clearSelectedRecord,
    refresh,
    exporting,
    downloadHistory,
  } = usePorteriaHistorial({
    ...(initialEntradaFrom ? { entradaFrom: initialEntradaFrom } : {}),
    ...(initialEntradaTo ? { entradaTo: initialEntradaTo } : {}),
  });

  useRegisterPorteriaRefresh(refresh, historyLoading);

  const numericLimit =
    typeof historyPagination.limit === "number"
      ? historyPagination.limit
      : PORTERIA_PAGE_SIZE_OPTIONS[0];
  const showingAll = isPorteriaAllPageSize(historyPagination.limit);
  const paginationFrom =
    historyPagination.total === 0
      ? 0
      : showingAll
        ? 1
        : (historyPagination.page - 1) * numericLimit + 1;
  const paginationTo = showingAll
    ? historyPagination.total
    : Math.min(historyPagination.page * numericLimit, historyPagination.total);

  return (
    <section className="space-y-4">
      <PorteriaHistoryFilters filters={filters} onChange={setFilters} onApply={applyFilters} />

      {historyError ? (
        <div className="rounded-md border border-red-200 bg-red-50 p-3 text-sm text-red-700">
          {historyError}
        </div>
      ) : null}

      {historyLoading ? (
        <div className="rounded-xl border bg-card p-8 text-center text-sm text-muted-foreground">
          Cargando historial...
        </div>
      ) : (
        <PorteriaHistoryTable
          rows={historyRows}
          selectedId={selectedRecord?.id ?? null}
          sortColumn={sort?.column ?? null}
          sortOrder={sort?.order ?? null}
          onSortColumnChange={setSortColumn}
          onRowClick={selectRecord}
        />
      )}

      <div className="flex flex-wrap items-center justify-end gap-2">
        <Button
          type="button"
          variant="outline"
          size="sm"
          disabled={Boolean(exporting) || historyLoading || historyPagination.total === 0}
          onClick={() => void downloadHistory("pdf")}
        >
          <PdfFileIcon className="mr-2 h-4 w-4 shrink-0" />
          {exporting === "pdf" ? "Generando PDF..." : "Descargar PDF"}
        </Button>
        <Button
          type="button"
          variant="outline"
          size="sm"
          disabled={Boolean(exporting) || historyLoading || historyPagination.total === 0}
          onClick={() => void downloadHistory("xlsx")}
        >
          <ExcelFileIcon className="mr-2 h-4 w-4 shrink-0" />
          {exporting === "xlsx" ? "Generando Excel..." : "Descargar Excel"}
        </Button>
      </div>

      {historyPagination.total > 0 ? (
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
            <label className="flex items-center gap-2 text-sm text-muted-foreground">
              <span className="whitespace-nowrap">Mostrar por pagina</span>
              <Select
                aria-label="Mostrar por pagina"
                className="h-9 w-24 shrink-0 px-2 py-1 text-center text-sm font-medium tabular-nums text-foreground"
                value={
                  isPorteriaAllPageSize(historyPagination.limit)
                    ? PORTERIA_PAGE_SIZE_ALL
                    : String(historyPagination.limit)
                }
                onChange={(event) => {
                  const nextLimit = parsePorteriaPageSize(event.target.value);
                  if (nextLimit) setPageLimit(nextLimit);
                }}
              >
                {PORTERIA_PAGE_SIZE_OPTIONS.map((size) => (
                  <option key={size} value={size}>
                    {size}
                  </option>
                ))}
                <option value={PORTERIA_PAGE_SIZE_ALL}>Todos</option>
              </Select>
            </label>
            <p className="text-sm text-muted-foreground">
              Mostrando {paginationFrom}-{paginationTo} de {historyPagination.total} visitas
            </p>
          </div>
          {!showingAll ? (
            <div className="flex items-center gap-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                disabled={historyPagination.page <= 1}
                onClick={() => setPage(historyPagination.page - 1)}
              >
                Anterior
              </Button>
              <span className="min-w-24 text-center text-sm text-muted-foreground">
                Pagina {historyPagination.page} de {historyPagination.totalPages}
              </span>
              <Button
                type="button"
                variant="outline"
                size="sm"
                disabled={historyPagination.page >= historyPagination.totalPages}
                onClick={() => setPage(historyPagination.page + 1)}
              >
                Siguiente
              </Button>
            </div>
          ) : null}
        </div>
      ) : null}

      <PorteriaVisitDetailModal
        record={selectedRecord}
        open={selectedRecord !== null}
        onOpenChange={(open) => {
          if (!open) clearSelectedRecord();
        }}
      />
    </section>
  );
}
