/**
 * @file SessionBadges.tsx
 * @description Badges de contexto de la sesión (empresa, sede, empresa de seguridad, nombre).
 */
import { Badge } from "@/components/ui/badge";
import type { AuthUser } from "@/types/porteria";

interface SessionBadgesProps {
  user: AuthUser;
}

interface SessionBadgeProps {
  label: string;
  value: string;
  variant: "info" | "success" | "warning" | "accent";
}

/** Badge compacto para identificar el contexto de la sesión. */
function SessionBadge({ label, value, variant }: SessionBadgeProps) {
  return (
    <Badge variant={variant} className="min-w-0 max-w-56 gap-1" title={`${label}: ${value}`}>
      <span className="font-semibold">{label}:</span>
      <span className="truncate">{value}</span>
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

  return (
    <div className="flex min-w-0 max-w-full flex-wrap items-center gap-1.5" aria-label="Datos del usuario logueado">
      {user.empresaName ? (
        <SessionBadge label="Empresa" value={user.empresaName} variant="info" />
      ) : isSuperAdmin ? (
        <SessionBadge label="Empresa" value="Todas" variant="info" />
      ) : null}
      {user.sedeName ? (
        <SessionBadge label="Sede" value={user.sedeName} variant="success" />
      ) : isSuperAdmin ? (
        <SessionBadge label="Sede" value="Todas" variant="success" />
      ) : null}
      {user.empresaPorteriaName ? (
        <SessionBadge label="Empresa seguridad" value={user.empresaPorteriaName} variant="warning" />
      ) : isSuperAdmin ? (
        <SessionBadge label="Empresa seguridad" value="Todas" variant="warning" />
      ) : null}
      <SessionBadge label="Nombre" value={user.name} variant="accent" />
    </div>
  );
}
