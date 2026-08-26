/**
 * @file VisitasColumnEditorDialog.tsx
 * @description Editor arrastrable de las columnas visibles del listado de visitas.
 */
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog } from "@/components/ui/dialog";
import type {
  VisitaTableColumnDefinition,
  VisitaTableColumnId,
} from "@/lib/visitas-table-columns";

interface VisitasColumnEditorDialogProps {
  open: boolean;
  columns: readonly VisitaTableColumnDefinition[];
  visibleColumnIds: readonly VisitaTableColumnId[];
  onOpenChange: (open: boolean) => void;
  onSave: (columnIds: VisitaTableColumnId[]) => void;
}

/** Permite seleccionar las columnas y mover el modal desde su encabezado. */
export function VisitasColumnEditorDialog({
  open,
  columns,
  visibleColumnIds,
  onOpenChange,
  onSave,
}: VisitasColumnEditorDialogProps) {
  const [draftColumnIds, setDraftColumnIds] = useState<VisitaTableColumnId[]>([
    ...visibleColumnIds,
  ]);

  useEffect(() => {
    if (open) setDraftColumnIds([...visibleColumnIds]);
  }, [open, visibleColumnIds]);

  const toggleColumn = (columnId: VisitaTableColumnId, checked: boolean) => {
    setDraftColumnIds((current) => {
      if (checked) {
        return columns
          .map(({ id }) => id)
          .filter((id) => id === columnId || current.includes(id));
      }
      if (current.length <= 1) return current;
      return current.filter((id) => id !== columnId);
    });
  };

  return (
    <Dialog
      open={open}
      onOpenChange={onOpenChange}
      title="Editar columnas"
      description="Seleccione las columnas que desea mostrar. Puede mover este modal arrastrando el encabezado."
      className="max-w-lg"
      contentClassName="p-0 sm:p-0"
      draggable
    >
      <form
        onSubmit={(event) => {
          event.preventDefault();
          onSave(draftColumnIds);
          onOpenChange(false);
        }}
      >
        <div className="grid max-h-[min(60vh,28rem)] gap-2 overflow-y-auto p-4 sm:grid-cols-2 sm:p-5">
          {columns.map((column) => {
            const checked = draftColumnIds.includes(column.id);
            const isLastVisible = checked && draftColumnIds.length === 1;
            return (
              <label
                key={column.id}
                className="flex cursor-pointer items-center gap-3 rounded-md border px-3 py-2.5 text-sm transition-colors hover:bg-muted/60 has-[:checked]:border-primary/40 has-[:checked]:bg-primary/5"
              >
                <input
                  type="checkbox"
                  className="h-4 w-4 shrink-0 accent-primary"
                  checked={checked}
                  disabled={isLastVisible}
                  onChange={(event) => toggleColumn(column.id, event.target.checked)}
                />
                <span className="font-medium">{column.label}</span>
              </label>
            );
          })}
        </div>

        <div className="flex flex-col-reverse gap-2 border-t p-4 sm:flex-row sm:items-center sm:justify-between sm:px-5">
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => setDraftColumnIds(columns.map(({ id }) => id))}
          >
            Mostrar todas
          </Button>
          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" size="sm" onClick={() => onOpenChange(false)}>
              Cancelar
            </Button>
            <Button type="submit" size="sm">
              Guardar
            </Button>
          </div>
        </div>
      </form>
    </Dialog>
  );
}
