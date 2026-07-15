/**
 * @file CambiarContrasenaPage.tsx
 * @description Cambio de la propia contraseña; también cubre el cambio forzado tras un reseteo.
 */
import type { FormEvent } from "react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Field } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/context/AuthContext";
import { useToast } from "@/context/ToastContext";
import { ApiError } from "@/api/apiClient";
import { cambiarContrasena } from "@/api/auth";
import { accessFlagsFromUser, resolveDefaultAuthenticatedPath } from "@/utils/auth-access";

/**
 * Formulario de cambio de contraseña del usuario autenticado.
 * @returns Pantalla de cambio de contraseña.
 */
export default function CambiarContrasenaPage() {
  const navigate = useNavigate();
  const toast = useToast();
  const { user, refreshSession, logout } = useAuth();
  const forzado = Boolean(user?.requiereCambioContrasena);
  const [actual, setActual] = useState("");
  const [nueva, setNueva] = useState("");
  const [confirmacion, setConfirmacion] = useState("");
  const [loading, setLoading] = useState(false);

  const error =
    nueva.length > 0 && nueva.length < 8
      ? "La nueva contraseña debe tener al menos 8 caracteres."
      : confirmacion.length > 0 && confirmacion !== nueva
        ? "Las contraseñas no coinciden."
        : undefined;

  const onSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (error || nueva.length < 8 || nueva !== confirmacion || !actual) return;
    setLoading(true);
    try {
      await cambiarContrasena(actual, nueva);
      toast.success("Contraseña actualizada.");
      await refreshSession();
      navigate(resolveDefaultAuthenticatedPath(accessFlagsFromUser(user)), { replace: true });
    } catch (err) {
      const message = err instanceof ApiError || err instanceof Error
        ? err.message
        : "No se pudo cambiar la contraseña.";
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4 py-10">
      <div className="mx-auto flex w-full max-w-md flex-col gap-6 rounded-lg border bg-card px-6 pb-6 pt-6 shadow-soft">
        <div>
          <h1 className="text-xl font-semibold">Cambiar contraseña</h1>
          {forzado ? (
            <p className="mt-1 text-sm text-muted-foreground">
              Tu contraseña fue restablecida. Por seguridad, establecé una nueva para continuar.
            </p>
          ) : null}
        </div>

        <form className="space-y-4" onSubmit={onSubmit}>
          <Field id="cambiar-actual" label={forzado ? "Contraseña temporal" : "Contraseña actual"}>
            <Input
              id="cambiar-actual"
              type="password"
              name="actual"
              value={actual}
              onChange={(event) => setActual(event.target.value)}
              required
              autoComplete="current-password"
              placeholder={forzado ? "12345" : "Contraseña actual"}
            />
          </Field>

          <Field id="cambiar-nueva" label="Nueva contraseña" error={error}>
            <Input
              id="cambiar-nueva"
              type="password"
              name="nueva"
              value={nueva}
              onChange={(event) => setNueva(event.target.value)}
              required
              autoComplete="new-password"
              placeholder="Mínimo 8 caracteres"
            />
          </Field>

          <Field id="cambiar-confirmacion" label="Repetir nueva contraseña">
            <Input
              id="cambiar-confirmacion"
              type="password"
              name="confirmacion"
              value={confirmacion}
              onChange={(event) => setConfirmacion(event.target.value)}
              required
              autoComplete="new-password"
              placeholder="Repetí la nueva contraseña"
            />
          </Field>

          <Button
            type="submit"
            className="w-full"
            disabled={loading || Boolean(error) || nueva.length < 8 || nueva !== confirmacion || !actual}
          >
            {loading ? "Guardando…" : "Guardar contraseña"}
          </Button>

          <div className="text-center text-sm">
            <button
              type="button"
              className="text-muted-foreground underline-offset-4 hover:underline"
              onClick={() => void logout({ showToast: false })}
            >
              Cerrar sesión
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
