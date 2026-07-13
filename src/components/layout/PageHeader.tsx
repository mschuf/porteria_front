/**
 * @file PageHeader.tsx
 * @description Encabezado estandar de pagina: eyebrow, titulo, descripcion y badges de sesion.
 */
import type { ReactNode } from "react";
import { SessionBadges } from "@/components/layout/SessionBadges";
import { useAuth } from "@/context/AuthContext";

interface PageHeaderProps {
  eyebrow?: string;
  title: ReactNode;
  description?: string;
  actions?: ReactNode;
}

/**
 * Renderiza el titulo de la pagina junto a los badges de sesion del usuario.
 * @param props - Eyebrow, titulo, descripcion y acciones opcionales (tabs, refresh, etc).
 * @returns Fila de encabezado con titulo a la izquierda y badges/acciones a la derecha.
 */
export function PageHeader({ eyebrow, title, description, actions }: PageHeaderProps) {
  const { user } = useAuth();

  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
      <div>
        {eyebrow ? <p className="text-xs text-muted-foreground">{eyebrow}</p> : null}
        <h1 className="text-lg font-semibold">{title}</h1>
        {description ? <p className="mt-1 text-sm text-muted-foreground">{description}</p> : null}
      </div>

      <div className="flex w-full flex-wrap items-center gap-2 sm:w-auto sm:flex-nowrap sm:justify-end">
        {user ? <SessionBadges user={user} /> : null}
        {actions}
      </div>
    </div>
  );
}
