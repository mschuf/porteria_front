/**
 * @file VisitaWebcamCapture.tsx
 * @description Vista previa y actualización confirmable de la foto de ingreso.
 */
import { Camera, UserRound } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { obtenerFotoPersonaBlob } from "@/api/personas";
import { WebcamCapture } from "@/components/porteria/WebcamCapture";
import { Button } from "@/components/ui/button";
import { Dialog } from "@/components/ui/dialog";
import { Field } from "@/components/ui/field";

interface VisitaPhotoPersona {
  id: number;
  nombre: string;
  hasFoto: boolean;
}

interface VisitaWebcamCaptureProps {
  persona: VisitaPhotoPersona | null;
  photoFile: File | null;
  onCapture: (file: File | null) => void;
  disabled?: boolean;
}

/**
 * Campo compacto de foto para una visita nueva. La captura se confirma en un
 * modal independiente antes de reemplazar la vista previa del formulario.
 */
export function VisitaWebcamCapture({
  persona,
  photoFile,
  onCapture,
  disabled = false,
}: VisitaWebcamCaptureProps) {
  const [existingPhotoUrl, setExistingPhotoUrl] = useState<string | null>(null);
  const [capturedPhotoUrl, setCapturedPhotoUrl] = useState<string | null>(null);
  const [loadingExistingPhoto, setLoadingExistingPhoto] = useState(false);
  const [cameraModalOpen, setCameraModalOpen] = useState(false);
  const [pendingPhoto, setPendingPhoto] = useState<File | null>(null);
  const [largePreviewOpen, setLargePreviewOpen] = useState(false);

  useEffect(() => {
    if (!persona?.hasFoto) {
      setExistingPhotoUrl(null);
      setLoadingExistingPhoto(false);
      return;
    }

    const controller = new AbortController();
    let objectUrl: string | null = null;
    setExistingPhotoUrl(null);
    setLoadingExistingPhoto(true);

    void obtenerFotoPersonaBlob(persona.id, { signal: controller.signal })
      .then((blob) => {
        if (controller.signal.aborted) return;
        objectUrl = URL.createObjectURL(blob);
        setExistingPhotoUrl(objectUrl);
      })
      .catch(() => {
        if (!controller.signal.aborted) setExistingPhotoUrl(null);
      })
      .finally(() => {
        if (!controller.signal.aborted) setLoadingExistingPhoto(false);
      });

    return () => {
      controller.abort();
      if (objectUrl) URL.revokeObjectURL(objectUrl);
    };
  }, [persona?.hasFoto, persona?.id]);

  useEffect(() => {
    if (!photoFile) {
      setCapturedPhotoUrl(null);
      return;
    }

    const objectUrl = URL.createObjectURL(photoFile);
    setCapturedPhotoUrl(objectUrl);
    return () => URL.revokeObjectURL(objectUrl);
  }, [photoFile]);

  const previewUrl = capturedPhotoUrl ?? existingPhotoUrl;

  useEffect(() => {
    if (!previewUrl) setLargePreviewOpen(false);
  }, [previewUrl]);

  const handleCameraModalChange = useCallback((open: boolean) => {
    setCameraModalOpen(open);
    if (!open) setPendingPhoto(null);
  }, []);

  const openCameraModal = useCallback(() => {
    setPendingPhoto(null);
    setCameraModalOpen(true);
  }, []);

  const acceptPhoto = useCallback(() => {
    if (!pendingPhoto) return;
    onCapture(pendingPhoto);
    setCameraModalOpen(false);
    setPendingPhoto(null);
  }, [onCapture, pendingPhoto]);

  return (
    <>
      <Field id="visita-foto-captura" label="Foto de ingreso (opcional)">
        <div className="flex flex-wrap items-center gap-3">
          <div
            className="flex h-24 w-32 shrink-0 items-center justify-center overflow-hidden rounded-md border bg-muted/30"
            onMouseEnter={() => previewUrl && setLargePreviewOpen(true)}
            onMouseLeave={() => setLargePreviewOpen(false)}
            onFocus={() => previewUrl && setLargePreviewOpen(true)}
            onBlur={() => setLargePreviewOpen(false)}
            tabIndex={previewUrl ? 0 : undefined}
            aria-label={previewUrl ? `Ampliar foto de ${persona?.nombre ?? "la persona"}` : undefined}
          >
            {previewUrl ? (
              <img
                src={previewUrl}
                alt={`Foto de ${persona?.nombre ?? "la persona seleccionada"}`}
                className="h-full w-full cursor-zoom-in object-cover"
              />
            ) : loadingExistingPhoto ? (
              <span className="px-2 text-center text-xs text-muted-foreground">Cargando foto…</span>
            ) : (
              <UserRound className="h-9 w-9 text-muted-foreground/50" aria-hidden="true" />
            )}
          </div>

          <div className="space-y-1.5">
            <Button
              id="visita-foto-captura"
              type="button"
              variant="outline"
              size="sm"
              disabled={disabled || !persona}
              onClick={openCameraModal}
            >
              <Camera className="h-4 w-4" aria-hidden="true" />
              Actualizar foto
            </Button>
            <p className="text-xs text-muted-foreground">
              {persona
                ? previewUrl
                  ? "Pasá el cursor sobre la foto para ampliarla."
                  : "La persona seleccionada todavía no tiene foto."
                : "Seleccione una persona para actualizar su foto."}
            </p>
          </div>
        </div>
      </Field>

      {largePreviewOpen && previewUrl
        ? createPortal(
            <div className="pointer-events-none fixed inset-0 z-[200] flex items-center justify-center bg-black/25 p-6">
              <img
                src={previewUrl}
                alt={`Vista ampliada de ${persona?.nombre ?? "la persona seleccionada"}`}
                className="max-h-[75vh] max-w-[75vw] rounded-xl border border-white/20 object-contain shadow-2xl"
              />
            </div>,
            document.body,
          )
        : null}

      {createPortal(
        <Dialog
          open={cameraModalOpen}
          onOpenChange={handleCameraModalChange}
          title="Actualizar foto de ingreso"
          description="Capturá una foto y confirmala antes de volver a la nueva visita."
          className="max-w-3xl"
        >
          <div className="space-y-4">
            <WebcamCapture
              onCapture={setPendingPhoto}
              disabled={disabled}
              fileNamePrefix="visita"
            />

            <div className="flex justify-end gap-2 border-t pt-4">
              <Button
                type="button"
                variant="outline"
                disabled={disabled}
                onClick={() => handleCameraModalChange(false)}
              >
                Cancelar
              </Button>
              <Button type="button" disabled={disabled || !pendingPhoto} onClick={acceptPhoto}>
                Aceptar
              </Button>
            </div>
          </div>
        </Dialog>,
        document.body,
      )}
    </>
  );
}
