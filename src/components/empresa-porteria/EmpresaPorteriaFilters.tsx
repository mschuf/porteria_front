/**
 * @file EmpresaPorteriaFilters.tsx
 * @description Barra de busqueda y filtros avanzados del CRUD de empresas de porteria.
 */
import { useCallback, useState, type ReactNode } from "react";
import { ChevronDown, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { cn } from "@/lib/utils";
import type { EmpresaPorteriaFilterState } from "@/types/pages/empresa-porteria-page.types";

interface EmpresaPorteriaFiltersProps {
  filters: EmpresaPorteriaFilterState;
  onChange: (filters: EmpresaPorteriaFilterState) => void;
  onApply: (filters?: EmpresaPorteriaFilterState) => void;
  actions?: ReactNode;
}

/** Filtros de empresas de porteria con busqueda rapida y panel avanzado. */
export function EmpresaPorteriaFilters({ filters, onChange, onApply, actions }: EmpresaPorteriaFiltersProps) {
  const [expanded, setExpanded] = useState(false);

  const update = useCallback(
    (key: keyof EmpresaPorteriaFilterState, value: string) => {
      onChange({ ...filters, [key]: value });
    },
    [filters, onChange],
  );

  return (
    <div className="overflow-visible rounded-md border bg-card p-3">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
        <div className="relative min-w-0 flex-1 pb-0.5">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={filters.search}
            onChange={(event) => update("search", event.target.value)}
            placeholder="Buscar en todos los campos..."
            className="pl-9 pr-10"
          />
          <button
            type="button"
            onClick={() => setExpanded((current) => !current)}
            aria-expanded={expanded}
            aria-label={expanded ? "Ocultar filtros avanzados" : "Mostrar filtros avanzados"}
            className="absolute right-1 top-1/2 inline-flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
          >
            <ChevronDown
              className={cn("h-4 w-4 transition-transform duration-200", expanded && "rotate-180")}
              aria-hidden="true"
            />
          </button>
        </div>
        {actions ? <div className="shrink-0 pb-0.5">{actions}</div> : null}
      </div>

      {expanded ? (
        <div className="mt-3 grid grid-cols-1 items-end gap-2 overflow-visible pb-1 md:grid-cols-3 xl:grid-cols-[repeat(5,minmax(0,1fr))_auto]">
          <label className="flex min-w-0 flex-col gap-1 pb-0.5 text-sm">
            <span className="text-muted-foreground">Nombre</span>
            <Input value={filters.nombre} onChange={(event) => update("nombre", event.target.value)} />
          </label>
          <label className="flex min-w-0 flex-col gap-1 pb-0.5 text-sm">
            <span className="text-muted-foreground">RUC</span>
            <Input value={filters.ruc} onChange={(event) => update("ruc", event.target.value)} />
          </label>
          <label className="flex min-w-0 flex-col gap-1 pb-0.5 text-sm">
            <span className="text-muted-foreground">Telefono</span>
            <Input value={filters.telefono} onChange={(event) => update("telefono", event.target.value)} />
          </label>
          <label className="flex min-w-0 flex-col gap-1 pb-0.5 text-sm">
            <span className="text-muted-foreground">Correo</span>
            <Input value={filters.correo} onChange={(event) => update("correo", event.target.value)} />
          </label>
          <label className="flex min-w-0 flex-col gap-1 pb-0.5 text-sm">
            <span className="text-muted-foreground">Estado</span>
            <Select value={filters.activo} onChange={(event) => update("activo", event.target.value)}>
              <option value="">Todos</option>
              <option value="true">Activos</option>
              <option value="false">Inactivos</option>
            </Select>
          </label>
          <Button type="button" className="mb-0.5 shrink-0" onClick={() => onApply()}>
            Buscar
          </Button>
        </div>
      ) : null}
    </div>
  );
}
