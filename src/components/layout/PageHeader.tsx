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
    <div className="flex flex-col gap-4 lg:grid lg:grid-cols-[minmax(16rem,1fr)_minmax(0,2fr)_auto] lg:items-start">
      <div className="min-w-0">
        {eyebrow ? <p className="text-xs text-muted-foreground">{eyebrow}</p> : null}
        <h1 className="text-lg font-semibold">{title}</h1>
        {description ? <p className="mt-1 text-sm text-muted-foreground">{description}</p> : null}
      </div>

      <div className="min-w-0 lg:pt-0.5">{user ? <SessionBadges user={user} /> : null}</div>

      {actions ? (
        <div className="flex w-full flex-wrap items-center lg:w-auto lg:justify-end">{actions}</div>
      ) : null}
    </div>
  );
}
