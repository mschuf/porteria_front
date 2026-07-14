/**
 * @file SedeEmpresaPorteriaPage.tsx
 * @description CRUD de asignaciones sede-empresa de seguridad para super_admin.
 */
import { Plus } from "lucide-react";
import { useCallback, useMemo, useRef, useState } from "react";
import {
  activarSedeEmpresaPorteria,
  actualizarSedeEmpresaPorteria,
  crearSedeEmpresaPorteria,
  desactivarSedeEmpresaPorteria,
  eliminarSedeEmpresaPorteria,
  type CrearSedeEmpresaPorteriaPayload,
  type SedeEmpresaPorteria,
} from "@/api/sede-empresa-porteria";
import { ApiError } from "@/api/apiClient";
import { SedeEmpresaPorteriaFilters } from "@/components/sede-empresa-porteria/SedeEmpresaPorteriaFilters";
import { SedeEmpresaPorteriaTable } from "@/components/sede-empresa-porteria/SedeEmpresaPorteriaTable";
import { PageHeader } from "@/components/layout/PageHeader";
import { Button } from "@/components/ui/button";
import { Dialog } from "@/components/ui/dialog";
import { Field } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import {
  ServerSearchableSelect,
  type ServerSearchableSelectHandle,
} from "@/components/ui/server-searchable-select";
import { useToast } from "@/context/ToastContext";
import { useSedeEmpresaPorteria } from "@/hooks/useSedeEmpresaPorteria";
import {
  loadEmpresaPorteriaSelectOptions,
  resolveEmpresaPorteriaSelectOption,
} from "@/lib/porteria-empresas-porteria";
import { loadSedeSelectOptions, resolveSedeSelectOption } from "@/lib/porteria-sedes";
import {
  isPorteriaAllPageSize,
  parsePorteriaPageSize,
  PORTERIA_PAGE_SIZE_ALL,
  PORTERIA_PAGE_SIZE_OPTIONS,
} from "@/lib/porteria";

interface SedeEmpresaPorteriaFormState {
  sedeId: string;
  empresaPorteriaId: string;
  asignadoDesde: string;
  asignadoHasta: string;
  activo: boolean;
}

const EMPTY_FORM: SedeEmpresaPorteriaFormState = {
  sedeId: "",
  empresaPorteriaId: "",
  asignadoDesde: "",
  asignadoHasta: "",
  activo: true,
};

/** Convierte un valor de `datetime-local` a ISO 8601, o undefined si esta vacio. */
function toIsoOrUndefined(value: string): string | undefined {
  if (!value) return undefined;
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? undefined : date.toISOString();
}

/** Convierte un ISO 8601 a formato `datetime-local` para precargar el input. */
function toDatetimeLocalValue(isoValue: string | null): string {
  if (!isoValue) return "";
  const date = new Date(isoValue);
  if (Number.isNaN(date.getTime())) return "";
  const offsetMs = date.getTimezoneOffset() * 60000;
  return new Date(date.getTime() - offsetMs).toISOString().slice(0, 16);
}

