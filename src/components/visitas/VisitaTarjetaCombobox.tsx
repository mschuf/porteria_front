import { ChevronDown, Loader2, Search } from "lucide-react";
import {
  forwardRef,
  type KeyboardEvent,
  useEffect,
  useId,
  useImperativeHandle,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import {
  searchVisitaTarjetaCandidates,
  type VisitaTarjetaCandidate,
} from "@/api/visitas";
import { Input } from "@/components/ui/input";
import { useDebouncedValue } from "@/hooks/useDebouncedValue";
import { cn } from "@/lib/utils";

export interface VisitaTarjetaComboboxHandle {
  focusAndOpen: () => void;
}

interface VisitaTarjetaComboboxProps {
  id?: string;
  value: string;
  visitaSedeId?: number;
  excludeVisitaId?: number;
  onChange: (candidate: VisitaTarjetaCandidate | null) => void;
  disabled?: boolean;
  invalid?: boolean;
}

const BLOCK_LABEL = {
  in_use: "En uso",
  different_sede: "Otra sede",
  inactive: "Inactiva",
} as const;

/** Combobox remoto de tarjetas, con opciones ocupadas visibles pero no seleccionables. */
export const VisitaTarjetaCombobox = forwardRef<
  VisitaTarjetaComboboxHandle,
  VisitaTarjetaComboboxProps
>(function VisitaTarjetaCombobox(
  { id, value, visitaSedeId, excludeVisitaId, onChange, disabled, invalid },
  ref,
) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState(value);
  const [items, setItems] = useState<VisitaTarjetaCandidate[]>([]);
  const [loading, setLoading] = useState(false);
  const [highlightedIndex, setHighlightedIndex] = useState(-1);
  const [position, setPosition] = useState<{ left: number; width: number; top?: number; bottom?: number } | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const listboxId = useId();
  const debouncedQuery = useDebouncedValue(query, 300);

  const selectableIndexes = useMemo(
    () => items.flatMap((item, index) => (item.selectable && visitaSedeId ? [index] : [])),
    [items, visitaSedeId],
  );

  useImperativeHandle(ref, () => ({
    focusAndOpen: () => {
      if (!disabled) {
        setOpen(true);
        inputRef.current?.focus();
      }
    },
  }), [disabled]);

  useEffect(() => {
    if (!open || value) setQuery(value);
  }, [open, value]);

  useEffect(() => {
    if (!open) return;
    const controller = new AbortController();
    setLoading(true);
    searchVisitaTarjetaCandidates(
      {
        search: debouncedQuery.trim() || undefined,
        visitaSedeId,
        excludeVisitaId,
        limit: 50,
      },
      { signal: controller.signal },
    )
      .then((nextItems) => {
        if (controller.signal.aborted) return;
        setItems(nextItems);
        const firstSelectable = nextItems.findIndex((item) => item.selectable && visitaSedeId);
        setHighlightedIndex(firstSelectable);
      })
      .catch(() => {
        if (!controller.signal.aborted) setItems([]);
      })
      .finally(() => {
        if (!controller.signal.aborted) setLoading(false);
      });
    return () => controller.abort();
  }, [debouncedQuery, excludeVisitaId, open, visitaSedeId]);

  useLayoutEffect(() => {
    if (!open) {
      setPosition(null);
      return;
    }
    const updatePosition = () => {
      const rect = containerRef.current?.getBoundingClientRect();
      if (!rect) return;
      const spaceBelow = window.innerHeight - rect.bottom;
      const spaceAbove = rect.top;
      setPosition({
        left: rect.left,
        width: rect.width,
        ...(spaceBelow < 280 && spaceAbove > spaceBelow
          ? { bottom: window.innerHeight - rect.top + 4 }
          : { top: rect.bottom + 4 }),
      });
    };
    updatePosition();
    window.addEventListener("resize", updatePosition);
    window.addEventListener("scroll", updatePosition, true);
    return () => {
      window.removeEventListener("resize", updatePosition);
      window.removeEventListener("scroll", updatePosition, true);
    };
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const close = (event: MouseEvent) => {
      if (!containerRef.current?.contains(event.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", close);
    return () => document.removeEventListener("mousedown", close);
  }, [open]);

  const choose = (item: VisitaTarjetaCandidate) => {
    if (!item.selectable || !visitaSedeId) return;
    onChange(item);
    setQuery(String(item.numero));
    setOpen(false);
  };

  const moveHighlight = (direction: 1 | -1) => {
    if (!selectableIndexes.length) return;
    const currentPosition = selectableIndexes.indexOf(highlightedIndex);
    const nextPosition = currentPosition < 0
      ? direction === 1 ? 0 : selectableIndexes.length - 1
      : Math.max(0, Math.min(selectableIndexes.length - 1, currentPosition + direction));
    setHighlightedIndex(selectableIndexes[nextPosition]!);
  };

  const handleKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "ArrowDown" || event.key === "ArrowUp") {
      event.preventDefault();
      if (!open) setOpen(true);
      else moveHighlight(event.key === "ArrowDown" ? 1 : -1);
    } else if (event.key === "Enter" && open && highlightedIndex >= 0) {
      event.preventDefault();
      const item = items[highlightedIndex];
      if (item) choose(item);
    } else if (event.key === "Escape") {
      setOpen(false);
    }
  };

  return (
    <div ref={containerRef} className="relative w-full">
      <Search className="pointer-events-none absolute left-3 top-3 h-4 w-4 text-muted-foreground" aria-hidden="true" />
      <Input
        ref={inputRef}
        id={id}
        role="combobox"
        aria-expanded={open}
        aria-controls={listboxId}
        aria-autocomplete="list"
        autoComplete="off"
        value={query}
        placeholder={visitaSedeId ? "Buscar número de tarjeta…" : "Seleccione una sede primero"}
        disabled={disabled || !visitaSedeId}
        className={cn(
          "pl-9 pr-9",
          invalid && "border-destructive focus-visible:ring-destructive",
        )}
        onFocus={() => setOpen(true)}
        onClick={() => setOpen(true)}
        onKeyDown={handleKeyDown}
        onChange={(event) => {
          setQuery(event.target.value);
          if (value) onChange(null);
          setOpen(true);
        }}
      />
      <ChevronDown
        className={cn(
          "pointer-events-none absolute right-3 top-3 h-4 w-4 text-muted-foreground transition-transform",
          open && "rotate-180",
        )}
        aria-hidden="true"
      />

      {open && position ? (
        <div
          className="fixed z-[70] max-h-64 overflow-y-auto rounded-md border bg-card p-1 shadow-md"
          style={position}
        >
          <ul id={listboxId} role="listbox" aria-label="Tarjetas">
            {loading && items.length === 0 ? (
              <li className="flex items-center gap-2 px-3 py-2 text-sm text-muted-foreground">
                <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" /> Buscando…
              </li>
            ) : null}
            {!loading && items.length === 0 ? (
              <li className="px-3 py-2 text-sm text-muted-foreground">Sin tarjetas coincidentes</li>
            ) : null}
            {items.map((item, index) => {
              const blocked = !item.selectable || !visitaSedeId;
              return (
                <li key={item.id} role="presentation">
                  <button
                    type="button"
                    role="option"
                    aria-selected={String(item.numero) === value && item.sedeId === visitaSedeId}
                    aria-disabled={blocked}
                    disabled={blocked}
                    className={cn(
                      "flex w-full items-center justify-between gap-3 rounded-sm px-3 py-2 text-left text-sm",
                      !blocked && "hover:bg-accent hover:text-accent-foreground",
                      index === highlightedIndex && !blocked && "bg-accent text-accent-foreground",
                      blocked && "cursor-not-allowed text-muted-foreground opacity-70",
                      item.enUso && "line-through",
                    )}
                    onMouseEnter={() => { if (!blocked) setHighlightedIndex(index); }}
                    onClick={() => choose(item)}
                  >
                    <span className="min-w-0 truncate font-medium">Nº {item.numero}</span>
                    <span className="flex shrink-0 items-center gap-2 text-xs">
                      <span>{item.sedeNombre}</span>
                      {item.blockedReason ? <span>{BLOCK_LABEL[item.blockedReason]}</span> : null}
                    </span>
                  </button>
                </li>
              );
            })}
          </ul>
        </div>
      ) : null}
    </div>
  );
});
