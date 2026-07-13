import { useMemo, useState } from "react";
import { Search } from "lucide-react";
import { TARJETA_ICONOS, type TarjetaIcono } from "@/api/tarjetas";
import { Input } from "@/components/ui/input";
import { TARJETA_ICON_COMPONENTS } from "@/lib/tarjeta-iconos";
import { cn } from "@/lib/utils";

export function TarjetaIconSelector({ value, onChange }: { value: TarjetaIcono; onChange: (value: TarjetaIcono) => void; }) {
  const [search, setSearch] = useState("");
  const options = useMemo(() => TARJETA_ICONOS.filter((name) => name.toLowerCase().includes(search.trim().toLowerCase())), [search]);
  return <div className="space-y-2"><div className="relative"><Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground"/><Input className="pl-9" value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Buscar icono..."/></div><div className="grid max-h-52 grid-cols-3 gap-2 overflow-y-auto rounded border p-2 sm:grid-cols-4">{options.map((name) => { const Icon = TARJETA_ICON_COMPONENTS[name]; return <button key={name} type="button" onClick={() => onChange(name)} className={cn("flex min-w-0 flex-col items-center gap-1 rounded-md border p-2 text-xs hover:bg-muted", value === name && "border-primary bg-primary/10 text-primary ring-1 ring-primary")}><Icon className="h-6 w-6"/><span className="w-full truncate">{name}</span></button>; })}</div></div>;
}
