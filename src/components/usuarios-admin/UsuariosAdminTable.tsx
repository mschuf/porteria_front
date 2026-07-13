/**
 * @file UsuariosAdminTable.tsx
 * @description Tabla de usuarios con orden por columnas.
 */
import { ArrowDown, ArrowUp, ArrowUpDown, KeyRound, Network, Pencil, Power } from "lucide-react";
import type { UsuarioAdmin, UsuarioAdminSortColumn, UsuarioAdminSortOrder } from "@/api/usuariosAdmin";
import { Badge } from "@/components/ui/badge";
import { EmptyState } from "@/components/ui/empty-state";
import { cn } from "@/lib/utils";

interface UsuariosAdminTableProps {
  rows: UsuarioAdmin[];
  sortColumn?: UsuarioAdminSortColumn | null;
  sortOrder?: UsuarioAdminSortOrder | null;
  onSortColumnChange?: (column: UsuarioAdminSortColumn) => void;
  onExplainAssignment: (usuario: UsuarioAdmin) => void;
  onEdit: (usuario: UsuarioAdmin) => void;
  onResetPassword: (usuario: UsuarioAdmin) => void;
  onActivate: (usuario: UsuarioAdmin) => void;
  onDeactivate: (usuario: UsuarioAdmin) => void;
}

const SORTABLE_COLUMNS: Array<{ id: UsuarioAdminSortColumn; label: string }> = [
  { id: "id", label: "ID" },
  { id: "usuario", label: "Usuario" },
  { id: "nombre", label: "Nombre" },
  { id: "correo", label: "Correo" },
  { id: "rol", label: "Rol" },
];

const ROL_LABEL: Record<UsuarioAdmin["rol"], string> = {
  super_admin: "Super admin",
  admin_empresa: "Admin empresa",
  portero: "Portero",
};

const actionIconButtonClass =
  "inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-full border transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1 disabled:cursor-not-allowed disabled:opacity-40";

function SortableHeader({
  column,
  label,
  sortColumn,
  sortOrder,
  onSortColumnChange,
}: {
  column: UsuarioAdminSortColumn;
  label: string;
  sortColumn?: UsuarioAdminSortColumn | null;
  sortOrder?: UsuarioAdminSortOrder | null;
  onSortColumnChange?: (column: UsuarioAdminSortColumn) => void;
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

/** Tabla ordenable de usuarios con acciones CRUD. */
export function UsuariosAdminTable({
  rows,
  sortColumn,
  sortOrder,
  onSortColumnChange,
  onExplainAssignment,
  onEdit,
  onResetPassword,
  onActivate,
  onDeactivate,
}: UsuariosAdminTableProps) {
  if (rows.length === 0) {
    return (
      <EmptyState
        title="Sin usuarios"
        description="No hay usuarios registrados o no coinciden con los filtros aplicados."
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
            {rows.map((usuario) => (
              <tr key={usuario.id} className="hover:bg-muted/40">
                <td className="px-4 py-3 tabular-nums">{usuario.id}</td>
                <td className="px-4 py-3 font-medium">{usuario.usuario}</td>
                <td className="px-4 py-3">{usuario.nombre}</td>
                <td className="px-4 py-3">{usuario.correo ?? "-"}</td>
                <td className="px-4 py-3">{ROL_LABEL[usuario.rol]}</td>
                <td className="px-4 py-3">
                  <Badge variant={usuario.activo ? "success" : "danger"}>
                    {usuario.activo ? "Activo" : "Inactivo"}
                  </Badge>
                </td>
                <td className="px-4 py-3">
                  <div className="flex flex-nowrap items-center gap-1.5">
                    <button
                      type="button"
                      aria-label={`Explicar asignación de ${usuario.nombre}`}
                      title="Explicar asignación"
                      onClick={() => onExplainAssignment(usuario)}
                      className={cn(actionIconButtonClass, "border-violet-300 text-violet-700 hover:bg-violet-50")}
                    >
                      <Network className="h-3.5 w-3.5" aria-hidden="true" />
                    </button>
                    <button
                      type="button"
                      aria-label="Editar"
                      title="Editar"
                      onClick={() => onEdit(usuario)}
                      className={cn(actionIconButtonClass, "border-border hover:bg-muted")}
                    >
                      <Pencil className="h-3.5 w-3.5" aria-hidden="true" />
                    </button>
                    <button
                      type="button"
                      aria-label="Resetear contraseña"
                      title="Resetear contraseña"
                      onClick={() => onResetPassword(usuario)}
                      className={cn(actionIconButtonClass, "border-sky-300 text-sky-700 hover:bg-sky-50")}
                    >
                      <KeyRound className="h-3.5 w-3.5" aria-hidden="true" />
                    </button>
                    {usuario.activo ? (
                      <button
                        type="button"
                        aria-label="Desactivar"
                        title="Desactivar"
                        onClick={() => onDeactivate(usuario)}
                        className={cn(actionIconButtonClass, "border-amber-300 text-amber-700 hover:bg-amber-50")}
                      >
                        <Power className="h-3.5 w-3.5" aria-hidden="true" />
                      </button>
                    ) : (
                      <button
                        type="button"
                        aria-label="Activar"
                        title="Activar"
                        onClick={() => onActivate(usuario)}
                        className={cn(actionIconButtonClass, "border-emerald-300 text-emerald-700 hover:bg-emerald-50")}
                      >
                        <Power className="h-3.5 w-3.5" aria-hidden="true" />
                      </button>
                    )}
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
