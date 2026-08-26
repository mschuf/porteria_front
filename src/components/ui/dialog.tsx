/**
 * @file dialog.tsx
 * @description Modal accesible con bloqueo de scroll del body y soporte para contenido desbordante.
 */
import { X } from "lucide-react";
import {
  useEffect,
  useId,
  useRef,
  useState,
  type PointerEvent as ReactPointerEvent,
  type ReactNode,
} from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

let scrollLockCount = 0;
let previousBodyOverflow = "";

/**
 * Bloquea el scroll del documento mientras hay al menos un diálogo abierto.
 */
function lockBodyScroll(): void {
  if (scrollLockCount === 0) {
    previousBodyOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
  }
  scrollLockCount += 1;
}

/**
 * Libera el bloqueo de scroll si no quedan diálogos abiertos.
 */
function unlockBodyScroll(): void {
  scrollLockCount = Math.max(0, scrollLockCount - 1);
  if (scrollLockCount === 0) {
    document.body.style.overflow = previousBodyOverflow;
  }
}

/** Props del componente Dialog. */
interface DialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description?: string;
  children: ReactNode;
  className?: string;
  headerClassName?: string;
  titleClassName?: string;
  descriptionClassName?: string;
  contentClassName?: string;
  closeButtonClassName?: string;
  /** Evita recortar menús desplegables (p. ej. SearchableSelect) dentro del modal. */
  allowOverflow?: boolean;
  /** Permite mover el diálogo arrastrando su encabezado. */
  draggable?: boolean;
}

interface DialogDragState {
  pointerId: number;
  pointerX: number;
  pointerY: number;
  offsetX: number;
  offsetY: number;
  baseLeft: number;
  baseTop: number;
  width: number;
  height: number;
}

/**
 * Modal centrado con overlay, cierre por Escape o clic fuera y etiquetas ARIA.
 * @param props - Configuración de apertura, contenido y estilos del diálogo.
 */
export function Dialog({
  open,
  onOpenChange,
  title,
  description,
  children,
  className,
  headerClassName,
  titleClassName,
  descriptionClassName,
  contentClassName,
  closeButtonClassName,
  allowOverflow = false,
  draggable = false,
}: DialogProps) {
  const titleId = useId();
  const descriptionId = useId();
  const dialogRef = useRef<HTMLDivElement>(null);
  const dragStateRef = useRef<DialogDragState | null>(null);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });

  useEffect(() => {
    setDragOffset({ x: 0, y: 0 });
    dragStateRef.current = null;
  }, [open]);

  useEffect(() => {
    if (!open) return;

    lockBodyScroll();

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onOpenChange(false);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => {
      unlockBodyScroll();
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [onOpenChange, open]);

  const handleDragStart = (event: ReactPointerEvent<HTMLDivElement>) => {
    if (!draggable || event.button !== 0) return;
    const target = event.target as HTMLElement;
    if (target.closest("button, input, select, textarea, a")) return;

    const rect = dialogRef.current?.getBoundingClientRect();
    if (!rect) return;

    dragStateRef.current = {
      pointerId: event.pointerId,
      pointerX: event.clientX,
      pointerY: event.clientY,
      offsetX: dragOffset.x,
      offsetY: dragOffset.y,
      baseLeft: rect.left - dragOffset.x,
      baseTop: rect.top - dragOffset.y,
      width: rect.width,
      height: rect.height,
    };
    event.currentTarget.setPointerCapture(event.pointerId);
    event.preventDefault();
  };

  const handleDragMove = (event: ReactPointerEvent<HTMLDivElement>) => {
    const drag = dragStateRef.current;
    if (!drag || drag.pointerId !== event.pointerId) return;

    const desiredX = drag.offsetX + event.clientX - drag.pointerX;
    const desiredY = drag.offsetY + event.clientY - drag.pointerY;
    const viewportMargin = 8;
    const minX = viewportMargin - drag.baseLeft;
    const maxX = window.innerWidth - viewportMargin - drag.baseLeft - drag.width;
    const minY = viewportMargin - drag.baseTop;
    const maxY = window.innerHeight - viewportMargin - drag.baseTop - drag.height;

    setDragOffset({
      x: Math.min(Math.max(desiredX, minX), maxX),
      y: Math.min(Math.max(desiredY, minY), maxY),
    });
  };

  const handleDragEnd = (event: ReactPointerEvent<HTMLDivElement>) => {
    if (dragStateRef.current?.pointerId !== event.pointerId) return;
    dragStateRef.current = null;
    if (event.currentTarget.hasPointerCapture(event.pointerId)) {
      event.currentTarget.releasePointerCapture(event.pointerId);
    }
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <button
        type="button"
        className="absolute inset-0 bg-black/50"
        aria-label="Cerrar"
        onClick={() => onOpenChange(false)}
      />
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        aria-describedby={description ? descriptionId : undefined}
        style={draggable
          ? { transform: `translate3d(${dragOffset.x}px, ${dragOffset.y}px, 0)` }
          : undefined}
        className={cn(
          "relative z-10 flex max-h-[min(90vh,720px)] w-full max-w-2xl flex-col rounded-md border bg-card shadow-soft",
          allowOverflow ? "overflow-visible" : "overflow-hidden",
          className
        )}
      >
        <div
          className={cn(
            "flex items-center justify-between gap-3 border-b px-4 py-3 sm:px-5",
            draggable && "touch-none select-none cursor-move",
            headerClassName,
          )}
          onPointerDown={handleDragStart}
          onPointerMove={handleDragMove}
          onPointerUp={handleDragEnd}
          onPointerCancel={handleDragEnd}
        >
          <div className="min-w-0 space-y-1">
            <h2 id={titleId} className={cn("text-lg font-semibold leading-tight", titleClassName)}>
              {title}
            </h2>
            {description ? (
              <p id={descriptionId} className={cn("text-sm text-muted-foreground", descriptionClassName)}>
                {description}
              </p>
            ) : null}
          </div>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className={cn("shrink-0", draggable && "cursor-pointer", closeButtonClassName)}
            aria-label="Cerrar"
            onClick={() => onOpenChange(false)}
          >
            <X className="h-4 w-4" aria-hidden="true" />
          </Button>
        </div>
        <div
          className={cn(
            "px-4 py-4 sm:px-5",
            allowOverflow ? "overflow-visible" : "min-h-0 flex-1 overflow-y-auto",
            contentClassName
          )}
        >
          {children}
        </div>
      </div>
    </div>
  );
}
