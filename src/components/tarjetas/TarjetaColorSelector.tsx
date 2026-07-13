import { Input } from "@/components/ui/input";

const PALETTE = [
  { name: "Rojo", value: "#FF0000" },
  { name: "Naranja", value: "#FFA500" },
  { name: "Amarillo", value: "#FFFF00" },
  { name: "Verde", value: "#008000" },
  { name: "Celeste", value: "#00BFFF" },
  { name: "Azul", value: "#0000FF" },
  { name: "Violeta", value: "#800080" },
  { name: "Rosa", value: "#FF69B4" },
  { name: "Marrón", value: "#8B4513" },
  { name: "Gris", value: "#808080" },
  { name: "Negro", value: "#000000" },
  { name: "Blanco", value: "#FFFFFF" },
] as const;

export function TarjetaColorSelector({
  value,
  onChange,
}: {
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <div className="space-y-3">
      <div className="flex gap-2">
        <input
          type="color"
          aria-label="Seleccionar un color personalizado"
          className="h-10 w-14 cursor-pointer rounded border bg-background p-1"
          value={/^#[0-9A-Fa-f]{6}$/.test(value) ? value : "#0000FF"}
          onChange={(event) => onChange(event.target.value.toUpperCase())}
        />
        <Input
          aria-label="Código hexadecimal del color"
          value={value}
          maxLength={7}
          placeholder="#0000FF"
          onChange={(event) => onChange(event.target.value.toUpperCase())}
        />
      </div>

      <div className="grid w-full grid-cols-6 gap-x-4 gap-y-3" aria-label="Paleta de colores básicos">
        {PALETTE.map((color) => (
          <div key={color.value} className="group relative flex justify-center">
            <button
              type="button"
              aria-label={`Seleccionar color ${color.name}`}
              onClick={() => onChange(color.value)}
              className={`h-8 w-8 rounded-full border-2 border-border transition-transform hover:scale-110 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 ${
                value.toUpperCase() === color.value ? "ring-2 ring-ring ring-offset-2" : ""
              }`}
              style={{ backgroundColor: color.value }}
            />
            <span
              role="tooltip"
              className="pointer-events-none absolute bottom-full left-1/2 z-20 mb-2 hidden -translate-x-1/2 whitespace-nowrap rounded-md bg-foreground px-2 py-1 text-xs font-medium normal-case text-background shadow-md group-hover:block group-focus-within:block"
            >
              {color.name} ({color.value})
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
