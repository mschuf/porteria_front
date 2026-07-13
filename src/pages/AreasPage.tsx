import { Plus } from "lucide-react";
import { useState } from "react";
import { activarArea, actualizarArea, crearArea, desactivarArea, eliminarArea, type Area } from "@/api/areas";
import { ApiError } from "@/api/apiClient";
import { AreasFilters } from "@/components/areas/AreasFilters";
import { AreasTable } from "@/components/areas/AreasTable";
import { PageHeader } from "@/components/layout/PageHeader";
import { Button } from "@/components/ui/button";
import { CatalogPagination } from "@/components/ui/catalog-pagination";
import { Dialog } from "@/components/ui/dialog";
import { Field } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { ServerSearchableSelect } from "@/components/ui/server-searchable-select";
import { useToast } from "@/context/ToastContext";
import { useAreas } from "@/hooks/useAreas";
import { loadSedeSelectOptions, resolveSedeSelectOption } from "@/lib/porteria-sedes";

type ConfirmAction = "activate" | "deactivate" | "delete";

export default function AreasPage() {
  const list = useAreas();
  const toast = useToast();
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Area | null>(null);
  const [sedeId, setSedeId] = useState("");
  const [nombre, setNombre] = useState("");
  const [activo, setActivo] = useState(true);
  const [saving, setSaving] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [confirmArea, setConfirmArea] = useState<Area | null>(null);
  const [confirmAction, setConfirmAction] = useState<ConfirmAction | null>(null);
  const [confirmLoading, setConfirmLoading] = useState(false);

  const start = (row?: Area) => {
    setEditing(row ?? null);
    setSedeId(row ? String(row.sedeId) : "");
    setNombre(row?.nombre ?? "");
    setActivo(row?.activo ?? true);
    setOpen(true);
  };

  const message = (reason: unknown) =>
    reason instanceof ApiError ? reason.message : "No se pudo completar la acción.";

  async function save() {
    if (!sedeId) return toast.error("Seleccione una sede.", "Áreas");
    if (!nombre.trim()) return toast.error("Ingrese el nombre del área.", "Áreas");
    setSaving(true);
    try {
      if (editing) await actualizarArea(editing.id, { nombre: nombre.trim(), activo });
      else await crearArea({ sedeId: Number(sedeId), nombre: nombre.trim(), activo });
      toast.success(editing ? "Área actualizada." : "Área creada.", "Áreas");
      setOpen(false);
      list.reload();
    } catch (error) {
      toast.error(message(error), "Áreas");
    } finally {
      setSaving(false);
    }
  }

  function openConfirm(row: Area, action: ConfirmAction) {
    setConfirmArea(row);
    setConfirmAction(action);
    setConfirmOpen(true);
  }

  function toggle(row: Area) {
    openConfirm(row, row.activo ? "deactivate" : "activate");
  }

  async function confirm() {
    if (!confirmArea || !confirmAction) return;
    setConfirmLoading(true);
    try {
      if (confirmAction === "deactivate") await desactivarArea(confirmArea.id);
      else if (confirmAction === "activate") await activarArea(confirmArea.id);
      else await eliminarArea(confirmArea.id);

      toast.success(confirmAction === "delete" ? "Área eliminada." : "Estado actualizado.", "Áreas");
      setConfirmOpen(false);
      list.reload();
    } catch (error) {
      toast.error(message(error), "Áreas");
    } finally {
      setConfirmLoading(false);
    }
  }

  const confirmTitle =
    confirmAction === "deactivate"
      ? "Desactivar área"
      : confirmAction === "activate"
        ? "Activar área"
        : "Eliminar área";
  const confirmDescription =
    confirmAction === "deactivate"
      ? `¿Desactivar el área ${confirmArea?.nombre}?`
      : confirmAction === "activate"
        ? `¿Activar el área ${confirmArea?.nombre}?`
        : `¿Eliminar permanentemente el área ${confirmArea?.nombre}?`;

  return (
    <div className="space-y-5">
      <PageHeader
        eyebrow="Administración"
        title="Áreas"
        description="Catálogo de áreas asignables a tarjetas."
      />
      <AreasFilters
        filters={list.filters}
        onChange={list.setFilters}
        onApply={list.applyFilters}
        actions={
          <Button onClick={() => start()}>
            <Plus className="h-4 w-4" />
            Nueva área
          </Button>
        }
      />
      {list.error ? (
        <div className="rounded border border-red-200 bg-red-50 p-3 text-sm text-red-700">{list.error}</div>
      ) : null}
      {list.loading ? (
        <div className="rounded border p-6 text-sm text-muted-foreground">Cargando áreas...</div>
      ) : (
        <AreasTable
          rows={list.items}
          sort={list.sort}
          onSort={list.setSortColumn}
          onEdit={start}
          onToggle={toggle}
          onDelete={(row) => openConfirm(row, "delete")}
        />
      )}
      <CatalogPagination {...list.pagination} onPage={list.setPage} onLimit={list.setPageLimit} />

      <Dialog
        open={open}
        onOpenChange={setOpen}
        title={editing ? "Editar área" : "Nueva área"}
        description="Defina el área disponible para asignación."
      >
        <form
          className="space-y-4"
          onSubmit={(event) => {
            event.preventDefault();
            void save();
          }}
        >
          <Field id="area-sede" label="Sede" required>
            <ServerSearchableSelect
              id="area-sede"
              value={sedeId}
              onChange={setSedeId}
              onLoadOptions={loadSedeSelectOptions}
              resolveSelectedOption={resolveSedeSelectOption}
              defaultSelectedOption={
                editing
                  ? { value: String(editing.sedeId), label: `${editing.sedeNombre} — ${editing.empresaNombre}` }
                  : null
              }
              placeholder="Seleccione una sede"
              searchPlaceholder="Buscar sede..."
              disabled={Boolean(editing)}
            />
          </Field>
          <Field id="area-nombre" label="Nombre" required>
            <Input
              id="area-nombre"
              autoFocus
              value={nombre}
              maxLength={120}
              onChange={(event) => setNombre(event.target.value)}
            />
          </Field>
          <Field id="area-activo" label="Estado">
            <Select
              id="area-activo"
              value={String(activo)}
              onChange={(event) => setActivo(event.target.value === "true")}
            >
              <option value="true">Activo</option>
              <option value="false">Inactivo</option>
            </Select>
          </Field>
          <div className="flex justify-end gap-2 border-t pt-4">
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Cancelar
            </Button>
            <Button type="submit" disabled={saving || !sedeId || !nombre.trim()}>
              {saving ? "Guardando..." : "Guardar"}
            </Button>
          </div>
        </form>
      </Dialog>

      <Dialog
        open={confirmOpen}
        onOpenChange={setConfirmOpen}
        title={confirmTitle}
        description={confirmDescription}
        className="max-w-sm rounded-2xl border-transparent bg-white p-5 shadow-[0_20px_25px_-5px_rgba(17,24,39,0.10),0_8px_10px_-6px_rgba(17,24,39,0.08)] dark:border-[#374151] dark:bg-[#1F2937] dark:shadow-[0_20px_25px_-5px_rgba(0,0,0,0.45),0_8px_10px_-6px_rgba(0,0,0,0.35)]"
        headerClassName="border-b-0 p-0"
        titleClassName="text-lg ml-4 font-bold text-[#111827] dark:text-white"
        descriptionClassName="mb-1.5 ml-4 mt-3 text-[15px] leading-relaxed text-[#4B5563] dark:text-[#E5E7EB]"
        contentClassName="p-0 pt-4"
        closeButtonClassName="text-[#9CA3AF] hover:bg-transparent hover:text-[#4B5563] dark:hover:text-white"
      >
        <div className="flex justify-end gap-2.5">
          <Button
            type="button"
            onClick={() => setConfirmOpen(false)}
            disabled={confirmLoading}
            className="rounded-xl border border-[#E5E7EB] bg-[#F9FAFB] font-semibold text-[#111827] hover:bg-[#F3F4F6] dark:border-transparent dark:bg-[#374151] dark:text-[#E5E7EB] dark:hover:bg-[#4B5563]"
          >
            Cancelar
          </Button>
          <Button
            type="button"
            onClick={() => void confirm()}
            disabled={confirmLoading}
            className="rounded-xl bg-[#EF4444] font-semibold text-white hover:bg-[#DC2626] dark:hover:bg-[#F87171]"
          >
            {confirmLoading ? "Procesando..." : "Confirmar"}
          </Button>
        </div>
      </Dialog>
    </div>
  );
}
