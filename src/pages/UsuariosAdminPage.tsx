/**
 * @file UsuariosAdminPage.tsx
 * @description CRUD de usuarios del sistema para super_admin.
 */
import { Eye, Plus } from "lucide-react";
import { useCallback, useMemo, useRef, useState } from "react";
import {
  activarUsuarioAdmin,
  actualizarUsuarioAdmin,
  crearUsuarioAdmin,
  desactivarUsuarioAdmin,
  resetearPasswordUsuarioAdmin,
  type ActualizarUsuarioAdminPayload,
  type CrearUsuarioAdminPayload,
  type UsuarioAdmin,
  type UsuarioAdminRol,
} from "@/api/usuariosAdmin";
import { ApiError } from "@/api/apiClient";
import { UsuariosAdminFilters } from "@/components/usuarios-admin/UsuariosAdminFilters";
import { UsuariosAdminTable } from "@/components/usuarios-admin/UsuariosAdminTable";
import { Button } from "@/components/ui/button";
import { Dialog } from "@/components/ui/dialog";
import { Field } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { useToast } from "@/context/ToastContext";
import { useUsuariosAdmin } from "@/hooks/useUsuariosAdmin";
import {
  isPorteriaAllPageSize,
  parsePorteriaPageSize,
  PORTERIA_PAGE_SIZE_ALL,
  PORTERIA_PAGE_SIZE_OPTIONS,
} from "@/lib/porteria";

interface UsuarioFormState {
  usuario: string;
  nombre: string;
  correo: string;
  rol: UsuarioAdminRol;
  password: string;
  activo: boolean;
}

const EMPTY_FORM: UsuarioFormState = {
  usuario: "",
  nombre: "",
  correo: "",
  rol: "portero",
  password: "",
  activo: true,
};

type RequiredUsuarioField = "usuario" | "nombre" | "password";

const REQUIRED_CREATE_FIELDS: Array<{ key: RequiredUsuarioField; label: string }> = [
  { key: "usuario", label: "Usuario" },
  { key: "nombre", label: "Nombre" },
  { key: "password", label: "Contraseña" },
];

