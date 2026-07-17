import { useState } from "react";
import { useSearchParams } from "react-router-dom";
import { ArrowDown, ArrowUp, ArrowUpDown, ChevronDown, Search } from "lucide-react";
import type {
  EncargadoVisitaHistoryQuery,
  EncargadoVisitaRecord,
} from "@/api/encargadoVisita";
import { AprobacionBadge } from "@/components/visitas/AprobacionBadge";
import { Button } from "@/components/ui/button";
import { Dialog } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { useRegisterPorteriaRefresh } from "@/context/PorteriaRefreshContext";
import { useEncargadoVisitaHistory } from "@/hooks/useEncargadoVisita";
import { cn } from "@/lib/utils";

const columns: Array<{
  id: NonNullable<EncargadoVisitaHistoryQuery["sortBy"]>;
  label: string;
}> = [
  { id: "id", label: "Visita" },
  { id: "visitante", label: "Visitante" },
  { id: "documento", label: "Documento" },
  { id: "empresa", label: "Empresa" },
  { id: "motivo", label: "Motivo" },
  { id: "entradaAt", label: "Fecha" },
];

export default function EncargadoVisitaHistorialPage() {
  const [searchParams] = useSearchParams();
  const history = useEncargadoVisitaHistory({
    entradaFrom: searchParams.get("entradaFrom") ?? undefined,
    entradaTo: searchParams.get("entradaTo") ?? undefined,
  });
  const [advanced, setAdvanced] = useState(false);
  const [selected, setSelected] = useState<EncargadoVisitaRecord | null>(null);
  useRegisterPorteriaRefresh(history.refresh, history.loading);

  const pages = Math.max(1, Math.ceil(history.total / history.limit));
  const from = history.total ? (history.page - 1) * history.limit + 1 : 0;
  const to = Math.min(history.page * history.limit, history.total);

  const update = (key: string, value: string) => {
    history.setDraft({ ...history.draft, [key]: value || undefined });
  };

  return (
    <section className="space-y-4">
      <div className="rounded-md border bg-card p-3">
        <div className="flex items-stretch gap-2">
          <div className="relative min-w-0 flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={history.draft.search ?? ""}
              onChange={(event) => update("search", event.target.value)}
              placeholder="Buscar en todos los campos..."
              className="pl-9 pr-10"
            />
            <button
              type="button"
              className="absolute right-1 top-1/2 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
              onClick={() => setAdvanced((current) => !current)}
              aria-expanded={advanced}
              aria-label={advanced ? "Ocultar búsqueda avanzada" : "Mostrar búsqueda avanzada"}
              title={advanced ? "Ocultar filtros" : "Mostrar filtros"}
            >
              <ChevronDown
                className={cn("h-4 w-4 transition-transform", advanced && "rotate-180")}
                aria-hidden="true"
              />
            </button>
          </div>
          <Button size="sm" className="shrink-0 gap-1 self-center" onClick={history.apply}>
            <Search className="h-4 w-4" aria-hidden="true" />
            Buscar
          </Button>
        </div>

        {advanced ? (
          <div className="mt-3 grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
            {[
              ["visitante", "Visitante"],
              ["documento", "Documento"],
              ["empresa", "Empresa"],
              ["motivo", "Motivo"],
            ].map(([key, label]) => (
              <label key={key} className="space-y-1 text-sm">
                <span className="text-muted-foreground">{label}</span>
                <Input
                  value={String(history.draft[key as keyof typeof history.draft] ?? "")}
                  onChange={(event) => update(key, event.target.value)}
                />
              </label>
            ))}
            <label className="space-y-1 text-sm">
              <span className="text-muted-foreground">Desde</span>
              <Input
                type="date"
                value={history.draft.entradaFrom ?? ""}
                onChange={(event) => update("entradaFrom", event.target.value)}
              />
            </label>
            <label className="space-y-1 text-sm">
              <span className="text-muted-foreground">Hasta</span>
              <Input
                type="date"
                value={history.draft.entradaTo ?? ""}
                onChange={(event) => update("entradaTo", event.target.value)}
              />
            </label>
          </div>
        ) : null}
      </div>

      {history.error ? (
        <p className="rounded-md border border-red-200 bg-red-50 p-3 text-sm text-red-700">
          {history.error}
        </p>
      ) : null}

      {history.loading ? (
        <p className="rounded-xl border p-8 text-center text-sm text-muted-foreground">
          Cargando historial...
        </p>
      ) : (
        <div className="overflow-x-auto rounded-xl border bg-card">
          <table className="w-full min-w-[800px] text-left text-sm">
            <thead className="bg-muted/60">
              <tr>
                {columns.map((column) => (
                  <th key={column.id} className="px-4 py-3">
                    <button
                      type="button"
                      className="flex items-center gap-1"
                      onClick={() => history.toggleSort(column.id)}
                    >
                      {column.label}
                      {history.sort.sortBy === column.id ? (
                        history.sort.sortOrder === "asc" ? (
                          <ArrowUp className="h-4 w-4" />
                        ) : (
                          <ArrowDown className="h-4 w-4" />
                        )
                      ) : (
                        <ArrowUpDown className="h-4 w-4 opacity-50" />
                      )}
                    </button>
                  </th>
                ))}
                <th className="px-4 py-3">Aprobación</th>
              </tr>
            </thead>
            <tbody>
              {history.items.map((visit) => (
                <tr
                  key={visit.id}
                  className="cursor-pointer border-t hover:bg-muted/40"
                  onClick={() => setSelected(visit)}
                >
                  <td className="px-4 py-3">#{visit.id}</td>
                  <td className="px-4 py-3 font-medium">{visit.visitante}</td>
                  <td className="px-4 py-3">{visit.documento}</td>
                  <td className="px-4 py-3">{visit.empresa ?? "—"}</td>
                  <td className="px-4 py-3">{visit.motivo}</td>
                  <td className="px-4 py-3">
                    {visit.entradaAt
                      ? new Date(visit.entradaAt).toLocaleString("es-PY")
                      : "—"}
                  </td>
                  <td className="px-4 py-3">
                    <AprobacionBadge
                      estado={visit.estadoAprobacion}
                      motivoRechazo={visit.motivoRechazo}
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {!history.items.length ? (
            <p className="p-8 text-center text-muted-foreground">Sin historial.</p>
          ) : null}
        </div>
      )}

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3 text-sm text-muted-foreground">
          <span>Mostrar por página</span>
          <Select
            className="w-24"
            value={history.limit}
            onChange={(event) => {
              history.setLimit(Number(event.target.value));
              history.setPage(1);
            }}
          >
            {[15, 50, 100].map((size) => (
              <option key={size}>{size}</option>
            ))}
            <option value={Math.max(history.total, 1)}>Todos</option>
          </Select>
          <span>
            Mostrando {from} - {to} de {history.total} elementos
          </span>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            disabled={history.page <= 1}
            onClick={() => history.setPage(history.page - 1)}
          >
            Anterior
          </Button>
          <span className="text-sm">
            Página {history.page} de {pages}
          </span>
          <Button
            variant="outline"
            size="sm"
            disabled={history.page >= pages}
            onClick={() => history.setPage(history.page + 1)}
          >
            Siguiente
          </Button>
        </div>
      </div>

      <Dialog
        open={selected !== null}
        onOpenChange={(open) => {
          if (!open) setSelected(null);
        }}
        title={selected ? `Visita #${selected.id}` : "Visita"}
        description="Detalle de la visita"
      >
        {selected ? (
          <dl className="grid gap-3 sm:grid-cols-2">
            {[
              ["Visitante", selected.visitante],
              ["Documento", selected.documento],
              ["Empresa", selected.empresa ?? "—"],
              ["Motivo", selected.motivo],
              ["Sede", selected.sedeNombre],
            ].map(([key, value]) => (
              <div key={key} className="rounded-md border p-3">
                <dt className="text-xs text-muted-foreground">{key}</dt>
                <dd className="font-medium">{value}</dd>
              </div>
            ))}
            <div className="rounded-md border p-3">
              <dt className="text-xs text-muted-foreground">Aprobación</dt>
              <dd className="mt-1">
                <AprobacionBadge
                  estado={selected.estadoAprobacion}
                  motivoRechazo={selected.motivoRechazo}
                />
              </dd>
            </div>
            {selected.estadoAprobacion === "rechazada" ? (
              <div className="rounded-md border p-3 sm:col-span-2">
                <dt className="text-xs text-muted-foreground">Motivo del rechazo</dt>
                <dd className="font-medium">{selected.motivoRechazo}</dd>
              </div>
            ) : null}
          </dl>
        ) : null}
      </Dialog>
    </section>
  );
}
