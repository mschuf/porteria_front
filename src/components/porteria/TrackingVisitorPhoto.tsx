/**
 * @file TrackingVisitorPhoto.tsx
 * @description Foto del visitante para cards de seguimiento e historial en Portería.
 */
import { UserRound } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { obtenerFotoPersonaBlob } from "@/api/personas";
import { obtenerFotoVisitaBlob } from "@/api/visitas";
import { cn } from "@/lib/utils";

interface TrackingVisitorPhotoProps {
  visitaId: number;
  personaId: number;
  hasVisitaFoto: boolean;
  hasPersonaFoto: boolean;
  name: string;
  className?: string;
  previewMaxSizePx?: number;
  centerPreviewOnCard?: boolean;
}

const PREVIEW_MAX_SIZE_PX = 320;

/**
 * Muestra la foto de la visita o, en su defecto, la de la persona.
 * Al pasar el mouse sobre una foto cargada, muestra un preview ampliado flotante.
 */
export function TrackingVisitorPhoto({
  visitaId,
  personaId,
  hasVisitaFoto,
  hasPersonaFoto,
  name,
  className,
  previewMaxSizePx = PREVIEW_MAX_SIZE_PX,
  centerPreviewOnCard = false,
}: TrackingVisitorPhotoProps) {
  const anchorRef = useRef<HTMLDivElement>(null);
  const [photoUrl, setPhotoUrl] = useState<string | null>(null);
  const [previewOpen, setPreviewOpen] = useState(false);
  const [previewCenter, setPreviewCenter] = useState({ top: 0, left: 0 });

  const hasPhoto = hasVisitaFoto || hasPersonaFoto;

  useEffect(() => {
    if (!hasPhoto) {
      setPhotoUrl(null);
      return;
    }

    let cancelled = false;
    let objectUrl: string | null = null;

    const loadPhoto = hasVisitaFoto
      ? obtenerFotoVisitaBlob(visitaId)
      : obtenerFotoPersonaBlob(personaId);

    void loadPhoto
      .then((blob) => {
        if (cancelled) return;
        objectUrl = URL.createObjectURL(blob);
        setPhotoUrl(objectUrl);
      })
      .catch(() => {
        if (!cancelled) setPhotoUrl(null);
      });

    return () => {
      cancelled = true;
      if (objectUrl) URL.revokeObjectURL(objectUrl);
    };
  }, [hasPersonaFoto, hasPhoto, hasVisitaFoto, personaId, visitaId]);

  const updatePreviewCenter = useCallback(() => {
    const card = centerPreviewOnCard
      ? anchorRef.current?.closest<HTMLElement>("[data-tracking-visitor-card]")
      : null;

    if (card) {
      const rect = card.getBoundingClientRect();
      setPreviewCenter({
        top: rect.top + rect.height / 2,
        left: rect.left + rect.width / 2,
      });
      return;
    }

    setPreviewCenter({
      top: window.innerHeight / 2,
      left: window.innerWidth / 2,
    });
  }, [centerPreviewOnCard]);

  const openPreview = useCallback(() => {
    if (!photoUrl) return;
    updatePreviewCenter();
    setPreviewOpen(true);
  }, [photoUrl, updatePreviewCenter]);

  useEffect(() => {
    if (!previewOpen) return;

    window.addEventListener("scroll", updatePreviewCenter, true);
    window.addEventListener("resize", updatePreviewCenter);

    return () => {
      window.removeEventListener("scroll", updatePreviewCenter, true);
      window.removeEventListener("resize", updatePreviewCenter);
    };
  }, [previewOpen, updatePreviewCenter]);

  return (
    <>
      <div
        ref={anchorRef}
        onMouseEnter={openPreview}
        onMouseLeave={() => setPreviewOpen(false)}
        onFocus={openPreview}
        onBlur={() => setPreviewOpen(false)}
        tabIndex={photoUrl ? 0 : undefined}
        aria-label={photoUrl ? `Ver foto ampliada de ${name}` : undefined}
        className={cn(
          "overflow-hidden rounded-lg border border-black/10 bg-background/60 ring-1 ring-black/5 dark:border-white/10 dark:bg-background/30 dark:ring-white/10",
          photoUrl && "cursor-zoom-in focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
          className,
        )}
      >
        {photoUrl ? (
          <img src={photoUrl} alt={`Foto de ${name}`} className="h-full w-full object-cover" />
        ) : (
          <div className="flex h-full w-full items-center justify-center bg-muted/30">
            <UserRound className="h-9 w-9 text-muted-foreground/45" aria-hidden="true" />
          </div>
        )}
      </div>

      {previewOpen && photoUrl
        ? createPortal(
            <div className="pointer-events-none fixed inset-0 z-[200] bg-black/25">
              <img
                src={photoUrl}
                alt={`Foto ampliada de ${name}`}
                className="fixed -translate-x-1/2 -translate-y-1/2 rounded-xl border border-white/20 object-contain shadow-2xl"
                style={{
                  top: previewCenter.top,
                  left: previewCenter.left,
                  maxHeight: `min(75vh, ${previewMaxSizePx}px)`,
                  maxWidth: `min(75vw, ${previewMaxSizePx}px)`,
                }}
              />
            </div>,
            document.body,
          )
        : null}
    </>
  );
}
