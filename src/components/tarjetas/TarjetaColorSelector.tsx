import { Input } from "@/components/ui/input";

const PALETTE = ["#EF4444", "#F97316", "#F59E0B", "#EAB308", "#22C55E", "#10B981", "#06B6D4", "#3B82F6", "#6366F1", "#8B5CF6", "#A855F7", "#EC4899", "#64748B", "#111827"];

export function TarjetaColorSelector({ value, onChange }: { value: string; onChange: (value: string) => void; }) {
  return <div className="space-y-3"><div className="flex gap-2"><input type="color" className="h-10 w-14 cursor-pointer rounded border bg-background p-1" value={/^#[0-9A-Fa-f]{6}$/.test(value) ? value : "#3B82F6"} onChange={(e) => onChange(e.target.value.toUpperCase())}/><Input value={value} maxLength={7} placeholder="#3B82F6" onChange={(e) => onChange(e.target.value.toUpperCase())}/></div><div className="flex flex-wrap gap-2" aria-label="Paleta de colores HTML">{PALETTE.map((color) => <button key={color} type="button" title={color} aria-label={`Seleccionar ${color}`} onClick={() => onChange(color)} className={`h-8 w-8 rounded-full border-2 ${value === color ? "ring-2 ring-ring ring-offset-2" : "border-white/80"}`} style={{ backgroundColor: color }}/>)}</div></div>;
}
