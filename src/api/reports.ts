/**
 * @file reports.ts
 * @description Cliente HTTP de reportes superadmin.
 */
import { apiClient } from "./apiClient";
import type {
  PorteriaReportLog,
  PorteriaReportSortColumn,
  PorteriaReportSortOrder,
} from "@/types/pages/porteria-report.types";
import type {
  PorteriaAuditAction,
  PorteriaAuditLog,
  PorteriaAuditSortColumn,
  PorteriaAuditSortOrder,
} from "@/types/pages/porteria-audit-report.types";
import type { VisitaEstado } from "@/api/visitas";

export type PorteriaReportExportFormat = "pdf" | "xlsx";

export interface ExportVisitasReportQuery {
  format: PorteriaReportExportFormat;
  entradaFrom?: string;
  entradaTo?: string;
  estado?: VisitaEstado;
  empresa?: string;
  visitante?: string;
  documento?: string;
  motivo?: string;
  responsable?: string;
  sortBy?: PorteriaReportSortColumn;
  sortOrder?: PorteriaReportSortOrder;
}

export interface ListVisitasReportQuery {
  page?: number;
  limit?: number;
  entradaFrom?: string;
  entradaTo?: string;
  estado?: VisitaEstado;
  empresa?: string;
  visitante?: string;
  documento?: string;
  motivo?: string;
  responsable?: string;
  sortBy?: PorteriaReportSortColumn;
  sortOrder?: PorteriaReportSortOrder;
}

export interface VisitaReportListResponse {
  items: PorteriaReportLog[];
  total: number;
  page: number;
  limit: number;
}

export interface ListPorteriaAuditLogsQuery {
  page?: number;
  limit?: number;
  q?: string;
  action?: PorteriaAuditAction;
  actorUserId?: number;
  visitaId?: number;
  visitante?: string;
  documento?: string;
  occurredFrom?: string;
  occurredTo?: string;
  estadoBefore?: VisitaEstado;
  estadoAfter?: VisitaEstado;
  sortBy?: PorteriaAuditSortColumn;
  sortOrder?: PorteriaAuditSortOrder;
}

export interface PorteriaAuditLogsListResponse {
  items: PorteriaAuditLog[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

type ReadRequestOptions = { signal?: AbortSignal; showBackdrop?: boolean };

/**
 * Lista visitas de portería con filtros y paginación.
 * @param query - Parámetros de consulta del reporte.
 * @param options - Opciones de petición HTTP.
 * @returns Página de visitas y total.
 */
export async function listVisitasReport(
  query: ListVisitasReportQuery = {},
  options?: ReadRequestOptions,
): Promise<VisitaReportListResponse> {
  return apiClient.get<VisitaReportListResponse>("/reports/visitas", {
    ...options,
    showBackdrop: options?.showBackdrop ?? true,
    query: {
      page: query.page ?? 1,
      limit: query.limit ?? 15,
      entradaFrom: query.entradaFrom,
      entradaTo: query.entradaTo,
      estado: query.estado,
      empresa: query.empresa || undefined,
      visitante: query.visitante || undefined,
      documento: query.documento || undefined,
      motivo: query.motivo || undefined,
      responsable: query.responsable || undefined,
      sortBy: query.sortBy,
      sortOrder: query.sortOrder,
    },
  });
}

/**
 * Lista auditoría de portería con paginación, orden y filtros avanzados.
 * @param query - Parámetros de consulta.
 * @param options - Opciones de petición HTTP.
 * @returns Página de auditoría.
 */
export async function listPorteriaAuditLogs(
  query: ListPorteriaAuditLogsQuery = {},
  options?: ReadRequestOptions,
): Promise<PorteriaAuditLogsListResponse> {
  return apiClient.get<PorteriaAuditLogsListResponse>("/reports/porteria-audit", {
    ...options,
    showBackdrop: options?.showBackdrop ?? true,
    query: {
      page: query.page ?? 1,
      limit: query.limit ?? 15,
      q: query.q || undefined,
      action: query.action,
      actorUserId: query.actorUserId,
      visitaId: query.visitaId,
      visitante: query.visitante || undefined,
      documento: query.documento || undefined,
      occurredFrom: query.occurredFrom,
      occurredTo: query.occurredTo,
      estadoBefore: query.estadoBefore,
      estadoAfter: query.estadoAfter,
      sortBy: query.sortBy,
      sortOrder: query.sortOrder,
    },
  });
}

/**
 * Descarga reporte de visitas de portería en PDF o Excel.
 * @param query - Filtros activos y formato de exportación.
 * @param options - Opciones de petición HTTP.
 * @returns Blob y nombre de archivo.
 */
export async function downloadVisitasReport(
  query: ExportVisitasReportQuery,
  options?: ReadRequestOptions,
): Promise<{ blob: Blob; filename: string }> {
  return apiClient.download("/reports/visitas/export", {
    ...options,
    showBackdrop: options?.showBackdrop ?? true,
    query: {
      format: query.format,
      entradaFrom: query.entradaFrom,
      entradaTo: query.entradaTo,
      estado: query.estado,
      empresa: query.empresa || undefined,
      visitante: query.visitante || undefined,
      documento: query.documento || undefined,
      motivo: query.motivo || undefined,
      responsable: query.responsable || undefined,
      sortBy: query.sortBy,
      sortOrder: query.sortOrder,
    },
  });
}

/**
 * Dispara descarga de blob en el navegador.
 * @param blob - Archivo binario.
 * @param filename - Nombre sugerido.
 * @returns void
 */
export function triggerBrowserDownload(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = filename;
  anchor.rel = "noopener";
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
  URL.revokeObjectURL(url);
}
