/**
 * @file RestablecerSubordinadoPage.tsx
 * @description Permite a un superior restablecer la contraseña de un subordinado a la temporal.
 */
import { useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Loading } from "@/components/ui/loading";
import { useToast } from "@/context/ToastContext";
import { ApiError } from "@/api/apiClient";
import { obtenerSubordinadoReseteo, restablecerPorSuperior, type SubordinadoReseteo } from "@/api/auth";

type Estado =
  | { fase: "cargando" }
  | { fase: "listo"; subordinado: SubordinadoReseteo }
  | { fase: "invalido"; mensaje: string }
  | { fase: "hecho"; subordinado: SubordinadoReseteo };

/**
 * Pantalla de confirmación de reseteo del subordinado por el superior directo.
 * @returns Pantalla de reseteo por superior.
 */
export default function RestablecerSubordinadoPage() {
  const toast = useToast();
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token") ?? "";
  const [estado, setEstado] = useState<Estado>({ fase: "cargando" });
  const [procesando, setProcesando] = useState(false);

  useEffect(() => {
    let cancelado = false;
    if (!token) {
      setEstado({ fase: "invalido", mensaje: "El enlace es inválido o está incompleto." });
      return;
    }
    void (async () => {
      try {
        const subordinado = await obtenerSubordinadoReseteo(token);
        if (!cancelado) setEstado({ fase: "listo", subordinado });
      } catch (error) {
        if (cancelado) return;
        const mensaje = error instanceof ApiError || error instanceof Error
          ? error.message
          : "El enlace es inválido o ya expiró.";
        setEstado({ fase: "invalido", mensaje });
      }
    })();
    return () => {
      cancelado = true;
    };
  }, [token]);

  const onConfirmar = async () => {
    setProcesando(true);
    try {
      const subordinado = await restablecerPorSuperior(token);
      setEstado({ fase: "hecho", subordinado });
      toast.success("Contraseña restablecida a la temporal.");
    } catch (error) {
      const mensaje = error instanceof ApiError || error instanceof Error
        ? error.message
        : "No se pudo restablecer la contraseña.";
      toast.error(mensaje);
    } finally {
      setProcesando(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4 py-10">
      <div className="mx-auto flex w-full max-w-md flex-col gap-6 rounded-lg border bg-card px-6 pb-6 pt-6 shadow-soft">
        <div>
          <h1 className="text-xl font-semibold">Restablecer contraseña de un subordinado</h1>
        </div>

        {estado.fase === "cargando" ? (
          <Loading label="Verificando enlace…" />
        ) : estado.fase === "invalido" ? (
          <div className="space-y-4">
            <p className="rounded-md border border-destructive/40 bg-destructive/5 p-3 text-sm text-destructive">
              {estado.mensaje}
            </p>
            <Button asChild variant="outline" className="w-full">
              <Link to="/login">Ir a iniciar sesión</Link>
            </Button>
          </div>
        ) : estado.fase === "hecho" ? (
          <div className="space-y-4">
            <p className="rounded-md border bg-muted/40 p-3 text-sm">
              La contraseña de <strong>{estado.subordinado.nombre}</strong> ({estado.subordinado.usuario})
              se restableció a la contraseña temporal <strong>12345</strong>. Deberá cambiarla al
              iniciar sesión.
            </p>
            <Button asChild variant="outline" className="w-full">
              <Link to="/login">Volver</Link>
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">
              El siguiente usuario solicitó recuperar su contraseña y no tiene correo registrado. Al
              confirmar, su contraseña se restablecerá a la temporal <strong>12345</strong> y deberá
              cambiarla al iniciar sesión.
            </p>
            <div className="rounded-md border bg-muted/40 p-3 text-sm">
              <div><span className="text-muted-foreground">Nombre:</span> <strong>{estado.subordinado.nombre}</strong></div>
              <div><span className="text-muted-foreground">Usuario:</span> {estado.subordinado.usuario}</div>
            </div>
            <Button className="w-full" onClick={onConfirmar} disabled={procesando}>
              {procesando ? "Restableciendo…" : "Restablecer a 12345"}
            </Button>
            <div className="text-center text-sm">
              <Link to="/login" className="text-muted-foreground underline-offset-4 hover:underline">
                Cancelar
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
