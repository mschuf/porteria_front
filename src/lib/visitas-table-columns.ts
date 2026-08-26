/**
 * @file visitas-table-columns.ts
 * @description Definición y persistencia de las columnas visibles del listado de visitas.
 */
import type { VisitaSortColumn } from "@/api/visitas";

export type VisitaTableColumnId =
  | VisitaSortColumn
  | "credencialNumero"
  | "tarjetaColor"
  | "acciones";

export interface VisitaTableColumnDefinition {
  id: VisitaTableColumnId;
  label: string;
  sortColumn?: VisitaSortColumn;
}

export const VISITA_TABLE_COLUMNS: readonly VisitaTableColumnDefinition[] = [
  { id: "id", label: "Visita", sortColumn: "id" },
  { id: "visitante", label: "Visitante", sortColumn: "visitante" },
  { id: "documento", label: "Documento", sortColumn: "documento" },
  { id: "empresa", label: "Empresa", sortColumn: "empresa" },
  { id: "sede", label: "Sede", sortColumn: "sede" },
  { id: "motivo", label: "Motivo", sortColumn: "motivo" },
  { id: "responsable", label: "Responsable", sortColumn: "responsable" },
  { id: "creador", label: "Creado por", sortColumn: "creador" },
  { id: "estado", label: "Estado", sortColumn: "estado" },
  { id: "estadoAprobacion", label: "Aprobación", sortColumn: "estadoAprobacion" },
  { id: "entradaAt", label: "Entrada", sortColumn: "entradaAt" },
  { id: "salidaAt", label: "Salida", sortColumn: "salidaAt" },
  { id: "credencialNumero", label: "Nº tarjeta" },
  { id: "tarjetaColor", label: "Color tarjeta" },
  { id: "acciones", label: "Acciones" },
];

const VALID_COLUMN_IDS = new Set<VisitaTableColumnId>(
  VISITA_TABLE_COLUMNS.map(({ id }) => id),
);
const COOKIE_MAX_AGE_SECONDS = 60 * 60 * 24 * 365;

function preferenceCookieName(userId?: number): string | null {
  return userId ? `porteria_visitas_columnas_${userId}` : null;
}

/** Devuelve todas las columnas como preferencia segura por defecto. */
export function getDefaultVisitaTableColumnIds(): VisitaTableColumnId[] {
  return VISITA_TABLE_COLUMNS.map(({ id }) => id);
}

/** Lee y valida la preferencia de columnas del usuario desde una cookie. */
export function readVisitaTableColumnPreference(userId?: number): VisitaTableColumnId[] {
  const cookieName = preferenceCookieName(userId);
  if (!cookieName || typeof document === "undefined") {
    return getDefaultVisitaTableColumnIds();
  }

  const encodedValue = document.cookie
    .split("; ")
    .find((entry) => entry.startsWith(`${cookieName}=`))
    ?.slice(cookieName.length + 1);

  if (!encodedValue) return getDefaultVisitaTableColumnIds();

  try {
    const parsed: unknown = JSON.parse(decodeURIComponent(encodedValue));
    if (!Array.isArray(parsed)) return getDefaultVisitaTableColumnIds();

    const validIds = Array.from(new Set(
      parsed.filter(
        (value): value is VisitaTableColumnId =>
          typeof value === "string" && VALID_COLUMN_IDS.has(value as VisitaTableColumnId),
      ),
    ));

    return validIds.length ? validIds : getDefaultVisitaTableColumnIds();
  } catch {
    return getDefaultVisitaTableColumnIds();
  }
}

/** Guarda durante un año la preferencia de columnas del usuario. */
export function writeVisitaTableColumnPreference(
  userId: number | undefined,
  columnIds: readonly VisitaTableColumnId[],
): void {
  const cookieName = preferenceCookieName(userId);
  if (!cookieName || typeof document === "undefined") return;

  const validIds = Array.from(new Set(columnIds.filter((id) => VALID_COLUMN_IDS.has(id))));
  if (!validIds.length) return;

  const secure = window.location.protocol === "https:" ? "; Secure" : "";
  document.cookie = `${cookieName}=${encodeURIComponent(JSON.stringify(validIds))}; Max-Age=${COOKIE_MAX_AGE_SECONDS}; Path=/; SameSite=Lax${secure}`;
}
