/**
 * @file PorteriaIndicadoresPage.tsx
 * @description Vista de indicadores y seguimiento en tiempo real.
 */
import { PorteriaCards } from "@/components/porteria/PorteriaCards";
import { PorteriaSeguimientoCards } from "@/components/porteria/PorteriaSeguimientoCards";
import { useRegisterPorteriaRefresh } from "@/context/PorteriaRefreshContext";
import { usePorteriaIndicadores } from "@/hooks/usePorteria";
import { useNavigate } from "react-router-dom";

/** @returns Metricas y visitantes activos de Porteria. */
export default function PorteriaIndicadoresPage() {
  const navigate = useNavigate();
  const {
    metrics,
    trackingVisitors,
    loading,
    refresh,
  } = usePorteriaIndicadores();

  useRegisterPorteriaRefresh(refresh, loading);

  return (
    <div className="space-y-6">
      <PorteriaCards
        metrics={metrics}
        onIngresosHoyClick={() => navigate("/porteria/visitas", { state: { openCreateVisit: true } })}
      />
      <PorteriaSeguimientoCards visitors={trackingVisitors} />
    </div>
  );
}
