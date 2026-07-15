/**
 * @file RecuperarContrasenaPage.tsx
 * @description Solicita la recuperación de contraseña por usuario o correo.
 */
import type { FormEvent } from "react";
import { useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Field } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { useToast } from "@/context/ToastContext";
import { ApiError } from "@/api/apiClient";
import { recuperarContrasena } from "@/api/auth";

/**
 * Formulario de solicitud de recuperación de contraseña.
 * @returns Pantalla de recuperación.
 */
export default function RecuperarContrasenaPage() {
  const toast = useToast();
  const [identificador, setIdentificador] = useState("");
  const [loading, setLoading] = useState(false);
  const [enviado, setEnviado] = useState(false);

  const onSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setLoading(true);
    try {
      await recuperarContrasena(identificador.trim());
      setEnviado(true);
    } catch (error) {
      const message = error instanceof ApiError || error instanceof Error
        ? error.message
        : "No se pudo procesar la solicitud.";
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4 py-10">
      <div className="mx-auto flex w-full max-w-md flex-col gap-6 rounded-lg border bg-card px-6 pb-6 pt-6 shadow-soft">
        <div>
          <h1 className="text-xl font-semibold">Recuperar contraseña</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Ingresá tu usuario o correo y te enviaremos instrucciones para restablecerla.
          </p>
        </div>

        {enviado ? (
          <div className="space-y-4">
            <p className="rounded-md border bg-muted/40 p-3 text-sm">
              Si la cuenta existe, se enviaron las instrucciones. Si no tenés correo registrado, la
              solicitud se envió a tu superior directo para que restablezca tu contraseña.
            </p>
            <Button asChild variant="outline" className="w-full">
              <Link to="/login">Volver a iniciar sesión</Link>
            </Button>
          </div>
        ) : (
          <form className="space-y-4" onSubmit={onSubmit}>
            <Field id="recuperar-identificador" label="Usuario o correo">
              <Input
                id="recuperar-identificador"
                name="identificador"
                value={identificador}
                onChange={(event) => setIdentificador(event.target.value)}
                required
                autoComplete="username"
                placeholder="usuario o correo@dominio.com"
              />
            </Field>

            <Button type="submit" className="w-full" disabled={loading || !identificador.trim()}>
              {loading ? "Enviando…" : "Enviar instrucciones"}
            </Button>

            <div className="text-center text-sm">
              <Link to="/login" className="text-muted-foreground underline-offset-4 hover:underline">
                Volver a iniciar sesión
              </Link>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
