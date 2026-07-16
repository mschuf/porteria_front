/**
 * @file VisitaTarjetaColorSelector.tsx
 * @description Vista visual de la tarjeta del catálogo seleccionada para la visita.
 */
import { Check, IdCard } from "lucide-react";
import type { VisitaTarjetaCandidate } from "@/api/visitas";
import type { TarjetaIcono } from "@/api/tarjetas";
import { Label } from "@/components/ui/label";
import { TARJETA_ICON_COMPONENTS } from "@/lib/tarjeta-iconos";
import { getTarjetaContrastColor, getTarjetaDisplayColor } from "@/lib/tarjeta-color-display";

interface VisitaTarjetaColorSelectorProps {
  tarjeta: VisitaTarjetaCandidate | null;
  labelId?: string;
}

/** Muestra la tarjeta seleccionada reutilizando el diseño visual previo del formulario. */
export function VisitaTarjetaColorSelector({
  tarjeta,
  labelId,
}: VisitaTarjetaColorSelectorProps) {
  const Icon = tarjeta
    ? TARJETA_ICON_COMPONENTS[tarjeta.icono as TarjetaIcono] ?? IdCard
    : IdCard;
  const displayColor = tarjeta ? getTarjetaDisplayColor(tarjeta.color) : "";

  return (
    <div className="space-y-1.5">
      <Label id={labelId} tabIndex={-1}>Color de tarjeta</Label>
      {tarjeta ? (
        <div
          className="relative flex w-full items-center gap-3 rounded-xl border p-3 text-left shadow-sm ring-2 ring-offset-2 ring-offset-background"
          style={{
            borderColor: `${displayColor}99`,
            background: `linear-gradient(135deg, ${displayColor}30, ${displayColor}14, transparent)`,
            boxShadow: `0 0 0 2px ${displayColor}66`,
          }}
        >
          <span
            className="flex h-14 w-14 shrink-0 items-center justify-center rounded-lg border"
            style={{
              borderColor: `${displayColor}CC`,
              backgroundColor: displayColor,
              color: getTarjetaContrastColor(tarjeta.color),
            }}
            aria-hidden="true"
          >
            <Icon className="h-7 w-7" />
          </span>

          <span className="min-w-0 flex-1 space-y-1 pr-7">
            <span className="block text-sm font-semibold">Tarjeta Nº {tarjeta.numero}</span>
            <span className="block text-sm font-medium leading-snug text-muted-foreground">
              {tarjeta.areas.length
                ? tarjeta.areas.map((area) => area.nombre).join(" · ")
                : "Sin áreas asignadas"}
            </span>
          </span>

          <span
            className="absolute right-3 top-3 flex h-5 w-5 items-center justify-center rounded-full shadow-sm ring-1 ring-black/15 dark:ring-white/20"
            style={{
              backgroundColor: displayColor,
              color: getTarjetaContrastColor(tarjeta.color),
            }}
            aria-hidden="true"
          >
            <Check className="h-3 w-3" strokeWidth={3} />
          </span>
        </div>
      ) : (
        <div className="flex min-h-20 items-center gap-3 rounded-xl border border-dashed bg-muted/20 p-3 text-muted-foreground">
          <span className="flex h-14 w-14 shrink-0 items-center justify-center rounded-lg bg-muted ring-1 ring-border/70" aria-hidden="true">
            <Icon className="h-7 w-7" />
          </span>
          <span className="text-sm">Seleccione un número de tarjeta para ver su color y accesos.</span>
        </div>
      )}
    </div>
  );
}
