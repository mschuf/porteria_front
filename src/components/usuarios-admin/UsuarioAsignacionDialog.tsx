/**
 * @file UsuarioAsignacionDialog.tsx
 * @description Modal gráfico que explica el acceso vigente de un usuario según su rol.
 */
import {
  AlertTriangle,
  ArrowDown,
  ArrowRight,
  Building2,
  CheckCircle2,
  MapPin,
  Network,
  RefreshCw,
  ShieldCheck,
  UserRound,
  Warehouse,
  type LucideIcon,
} from "lucide-react";
import { useEffect, useState } from "react";
import {
  obtenerAsignacionUsuarioAdmin,
  type UsuarioAdmin,
  type UsuarioAdminAsignacion,
} from "@/api/usuariosAdmin";
import { ApiError } from "@/api/apiClient";
import { Button } from "@/components/ui/button";
import { Dialog } from "@/components/ui/dialog";
import { isAbortError } from "@/lib/http";
import { cn } from "@/lib/utils";

interface UsuarioAsignacionDialogProps {
  open: boolean;
  usuario: UsuarioAdmin | null;
  onOpenChange: (open: boolean) => void;
}

const ROLE_LABEL: Record<UsuarioAdmin["rol"], string> = {
  super_admin: "Super admin",
  admin_empresa: "Admin empresa",
  portero: "Portero",
};

interface AssignmentNodeProps {
  icon: LucideIcon;
  eyebrow: string;
  title: string;
  tone?: "default" | "primary" | "success" | "info" | "warning";
}

function AssignmentNode({ icon: Icon, eyebrow, title, tone = "default" }: AssignmentNodeProps) {
  return (
    <div
      className={cn(
        "flex min-h-24 w-full min-w-0 items-center gap-3 rounded-xl border bg-card p-4 shadow-sm sm:w-48 sm:flex-col sm:justify-center sm:text-center",
        tone === "primary" && "border-primary/30 bg-primary/5",
        tone === "success" &&
          "border-emerald-300 bg-emerald-50/70 dark:border-emerald-700/70 dark:bg-emerald-950/40",
        tone === "info" &&
          "border-sky-300 bg-sky-50/70 dark:border-sky-700/70 dark:bg-sky-950/40",
        tone === "warning" &&
          "border-amber-300 bg-amber-50/70 dark:border-amber-700/70 dark:bg-amber-950/40",
      )}
    >
      <div
        className={cn(
          "flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-muted text-muted-foreground",
          tone === "primary" && "bg-primary/10 text-primary",
          tone === "success" &&
            "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/60 dark:text-emerald-200",
          tone === "info" && "bg-sky-100 text-sky-700 dark:bg-sky-900/60 dark:text-sky-200",
          tone === "warning" &&
            "bg-amber-100 text-amber-800 dark:bg-amber-900/60 dark:text-amber-200",
        )}
      >
        <Icon className="h-5 w-5" aria-hidden="true" />
      </div>
      <div className="min-w-0">
        <p className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">{eyebrow}</p>
        <p className="mt-0.5 break-words text-sm font-semibold leading-snug text-foreground">{title}</p>
      </div>
    </div>
  );
}

function FlowConnector() {
  return (
    <div className="flex h-8 shrink-0 items-center justify-center text-muted-foreground sm:h-auto sm:w-9">
      <ArrowDown className="h-5 w-5 sm:hidden" aria-hidden="true" />
      <ArrowRight className="hidden h-5 w-5 sm:block" aria-hidden="true" />
    </div>
  );
}

function EmptyAssignment({ role }: { role: UsuarioAdmin["rol"] }) {
  return (
    <div className="rounded-xl border border-dashed bg-muted/30 px-5 py-8 text-center">
      <Network className="mx-auto h-9 w-9 text-muted-foreground" aria-hidden="true" />
      <p className="mt-3 font-semibold">Sin asignación vigente</p>
      <p className="mt-1 text-sm text-muted-foreground">
        {role === "portero"
          ? "El portero no tiene una sede y empresa de portería activas en este momento."
          : "El administrador no tiene empresas receptoras activas asignadas."}
      </p>
    </div>
  );
}

