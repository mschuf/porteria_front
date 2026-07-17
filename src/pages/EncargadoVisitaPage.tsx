import { useRef, useState } from "react";
import type { RefObject } from "react";
import { useNavigate } from "react-router-dom";
import {
  CalendarDays,
  Check,
  ChevronDown,
  CircleCheck,
  Clock3,
  RefreshCw,
  X,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import type { EncargadoVisitaRecord } from "@/api/encargadoVisita";
import { MobileRefreshFab } from "@/components/layout/MobileRefreshFab";
import { PageHeader } from "@/components/layout/PageHeader";
import { PorteriaTabs } from "@/components/porteria/PorteriaTabs";
import { AprobacionBadge } from "@/components/visitas/AprobacionBadge";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dialog } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { useAuth } from "@/context/AuthContext";
import { useRegisterPorteriaRefresh } from "@/context/PorteriaRefreshContext";
import { useEncargadoVisitaSummary } from "@/hooks/useEncargadoVisita";
import { PORTERIA_TAB_PATHS } from "@/lib/porteria-navigation";
import { cn } from "@/lib/utils";
import type { PorteriaTab } from "@/types/pages/porteria-page.types";

type Decide = (
  id: number,
  status: "aprobada" | "rechazada",
  motivoRechazo?: string,
) => Promise<void>;

interface MetricConfig {
  id: "today" | "approved" | "pending";
  label: string;
  icon: LucideIcon;
  cardClassName: string;
  iconClassName: string;
}

const METRICS: MetricConfig[] = [
  {
    id: "today",
    label: "Visitas hoy",
    icon: CalendarDays,
    cardClassName:
      "border-sky-200/90 bg-gradient-to-br from-sky-50 via-sky-50/70 to-white text-sky-900 dark:border-sky-800/70 dark:from-sky-950/60 dark:via-sky-900/35 dark:to-sky-950/45 dark:text-sky-100",
    iconClassName:
      "bg-sky-100 text-sky-700 ring-sky-200/60 dark:bg-sky-900/55 dark:text-sky-200 dark:ring-sky-700/45",
  },
  {
    id: "approved",
    label: "Visitas aprobadas",
    icon: CircleCheck,
    cardClassName:
      "border-emerald-200/90 bg-gradient-to-br from-emerald-50 via-emerald-50/70 to-white text-emerald-900 dark:border-emerald-800/70 dark:from-emerald-950/60 dark:via-emerald-900/35 dark:to-emerald-950/45 dark:text-emerald-100",
    iconClassName:
      "bg-emerald-100 text-emerald-700 ring-emerald-200/60 dark:bg-emerald-900/55 dark:text-emerald-200 dark:ring-emerald-700/45",
  },
  {
    id: "pending",
    label: "Visitas por aprobar",
    icon: Clock3,
    cardClassName:
      "border-amber-200/90 bg-gradient-to-br from-amber-50 via-amber-50/70 to-white text-amber-900 dark:border-amber-800/70 dark:from-amber-950/60 dark:via-amber-900/35 dark:to-amber-950/45 dark:text-amber-100",
    iconClassName:
      "bg-amber-100 text-amber-700 ring-amber-200/60 dark:bg-amber-900/55 dark:text-amber-200 dark:ring-amber-700/45",
  },
];

