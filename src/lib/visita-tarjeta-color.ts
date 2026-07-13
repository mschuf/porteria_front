/**
 * @file visita-tarjeta-color.ts
 * @description Colores de tarjeta de visita y mapeo a zonas permitidas.
 */
import type { VisitaZona } from "@/api/visitas";
import { normalizeText } from "@/lib/utils";

export const VISITA_TARJETA_COLOR = ["rojo", "amarillo", "verde"] as const;

export type VisitaTarjetaColor = (typeof VISITA_TARJETA_COLOR)[number];

/** Etiquetas legibles para mostrar en UI. */
export const VISITA_TARJETA_COLOR_LABELS: Record<VisitaTarjetaColor, string> = {
  rojo: "Rojo",
  amarillo: "Amarillo",
  verde: "Verde",
};

/** Descripción de accesos por color de tarjeta. */
export const VISITA_TARJETA_COLOR_ACCESOS: Record<VisitaTarjetaColor, string> = {
  rojo: "Administración",
  amarillo: "Fábrica",
  verde: "Administración y fábrica",
};

/** Indica si un valor es un color de tarjeta válido. */
export function isVisitaTarjetaColor(value: unknown): value is VisitaTarjetaColor {
  return typeof value === "string" && (VISITA_TARJETA_COLOR as readonly string[]).includes(value);
}

/** Resuelve las zonas permitidas según el color de tarjeta seleccionado. */
export function resolveZonasFromTarjetaColor(color: VisitaTarjetaColor): VisitaZona[] {
  switch (color) {
    case "rojo":
      return ["administración"];
    case "amarillo":
      return ["fábrica"];
    case "verde":
      return ["administración", "fábrica"];
  }
}

/** Traduce áreas y color HTML del catálogo al esquema legado de acceso de visitas. */
export function resolveVisitaTarjetaColorFromCatalog(tarjeta: {
  color: string;
  areas: Array<{ nombre: string }>;
}): VisitaTarjetaColor {
  const areas = tarjeta.areas.map((area) => normalizeText(area.nombre));
  const administracion = areas.some((area) => area.includes("admin"));
  const fabrica = areas.some((area) => area.includes("fabric"));
  if (administracion && fabrica) return "verde";
  if (fabrica) return "amarillo";
  if (administracion) return "rojo";

  const match = /^#([0-9A-F]{2})([0-9A-F]{2})([0-9A-F]{2})$/i.exec(tarjeta.color);
  if (!match) return "rojo";
  const rgb = [Number.parseInt(match[1]!, 16), Number.parseInt(match[2]!, 16), Number.parseInt(match[3]!, 16)];
  const references: Array<[VisitaTarjetaColor, [number, number, number]]> = [
    ["rojo", [239, 68, 68]],
    ["amarillo", [245, 158, 11]],
    ["verde", [34, 197, 94]],
  ];
  return references.reduce((best, current) => {
    const distance = current[1].reduce((sum, channel, index) => sum + (rgb[index]! - channel) ** 2, 0);
    const bestDistance = best[1].reduce((sum, channel, index) => sum + (rgb[index]! - channel) ** 2, 0);
    return distance < bestDistance ? current : best;
  })[0];
}
