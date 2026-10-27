/**
 * @file file-type-icons.tsx
 * @description Iconos de archivo PDF y Excel reutilizados por las descargas.
 */

/** @param className - Clases Tailwind aplicadas al SVG. @returns Icono de archivo PDF. */
export function PdfFileIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden="true">
      <path
        fill="#DC2626"
        d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8l-6-6z"
      />
      <path fill="#fff" fillOpacity="0.9" d="M14 2v6h6" />
      <text
        x="12"
        y="16.5"
        fill="#fff"
        fontSize="5.5"
        fontWeight="700"
        textAnchor="middle"
        fontFamily="system-ui, sans-serif"
      >
        PDF
      </text>
    </svg>
  );
}

/** @param className - Clases Tailwind aplicadas al SVG. @returns Icono de archivo Excel. */
export function ExcelFileIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden="true">
      <path
        fill="#16A34A"
        d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8l-6-6z"
      />
      <path fill="#fff" fillOpacity="0.9" d="M14 2v6h6" />
      <text
        x="12"
        y="16.5"
        fill="#fff"
        fontSize="5.5"
        fontWeight="700"
        textAnchor="middle"
        fontFamily="system-ui, sans-serif"
      >
        XLS
      </text>
    </svg>
  );
}
