/**
 * @file UsuarioEmpresaPage.tsx
 * @description CRUD de asignaciones usuario-empresa para super_admin.
 */
import { Plus } from "lucide-react";
import { useCallback, useMemo, useRef, useState } from "react";
import {
  activarUsuarioEmpresa,
  actualizarUsuarioEmpresa,
  crearUsuarioEmpresa,
  desactivarUsuarioEmpresa,
  eliminarUsuarioEmpresa,
  type CrearUsuarioEmpresaPayload,
  type UsuarioEmpresa,
} from "@/api/usuario-empresa";
import { ApiError } from "@/api/apiClient";
import { UsuarioEmpresaFilters } from "@/components/usuario-empresa/UsuarioEmpresaFilters";
import { UsuarioEmpresaTable } from "@/components/usuario-empresa/UsuarioEmpresaTable";
import { Button } from "@/components/ui/button";
import { Dialog } from "@/components/ui/dialog";
import { Field } from "@/components/ui/field";
import { Select } from "@/components/ui/select";
import {
  ServerSearchableSelect,
  type ServerSearchableSelectHandle,
} from "@/components/ui/server-searchable-select";
import { useToast } from "@/context/ToastContext";
import { useUsuarioEmpresa } from "@/hooks/useUsuarioEmpresa";
import { loadEmpresaSelectOptions, resolveEmpresaSelectOption } from "@/lib/porteria-empresas";
import { loadUsuarioSelectOptions, resolveUsuarioSelectOption } from "@/lib/porteria-usuarios";
import {
  isPorteriaAllPageSize,
  parsePorteriaPageSize,
  PORTERIA_PAGE_SIZE_ALL,
  PORTERIA_PAGE_SIZE_OPTIONS,
} from "@/lib/porteria";

interface UsuarioEmpresaFormState {
  usuarioId: string;
  empresaId: string;
  activo: boolean;
}

const EMPTY_FORM: UsuarioEmpresaFormState = {
  usuarioId: "",
  empresaId: "",
  activo: true,
};

/** CRUD de asignaciones usuario-empresa con filtros, orden y paginacion. */
export default function UsuarioEmpresaPage() {
  const toast = useToast();
  const usuarioRef = useRef<ServerSearchableSelectHandle | null>(null);
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
  } = useUsuarioEmpresa();

  const [dialogOpen, setDialogOpen] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [editing, setEditing] = useState<UsuarioEmpresa | null>(null);
  const [confirmAsignacion, setConfirmAsignacion] = useState<UsuarioEmpresa | null>(null);
  const [confirmAction, setConfirmAction] = useState<"activate" | "deactivate" | "delete" | null>(null);
  const [form, setForm] = useState<UsuarioEmpresaFormState>(EMPTY_FORM);
  const [requiredErrors, setRequiredErrors] = useState({ usuarioId: false, empresaId: false });
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
    () => Boolean(form.usuarioId) && Boolean(form.empresaId),
    [form],
  );

  const openCreateDialog = useCallback(() => {
    setEditing(null);
    setForm(EMPTY_FORM);
    setRequiredErrors({ usuarioId: false, empresaId: false });
    setDialogOpen(true);
  }, []);

  const openEditDialog = useCallback((asignacion: UsuarioEmpresa) => {
    setEditing(asignacion);
    setForm({
      usuarioId: String(asignacion.usuarioId),
      empresaId: String(asignacion.empresaId),
      activo: asignacion.activo,
    });
    setRequiredErrors({ usuarioId: false, empresaId: false });
    setDialogOpen(true);
  }, []);

  const openConfirm = useCallback(
    (asignacion: UsuarioEmpresa, action: "activate" | "deactivate" | "delete") => {
      setConfirmAsignacion(asignacion);
      setConfirmAction(action);
      setConfirmOpen(true);
    },
    [],
  );

  const handleSave = useCallback(async () => {
    if (!editing) {
      if (!form.usuarioId) {
        toast.error("Seleccione un usuario.", "Asignaciones");
        setRequiredErrors((current) => ({ ...current, usuarioId: true }));
        usuarioRef.current?.focusAndOpen();
        return;
      }
      if (!form.empresaId) {
        toast.error("Seleccione una empresa.", "Asignaciones");
        setRequiredErrors((current) => ({ ...current, empresaId: true }));
        empresaRef.current?.focusAndOpen();
        return;
      }
    }

    setSaving(true);
    try {
      const payload: CrearUsuarioEmpresaPayload = {
        usuarioId: Number(form.usuarioId),
        empresaId: Number(form.empresaId),
        activo: form.activo,
      };

      if (editing) {
        await actualizarUsuarioEmpresa(editing.id, payload);
      } else {
        await crearUsuarioEmpresa(payload);
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
        await activarUsuarioEmpresa(confirmAsignacion.id);
        toast.success("Asignacion activada.", "Asignaciones");
      } else if (confirmAction === "deactivate") {
        await desactivarUsuarioEmpresa(confirmAsignacion.id);
        toast.success("Asignacion desactivada.", "Asignaciones");
      } else {
        await eliminarUsuarioEmpresa(confirmAsignacion.id);
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
      ? `¿Activar la asignacion de ${confirmAsignacion?.usuarioNombre} con ${confirmAsignacion?.empresaNombre}?`
      : confirmAction === "deactivate"
        ? `¿Desactivar la asignacion de ${confirmAsignacion?.usuarioNombre} con ${confirmAsignacion?.empresaNombre}?`
        : `¿Eliminar permanentemente esta asignacion?`;

  return (
    <div className="space-y-5">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <p className="text-xs text-muted-foreground">Administracion</p>
          <h1 className="text-lg font-semibold">Usuarios por empresa</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Usuarios asignados a cada empresa.
          </p>
        </div>
      </div>

      <UsuarioEmpresaFilters
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
        <UsuarioEmpresaTable
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
        description="Registre la asignacion entre usuario y empresa."
      >
        <form
          className="space-y-4"
          onSubmit={(event) => {
            event.preventDefault();
            void handleSave();
          }}
        >
          <Field id="ue-usuario" label="Usuario" required={!editing}>
            <ServerSearchableSelect
              ref={usuarioRef}
              id="ue-usuario"
              value={form.usuarioId}
              onChange={(value) => {
                setForm({ ...form, usuarioId: value });
                setRequiredErrors((current) => ({ ...current, usuarioId: false }));
              }}
              onLoadOptions={loadUsuarioSelectOptions}
              resolveSelectedOption={resolveUsuarioSelectOption}
              defaultSelectedOption={
                editing ? { value: String(editing.usuarioId), label: editing.usuarioNombre } : null
              }
              placeholder="Seleccione un usuario"
              searchPlaceholder="Buscar usuario..."
              invalid={requiredErrors.usuarioId}
            />
          </Field>
          <Field id="ue-empresa" label="Empresa" required={!editing}>
            <ServerSearchableSelect
              ref={empresaRef}
              id="ue-empresa"
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
          {editing ? (
            <Field id="ue-activo" label="Estado">
              <Select
                id="ue-activo"
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
