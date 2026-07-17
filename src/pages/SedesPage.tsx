/**
 * @file SedesPage.tsx
 * @description CRUD de sedes para super_admin.
 */
import { Plus } from "lucide-react";
import { useCallback, useMemo, useRef, useState } from "react";
import {
  activarSede,
  actualizarSede,
  crearSede,
  desactivarSede,
  eliminarSede,
  type CrearSedePayload,
  type Sede,
} from "@/api/sedes";
import { ApiError } from "@/api/apiClient";
import { SedesFilters } from "@/components/sedes/SedesFilters";
import { SedesTable } from "@/components/sedes/SedesTable";
import { PageHeader } from "@/components/layout/PageHeader";
import { Button } from "@/components/ui/button";
import { Dialog } from "@/components/ui/dialog";
import { Field } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { cn } from "@/lib/utils";
import {
  ServerSearchableSelect,
  type ServerSearchableSelectHandle,
} from "@/components/ui/server-searchable-select";
import { useToast } from "@/context/ToastContext";
import { useSedes } from "@/hooks/useSedes";
import { loadEmpresaSelectOptions, resolveEmpresaSelectOption } from "@/lib/porteria-empresas";
import {
  isPorteriaAllPageSize,
  parsePorteriaPageSize,
  PORTERIA_PAGE_SIZE_ALL,
  PORTERIA_PAGE_SIZE_OPTIONS,
} from "@/lib/porteria";

interface SedeFormState {
  empresaId: string;
  nombre: string;
  direccion: string;
  telefono: string;
  activo: boolean;
  visitaRequiereAprobacion: boolean;
}

const EMPTY_FORM: SedeFormState = {
  empresaId: "",
  nombre: "",
  direccion: "",
  telefono: "",
  activo: true,
  visitaRequiereAprobacion: true,
};

