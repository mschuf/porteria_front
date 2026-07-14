/**
 * @file EmpresaPorteriaPage.tsx
 * @description CRUD de empresas de porteria (seguridad) para super_admin.
 */
import { Plus } from "lucide-react";
import { useCallback, useMemo, useRef, useState } from "react";
import {
  activarEmpresaPorteria,
  actualizarEmpresaPorteria,
  crearEmpresaPorteria,
  desactivarEmpresaPorteria,
  eliminarEmpresaPorteria,
  type CrearEmpresaPorteriaPayload,
  type EmpresaPorteria,
} from "@/api/empresa-porteria";
import { ApiError } from "@/api/apiClient";
import { EmpresaPorteriaFilters } from "@/components/empresa-porteria/EmpresaPorteriaFilters";
import { EmpresaPorteriaTable } from "@/components/empresa-porteria/EmpresaPorteriaTable";
import { PageHeader } from "@/components/layout/PageHeader";
import { Button } from "@/components/ui/button";
import { Dialog } from "@/components/ui/dialog";
import { Field } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { useToast } from "@/context/ToastContext";
import { useEmpresaPorteria } from "@/hooks/useEmpresaPorteria";
import {
  isPorteriaAllPageSize,
  parsePorteriaPageSize,
  PORTERIA_PAGE_SIZE_ALL,
  PORTERIA_PAGE_SIZE_OPTIONS,
} from "@/lib/porteria";

interface EmpresaPorteriaFormState {
  nombre: string;
  ruc: string;
  telefono: string;
  correo: string;
  nombreContacto: string;
  telefonoContacto: string;
  correoContacto: string;
  activo: boolean;
}

const EMPTY_FORM: EmpresaPorteriaFormState = {
  nombre: "",
  ruc: "",
  telefono: "",
  correo: "",
  nombreContacto: "",
  telefonoContacto: "",
  correoContacto: "",
  activo: true,
};

type RequiredEmpresaPorteriaField = "nombre" | "ruc" | "telefono" | "correo";

const REQUIRED_CREATE_FIELDS: Array<{ key: RequiredEmpresaPorteriaField; label: string }> = [
  { key: "nombre", label: "Nombre" },
  { key: "ruc", label: "RUC" },
  { key: "telefono", label: "Telefono" },
  { key: "correo", label: "Correo" },
];

