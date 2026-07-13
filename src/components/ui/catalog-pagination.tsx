import { Button } from "@/components/ui/button";
import { Select } from "@/components/ui/select";
import { isPorteriaAllPageSize, parsePorteriaPageSize, PORTERIA_PAGE_SIZE_ALL, PORTERIA_PAGE_SIZE_OPTIONS, type PorteriaPageSize } from "@/lib/porteria";

export function CatalogPagination({ page, limit, total, totalPages, onPage, onLimit }: { page: number; limit: PorteriaPageSize; total: number; totalPages: number; onPage: (page: number) => void; onLimit: (limit: PorteriaPageSize) => void; }) {
  if (!total) return null;
  const all = isPorteriaAllPageSize(limit);
  const numeric = all ? total : limit;
  const from = all ? 1 : (page - 1) * numeric + 1;
  const to = all ? total : Math.min(page * numeric, total);
  return <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
    <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
      <label className="flex items-center gap-2 text-sm text-muted-foreground"><span>Mostrar por pagina</span><Select className="h-9 w-24" value={all ? PORTERIA_PAGE_SIZE_ALL : String(limit)} onChange={(event) => { const parsed = parsePorteriaPageSize(event.target.value); if (parsed) onLimit(parsed); }}>{PORTERIA_PAGE_SIZE_OPTIONS.map((size) => <option key={size}>{size}</option>)}<option value={PORTERIA_PAGE_SIZE_ALL}>Todos</option></Select></label>
      <p className="text-sm text-muted-foreground">Mostrando {from}-{to} de {total} elementos</p>
    </div>
    {!all ? <div className="flex items-center gap-2"><Button variant="outline" size="sm" disabled={page <= 1} onClick={() => onPage(page - 1)}>Anterior</Button><span className="min-w-24 text-center text-sm text-muted-foreground">Pagina {page} de {totalPages}</span><Button variant="outline" size="sm" disabled={page >= totalPages} onClick={() => onPage(page + 1)}>Siguiente</Button></div> : null}
  </div>;
}