/** CRUD de sedes con filtros, orden y paginacion. */
export default function SedesPage() {
  const toast = useToast();
  const nombreRef = useRef<HTMLInputElement | null>(null);
  const empresaRef = useRef<ServerSearchableSelectHandle | null>(null);
  const {
    items,
    filters,
    setFilters,
    applyFilters,
    sort,
    setSortColumn,
    pagination,
    setPage,
    setPageLimit,
    loading,
    error,
    reload,
  } = useSedes();

  const [dialogOpen, setDialogOpen] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [editing, setEditing] = useState<Sede | null>(null);
  const [confirmSede, setConfirmSede] = useState<Sede | null>(null);
  const [confirmAction, setConfirmAction] = useState<"activate" | "deactivate" | "delete" | null>(null);
  const [form, setForm] = useState<SedeFormState>(EMPTY_FORM);
  const [requiredErrors, setRequiredErrors] = useState({ empresaId: false });
  const [saving, setSaving] = useState(false);
  const [confirmLoading, setConfirmLoading] = useState(false);

  const numericLimit =
    typeof pagination.limit === "number" ? pagination.limit : PORTERIA_PAGE_SIZE_OPTIONS[0];
  const showingAll = isPorteriaAllPageSize(pagination.limit);
  const paginationFrom =
    pagination.total === 0 ? 0 : showingAll ? 1 : (pagination.page - 1) * numericLimit + 1;
  const paginationTo = showingAll
    ? pagination.total
    : Math.min(pagination.page * numericLimit, pagination.total);

  const isCreateFormComplete = useMemo(
    () => Boolean(form.nombre.trim()) && Boolean(form.empresaId),
    [form],
  );

  const openCreateDialog = useCallback(() => {
    setEditing(null);
    setForm(EMPTY_FORM);
    setRequiredErrors({ empresaId: false });
    setDialogOpen(true);
  }, []);

  const openEditDialog = useCallback((sede: Sede) => {
    setEditing(sede);
    setForm({
      empresaId: String(sede.empresaId),
      nombre: sede.nombre,
      direccion: sede.direccion ?? "",
      telefono: sede.telefono ?? "",
      activo: sede.activo,
      visitaRequiereAprobacion: sede.visitaRequiereAprobacion,
    });
    setRequiredErrors({ empresaId: false });
    setDialogOpen(true);
  }, []);

  const openConfirm = useCallback((sede: Sede, action: "activate" | "deactivate" | "delete") => {
    setConfirmSede(sede);
    setConfirmAction(action);
    setConfirmOpen(true);
  }, []);

  const handleSave = useCallback(async () => {
    const nombre = form.nombre.trim();
    if (!editing) {
      if (!nombre) {
        toast.error("Complete el campo Nombre.", "Sedes");
        nombreRef.current?.focus();
        return;
      }
      if (!form.empresaId) {
        toast.error("Seleccione una empresa.", "Sedes");
        setRequiredErrors({ empresaId: true });
        empresaRef.current?.focusAndOpen();
        return;
      }
    }

    setSaving(true);
    try {
      const payload: CrearSedePayload = {
        empresaId: Number(form.empresaId),
        nombre,
        direccion: form.direccion.trim(),
        telefono: form.telefono.trim(),
        activo: form.activo,
        visitaRequiereAprobacion: form.visitaRequiereAprobacion,
      };

      if (editing) {
        await actualizarSede(editing.id, payload);
      } else {
        await crearSede(payload);
      }

      toast.success(editing ? "Sede actualizada." : "Sede creada.", "Sedes");
      setDialogOpen(false);
      await reload();
    } catch (saveError) {
      const message = saveError instanceof ApiError ? saveError.message : "No se pudo guardar la sede.";
      toast.error(message, "Sedes");
    } finally {
      setSaving(false);
    }
  }, [editing, form, reload, toast]);

  const handleConfirm = useCallback(async () => {
    if (!confirmSede || !confirmAction) return;

    setConfirmLoading(true);
    try {
      if (confirmAction === "activate") {
        await activarSede(confirmSede.id);
        toast.success("Sede activada.", "Sedes");
      } else if (confirmAction === "deactivate") {
        await desactivarSede(confirmSede.id);
        toast.success("Sede desactivada.", "Sedes");
      } else {
        await eliminarSede(confirmSede.id);
        toast.success("Sede eliminada.", "Sedes");
      }
      setConfirmOpen(false);
      await reload();
    } catch (confirmError) {
      const message =
        confirmError instanceof ApiError ? confirmError.message : "No se pudo completar la accion.";
      toast.error(message, "Sedes");
    } finally {
      setConfirmLoading(false);
    }
  }, [confirmAction, confirmSede, reload, toast]);

  const confirmTitle =
    confirmAction === "activate"
      ? "Activar sede"
      : confirmAction === "deactivate"
        ? "Desactivar sede"
        : "Eliminar sede";

  const confirmDescription =
    confirmAction === "activate"
      ? `¿Activar ${confirmSede?.nombre}?`
      : confirmAction === "deactivate"
        ? `¿Desactivar ${confirmSede?.nombre}?`
        : `¿Eliminar permanentemente ${confirmSede?.nombre}? Solo es posible si no tiene empresas de portería asignadas.`;

  return (
    <div className="space-y-5">
      <PageHeader
        eyebrow="Administracion"
        title="Sedes"
        description="Sedes fisicas pertenecientes a las empresas receptoras."
      />

      <SedesFilters
        filters={filters}
        onChange={setFilters}
        onApply={applyFilters}
        actions={
          <Button type="button" className="w-full sm:w-auto" onClick={openCreateDialog}>
            <Plus className="h-4 w-4" aria-hidden="true" />
            Nueva sede
          </Button>
        }
      />

      {error ? (
        <div className="rounded-md border border-red-200 bg-red-50 p-3 text-sm text-red-700">{error}</div>
      ) : null}

      {loading ? (
        <div className="rounded-md border bg-card p-6 text-sm text-muted-foreground shadow-soft">
          Cargando sedes...
        </div>
      ) : (
        <SedesTable
          rows={items}
          sortColumn={sort?.column ?? null}
          sortOrder={sort?.order ?? null}
          onSortColumnChange={setSortColumn}
          onEdit={openEditDialog}
          onActivate={(sede) => openConfirm(sede, "activate")}
          onDeactivate={(sede) => openConfirm(sede, "deactivate")}
          onDelete={(sede) => openConfirm(sede, "delete")}
        />
      )}

      {pagination.total > 0 ? (
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
            <label className="flex items-center gap-2 text-sm text-muted-foreground">
              <span className="whitespace-nowrap">Mostrar por pagina</span>
              <Select
                aria-label="Mostrar por pagina"
                className="h-9 w-24 shrink-0 px-2 py-1 text-center text-sm font-medium tabular-nums text-foreground"
                value={showingAll ? PORTERIA_PAGE_SIZE_ALL : String(pagination.limit)}
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
              Mostrando {paginationFrom}-{paginationTo} de {pagination.total} elementos
            </p>
          </div>
          {!showingAll ? (
            <div className="flex items-center gap-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                disabled={pagination.page <= 1}
                onClick={() => setPage(pagination.page - 1)}
              >
                Anterior
              </Button>
              <span className="min-w-24 text-center text-sm text-muted-foreground">
                Pagina {pagination.page} de {pagination.totalPages}
              </span>
              <Button
                type="button"
                variant="outline"
                size="sm"
                disabled={pagination.page >= pagination.totalPages}
                onClick={() => setPage(pagination.page + 1)}
              >
                Siguiente
              </Button>
            </div>
          ) : null}
        </div>
      ) : null}

      <Dialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        title={editing ? "Editar sede" : "Nueva sede"}
        description="Registre los datos de la sede."
      >
        <form
          className="space-y-4"
          onSubmit={(event) => {
            event.preventDefault();
            void handleSave();
          }}
        >
          <Field id="sede-nombre" label="Nombre" required={!editing}>
            <Input
              id="sede-nombre"
              ref={nombreRef}
              value={form.nombre}
              onChange={(e) => setForm({ ...form, nombre: e.target.value })}
              placeholder="Ej: Casa Matriz"
              aria-required={!editing}
            />
          </Field>
          <Field id="sede-empresa" label="Empresa" required={!editing}>
            <ServerSearchableSelect
              ref={empresaRef}
              id="sede-empresa"
              value={form.empresaId}
              onChange={(value) => {
                setForm({ ...form, empresaId: value });
                setRequiredErrors((current) => ({ ...current, empresaId: false }));
              }}
              onLoadOptions={loadEmpresaSelectOptions}
              resolveSelectedOption={resolveEmpresaSelectOption}
              defaultSelectedOption={
                editing ? { value: String(editing.empresaId), label: editing.empresaNombre } : null
              }
              placeholder="Seleccione una empresa"
              searchPlaceholder="Buscar empresa..."
              invalid={requiredErrors.empresaId}
            />
          </Field>
          <Field id="sede-direccion" label="Direccion">
            <Input
              id="sede-direccion"
              value={form.direccion}
              onChange={(e) => setForm({ ...form, direccion: e.target.value })}
              placeholder="Ej: Av. Mariscal Lopez 123"
            />
          </Field>
          <Field id="sede-telefono" label="Telefono">
            <Input
              id="sede-telefono"
              value={form.telefono}
              onChange={(e) => setForm({ ...form, telefono: e.target.value })}
              placeholder="Ej: 021555123"
            />
          </Field>
          <Field id="sede-visita-aprobacion" label="Aprobación de visitas">
            <label
              className={cn(
                "flex cursor-pointer items-center gap-3 rounded-lg border p-3 transition-colors",
                form.visitaRequiereAprobacion
                  ? "border-primary bg-primary/5"
                  : "hover:border-primary/40 hover:bg-muted/50",
              )}
            >
              <input
                id="sede-visita-aprobacion"
                type="checkbox"
                className="h-4 w-4 accent-primary"
                checked={form.visitaRequiereAprobacion}
                onChange={(e) => setForm({ ...form, visitaRequiereAprobacion: e.target.checked })}
              />
              <span className="text-sm font-medium">¿Visita requiere aprobación?</span>
            </label>
            <p className="mt-1 text-xs text-muted-foreground">
              Si se desmarca, las visitas de esta sede se aprueban automáticamente al crearse.
            </p>
          </Field>
          {editing ? (
            <Field id="sede-activo" label="Estado">
              <Select
                id="sede-activo"
                value={form.activo ? "true" : "false"}
                onChange={(e) => setForm({ ...form, activo: e.target.value === "true" })}
              >
                <option value="true">Activo</option>
                <option value="false">Inactivo</option>
              </Select>
            </Field>
          ) : null}
          <div className="flex justify-end gap-2 border-t pt-4">
            <Button type="button" variant="outline" onClick={() => setDialogOpen(false)} disabled={saving}>
              Cancelar
            </Button>
            <span
              className="inline-flex"
              onClick={(event) => {
                if (!editing && !isCreateFormComplete) {
                  event.preventDefault();
                }
              }}
            >
              <Button
                type="submit"
                disabled={saving || (!editing && !isCreateFormComplete)}
                title={!editing && !isCreateFormComplete ? "Complete todos los campos obligatorios" : undefined}
                className={!editing && !isCreateFormComplete ? "pointer-events-none" : undefined}
              >
                {saving ? "Guardando..." : editing ? "Guardar cambios" : "Crear sede"}
              </Button>
            </span>
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
            onClick={() => void handleConfirm()}
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