/** CRUD de asignaciones sede-empresa de seguridad con filtros, orden y paginacion. */
export default function SedeEmpresaPorteriaPage() {
  const toast = useToast();
  const sedeRef = useRef<ServerSearchableSelectHandle | null>(null);
  const empresaPorteriaRef = useRef<ServerSearchableSelectHandle | null>(null);
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
  } = useSedeEmpresaPorteria();

  const [dialogOpen, setDialogOpen] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [editing, setEditing] = useState<SedeEmpresaPorteria | null>(null);
  const [confirmAsignacion, setConfirmAsignacion] = useState<SedeEmpresaPorteria | null>(null);
  const [confirmAction, setConfirmAction] = useState<"activate" | "deactivate" | "delete" | null>(null);
  const [form, setForm] = useState<SedeEmpresaPorteriaFormState>(EMPTY_FORM);
  const [requiredErrors, setRequiredErrors] = useState({ sedeId: false, empresaPorteriaId: false });
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
    () => Boolean(form.sedeId) && Boolean(form.empresaPorteriaId),
    [form],
  );

  const openCreateDialog = useCallback(() => {
    setEditing(null);
    setForm(EMPTY_FORM);
    setRequiredErrors({ sedeId: false, empresaPorteriaId: false });
    setDialogOpen(true);
  }, []);

  const openEditDialog = useCallback((asignacion: SedeEmpresaPorteria) => {
    setEditing(asignacion);
    setForm({
      sedeId: String(asignacion.sedeId),
      empresaPorteriaId: String(asignacion.empresaPorteriaId),
      asignadoDesde: toDatetimeLocalValue(asignacion.asignadoDesde),
      asignadoHasta: toDatetimeLocalValue(asignacion.asignadoHasta),
      activo: asignacion.activo,
    });
    setRequiredErrors({ sedeId: false, empresaPorteriaId: false });
    setDialogOpen(true);
  }, []);

  const openConfirm = useCallback(
    (asignacion: SedeEmpresaPorteria, action: "activate" | "deactivate" | "delete") => {
      setConfirmAsignacion(asignacion);
      setConfirmAction(action);
      setConfirmOpen(true);
    },
    [],
  );

  const handleSave = useCallback(async () => {
    if (!editing) {
      if (!form.sedeId) {
        toast.error("Seleccione una sede.", "Asignaciones");
        setRequiredErrors((current) => ({ ...current, sedeId: true }));
        sedeRef.current?.focusAndOpen();
        return;
      }
      if (!form.empresaPorteriaId) {
        toast.error("Seleccione una empresa de seguridad.", "Asignaciones");
        setRequiredErrors((current) => ({ ...current, empresaPorteriaId: true }));
        empresaPorteriaRef.current?.focusAndOpen();
        return;
      }
    }

    setSaving(true);
    try {
      const payload: CrearSedeEmpresaPorteriaPayload = {
        sedeId: Number(form.sedeId),
        empresaPorteriaId: Number(form.empresaPorteriaId),
        activo: form.activo,
        asignadoDesde: toIsoOrUndefined(form.asignadoDesde),
        asignadoHasta: form.asignadoHasta ? toIsoOrUndefined(form.asignadoHasta) : null,
      };

      if (editing) {
        await actualizarSedeEmpresaPorteria(editing.id, payload);
      } else {
        await crearSedeEmpresaPorteria(payload);
      }

      toast.success(editing ? "Asignacion actualizada." : "Asignacion creada.", "Asignaciones");
      setDialogOpen(false);
      await reload();
    } catch (saveError) {
      const message =
        saveError instanceof ApiError ? saveError.message : "No se pudo guardar la asignacion.";
      toast.error(message, "Asignaciones");
    } finally {
      setSaving(false);
    }
  }, [editing, form, reload, toast]);

  const handleConfirm = useCallback(async () => {
    if (!confirmAsignacion || !confirmAction) return;

    setConfirmLoading(true);
    try {
      if (confirmAction === "activate") {
        await activarSedeEmpresaPorteria(confirmAsignacion.id);
        toast.success("Asignacion activada.", "Asignaciones");
      } else if (confirmAction === "deactivate") {
        await desactivarSedeEmpresaPorteria(confirmAsignacion.id);
        toast.success("Asignacion desactivada.", "Asignaciones");
      } else {
        await eliminarSedeEmpresaPorteria(confirmAsignacion.id);
        toast.success("Asignacion eliminada.", "Asignaciones");
      }
      setConfirmOpen(false);
      await reload();
    } catch (confirmError) {
      const message =
        confirmError instanceof ApiError ? confirmError.message : "No se pudo completar la accion.";
      toast.error(message, "Asignaciones");
    } finally {
      setConfirmLoading(false);
    }
  }, [confirmAction, confirmAsignacion, reload, toast]);

  const confirmTitle =
    confirmAction === "activate"
      ? "Activar asignacion"
      : confirmAction === "deactivate"
        ? "Desactivar asignacion"
        : "Eliminar asignacion";

  const confirmDescription =
    confirmAction === "activate"
      ? `¿Activar la asignacion de ${confirmAsignacion?.sedeNombre} con ${confirmAsignacion?.empresaPorteriaNombre}?`
      : confirmAction === "deactivate"
        ? `¿Desactivar la asignacion de ${confirmAsignacion?.sedeNombre} con ${confirmAsignacion?.empresaPorteriaNombre}?`
        : `¿Eliminar permanentemente esta asignacion?`;

  return (
    <div className="space-y-5">
      <PageHeader
        eyebrow="Administracion"
        title="Asignaciones sede-porteria"
        description="Empresas de porteria asignadas a cada sede."
      />

      <SedeEmpresaPorteriaFilters
        filters={filters}
        onChange={setFilters}
        onApply={applyFilters}
        actions={
          <Button type="button" className="w-full sm:w-auto" onClick={openCreateDialog}>
            <Plus className="h-4 w-4" aria-hidden="true" />
            Nueva asignacion
          </Button>
        }
      />

      {error ? (
        <div className="rounded-md border border-red-200 bg-red-50 p-3 text-sm text-red-700">{error}</div>
      ) : null}

      {loading ? (
        <div className="rounded-md border bg-card p-6 text-sm text-muted-foreground shadow-soft">
          Cargando asignaciones...
        </div>
      ) : (
        <SedeEmpresaPorteriaTable
          rows={items}
          sortColumn={sort?.column ?? null}
          sortOrder={sort?.order ?? null}
          onSortColumnChange={setSortColumn}
          onEdit={openEditDialog}
          onActivate={(asignacion) => openConfirm(asignacion, "activate")}
          onDeactivate={(asignacion) => openConfirm(asignacion, "deactivate")}
          onDelete={(asignacion) => openConfirm(asignacion, "delete")}
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
        title={editing ? "Editar asignacion" : "Nueva asignacion"}
        description="Registre la asignacion entre sede y empresa de seguridad."
      >
        <form
          className="space-y-4"
          onSubmit={(event) => {
            event.preventDefault();
            void handleSave();
          }}
        >
          <Field id="sep-sede" label="Sede" required={!editing}>
            <ServerSearchableSelect
              ref={sedeRef}
              id="sep-sede"
              value={form.sedeId}
              onChange={(value) => {
                setForm({ ...form, sedeId: value });
                setRequiredErrors((current) => ({ ...current, sedeId: false }));
              }}
              onLoadOptions={loadSedeSelectOptions}
              resolveSelectedOption={resolveSedeSelectOption}
              defaultSelectedOption={
                editing
                  ? { value: String(editing.sedeId), label: editing.sedeNombre }
                  : null
              }
              placeholder="Seleccione una sede"
              searchPlaceholder="Buscar sede..."
              invalid={requiredErrors.sedeId}
            />
          </Field>
          <Field id="sep-empresa-porteria" label="Empresa de seguridad" required={!editing}>
            <ServerSearchableSelect
              ref={empresaPorteriaRef}
              id="sep-empresa-porteria"
              value={form.empresaPorteriaId}
              onChange={(value) => {
                setForm({ ...form, empresaPorteriaId: value });
                setRequiredErrors((current) => ({ ...current, empresaPorteriaId: false }));
              }}
              onLoadOptions={loadEmpresaPorteriaSelectOptions}
              resolveSelectedOption={resolveEmpresaPorteriaSelectOption}
              defaultSelectedOption={
                editing
                  ? { value: String(editing.empresaPorteriaId), label: editing.empresaPorteriaNombre }
                  : null
              }
              placeholder="Seleccione una empresa de seguridad"
              searchPlaceholder="Buscar empresa de seguridad..."
              invalid={requiredErrors.empresaPorteriaId}
            />
          </Field>
          <Field id="sep-asignado-desde" label="Asignado desde">
            <Input
              id="sep-asignado-desde"
              type="datetime-local"
              value={form.asignadoDesde}
              onChange={(e) => setForm({ ...form, asignadoDesde: e.target.value })}
            />
          </Field>
          <Field id="sep-asignado-hasta" label="Asignado hasta">
            <Input
              id="sep-asignado-hasta"
              type="datetime-local"
              value={form.asignadoHasta}
              onChange={(e) => setForm({ ...form, asignadoHasta: e.target.value })}
            />
            <p className="text-xs text-muted-foreground">
              Si queda vacio, la asignacion no vence y sigue siendo valida mientras este activa.
            </p>
          </Field>
          {editing ? (
            <Field id="sep-activo" label="Estado">
              <Select
                id="sep-activo"
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
                {saving ? "Guardando..." : editing ? "Guardar cambios" : "Crear asignacion"}
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
