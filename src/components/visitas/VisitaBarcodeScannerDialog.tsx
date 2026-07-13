/**
 * @file VisitaBarcodeScannerDialog.tsx
 * @description Modal de lectura del código de barras de la tarjeta de visitante.
 * Usa @zxing/browser para decodificar en vivo desde la cámara y devolver el
 * número de tarjeta. La imagen no se persiste.
 */
import { Barcode, Camera, LoaderCircle } from "lucide-react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { BrowserMultiFormatReader, type IScannerControls } from "@zxing/browser";
import { Dialog } from "@/components/ui/dialog";

const CAMERA_LABEL = import.meta.env.VITE_PORTERIA_CAMERA_LABEL?.trim() || "Brio";

interface MediaDeviceOption {
  deviceId: string;
  label: string;
}

interface VisitaBarcodeScannerDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onDetected: (code: string) => void;
}

/** Cierra correctamente todos los tracks activos de la cámara. */
function stopStream(stream: MediaStream | null): void {
  stream?.getTracks().forEach((track) => track.stop());
}

/** Prioriza la cámara Brio (si existe), con fallback a la primera disponible. */
function pickPreferredDeviceId(devices: MediaDeviceOption[]): string {
  if (devices.length === 0) return "";
  const preferred = devices.find((device) =>
    device.label.toLowerCase().includes(CAMERA_LABEL.toLowerCase()),
  );
  return preferred?.deviceId ?? devices[0]?.deviceId ?? "";
}

/**
 * Lee en vivo el código de barras 1D/2D de la tarjeta y devuelve su texto.
 * Auto-detecta formatos comunes (Code128, Code39, EAN, ITF, QR…).
 */
export function VisitaBarcodeScannerDialog({
  open,
  onOpenChange,
  onDetected,
}: VisitaBarcodeScannerDialogProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const controlsRef = useRef<IScannerControls | null>(null);
  const readerRef = useRef<BrowserMultiFormatReader | null>(null);
  const disposedRef = useRef(false);

  const [devices, setDevices] = useState<MediaDeviceOption[]>([]);
  const [selectedDeviceId, setSelectedDeviceId] = useState("");
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [scannerStatus, setScannerStatus] = useState("Preparando cámara…");
  const [loadingCamera, setLoadingCamera] = useState(false);

  const helpMessage = useMemo(() => {
    if (cameraError) return cameraError;
    if (loadingCamera) return "Iniciando cámara…";
    return scannerStatus;
  }, [cameraError, loadingCamera, scannerStatus]);

  /** Detiene el lector zxing y libera el stream de la cámara. */
  const releaseScanner = useCallback(() => {
    controlsRef.current?.stop();
    controlsRef.current = null;
    const video = videoRef.current;
    if (video) {
      stopStream(video.srcObject as MediaStream | null);
      video.pause();
      video.srcObject = null;
    }
  }, []);

  /** Inicia la decodificación continua sobre la cámara seleccionada. */
  const startScanner = useCallback(async () => {
    if (!open || !selectedDeviceId) return;
    if (!navigator.mediaDevices?.getUserMedia) {
      setCameraError("El acceso a la cámara requiere HTTPS o localhost.");
      return;
    }

    setLoadingCamera(true);
    setCameraError(null);
    releaseScanner();

    const reader = readerRef.current ?? new BrowserMultiFormatReader();
    readerRef.current = reader;

    try {
      const video = videoRef.current;
      if (!video) return;
      controlsRef.current = await reader.decodeFromVideoDevice(
        selectedDeviceId,
        video,
        (result) => {
          if (disposedRef.current || !result) return;
          const text = result.getText().trim();
          if (!text) return;
          setScannerStatus("Código detectado.");
          onDetected(text);
          onOpenChange(false);
        },
      );
      setScannerStatus("Cámara lista. Enfocá el código de barras de la tarjeta.");
    } catch {
      setCameraError("No se pudo abrir la cámara seleccionada.");
    } finally {
      setLoadingCamera(false);
    }
  }, [onDetected, onOpenChange, open, releaseScanner, selectedDeviceId]);

  /** Pide permisos, lista cámaras y define la cámara inicial recomendada. */
  const bootstrapDevices = useCallback(async () => {
    if (!navigator.mediaDevices?.enumerateDevices || !navigator.mediaDevices?.getUserMedia) {
      setCameraError("Este navegador no admite acceso a la cámara.");
      return;
    }

    try {
      const bootstrapStream = await navigator.mediaDevices.getUserMedia({ video: true, audio: false });
      stopStream(bootstrapStream);
      const allDevices = await navigator.mediaDevices.enumerateDevices();
      const videoInputs = allDevices
        .filter((device) => device.kind === "videoinput")
        .map((device, index) => ({
          deviceId: device.deviceId,
          label: device.label || `Cámara ${index + 1}`,
        }));
      setDevices(videoInputs);
      setSelectedDeviceId((current) => {
        if (current && videoInputs.some((device) => device.deviceId === current)) return current;
        return pickPreferredDeviceId(videoInputs);
      });
    } catch {
      setCameraError("Permiso de cámara denegado o cámara no disponible.");
    }
  }, []);

  useEffect(() => {
    if (!open) return;
    disposedRef.current = false;
    setCameraError(null);
    setScannerStatus("Preparando cámara…");
    void bootstrapDevices();

    return () => {
      disposedRef.current = true;
      releaseScanner();
    };
  }, [bootstrapDevices, open, releaseScanner]);

  useEffect(() => {
    if (!open || !selectedDeviceId) return;
    void startScanner();
  }, [open, selectedDeviceId, startScanner]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange} title="Escanear tarjeta" className="max-w-3xl">
      <div className="space-y-3">
        {devices.length > 1 ? (
          <label className="flex flex-col gap-1 text-sm">
            <span className="text-muted-foreground">Cámara</span>
            <select
              value={selectedDeviceId}
              onChange={(event) => setSelectedDeviceId(event.target.value)}
              disabled={loadingCamera}
              className="h-10 rounded-md border bg-background px-3 text-sm"
            >
              {devices.map((device) => (
                <option key={device.deviceId} value={device.deviceId}>
                  {device.label}
                </option>
              ))}
            </select>
          </label>
        ) : null}

        <div className="relative overflow-hidden rounded-md border bg-muted/30">
          <video
            ref={videoRef}
            autoPlay
            playsInline
            muted
            className="aspect-video h-full w-full object-cover"
          />
          <div className="pointer-events-none absolute inset-x-8 top-1/2 h-[2px] -translate-y-1/2 bg-emerald-500/80" />
          {loadingCamera && (
            <div className="absolute inset-0 flex items-center justify-center bg-background/70 text-sm text-muted-foreground">
              <LoaderCircle className="mr-2 h-4 w-4 animate-spin" />
              Preparando escáner…
            </div>
          )}
        </div>

        <div className="flex items-center gap-2 rounded-md border bg-muted/20 px-3 py-2 text-sm text-muted-foreground">
          {cameraError ? (
            <Camera className="h-4 w-4 shrink-0 text-destructive" aria-hidden="true" />
          ) : (
            <Barcode className="h-4 w-4 shrink-0" aria-hidden="true" />
          )}
          <p>{helpMessage}</p>
        </div>
      </div>
    </Dialog>
  );
}
