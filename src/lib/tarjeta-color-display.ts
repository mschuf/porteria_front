const LEGACY_DISPLAY_COLORS: Record<string, string> = {
  "#FF0000": "#DC2626",
  "#FFA500": "#EA580C",
  "#FFFF00": "#EAB308",
  "#008000": "#16A34A",
  "#00BFFF": "#0284C7",
  "#0000FF": "#2563EB",
  "#800080": "#9333EA",
  "#FF69B4": "#DB2777",
  "#8B4513": "#92400E",
  "#808080": "#64748B",
  "#000000": "#18181B",
  "#FFFFFF": "#F8FAFC",
};

/** Suaviza los colores básicos heredados sin alterar el valor guardado de la tarjeta. */
export function getTarjetaDisplayColor(color: string): string {
  const normalized = color.toUpperCase();
  return LEGACY_DISPLAY_COLORS[normalized] ?? color;
}

/** Devuelve un color de ícono legible sobre cualquier color de tarjeta. */
export function getTarjetaContrastColor(color: string): "#111827" | "#FFFFFF" {
  const hex = getTarjetaDisplayColor(color).replace("#", "");
  if (!/^[0-9A-Fa-f]{6}$/.test(hex)) return "#111827";

  const [red, green, blue] = [0, 2, 4]
    .map((offset) => Number.parseInt(hex.slice(offset, offset + 2), 16) / 255)
    .map((channel) => channel <= 0.04045 ? channel / 12.92 : ((channel + 0.055) / 1.055) ** 2.4);
  const luminance = red * 0.2126 + green * 0.7152 + blue * 0.0722;
  const contrastWithDark = (luminance + 0.05) / 0.05;
  const contrastWithWhite = 1.05 / (luminance + 0.05);
  return contrastWithDark >= contrastWithWhite ? "#111827" : "#FFFFFF";
}
