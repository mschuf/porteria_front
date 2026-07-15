/**
 * @file RestablecerContrasenaPage.tsx
 * @description Establece una nueva contraseña a partir del token recibido por correo.
 */
import type { FormEvent } from "react";
import { useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Field } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { useToast } from "@/context/ToastContext";
import { ApiError } from "@/api/apiClient";
import { restablecerContrasena } from "@/api/auth";

/**
 * Formulario de nueva contraseña con token del enlace.
 * @returns Pantalla de restablecimiento.
 */
export default function RestablecerContrasenaPage() {
  const navigate = useNavigate();
  const toast = useToast();
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token") ?? "";
  const [contrasena, setContrasena] = useState("");
  const [confirmacion, setConfirmacion] = useState("");
  const [loading, setLoading] = useState(false);

  const error =
    contrasena.length > 0 && contrasena.length < 8
      ? "La contraseña debe tener al menos 8 caracteres."
      : confirmacion.length > 0 && confirmacion !== contrasena
        ? "Las contraseñas no coinciden."
        : undefined;

  const onSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (error || contrasena.length < 8 || contrasena !== confirmacion) return;
    setLoading(true);
    try {
      await restablecerContrasena(token, contrasena);
      toast.success("Contraseña actualizada. Ya podés iniciar sesión.");
      navigate("/login", { replace: true });
    } catch (err) {
      const message = err instanceof ApiError || err instanceof Error
        ? err.message
        : "No se pudo restablecer la contraseña.";
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4 py-10">
      <div className="mx-auto flex w-full max-w-md flex-col gap-6 rounded-lg border bg-card px-6 pb-6 pt-6 shadow-soft">
        <div>
          <h1 className="text-xl font-semibold">Nueva contraseña</h1>
          <p className="mt-1 text-sm text-muted-foreground">Ingresá tu nueva contraseña.</p>
        </div>

        {!token ? (
          <div className="space-y-4">
            <p className="rounded-md border border-destructive/40 bg-destructive/5 p-3 text-sm text-destructive">
              El enlace es inválido o está incompleto. Solicitá la recuperación nuevamente.
            </p>
            <Button asChild variant="outline" className="w-full">
              <Link to="/recuperar-contrasena">Solicitar de nuevo</Link>
            </Button>
          </div>
        ) : (
          <form className="space-y-4" onSubmit={onSubmit}>
            <Field id="reset-contrasena" label="Nueva contraseña" error={error}>
              <Input
                id="reset-contrasena"
                type="password"
                name="contrasena"
                value={contrasena}
                onChange={(event) => setContrasena(event.target.value)}
                required
                autoComplete="new-password"
                placeholder="Mínimo 8 caracteres"
              />
            </Field>

            <Field id="reset-confirmacion" label="Repetir contraseña">
              <Input
                id="reset-confirmacion"
                type="password"
                name="confirmacion"
                value={confirmacion}
                onChange={(event) => setConfirmacion(event.target.value)}
                required
                autoComplete="new-password"
                placeholder="Repetí la contraseña"
              />
            </Field>

            <Button
              type="submit"
              className="w-full"
              disabled={loading || Boolean(error) || contrasena.length < 8 || contrasena !== confirmacion}
            >
              {loading ? "Guardando…" : "Guardar contraseña"}
            </Button>
          </form>
        )}
      </div>
    </div>
  );
}
