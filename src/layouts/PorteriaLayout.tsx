/**
 * @file PorteriaLayout.tsx
 * @description Layout compartido de Porteria con tabs persistentes.
 */
import { Outlet, useLocation, useNavigate } from "react-router-dom";
import { RefreshCw } from "lucide-react";
import { MobileRefreshFab } from "@/components/layout/MobileRefreshFab";
import { PageHeader } from "@/components/layout/PageHeader";
import { PorteriaTabs } from "@/components/porteria/PorteriaTabs";
import { Button } from "@/components/ui/button";
import {
  PorteriaRefreshProvider,
  usePorteriaRefresh,
} from "@/context/PorteriaRefreshContext";
import { cn } from "@/lib/utils";
import {
  isPorteriaStandalonePage,
  PORTERIA_TAB_PATHS,
  resolvePorteriaTab,
} from "@/lib/porteria-navigation";
import type { PorteriaTab } from "@/types/pages/porteria-page.types";

/**
 * Encabezado y tabs comunes para indicadores, visitas e historial.
 * @returns Layout con outlet de rutas hijas.
 */
export default function PorteriaLayout() {
  return (
    <PorteriaRefreshProvider>
      <PorteriaLayoutContent />
    </PorteriaRefreshProvider>
  );
}

function PorteriaLayoutContent() {
  const location = useLocation();
  const navigate = useNavigate();
  const tab = resolvePorteriaTab(location.pathname);
  const { handleRefresh, loading } = usePorteriaRefresh();
  const showRefresh = tab === "indicadores" || tab === "visita" || tab === "historial";
  const showPorteriaBranding = !isPorteriaStandalonePage(location.pathname);

  function handleTabChange(nextTab: PorteriaTab) {
    navigate(PORTERIA_TAB_PATHS[nextTab]);
  }

  return (
    <div className="space-y-5">
      {!showPorteriaBranding ? null : (
        <PageHeader
          title="porterIA"
          description="Seguimiento de visitas y control de ingresos."
          sessionBadgesNearTitle={location.pathname === "/porteria/visitas"}
          actions={
            <div className="flex w-full shrink-0 items-center gap-2 sm:w-auto">
              {showRefresh ? (
                <div className="hidden shrink-0 rounded-md border bg-card p-1 sm:flex">
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="gap-2"
                    disabled={loading}
                    onClick={() => void handleRefresh()}
                  >
                    <RefreshCw
                      className={cn("h-4 w-4", loading && "animate-spin")}
                      aria-hidden="true"
                    />
                  </Button>
                </div>
              ) : null}

              <PorteriaTabs value={tab} onChange={handleTabChange} />
            </div>
          }
        />
      )}

      <Outlet />

      {showRefresh ? (
        <MobileRefreshFab
          visible
          onClick={() => void handleRefresh()}
          loading={loading}
        />
      ) : null}
    </div>
  );
}