/** CRUD de usuarios con filtros, orden y paginacion. */
export default function UsuariosAdminPage() {
  const toast = useToast();
  const inputRefs = useRef<Record<RequiredUsuarioField, HTMLInputElement | null>>({
    usuario: null,
    nombre: null,
    password: null,
  });
  const resetPasswordRef = useRef<HTMLInputElement | null>(null);
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
  } = useUsuariosAdmin();

  const [dialogOpen, setDialogOpen] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [resetOpen, setResetOpen] = useState(false);
  const [editing, setEditing] = useState<UsuarioAdmin | null>(null);
  const [confirmUsuario, setConfirmUsuario] = useState<UsuarioAdmin | null>(null);
  const [confirmAction, setConfirmAction] = useState<"activate" | "deactivate" | null>(null);
  const [resetUsuario, setResetUsuario] = useState<UsuarioAdmin | null>(null);
  const [resetPassword, setResetPassword] = useState("");
  const [revealCreatePassword, setRevealCreatePassword] = useState(false);
  const [revealResetPassword, setRevealResetPassword] = useState(false);
  const [form, setForm] = useState<UsuarioFormState>(EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const [confirmLoading, setConfirmLoading] = useState(false);
  const [resetLoading, setResetLoading] = useState(false);

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
    setRevealCreatePassword(false);
    setDialogOpen(true);
  }, []);

  const openEditDialog = useCallback((usuario: UsuarioAdmin) => {
    setEditing(usuario);
    setForm({
      usuario: usuario.usuario,
      nombre: usuario.nombre,
      correo: usuario.correo ?? "",
      rol: usuario.rol,
      password: "",
      activo: usuario.activo,
    });
    setDialogOpen(true);
  }, []);

  const openConfirm = useCallback((usuario: UsuarioAdmin, action: "activate" | "deactivate") => {
    setConfirmUsuario(usuario);
    setConfirmAction(action);
    setConfirmOpen(true);
  }, []);

  const openResetPassword = useCallback((usuario: UsuarioAdmin) => {
    setResetUsuario(usuario);
    setResetPassword("");
    setRevealResetPassword(false);
    setResetOpen(true);
  }, []);

  const handleSave = useCallback(async () => {
    if (!editing && firstMissingCreateField) {
      toast.error(`Complete el campo ${firstMissingCreateField.label}.`, "Usuarios");
      inputRefs.current[firstMissingCreateField.key]?.focus();
      return;
    }

    setSaving(true);
    try {
      if (editing) {
        const payload: ActualizarUsuarioAdminPayload = {
          usuario: form.usuario.trim(),
          nombre: form.nombre.trim(),
          correo: form.correo.trim() || undefined,
          rol: form.rol,
          activo: form.activo,
        };
        await actualizarUsuarioAdmin(editing.id, payload);
      } else {
        const payload: CrearUsuarioAdminPayload = {
          usuario: form.usuario.trim(),
          nombre: form.nombre.trim(),
          correo: form.correo.trim() || undefined,
          rol: form.rol,
          password: form.password,
          activo: form.activo,
        };
        await crearUsuarioAdmin(payload);
      }

      toast.success(editing ? "Usuario actualizado." : "Usuario creado.", "Usuarios");
      setDialogOpen(false);
      await reload();
    } catch (saveError) {
      const message = saveError instanceof ApiError ? saveError.message : "No se pudo guardar el usuario.";
      toast.error(message, "Usuarios");
    } finally {
      setSaving(false);
    }
  }, [editing, firstMissingCreateField, form, reload, toast]);

  const handleConfirm = useCallback(async () => {
    if (!confirmUsuario || !confirmAction) return;

    setConfirmLoading(true);
    try {
      if (confirmAction === "activate") {
        await activarUsuarioAdmin(confirmUsuario.id);
        toast.success("Usuario activado.", "Usuarios");
      } else {
        await desactivarUsuarioAdmin(confirmUsuario.id);
        toast.success("Usuario desactivado.", "Usuarios");
      }
      setConfirmOpen(false);
      await reload();
    } catch (confirmError) {
      const message =
        confirmError instanceof ApiError ? confirmError.message : "No se pudo completar la accion.";
      toast.error(message, "Usuarios");
    } finally {
      setConfirmLoading(false);
    }
  }, [confirmAction, confirmUsuario, reload, toast]);

  const handleResetPassword = useCallback(async () => {
    if (!resetUsuario) return;
    if (resetPassword.trim().length < 8) {
      toast.error("La contraseña debe tener al menos 8 caracteres.", "Usuarios");
      resetPasswordRef.current?.focus();
      return;
    }

    setResetLoading(true);
    try {
      await resetearPasswordUsuarioAdmin(resetUsuario.id, resetPassword);
      toast.success("Contraseña restablecida.", "Usuarios");
      setResetOpen(false);
    } catch (resetError) {
      const message =
        resetError instanceof ApiError ? resetError.message : "No se pudo restablecer la contraseña.";
      toast.error(message, "Usuarios");
    } finally {
      setResetLoading(false);
    }
  }, [resetPassword, resetUsuario, toast]);

  const confirmTitle = confirmAction === "activate" ? "Activar usuario" : "Desactivar usuario";
  const confirmDescription =
    confirmAction === "activate"
      ? `¿Activar a ${confirmUsuario?.nombre}?`
      : `¿Desactivar a ${confirmUsuario?.nombre}? No podrá iniciar sesión mientras esté inactivo.`;

  return (
    <div className="space-y-5">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <p className="text-xs text-muted-foreground">Administracion</p>
          <h1 className="text-lg font-semibold">Usuarios</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Usuarios internos del sistema y sus roles de acceso.
          </p>
        </div>
      </div>

      <UsuariosAdminFilters
        filters={filters}
        onChange={setFilters}
        onApply={applyFilters}
        actions={
          <Button type="button" className="w-full sm:w-auto" onClick={openCreateDialog}>
            <Plus className="h-4 w-4" aria-hidden="true" />
            Nuevo usuario
          </Button>
        }
      />

      {error ? (
        <div className="rounded-md border border-red-200 bg-red-50 p-3 text-sm text-red-700">{error}</div>
      ) : null}

      {loading ? (
        <div className="rounded-md border bg-card p-6 text-sm text-muted-foreground shadow-soft">
          Cargando usuarios...
        </div>
      ) : (
        <UsuariosAdminTable
          rows={items}
          sortColumn={sort?.column ?? null}
          sortOrder={sort?.order ?? null}
          onSortColumnChange={setSortColumn}
          onEdit={openEditDialog}
          onResetPassword={openResetPassword}
          onActivate={(usuario) => openConfirm(usuario, "activate")}
          onDeactivate={(usuario) => openConfirm(usuario, "deactivate")}
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
        title={editing ? "Editar usuario" : "Nuevo usuario"}
        description="Registre los datos del usuario del sistema."
      >
        <form
          className="space-y-4"
          onSubmit={(event) => {
            event.preventDefault();
            void handleSave();
          }}
        >
          <Field id="usuario-login" label="Usuario" required={!editing}>
            <Input
              id="usuario-login"
              ref={(element) => {
                inputRefs.current.usuario = element;
              }}
              value={form.usuario}
              onChange={(e) => setForm({ ...form, usuario: e.target.value })}
              placeholder="Ej: jperez"
              aria-required={!editing}
            />
          </Field>
          <Field id="usuario-nombre" label="Nombre" required={!editing}>
            <Input
              id="usuario-nombre"
              ref={(element) => {
                inputRefs.current.nombre = element;
              }}
              value={form.nombre}
              onChange={(e) => setForm({ ...form, nombre: e.target.value })}
              placeholder="Ej: Juan Perez"
              aria-required={!editing}
            />
          </Field>
          <Field id="usuario-correo" label="Correo">
            <Input
              id="usuario-correo"
              type="email"
              value={form.correo}
              onChange={(e) => setForm({ ...form, correo: e.target.value })}
              placeholder="Ej: jperez@empresa.com.py"
            />
          </Field>
          <Field id="usuario-rol" label="Rol" required>
            <Select
              id="usuario-rol"
              value={form.rol}
              onChange={(e) => setForm({ ...form, rol: e.target.value as UsuarioAdminRol })}
            >
              <option value="super_admin">Super admin</option>
              <option value="admin_empresa">Admin empresa</option>
              <option value="portero">Portero</option>
            </Select>
          </Field>
          {!editing ? (
            <Field id="usuario-password" label="Contraseña" required>
              <div className="relative">
                <Input
                  id="usuario-password"
                  type={revealCreatePassword ? "text" : "password"}
                  ref={(element) => {
                    inputRefs.current.password = element;
                  }}
                  value={form.password}
                  onChange={(e) => setForm({ ...form, password: e.target.value })}
                  placeholder="Minimo 8 caracteres"
                  aria-required
                  className="pr-10"
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="absolute right-1 top-1/2 h-8 w-8 -translate-y-1/2 text-muted-foreground"
                  aria-label="Mantener presionado para ver la contrasena"
                  title="Mantener presionado para ver"
                  onPointerDown={() => setRevealCreatePassword(true)}
                  onPointerUp={() => setRevealCreatePassword(false)}
                  onPointerLeave={() => setRevealCreatePassword(false)}
                  onPointerCancel={() => setRevealCreatePassword(false)}
                >
                  <Eye className="h-4 w-4" aria-hidden="true" />
                </Button>
              </div>
            </Field>
          ) : null}
          {editing ? (
            <Field id="usuario-activo" label="Estado">
              <Select
                id="usuario-activo"
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
                    toast.error(`Complete el campo ${firstMissingCreateField.label}.`, "Usuarios");
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
                {saving ? "Guardando..." : editing ? "Guardar cambios" : "Crear usuario"}
              </Button>
            </span>
          </div>
        </form>
      </Dialog>

      <Dialog
        open={resetOpen}
        onOpenChange={setResetOpen}
        title="Resetear contraseña"
        description={`Ingrese la nueva contraseña para ${resetUsuario?.usuario ?? ""}.`}
      >
        <form
          className="space-y-4"
          onSubmit={(event) => {
            event.preventDefault();
            void handleResetPassword();
          }}
        >
          <Field id="reset-password" label="Nueva contraseña" required>
            <div className="relative">
              <Input
                id="reset-password"
                type={revealResetPassword ? "text" : "password"}
                ref={resetPasswordRef}
                value={resetPassword}
                onChange={(e) => setResetPassword(e.target.value)}
                placeholder="Minimo 8 caracteres"
                aria-required
                className="pr-10"
              />
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="absolute right-1 top-1/2 h-8 w-8 -translate-y-1/2 text-muted-foreground"
                aria-label="Mantener presionado para ver la contraseña"
                title="Mantener presionado para ver"
                onPointerDown={() => setRevealResetPassword(true)}
                onPointerUp={() => setRevealResetPassword(false)}
                onPointerLeave={() => setRevealResetPassword(false)}
                onPointerCancel={() => setRevealResetPassword(false)}
              >
                <Eye className="h-4 w-4" aria-hidden="true" />
              </Button>
            </div>
          </Field>
          <div className="flex justify-end gap-2 border-t pt-4">
            <Button type="button" variant="outline" onClick={() => setResetOpen(false)} disabled={resetLoading}>
              Cancelar
            </Button>
            <Button type="submit" disabled={resetLoading}>
              {resetLoading ? "Guardando..." : "Restablecer"}
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
            {confirmLoading ? "Procesando..." : "Confirmar"}
          </Button>
        </div>
      </Dialog>
    </div>
  );
}