function AssignmentDiagram({ data }: { data: UsuarioAdminAsignacion }) {
  const userNode = (
    <AssignmentNode
      icon={UserRound}
      eyebrow={ROLE_LABEL[data.usuario.rol]}
      title={data.usuario.nombre}
      tone="primary"
    />
  );

  if (data.tipo === "global") {
    return (
      <div className="flex flex-col items-center justify-center sm:flex-row">
        {userNode}
        <FlowConnector />
        <AssignmentNode icon={ShieldCheck} eyebrow="Permiso" title="Acceso global" tone="success" />
      </div>
    );
  }

  if (data.tipo === "empresa") {
    if (data.empresas.length === 0) return <EmptyAssignment role={data.usuario.rol} />;

    return (
      <div className="flex flex-col items-center">
        {userNode}
        <div className="h-7 w-px bg-border" aria-hidden="true" />
        <div className="relative grid w-full gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {data.empresas.map((empresa) => (
            <div key={empresa.id} className="flex justify-center">
              <AssignmentNode icon={Building2} eyebrow="Empresa receptora" title={empresa.nombre} tone="info" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (!data.asignacion) return <EmptyAssignment role={data.usuario.rol} />;

  return (
    <div className="flex flex-col items-center justify-center sm:flex-row sm:items-stretch">
      {userNode}
      <FlowConnector />
      <AssignmentNode
        icon={ShieldCheck}
        eyebrow="Empresa de portería"
        title={data.asignacion.empresaPorteria.nombre}
        tone="warning"
      />
      <FlowConnector />
      <AssignmentNode
        icon={Warehouse}
        eyebrow="Empresa receptora"
        title={data.asignacion.empresa.nombre}
        tone="info"
      />
      <FlowConnector />
      <AssignmentNode icon={MapPin} eyebrow="Sede" title={data.asignacion.sede.nombre} tone="success" />
    </div>
  );
}

function hasEffectiveAssignment(data: UsuarioAdminAsignacion): boolean {
  if (data.tipo === "global") return true;
  if (data.tipo === "empresa") return data.empresas.length > 0;
  return data.asignacion !== null;
}

/** Carga bajo demanda y representa la asignación vigente del usuario seleccionado. */
export function UsuarioAsignacionDialog({ open, usuario, onOpenChange }: UsuarioAsignacionDialogProps) {
  const [data, setData] = useState<UsuarioAdminAsignacion | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [retryVersion, setRetryVersion] = useState(0);

  useEffect(() => {
    if (!open || !usuario) return;

    const controller = new AbortController();
    setData(null);
    setError(null);
    setLoading(true);

    void obtenerAsignacionUsuarioAdmin(usuario.id, { signal: controller.signal })
      .then((result) => setData(result))
      .catch((requestError: unknown) => {
        if (isAbortError(requestError)) return;
        setError(
          requestError instanceof ApiError
            ? requestError.message
            : "No se pudo cargar la asignación del usuario.",
        );
      })
      .finally(() => {
        if (!controller.signal.aborted) setLoading(false);
      });

    return () => controller.abort();
  }, [open, retryVersion, usuario]);

  return (
    <Dialog
      open={open}
      onOpenChange={onOpenChange}
      title="Explicar asignación"
      description={usuario ? `${usuario.nombre} · ${ROLE_LABEL[usuario.rol]}` : undefined}
      className="max-w-5xl"
      contentClassName="sm:px-6 sm:py-6"
    >
      <div aria-live="polite">
        {loading ? (
          <div className="flex min-h-52 flex-col items-center justify-center text-center">
            <RefreshCw className="h-8 w-8 animate-spin text-primary" aria-hidden="true" />
            <p className="mt-3 text-sm font-medium">Cargando asignación vigente...</p>
          </div>
        ) : error ? (
          <div className="rounded-xl border border-red-200 bg-red-50 px-5 py-7 text-center text-red-800">
            <AlertTriangle className="mx-auto h-8 w-8" aria-hidden="true" />
            <p className="mt-3 font-semibold">No se pudo mostrar la asignación</p>
            <p className="mt-1 text-sm">{error}</p>
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="mt-4 border-red-300 bg-white hover:bg-red-100"
              onClick={() => setRetryVersion((current) => current + 1)}
            >
              <RefreshCw className="h-4 w-4" aria-hidden="true" />
              Reintentar
            </Button>
          </div>
        ) : data ? (
          <div className="space-y-5">
            {!data.usuario.activo ? (
              <div className="flex items-start gap-3 rounded-lg border border-amber-300 bg-amber-50 p-3 text-sm text-amber-900">
                <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
                <p>Este usuario está inactivo. Su acceso permanece bloqueado aunque tenga relaciones asignadas.</p>
              </div>
            ) : hasEffectiveAssignment(data) ? (
              <div className="flex items-center gap-2 text-sm text-emerald-700 dark:text-emerald-300">
                <CheckCircle2 className="h-4 w-4" aria-hidden="true" />
                <span>Acceso activo según las relaciones vigentes.</span>
              </div>
            ) : null}
            <AssignmentDiagram data={data} />
            <p className="text-center text-xs text-muted-foreground">
              Se muestran únicamente asignaciones y entidades activas y vigentes.
            </p>
          </div>
        ) : null}
      </div>
    </Dialog>
  );
}
