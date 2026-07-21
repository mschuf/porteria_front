/**
 * @file SessionBadges.tsx
 * @description Badges de contexto de la sesión (empresa, sede, empresa de seguridad, nombre).
 */
import { Badge } from "@/components/ui/badge";
import type { AuthUser } from "@/types/porteria";
import { roleLabel } from "@/utils/role";

interface SessionBadgesProps {
  user: AuthUser;
}

interface SessionBadgeProps {
  label: string;
  value: string;
  variant: "default" | "info" | "success" | "warning" | "accent";
}

/** Badge compacto para identificar el contexto de la sesión. */
function SessionBadge({ label, value, variant }: SessionBadgeProps) {
  return (
    <Badge
      variant={variant}
      className="min-w-0 max-w-full items-start gap-1 whitespace-normal text-left sm:max-w-md"
      title={`${label}: ${value}`}
    >
      <span className="shrink-0 font-semibold">{label}:</span>
      <span className="min-w-0 break-words">{value}</span>
    </Badge>
  );
}

/**
 * Renderiza los badges de sesión del usuario logueado.
 * Para super_admin, que no está atado a una empresa/sede puntual, se muestra "Todas".
 * @param props - Usuario autenticado.
 * @returns Fila de badges de sesión.
 */
export function SessionBadges({ user }: SessionBadgesProps) {
  const isSuperAdmin = user.role === "super_admin";
  const isCompanyAdmin = user.role === "admin_empresa";
  const isPortero = user.role === "portero";
  const administeredCompanyNames = [
    ...new Set(user.sedes.map((sede) => sede.empresaNombre).filter(Boolean)),
  ];
  const administeredSedeNames = user.sedes.map((sede) => sede.nombre).filter(Boolean);
  const companyValue = user.empresaName ?? (isCompanyAdmin ? administeredCompanyNames.join(", ") : "");
  const sedeValue = user.sedeName ?? (isCompanyAdmin ? administeredSedeNames.join(", ") : "");
  const porteroLocationValue = [companyValue, sedeValue].filter(Boolean).join(" · ");

  return (
    <div className="flex min-w-0 max-w-full flex-wrap items-center gap-1.5" aria-label="Datos del usuario logueado">
      {isPortero && porteroLocationValue ? (
        <SessionBadge label="Empresa" value={porteroLocationValue} variant="info" />
      ) : companyValue ? (
        <SessionBadge label="Empresa" value={companyValue} variant="info" />
      ) : isSuperAdmin ? (
        <SessionBadge label="Empresa" value="Todas" variant="info" />
      ) : null}
      {!isPortero && sedeValue ? (
        <SessionBadge label={isCompanyAdmin ? "Sedes" : "Sede"} value={sedeValue} variant="success" />
      ) : isSuperAdmin ? (
        <SessionBadge label="Sede" value="Todas" variant="success" />
      ) : null}
      {!isPortero && user.empresaPorteriaName ? (
        <SessionBadge label="Empresa seguridad" value={user.empresaPorteriaName} variant="warning" />
      ) : isSuperAdmin ? (
        <SessionBadge label="Empresa seguridad" value="Todas" variant="warning" />
      ) : null}
      {!isPortero ? <SessionBadge label="Rol" value={roleLabel(user.role)} variant="default" /> : null}
      <SessionBadge label="Nombre" value={user.name} variant="accent" />
    </div>
  );
}