function VisitCard({
  visit,
  onDecide,
  highlightStillInside,
}: {
  visit: EncargadoVisitaRecord;
  onDecide: Decide;
  highlightStillInside: boolean;
}) {
  const [saving, setSaving] = useState(false);
  const [rejectOpen, setRejectOpen] = useState(false);
  const [reason, setReason] = useState("");
  const [actionError, setActionError] = useState("");
  const isStillInside = highlightStillInside && visit.estado === "activa";

  const approve = async () => {
    setSaving(true);
    setActionError("");
    try {
      await onDecide(visit.id, "aprobada");
    } catch (error) {
      setActionError(error instanceof Error ? error.message : "No se pudo aprobar la visita");
    } finally {
      setSaving(false);
    }
  };

  const reject = async () => {
    const trimmed = reason.trim();
    if (!trimmed) {
      setActionError("El motivo del rechazo es obligatorio.");
      return;
    }
    setSaving(true);
    setActionError("");
    try {
      await onDecide(visit.id, "rechazada", trimmed);
      setRejectOpen(false);
      setReason("");
    } catch (error) {
      setActionError(error instanceof Error ? error.message : "No se pudo rechazar la visita");
    } finally {
      setSaving(false);
    }
  };

  return (
    <>
      <article
        className={cn(
          "rounded-xl border bg-card p-4 shadow-soft",
          isStillInside && "border-emerald-400 dark:border-emerald-600",
        )}
      >
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <p className="truncate font-semibold">{visit.visitante}</p>
            <p className="truncate text-sm text-muted-foreground">{visit.empresa ?? "—"}</p>
          </div>
          <div className="flex flex-wrap justify-end gap-1.5">
            {isStillInside ? <Badge variant="success">Sigue dentro</Badge> : null}
            <AprobacionBadge
              estado={visit.estadoAprobacion}
              motivoRechazo={visit.motivoRechazo}
            />
          </div>
        </div>
        <div className="mt-3 grid gap-2 text-sm sm:grid-cols-2">
          <p>
            <span className="text-muted-foreground">Motivo:</span> {visit.motivo}
          </p>
          <p>
            <span className="text-muted-foreground">Sede:</span> {visit.sedeNombre}
          </p>
          <p className="flex items-center gap-1">
            <Clock3 className="h-4 w-4" />
            {visit.entradaAt
              ? new Date(visit.entradaAt).toLocaleTimeString("es-PY", {
                  hour: "2-digit",
                  minute: "2-digit",
                })
              : "—"}
          </p>
        </div>
        {visit.estadoAprobacion === "rechazada" ? (
          <p className="mt-3 rounded-md border border-red-200 bg-red-50 p-2 text-sm text-red-800">
            <span className="font-medium">Motivo del rechazo:</span> {visit.motivoRechazo}
          </p>
        ) : null}
        {actionError && !rejectOpen ? (
          <p className="mt-3 text-sm text-red-700">{actionError}</p>
        ) : null}
        {visit.estadoAprobacion !== "aprobada" ? (
          <div className="mt-4 flex gap-2">
            <Button size="sm" disabled={saving} onClick={() => void approve()}>
              <Check className="mr-1 h-4 w-4" />
              Aprobar
            </Button>
            {visit.estadoAprobacion === "pendiente" ? (
              <Button
                size="sm"
                variant="outline"
                disabled={saving}
                onClick={() => {
                  setActionError("");
                  setRejectOpen(true);
                }}
              >
                <X className="mr-1 h-4 w-4" />
                Rechazar
              </Button>
            ) : null}
          </div>
        ) : null}
      </article>

      <Dialog
        open={rejectOpen}
        onOpenChange={setRejectOpen}
        title={`Rechazar visita #${visit.id}`}
        description={`Ingresá el motivo del rechazo para ${visit.visitante}.`}
        className="max-w-lg"
      >
        <div className="space-y-3">
          <label className="block space-y-1">
            <span className="text-sm font-medium">Motivo del rechazo</span>
            <Textarea
              value={reason}
              maxLength={250}
              rows={5}
              autoFocus
              onChange={(event) => {
                setReason(event.target.value);
                setActionError("");
              }}
              placeholder="Escribí el motivo..."
            />
          </label>
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <span>
              {actionError ? <span className="text-red-700">{actionError}</span> : "Campo obligatorio"}
            </span>
            <span>{reason.length}/250</span>
          </div>
          <div className="flex justify-end gap-2">
            <Button variant="outline" disabled={saving} onClick={() => setRejectOpen(false)}>
              Cancelar
            </Button>
            <Button
              variant="destructive"
              disabled={saving || !reason.trim()}
              onClick={() => void reject()}
            >
              Rechazar
            </Button>
          </div>
        </div>
      </Dialog>
    </>
  );
}

function VisitSection({
  title,
  visits,
  onDecide,
  open,
  onOpenChange,
  sectionRef,
  highlightStillInside = false,
}: {
  title: string;
  visits: EncargadoVisitaRecord[];
  onDecide: Decide;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  sectionRef?: RefObject<HTMLElement>;
  highlightStillInside?: boolean;
}) {
  return (
    <section ref={sectionRef} className="scroll-mt-4 space-y-3">
      <button
        type="button"
        className="flex w-full items-center justify-between gap-3 rounded-md border bg-card p-3 text-left text-sm font-medium transition-colors hover:bg-muted/40"
        onClick={() => onOpenChange(!open)}
        aria-expanded={open}
      >
        <span>
          {title} <span className="text-muted-foreground">({visits.length})</span>
        </span>
        <ChevronDown
          className={cn("h-4 w-4 shrink-0 transition-transform", open && "rotate-180")}
          aria-hidden="true"
        />
      </button>
      {open ? (
        visits.length ? (
          <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
            {visits.map((visit) => (
              <VisitCard
                key={visit.id}
                visit={visit}
                onDecide={onDecide}
                highlightStillInside={highlightStillInside}
              />
            ))}
          </div>
        ) : (
          <p className="rounded-xl border border-dashed p-6 text-center text-sm text-muted-foreground">
            No hay visitas en esta sección.
          </p>
        )
      ) : null}
    </section>
  );
}

