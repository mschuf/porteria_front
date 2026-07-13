/**
 * @file ProveedoresPage.tsx
 * @description CRUD de proveedores del módulo Portería.
 */
import { Plus } from "lucide-react";
import { useCallback, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import {
  activarProveedor,
  actualizarProveedor,
  crearProveedor,
  desactivarProveedor,
  eliminarProveedor,
  type CrearProveedorPayload,
  type Proveedor,
} from "@/api/proveedores";
import { ApiError } from "@/api/apiClient";
import { PageHeader } from "@/components/layout/PageHeader";
import { ProveedoresFilters } from "@/components/proveedores/ProveedoresFilters";
import { ProveedoresTable } from "@/components/proveedores/ProveedoresTable";
import { PorteriaTabs } from "@/components/porteria/PorteriaTabs";
import { Button } from "@/components/ui/button";
import { Dialog } from "@/components/ui/dialog";
import { Field } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { useToast } from "@/context/ToastContext";
import { useAuth } from "@/context/AuthContext";
import { useProveedores } from "@/hooks/useProveedores";
import {
  isPorteriaAllPageSize,
  parsePorteriaPageSize,
  PORTERIA_PAGE_SIZE_ALL,
  PORTERIA_PAGE_SIZE_OPTIONS,
} from "@/lib/porteria";
import { PORTERIA_TAB_PATHS, resolvePorteriaTab } from "@/lib/porteria-navigation";
import type { PorteriaTab } from "@/types/pages/porteria-page.types";

interface ProveedorFormState {
  sedeId: string;
  nombre: string;
  ruc: string;
  activo: boolean;
}

const EMPTY_FORM: ProveedorFormState = {
  sedeId: "",
  nombre: "",
  ruc: "",
  activo: true,
};

/** CRUD de proveedores con filtros, orden y paginación. */
export default function ProveedoresPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const tab = resolvePorteriaTab(location.pathname);
  const toast = useToast();
  const { user } = useAuth();
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
  } = useProveedores();

  const [dialogOpen, setDialogOpen] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [editing, setEditing] = useState<Proveedor | null>(null);
  const [confirmProveedor, setConfirmProveedor] = useState<Proveedor | null>(null);
  const [confirmAction, setConfirmAction] = useState<"activate" | "deactivate" | "delete" | null>(null);
  const [form, setForm] = useState<ProveedorFormState>(EMPTY_FORM);
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

  const openCreateDialog = useCallback(() => {
    setEditing(null);
    setForm({ ...EMPTY_FORM, sedeId: user?.sedes.length === 1 ? String(user.sedes[0].id) : "" });
    setDialogOpen(true);
  }, [user]);

  const openEditDialog = useCallback((proveedor: Proveedor) => {
    setEditing(proveedor);
    setForm({
      sedeId: proveedor.sedeId ? String(proveedor.sedeId) : "",
      nombre: proveedor.nombre,
      ruc: proveedor.ruc,
      activo: proveedor.activo,
    });
    setDialogOpen(true);
  }, []);

  const openConfirm = useCallback(
    (proveedor: Proveedor, action: "activate" | "deactivate" | "delete") => {
      setConfirmProveedor(proveedor);
      setConfirmAction(action);
      setConfirmOpen(true);
    },
    [],
  );

  const handleSave = useCallback(async () => {
    if (!form.nombre.trim()) {
      toast.error("El nombre es obligatorio.", "Proveedores");
      return;
    }

    if (!form.ruc.trim()) {
      toast.error("El RUC es obligatorio.", "Proveedores");
      return;
    }

    if (!editing && !form.sedeId) { toast.error("Seleccione una sede.", "Proveedores"); return; }
    setSaving(true);
    try {
      const payload: CrearProveedorPayload = {
        sedeId: Number(form.sedeId),
        nombre: form.nombre.trim(),
        ruc: form.ruc.trim(),
        activo: form.activo,
      };

      if (editing) {
        await actualizarProveedor(editing.id, payload);
      } else {
        await crearProveedor(payload);
      }

      toast.success(editing ? "Proveedor actualizado." : "Proveedor creado.", "Proveedores");
      setDialogOpen(false);
      await reload();
    } catch (saveError) {
      const message = saveError instanceof ApiError ? saveError.message : "No se pudo guardar el proveedor.";
      toast.error(message, "Proveedores");
    } finally {
      setSaving(false);
    }
  }, [editing, form, reload, toast]);

  const handleConfirm = useCallback(async () => {
    if (!confirmProveedor || !confirmAction) return;

    setConfirmLoading(true);
    try {
      if (confirmAction === "activate") {
        await activarProveedor(confirmProveedor.id);
        toast.success("Proveedor activado.", "Proveedores");
      } else if (confirmAction === "deactivate") {
        await desactivarProveedor(confirmProveedor.id);
        toast.success("Proveedor desactivado.", "Proveedores");
      } else {
        await eliminarProveedor(confirmProveedor.id);
        toast.success("Proveedor eliminado.", "Proveedores");
      }
      setConfirmOpen(false);
      await reload();
    } catch (confirmError) {
      const message =
        confirmError instanceof ApiError ? confirmError.message : "No se pudo completar la acción.";
      toast.error(message, "Proveedores");
    } finally {
      setConfirmLoading(false);
    }
  }, [confirmAction, confirmProveedor, reload, toast]);

  const confirmTitle =
    confirmAction === "activate"
      ? "Activar proveedor"
      : confirmAction === "deactivate"
        ? "Desactivar proveedor"
        : "Eliminar proveedor";

  const confirmDescription =
    confirmAction === "activate"
      ? `¿Activar a ${confirmProveedor?.nombre}?`
      : confirmAction === "deactivate"
        ? `¿Desactivar a ${confirmProveedor?.nombre}?`
        : `¿Eliminar permanentemente a ${confirmProveedor?.nombre}? Solo es posible si no tiene personas asociadas.`;

  return (
    <div className="space-y-5">
      <PageHeader
        eyebrow="Portería"
        title="Proveedores"
        description="Empresas y contratistas a los que pertenecen las personas visitantes."
        actions={
          <PorteriaTabs
            value={tab}
            onChange={(nextTab: PorteriaTab) => navigate(PORTERIA_TAB_PATHS[nextTab])}
          />
        }
      />

      <ProveedoresFilters
        filters={filters}
        onChange={setFilters}
        onApply={applyFilters}
        actions={
          <Button type="button" className="w-full sm:w-auto" onClick={openCreateDialog}>
            <Plus className="h-4 w-4" aria-hidden="true" />
            Nuevo proveedor
          </Button>
        }
      />

      {error ? (
        <div className="rounded-md border border-red-200 bg-red-50 p-3 text-sm text-red-700">{error}</div>
      ) : null}

      {loading ? (
        <div className="rounded-md border bg-card p-6 text-sm text-muted-foreground shadow-soft">
          Cargando proveedores…
        </div>
      ) : (
        <ProveedoresTable
          rows={items}
          sortColumn={sort?.column ?? null}
          sortOrder={sort?.order ?? null}
          onSortColumnChange={setSortColumn}
          onEdit={openEditDialog}
          onActivate={(proveedor) => openConfirm(proveedor, "activate")}
          onDeactivate={(proveedor) => openConfirm(proveedor, "deactivate")}
          onDelete={(proveedor) => openConfirm(proveedor, "delete")}
        />
      )}

      {pagination.total > 0 ? (
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
            <label className="flex items-center gap-2 text-sm text-muted-foreground">
              <span className="whitespace-nowrap">Mostrar por página</span>
              <Select
                aria-label="Mostrar por página"
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
              Mostrando {paginationFrom}-{paginationTo} de {pagination.total} proveedores
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
                Página {pagination.page} de {pagination.totalPages}
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
        title={editing ? "Editar proveedor" : "Nuevo proveedor"}
        description="Registre la empresa o contratista."
      >
        <form
          className="space-y-4"
          onSubmit={(event) => {
            event.preventDefault();
            void handleSave();
          }}
        >
          {!editing ? <Field id="proveedor-sede" label="Sede" required><Select id="proveedor-sede" value={form.sedeId} onChange={(e) => setForm({ ...form, sedeId: e.target.value })}><option value="">Seleccione una sede</option>{user?.sedes.map((s) => <option key={s.id} value={s.id}>{s.nombre}</option>)}</Select></Field> : null}
          <Field id="proveedor-nombre" label="Nombre">
            <Input
              id="proveedor-nombre"
              value={form.nombre}
              onChange={(e) => setForm({ ...form, nombre: e.target.value })}
              required
            />
          </Field>
          <Field id="proveedor-ruc" label="RUC">
            <Input
              id="proveedor-ruc"
              value={form.ruc}
              onChange={(e) => setForm({ ...form, ruc: e.target.value })}
              required
            />
          </Field>
          {editing ? (
            <Field id="proveedor-activo" label="Estado">
              <Select
                id="proveedor-activo"
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
            <Button type="submit" disabled={saving}>
              {saving ? "Guardando…" : editing ? "Guardar cambios" : "Crear proveedor"}
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
            onClick={() => void handleConfirm()}
            disabled={confirmLoading}
            className="rounded-xl bg-[#EF4444] font-semibold text-white hover:bg-[#DC2626] dark:hover:bg-[#F87171]"
          >
            {confirmLoading ? "Procesando…" : "Confirmar"}
          </Button>
        </div>
      </Dialog>
    </div>
  );
}