/** CRUD de empresas de porteria con filtros, orden y paginacion. */
export default function EmpresaPorteriaPage() {
  const toast = useToast();
  const inputRefs = useRef<Record<RequiredEmpresaPorteriaField, HTMLInputElement | null>>({
    nombre: null,
    ruc: null,
    telefono: null,
    correo: null,
  });
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
  } = useEmpresaPorteria();

  const [dialogOpen, setDialogOpen] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [editing, setEditing] = useState<EmpresaPorteria | null>(null);
  const [confirmEmpresaPorteria, setConfirmEmpresaPorteria] = useState<EmpresaPorteria | null>(null);
  const [confirmAction, setConfirmAction] = useState<"activate" | "deactivate" | "delete" | null>(null);
  const [form, setForm] = useState<EmpresaPorteriaFormState>(EMPTY_FORM);
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
  const firstMissingCreateField = useMemo(
    () => REQUIRED_CREATE_FIELDS.find((field) => !form[field.key].trim()) ?? null,
    [form],
  );
  const isCreateFormComplete = !firstMissingCreateField;

  const openCreateDialog = useCallback(() => {
    setEditing(null);
    setForm(EMPTY_FORM);
    setDialogOpen(true);
  }, []);

  const openEditDialog = useCallback((empresaPorteria: EmpresaPorteria) => {
    setEditing(empresaPorteria);
    setForm({
      nombre: empresaPorteria.nombre,
      ruc: empresaPorteria.ruc ?? "",
      telefono: empresaPorteria.telefono ?? "",
      correo: empresaPorteria.correo ?? "",
      nombreContacto: empresaPorteria.nombreContacto ?? "",
      telefonoContacto: empresaPorteria.telefonoContacto ?? "",
      correoContacto: empresaPorteria.correoContacto ?? "",
      activo: empresaPorteria.activo,
    });
    setDialogOpen(true);
  }, []);

  const openConfirm = useCallback(
    (empresaPorteria: EmpresaPorteria, action: "activate" | "deactivate" | "delete") => {
      setConfirmEmpresaPorteria(empresaPorteria);
      setConfirmAction(action);
      setConfirmOpen(true);
    },
    [],
  );

  const handleSave = useCallback(async () => {
    if (!editing && firstMissingCreateField) {
      toast.error(`Complete el campo ${firstMissingCreateField.label}.`, "Empresas de seguridad");
      inputRefs.current[firstMissingCreateField.key]?.focus();
      return;
    }

    setSaving(true);
    try {
      const payload: CrearEmpresaPorteriaPayload = {
        nombre: form.nombre.trim(),
        ruc: form.ruc.trim(),
        telefono: form.telefono.trim(),
        correo: form.correo.trim(),
        nombreContacto: form.nombreContacto.trim(),
        telefonoContacto: form.telefonoContacto.trim(),
        correoContacto: form.correoContacto.trim(),
        activo: form.activo,
      };

      if (editing) {
        await actualizarEmpresaPorteria(editing.id, payload);
      } else {
        await crearEmpresaPorteria(payload);
      }

      toast.success(editing ? "Empresa de seguridad actualizada." : "Empresa de seguridad creada.", "Empresas de seguridad");
      setDialogOpen(false);
      await reload();
    } catch (saveError) {
      const message =
        saveError instanceof ApiError ? saveError.message : "No se pudo guardar la empresa de seguridad.";
      toast.error(message, "Empresas de seguridad");
    } finally {
      setSaving(false);
    }
  }, [editing, firstMissingCreateField, form, reload, toast]);

  const handleConfirm = useCallback(async () => {
    if (!confirmEmpresaPorteria || !confirmAction) return;

    setConfirmLoading(true);
    try {
      if (confirmAction === "activate") {
        await activarEmpresaPorteria(confirmEmpresaPorteria.id);
        toast.success("Empresa de seguridad activada.", "Empresas de seguridad");
      } else if (confirmAction === "deactivate") {
        await desactivarEmpresaPorteria(confirmEmpresaPorteria.id);
        toast.success("Empresa de seguridad desactivada.", "Empresas de seguridad");
      } else {
        await eliminarEmpresaPorteria(confirmEmpresaPorteria.id);
        toast.success("Empresa de seguridad eliminada.", "Empresas de seguridad");
      }
      setConfirmOpen(false);
      await reload();
    } catch (confirmError) {
      const message =
        confirmError instanceof ApiError ? confirmError.message : "No se pudo completar la accion.";
      toast.error(message, "Empresas de seguridad");
    } finally {
      setConfirmLoading(false);
    }
  }, [confirmAction, confirmEmpresaPorteria, reload, toast]);

  const confirmTitle =
    confirmAction === "activate"
      ? "Activar empresa de seguridad"
      : confirmAction === "deactivate"
        ? "Desactivar empresa de seguridad"
        : "Eliminar empresa de seguridad";

  const confirmDescription =
    confirmAction === "activate"
      ? `¿Activar a ${confirmEmpresaPorteria?.nombre}?`
      : confirmAction === "deactivate"
        ? `¿Desactivar a ${confirmEmpresaPorteria?.nombre}?`
        : `¿Eliminar permanentemente a ${confirmEmpresaPorteria?.nombre}? Solo es posible si no tiene sedes ni usuarios asociados.`;

  return (
    <div className="w-full min-w-0 space-y-5 min-[1600px]:ml-[calc(50%_-_40vw)] min-[1600px]:mr-0 min-[1600px]:w-[80vw]">
      <PageHeader
        eyebrow="Administracion"
        title="Empresas de seguridad"
        description="Empresas privadas de seguridad que operan la porteria."
      />

      <EmpresaPorteriaFilters
        filters={filters}
        onChange={setFilters}
        onApply={applyFilters}
        actions={
          <Button type="button" className="w-full sm:w-auto" onClick={openCreateDialog}>
            <Plus className="h-4 w-4" aria-hidden="true" />
            Nueva empresa de seguridad
          </Button>
        }
      />

      {error ? (
        <div className="rounded-md border border-red-200 bg-red-50 p-3 text-sm text-red-700">{error}</div>
      ) : null}

      {loading ? (
        <div className="rounded-md border bg-card p-6 text-sm text-muted-foreground shadow-soft">
          Cargando empresas de seguridad...
        </div>
      ) : (
        <EmpresaPorteriaTable
          rows={items}
          sortColumn={sort?.column ?? null}
          sortOrder={sort?.order ?? null}
          onSortColumnChange={setSortColumn}
          onEdit={openEditDialog}
          onActivate={(empresaPorteria) => openConfirm(empresaPorteria, "activate")}
          onDeactivate={(empresaPorteria) => openConfirm(empresaPorteria, "deactivate")}
          onDelete={(empresaPorteria) => openConfirm(empresaPorteria, "delete")}
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
        title={editing ? "Editar empresa de seguridad" : "Nueva empresa de seguridad"}
        description="Registre los datos de la empresa de seguridad."
      >
        <form
          className="space-y-4"
          onSubmit={(event) => {
            event.preventDefault();
            void handleSave();
          }}
        >
          <Field id="empresa-porteria-nombre" label="Nombre" required={!editing}>
            <Input
              id="empresa-porteria-nombre"
              ref={(element) => {
                inputRefs.current.nombre = element;
              }}
              value={form.nombre}
              onChange={(e) => setForm({ ...form, nombre: e.target.value })}
              placeholder="Ej: Seguridad Total SA"
              aria-required={!editing}
            />
          </Field>
          <Field id="empresa-porteria-ruc" label="RUC" required={!editing}>
            <Input
              id="empresa-porteria-ruc"
              ref={(element) => {
                inputRefs.current.ruc = element;
              }}
              value={form.ruc}
              onChange={(e) => setForm({ ...form, ruc: e.target.value })}
              placeholder="Ej: 80012345-6"
              aria-required={!editing}
            />
          </Field>
          <Field id="empresa-porteria-telefono" label="Telefono" required={!editing}>
            <Input
              id="empresa-porteria-telefono"
              ref={(element) => {
                inputRefs.current.telefono = element;
              }}
              value={form.telefono}
              onChange={(e) => setForm({ ...form, telefono: e.target.value })}
              placeholder="Ej: 021555123"
              aria-required={!editing}
            />
          </Field>
          <Field id="empresa-porteria-correo" label="Correo" required={!editing}>
            <Input
              id="empresa-porteria-correo"
              ref={(element) => {
                inputRefs.current.correo = element;
              }}
              value={form.correo}
              onChange={(e) => setForm({ ...form, correo: e.target.value })}
              placeholder="Ej: contacto@seguridadtotal.com.py"
              aria-required={!editing}
            />
          </Field>
          <Field id="empresa-porteria-nombre-contacto" label="Nombre de contacto">
            <Input
              id="empresa-porteria-nombre-contacto"
              value={form.nombreContacto}
              onChange={(e) => setForm({ ...form, nombreContacto: e.target.value })}
              placeholder="Ej: María González"
            />
          </Field>
          <Field id="empresa-porteria-telefono-contacto" label="Teléfono de contacto">
            <Input
              id="empresa-porteria-telefono-contacto"
              value={form.telefonoContacto}
              onChange={(e) => setForm({ ...form, telefonoContacto: e.target.value })}
              placeholder="Ej: 0981555123"
            />
          </Field>
          <Field id="empresa-porteria-correo-contacto" label="Correo de contacto">
            <Input
              id="empresa-porteria-correo-contacto"
              value={form.correoContacto}
              onChange={(e) => setForm({ ...form, correoContacto: e.target.value })}
              placeholder="Ej: maria.gonzalez@seguridadtotal.com.py"
            />
          </Field>
          {editing ? (
            <Field id="empresa-porteria-activo" label="Estado">
              <Select
                id="empresa-porteria-activo"
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
                  if (firstMissingCreateField) {
                    toast.error(`Complete el campo ${firstMissingCreateField.label}.`, "Empresas de seguridad");
                    inputRefs.current[firstMissingCreateField.key]?.focus();
                  }
                }
              }}
            >
              <Button
                type="submit"
                disabled={saving || (!editing && !isCreateFormComplete)}
                title={!editing && !isCreateFormComplete ? "Complete todos los campos obligatorios" : undefined}
                className={!editing && !isCreateFormComplete ? "pointer-events-none" : undefined}
              >
                {saving ? "Guardando..." : editing ? "Guardar cambios" : "Crear empresa de seguridad"}
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
