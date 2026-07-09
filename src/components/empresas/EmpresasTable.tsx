/**
 * @file EmpresasTable.tsx
 * @description Tabla de empresas con orden por columnas.
 */
import { ArrowDown, ArrowUp, ArrowUpDown, Pencil, Power, Trash2 } from "lucide-react";
import type { Empresa, EmpresaSortColumn, EmpresaSortOrder } from "@/api/empresas";
import { Badge } from "@/components/ui/badge";
import { EmptyState } from "@/components/ui/empty-state";
import { cn } from "@/lib/utils";

interface EmpresasTableProps {
  rows: Empresa[];
  sortColumn?: EmpresaSortColumn | null;
  sortOrder?: EmpresaSortOrder | null;
  onSortColumnChange?: (column: EmpresaSortColumn) => void;
  onEdit: (empresa: Empresa) => void;
  onActivate: (empresa: Empresa) => void;
  onDeactivate: (empresa: Empresa) => void;
  onDelete: (empresa: Empresa) => void;
}

const SORTABLE_COLUMNS: Array<{ id: EmpresaSortColumn; label: string }> = [
  { id: "id", label: "ID" },
  { id: "nombre", label: "Nombre" },
  { id: "ruc", label: "RUC" },
  { id: "direccion", label: "Direccion" },
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
  column: EmpresaSortColumn;
  label: string;
  sortColumn?: EmpresaSortColumn | null;
  sortOrder?: EmpresaSortOrder | null;
  onSortColumnChange?: (column: EmpresaSortColumn) => void;
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

/** Tabla ordenable de empresas con acciones CRUD. */
export function EmpresasTable({
  rows,
  sortColumn,
  sortOrder,
  onSortColumnChange,
  onEdit,
  onActivate,
  onDeactivate,
  onDelete,
}: EmpresasTableProps) {
  if (rows.length === 0) {
    return (
      <EmptyState
        title="Sin empresas"
        description="No hay empresas registradas o no coinciden con los filtros aplicados."
      />
    );
  }

  return (
    <div className="overflow-hidden rounded-md border bg-card shadow-soft">
      <div className="overflow-x-auto">
        <table className="w-full min-w-[1080px] border-collapse text-left text-sm">
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
            {rows.map((empresa) => (
              <tr key={empresa.id} className="hover:bg-muted/40">
                <td className="px-4 py-3 tabular-nums">{empresa.id}</td>
                <td className="px-4 py-3 font-medium">{empresa.nombre}</td>
                <td className="px-4 py-3 tabular-nums">{empresa.ruc ?? "-"}</td>
                <td className="px-4 py-3">{empresa.direccion ?? "-"}</td>
                <td className="px-4 py-3 tabular-nums">{empresa.telefono ?? "-"}</td>
                <td className="px-4 py-3">{empresa.correo ?? "-"}</td>
                <td className="px-4 py-3">
                  <Badge variant={empresa.activo ? "success" : "danger"}>
                    {empresa.activo ? "Activo" : "Inactivo"}
                  </Badge>
                </td>
                <td className="px-4 py-3">
                  <div className="flex flex-nowrap items-center gap-1.5">
                    <button
                      type="button"
                      aria-label="Editar"
                      title="Editar"
                      onClick={() => onEdit(empresa)}
                      className={cn(actionIconButtonClass, "border-border hover:bg-muted")}
                    >
                      <Pencil className="h-3.5 w-3.5" aria-hidden="true" />
                    </button>
                    {empresa.activo ? (
                      <button
                        type="button"
                        aria-label="Desactivar"
                        title="Desactivar"
                        onClick={() => onDeactivate(empresa)}
                        className={cn(actionIconButtonClass, "border-amber-300 text-amber-700 hover:bg-amber-50")}
                      >
                        <Power className="h-3.5 w-3.5" aria-hidden="true" />
                      </button>
                    ) : (
                      <button
                        type="button"
                        aria-label="Activar"
                        title="Activar"
                        onClick={() => onActivate(empresa)}
                        className={cn(actionIconButtonClass, "border-emerald-300 text-emerald-700 hover:bg-emerald-50")}
                      >
                        <Power className="h-3.5 w-3.5" aria-hidden="true" />
                      </button>
                    )}
                    <button
                      type="button"
                      aria-label="Eliminar"
                      title="Eliminar"
                      onClick={() => onDelete(empresa)}
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

