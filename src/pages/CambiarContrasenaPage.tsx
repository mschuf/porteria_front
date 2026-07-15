/**
 * @file CambiarContrasenaPage.tsx
 * @description Cambio de la propia contraseña; también cubre el cambio forzado tras un reseteo.
 */
import type { FormEvent } from "react";
import { useState } from "react";
import { Eye, EyeOff } from "lucide-react";
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
  const [actual, setActual] = useState(forzado ? "12345" : "");
  const [nueva, setNueva] = useState("");
  const [confirmacion, setConfirmacion] = useState("");
  const [loading, setLoading] = useState(false);
  const [revelar, setRevelar] = useState(false);

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

  const ojo = (
    <Button
      type="button"
      variant="ghost"
      size="icon"
      className="absolute right-1 top-1/2 h-8 w-8 -translate-y-1/2 text-muted-foreground"
      aria-label={revelar ? "Ocultar contraseñas" : "Mostrar contraseñas"}
      title={revelar ? "Ocultar contraseñas" : "Mostrar contraseñas"}
      onClick={() => setRevelar((prev) => !prev)}
    >
      {revelar ? <EyeOff className="h-4 w-4" aria-hidden="true" /> : <Eye className="h-4 w-4" aria-hidden="true" />}
    </Button>
  );

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
          {forzado ? null : (
            <Field id="cambiar-actual" label="Contraseña actual">
              <div className="relative">
                <Input
                  id="cambiar-actual"
                  type={revelar ? "text" : "password"}
                  name="actual"
                  value={actual}
                  onChange={(event) => setActual(event.target.value)}
                  required
                  autoComplete="current-password"
                  placeholder="Contraseña actual"
                  className="pr-10"
                />
                {ojo}
              </div>
            </Field>
          )}

          <Field id="cambiar-nueva" label="Nueva contraseña" error={error}>
            <div className="relative">
              <Input
                id="cambiar-nueva"
                type={revelar ? "text" : "password"}
                name="nueva"
                value={nueva}
                onChange={(event) => setNueva(event.target.value)}
                required
                autoComplete="new-password"
                placeholder="Mínimo 8 caracteres"
                className="pr-10"
              />
              {ojo}
            </div>
          </Field>

          <Field id="cambiar-confirmacion" label="Repetir nueva contraseña">
            <div className="relative">
              <Input
                id="cambiar-confirmacion"
                type={revelar ? "text" : "password"}
                name="confirmacion"
                value={confirmacion}
                onChange={(event) => setConfirmacion(event.target.value)}
                required
                autoComplete="new-password"
                placeholder="Repetí la nueva contraseña"
                className="pr-10"
              />
              {ojo}
            </div>
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
