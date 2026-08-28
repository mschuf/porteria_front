/**
 * @file LoginPage.tsx
 * @description Página de inicio de sesión con credenciales locales.
 */
import type { FormEvent } from "react";
import { useState } from "react";
import { Eye } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Field } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/context/AuthContext";
import { useToast } from "@/context/ToastContext";
import type { LoginPayload } from "@/types/auth";
import { ApiError } from "@/api/apiClient";
import { accessFlagsFromUser, resolveDefaultAuthenticatedPath } from "@/utils/auth-access";

/**
 * Extrae `remainingAttempts` del sobre de error de la API (1 a 5).
 * @param error - Error capturado en el submit de login.
 * @returns Entero 1-5 o `null` si no aplica.
 */
function readRemainingAttempts(error: unknown): number | null {
  if (!(error instanceof ApiError) || error.details == null || typeof error.details !== "object") {
    return null;
  }

  const inner = (error.details as { details?: unknown }).details;
  if (inner == null || typeof inner !== "object") {
    return null;
  }

  const remaining = (inner as { remainingAttempts?: unknown }).remainingAttempts;
  if (typeof remaining !== "number" || remaining < 1 || remaining > 5) {
    return null;
  }

  return remaining;
}

/**
 * Indica si el error es un bloqueo por demasiados intentos.
 * @param error - Error capturado en el submit de login.
 * @returns `true` si es 429 / `RATE_LIMITED`.
 */
function isLoginRateLimited(error: unknown): boolean {
  return error instanceof ApiError && (error.status === 429 || error.code === "RATE_LIMITED");
}

/**
 * Formulario de login y redirección tras autenticación exitosa.
 * @returns Pantalla de inicio de sesión.
 */
export default function LoginPage() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const toast = useToast();
  const [form, setForm] = useState<LoginPayload>({ username: "", password: "" });
  const [loading, setLoading] = useState(false);
  const [revealPassword, setRevealPassword] = useState(false);
  const [remainingAttempts, setRemainingAttempts] = useState<number | null>(null);

  /**
   * Envía credenciales al contexto de auth y redirige al inicio del perfil.
   * @param event - Evento submit del formulario.
   * @returns void
   */
  const onSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setLoading(true);

    try {
      const response = await login(form);
      setRemainingAttempts(null);
      toast.success("Inicio de sesión correcto.");
      navigate(resolveDefaultAuthenticatedPath(accessFlagsFromUser(response.user)), { replace: true });
    } catch (error) {
      if (isLoginRateLimited(error)) {
        setRemainingAttempts(null);
      } else {
        setRemainingAttempts(readRemainingAttempts(error));
      }

      const message =
        error instanceof ApiError || error instanceof Error
          ? error.message
          : "No se pudo iniciar sesión.";
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4 py-10">
      <div className="mx-auto flex w-full max-w-md flex-col gap-6 rounded-lg border bg-card px-6 pb-6 pt-4 shadow-soft">
        <div>
          <div className="flex flex-col items-center text-center">
            <img
              src="/images/logo.png"
              alt="Portería"
              className="h-[6.65rem] w-auto rounded-md dark:[filter:drop-shadow(1px_0_0_#fff)_drop-shadow(-1px_0_0_#fff)_drop-shadow(0_1px_0_#fff)_drop-shadow(0_-1px_0_#fff)_drop-shadow(1px_1px_0_#fff)_drop-shadow(-1px_1px_0_#fff)_drop-shadow(1px_-1px_0_#fff)_drop-shadow(-1px_-1px_0_#fff)]"
            />
          </div>
          <h1 className="mt-4 text-xl font-semibold">Iniciar sesión</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Usá tu usuario y contraseña del sistema.
          </p>
        </div>

        <form className="space-y-4" onSubmit={onSubmit}>
          <Field id="login-username" label="Usuario">
            <Input
              id="login-username"
              name="username"
              value={form.username}
              onChange={(event) => {
                setRemainingAttempts(null);
                setForm((prev) => ({ ...prev, username: event.target.value }));
              }}
              required
              autoComplete="username"
              placeholder="usuario"
            />
          </Field>

          <Field id="login-password" label="Contraseña">
            <div className="relative">
              <Input
                id="login-password"
                type={revealPassword ? "text" : "password"}
                name="password"
                value={form.password}
                onChange={(event) => setForm((prev) => ({ ...prev, password: event.target.value }))}
                required
                autoComplete="current-password"
                placeholder="contraseña"
                className="pr-10"
              />
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="absolute right-1 top-1/2 h-8 w-8 -translate-y-1/2 text-muted-foreground"
                aria-label="Mantener presionado para ver la contraseña"
                title="Mantener presionado para ver"
                onPointerDown={() => setRevealPassword(true)}
                onPointerUp={() => setRevealPassword(false)}
                onPointerLeave={() => setRevealPassword(false)}
                onPointerCancel={() => setRevealPassword(false)}
              >
                <Eye className="h-4 w-4" aria-hidden="true" />
              </Button>
            </div>
          </Field>

          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? "Ingresando…" : "Ingresar"}
          </Button>

          {remainingAttempts != null ? (
            <p
              className="rounded-md border border-destructive/40 bg-destructive/5 p-3 text-center text-sm text-destructive"
              role="status"
            >
              {remainingAttempts === 1
                ? "Queda 1 intento."
                : `Quedan ${remainingAttempts} intentos.`}
            </p>
          ) : null}

          <div className="text-center text-sm">
            <Link
              to="/recuperar-contrasena"
              className="text-muted-foreground underline-offset-4 hover:underline"
            >
              ¿Olvidaste tu contraseña?
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
}
