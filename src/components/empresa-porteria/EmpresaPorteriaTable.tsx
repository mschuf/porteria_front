/**
 * @file EmpresaPorteriaTable.tsx
 * @description Tabla de empresas de porteria con orden por columnas.
 */
import { ArrowDown, ArrowUp, ArrowUpDown, Pencil, Power, Trash2 } from "lucide-react";
import type {
  EmpresaPorteria,
  EmpresaPorteriaSortColumn,
  EmpresaPorteriaSortOrder,
} from "@/api/empresa-porteria";
import { Badge } from "@/components/ui/badge";
import { EmptyState } from "@/components/ui/empty-state";
import { cn } from "@/lib/utils";

interface EmpresaPorteriaTableProps {
  rows: EmpresaPorteria[];
  sortColumn?: EmpresaPorteriaSortColumn | null;
  sortOrder?: EmpresaPorteriaSortOrder | null;
  onSortColumnChange?: (column: EmpresaPorteriaSortColumn) => void;
  onEdit: (empresaPorteria: EmpresaPorteria) => void;
  onActivate: (empresaPorteria: EmpresaPorteria) => void;
  onDeactivate: (empresaPorteria: EmpresaPorteria) => void;
  onDelete: (empresaPorteria: EmpresaPorteria) => void;
}

const SORTABLE_COLUMNS: Array<{ id: EmpresaPorteriaSortColumn; label: string }> = [
  { id: "id", label: "ID" },
  { id: "nombre", label: "Nombre" },
  { id: "ruc", label: "RUC" },
  { id: "telefono", label: "Telefono" },
  { id: "correo", label: "Correo" },
];

const actionIconButtonClass =
  "inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-full border transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1 disabled:cursor-not-allowed disabled:opacity-40";

function SortableHeader({
  column,
  label,
  sortColumn,
  sortOrder,
  onSortColumnChange,
}: {
  column: EmpresaPorteriaSortColumn;
  label: string;
  sortColumn?: EmpresaPorteriaSortColumn | null;
  sortOrder?: EmpresaPorteriaSortOrder | null;
  onSortColumnChange?: (column: EmpresaPorteriaSortColumn) => void;
}) {
  const isActive = sortColumn === column;
  const ariaSort = isActive ? (sortOrder === "asc" ? "ascending" : "descending") : "none";

  if (!onSortColumnChange) {
    return <th className="px-4 py-3 font-semibold">{label}</th>;
  }

  return (
    <th className="px-4 py-3 font-semibold" aria-sort={ariaSort}>
      <button
        type="button"
        onClick={() => onSortColumnChange(column)}
        className="inline-flex items-center gap-1.5 transition-colors hover:text-foreground"
      >
        <span>{label}</span>
        {isActive ? (
          sortOrder === "asc" ? (
            <ArrowUp className="h-3.5 w-3.5" aria-hidden="true" />
          ) : (
            <ArrowDown className="h-3.5 w-3.5" aria-hidden="true" />
          )
        ) : (
          <ArrowUpDown className="h-3.5 w-3.5 opacity-50" aria-hidden="true" />
        )}
      </button>
    </th>
  );
}

/** Tabla ordenable de empresas de porteria con acciones CRUD. */
export function EmpresaPorteriaTable({
  rows,
  sortColumn,
  sortOrder,
  onSortColumnChange,
  onEdit,
  onActivate,
  onDeactivate,
  onDelete,
}: EmpresaPorteriaTableProps) {
  if (rows.length === 0) {
    return (
      <EmptyState
        title="Sin empresas de porteria"
        description="No hay empresas de porteria registradas o no coinciden con los filtros aplicados."
      />
    );
  }

  return (
    <div className="overflow-hidden rounded-md border bg-card shadow-soft">
      <div className="overflow-x-auto">
        <table className="w-full min-w-[960px] border-collapse text-left text-sm">
          <thead className="bg-muted text-xs uppercase tracking-normal text-muted-foreground">
            <tr>
              {SORTABLE_COLUMNS.map(({ id, label }) => (
                <SortableHeader
                  key={id}
                  column={id}
                  label={label}
                  sortColumn={sortColumn}
                  sortOrder={sortOrder}
                  onSortColumnChange={onSortColumnChange}
                />
              ))}
              <th className="px-4 py-3 font-semibold">Estado</th>
              <th className="px-4 py-3 font-semibold">Acciones</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {rows.map((empresaPorteria) => (
              <tr key={empresaPorteria.id} className="hover:bg-muted/40">
                <td className="px-4 py-3 tabular-nums">{empresaPorteria.id}</td>
                <td className="px-4 py-3 font-medium">{empresaPorteria.nombre}</td>
                <td className="px-4 py-3 tabular-nums">{empresaPorteria.ruc ?? "-"}</td>
                <td className="px-4 py-3 tabular-nums">{empresaPorteria.telefono ?? "-"}</td>
                <td className="px-4 py-3">{empresaPorteria.correo ?? "-"}</td>
                <td className="px-4 py-3">
                  <Badge variant={empresaPorteria.activo ? "success" : "danger"}>
                    {empresaPorteria.activo ? "Activo" : "Inactivo"}
                  </Badge>
                </td>
                <td className="px-4 py-3">
                  <div className="flex flex-nowrap items-center gap-1.5">
                    <button
                      type="button"
                      aria-label="Editar"
                      title="Editar"
                      onClick={() => onEdit(empresaPorteria)}
                      className={cn(actionIconButtonClass, "border-border hover:bg-muted")}
                    >
                      <Pencil className="h-3.5 w-3.5" aria-hidden="true" />
                    </button>
                    {empresaPorteria.activo ? (
                      <button
                        type="button"
                        aria-label="Desactivar"
                        title="Desactivar"
                        onClick={() => onDeactivate(empresaPorteria)}
                        className={cn(actionIconButtonClass, "border-amber-300 text-amber-700 hover:bg-amber-50")}
                      >
                        <Power className="h-3.5 w-3.5" aria-hidden="true" />
                      </button>
                    ) : (
                      <button
                        type="button"
                        aria-label="Activar"
                        title="Activar"
                        onClick={() => onActivate(empresaPorteria)}
                        className={cn(actionIconButtonClass, "border-emerald-300 text-emerald-700 hover:bg-emerald-50")}
                      >
                        <Power className="h-3.5 w-3.5" aria-hidden="true" />
                      </button>
                    )}
                    <button
                      type="button"
                      aria-label="Eliminar"
                      title="Eliminar"
                      onClick={() => onDelete(empresaPorteria)}
                      className={cn(actionIconButtonClass, "border-red-300 text-red-700 hover:bg-red-50")}
                    >
                      <Trash2 className="h-3.5 w-3.5" aria-hidden="true" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