export default function EncargadoVisitaPage() {
  const { data, loading, error, refresh, decide } = useEncargadoVisitaSummary();
  const { role } = useAuth();
  const navigate = useNavigate();
  const approvedSectionRef = useRef<HTMLElement>(null);
  const pendingSectionRef = useRef<HTMLElement>(null);
  const [approvedOpen, setApprovedOpen] = useState(true);
  const [pendingOpen, setPendingOpen] = useState(true);
  const [rejectedOpen, setRejectedOpen] = useState(false);
  useRegisterPorteriaRefresh(refresh, loading);

  const approved = data.visits
    .filter((visit) => visit.estadoAprobacion === "aprobada")
    .sort(
      (first, second) =>
        Number(second.estado === "activa") - Number(first.estado === "activa"),
    );
  const pending = data.visits.filter((visit) => visit.estadoAprobacion === "pendiente");
  const rejected = data.visits.filter((visit) => visit.estadoAprobacion === "rechazada");

  function handleTabChange(tab: PorteriaTab) {
    navigate(PORTERIA_TAB_PATHS[tab]);
  }

  function goToTodayHistory() {
    const now = new Date();
    const today = [
      now.getFullYear(),
      String(now.getMonth() + 1).padStart(2, "0"),
      String(now.getDate()).padStart(2, "0"),
    ].join("-");
    navigate(`${PORTERIA_TAB_PATHS.historial}?entradaFrom=${today}&entradaTo=${today}`);
  }

  function goToSection(
    sectionRef: RefObject<HTMLElement>,
    target: "approved" | "pending",
  ) {
    setApprovedOpen(target === "approved");
    setPendingOpen(target === "pending");
    setRejectedOpen(false);
    requestAnimationFrame(() => {
      sectionRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    });
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Aprobación de visitas"
        description="Revisá las visitas asignadas y las de tu alcance."
        actions={
          <div className="flex w-full shrink-0 items-center gap-2 sm:w-auto">
            <Button
              type="button"
              variant="outline"
              size="icon"
              className="hidden sm:inline-flex"
              disabled={loading}
              onClick={() => void refresh()}
              aria-label="Actualizar visitas"
              title="Actualizar"
            >
              <RefreshCw className={cn("h-4 w-4", loading && "animate-spin")} />
            </Button>
            <PorteriaTabs
              value={role === "encargado_visita" ? "indicadores" : null}
              onChange={handleTabChange}
            />
          </div>
        }
      />

      {error ? (
        <p className="rounded-md border border-red-200 bg-red-50 p-3 text-sm text-red-700">
          {error}
        </p>
      ) : null}

      <section className="grid gap-3 sm:grid-cols-3">
        {METRICS.map((metric) => {
          const Icon = metric.icon;
          return (
            <button
              key={metric.id}
              type="button"
              onClick={() => {
                if (metric.id === "today") {
                  goToTodayHistory();
                  return;
                }
                if (metric.id === "approved") {
                  goToSection(approvedSectionRef, "approved");
                  return;
                }
                goToSection(pendingSectionRef, "pending");
              }}
              className={cn(
                "rounded-xl border p-4 text-left shadow-soft transition-all hover:-translate-y-0.5 hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
                metric.cardClassName,
              )}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="text-sm font-medium text-inherit/80">{metric.label}</p>
                  <p className="mt-2 text-3xl font-semibold tabular-nums tracking-tight">
                    {data.metrics[metric.id]}
                  </p>
                </div>
                <span
                  className={cn(
                    "flex h-10 w-10 shrink-0 items-center justify-center rounded-xl shadow-sm ring-1",
                    metric.iconClassName,
                  )}
                >
                  <Icon className="h-5 w-5" aria-hidden="true" />
                </span>
              </div>
            </button>
          );
        })}
      </section>

      {loading ? (
        <p className="rounded-xl border p-8 text-center text-sm text-muted-foreground">
          Cargando visitas...
        </p>
      ) : (
        <>
          <VisitSection
            title="Visitas aprobadas"
            visits={approved}
            onDecide={decide}
            open={approvedOpen}
            onOpenChange={setApprovedOpen}
            sectionRef={approvedSectionRef}
            highlightStillInside
          />
          <VisitSection
            title="Por aprobar"
            visits={pending}
            onDecide={decide}
            open={pendingOpen}
            onOpenChange={setPendingOpen}
            sectionRef={pendingSectionRef}
          />
          <VisitSection
            title="Visitas rechazadas"
            visits={rejected}
            onDecide={decide}
            open={rejectedOpen}
            onOpenChange={setRejectedOpen}
          />
        </>
      )}

      <MobileRefreshFab
        visible
        onClick={() => void refresh()}
        loading={loading}
      />
    </div>
  );
}
