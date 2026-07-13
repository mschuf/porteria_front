import { useState } from "react";
import { ChevronDown, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { ServerSearchableSelect } from "@/components/ui/server-searchable-select";
import { loadSedeSelectOptions, resolveSedeSelectOption } from "@/lib/porteria-sedes";
import { cn } from "@/lib/utils";
import type { AreasFilters as Filters } from "@/hooks/useAreas";

export function AreasFilters({ filters, onChange, onApply, actions }: { filters: Filters; onChange: (value: Filters) => void; onApply: () => void; actions: React.ReactNode; }) {
  const [expanded, setExpanded] = useState(false);
  const set = (key: keyof Filters, value: string) => onChange({ ...filters, [key]: value });
  return <div className="rounded-md border bg-card p-3"><div className="flex flex-col gap-2 sm:flex-row"><div className="relative flex-1"><Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground"/><Input className="pl-9 pr-10" value={filters.search} onChange={(e) => set("search", e.target.value)} placeholder="Buscar en todos los campos..."/><button type="button" className="absolute right-1 top-1/2 h-8 w-8 -translate-y-1/2" onClick={() => setExpanded((v) => !v)} aria-label="Mostrar filtros avanzados"><ChevronDown className={cn("mx-auto h-4 w-4", expanded && "rotate-180")}/></button></div>{actions}</div>
    {expanded ? <div className="mt-3 grid items-end gap-2 md:grid-cols-[1fr_1fr_1fr_auto]"><label className="space-y-1 text-sm"><span className="text-muted-foreground">Sede</span><ServerSearchableSelect value={filters.sedeId} onChange={(value) => set("sedeId", value)} onLoadOptions={loadSedeSelectOptions} resolveSelectedOption={resolveSedeSelectOption} placeholder="Todas" searchPlaceholder="Buscar sede..." emptyOption={{ value: "", label: "Todas" }}/></label><label className="space-y-1 text-sm"><span className="text-muted-foreground">Nombre</span><Input value={filters.nombre} onChange={(e) => set("nombre", e.target.value)}/></label><label className="space-y-1 text-sm"><span className="text-muted-foreground">Estado</span><Select value={filters.activo} onChange={(e) => set("activo", e.target.value)}><option value="">Todos</option><option value="true">Activos</option><option value="false">Inactivos</option></Select></label><Button onClick={onApply}>Buscar</Button></div> : null}
  </div>;
}
