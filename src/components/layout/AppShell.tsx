/**
 * @file AppShell.tsx
 * @description Layout principal con header y menú lateral.
 */
import { Link, useLocation, useNavigate } from "react-router-dom";
import {
  ChevronDown,
  History,
  LogOut,
  Menu,
  Moon,
  Shield,
  Sun,
  Users,
  MapPin,
  ClipboardList,
  X,
  Truck,
  ListChecks,
  Building2,
  Building,
  ShieldCheck,
  Link2,
  FolderCog,
  CreditCard,
  LayoutGrid,
} from "lucide-react";
import { useEffect, useState, type ReactNode } from "react";
import { Button } from "@/components/ui/button";
import { InstallAppButton } from "@/components/layout/InstallAppButton";
import { cn } from "@/lib/utils";
import { useAuth } from "@/context/AuthContext";
import { resolvePorteriaTab } from "@/lib/porteria-navigation";
import type { PorteriaTab } from "@/types/pages/porteria-page.types";
import { accessFlagsFromUser, resolveDefaultAuthenticatedPath } from "@/utils/auth-access";
import { roleLabel } from "@/utils/role";

interface AppShellProps {
  children: ReactNode;
  theme: "light" | "dark";
  onToggleTheme: () => void;
}

const superAdminNavItems: Array<{
  label: string;
  icon: typeof MapPin;
  path: string;
  strictSuperAdminOnly?: boolean;
}> = [
  { label: "Empresas", icon: Building2, path: "/admin/empresas", strictSuperAdminOnly: true },
  {
    label: "Empresas de seguridad",
    icon: ShieldCheck,
    path: "/admin/empresa-porteria",
    strictSuperAdminOnly: true,
  },
  { label: "Sedes", icon: Building, path: "/admin/sedes", strictSuperAdminOnly: true },
  { label: "Usuarios", icon: Users, path: "/admin/usuarios" },
  { label: "Areas", icon: LayoutGrid, path: "/admin/areas", strictSuperAdminOnly: true },
  { label: "Tarjetas", icon: CreditCard, path: "/admin/tarjetas" },
];

const auditoriaNavItems: Array<{
  label: string;
  icon: typeof MapPin;
  path: string;
}> = [
  { label: "Reporte portería", icon: MapPin, path: "/admin/reporte-porteria" },
  {
    label: "Auditoría portería",
    icon: ClipboardList,
    path: "/admin/reporte-porteria-auditoria",
  },
];

const asignacionesNavItems: Array<{
  label: string;
  icon: typeof MapPin;
  path: string;
}> = [
  {
    label: "Usuarios por empresa",
    icon: Link2,
    path: "/admin/usuario-empresa",
  },
  {
    label: "Asignaciones sede-seguridad",
    icon: Link2,
    path: "/admin/sede-empresa-seguridad",
  },
  {
    label: "Usuarios por empresa de seguridad",
    icon: Link2,
    path: "/admin/usuario-empresa-seguridad",
  },
];

const porteriaNavItems: Array<{
  label: string;
  icon: typeof Shield;
  path: string;
  tab: PorteriaTab;
}> = [{ label: "Indicadores", icon: Shield, path: "/porteria", tab: "indicadores" }];

const porteriaCrudItems: Array<{
  label: string;
  icon: typeof Users;
  path: string;
}> = [
  { label: "Proveedores", icon: Truck, path: "/porteria/proveedores" },
  { label: "Personas", icon: Users, path: "/porteria/personas" },
  { label: "Motivos de visita", icon: ListChecks, path: "/porteria/motivos-visita" },
  { label: "Visitas", icon: ClipboardList, path: "/porteria/visitas" },
  { label: "Historial", icon: History, path: "/porteria/historial" },
];

interface NavSectionProps {
  title: string;
  expanded: boolean;
  onToggle: () => void;
  showBorder?: boolean;
  children: ReactNode;
}

function NavSection({ title, expanded, onToggle, showBorder = false, children }: NavSectionProps) {
  return (
    <div className={cn("space-y-1", showBorder && "border-t pt-3")}>
      <button
        type="button"
        onClick={onToggle}
        aria-expanded={expanded}
        className="flex w-full items-center justify-between rounded-md px-3 py-2 text-left text-xs font-semibold uppercase tracking-wide text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
      >
        <span>{title}</span>
        <ChevronDown
          className={cn("h-4 w-4 shrink-0 transition-transform duration-200", expanded && "rotate-180")}
          aria-hidden="true"
        />
      </button>
      {expanded ? <div className="space-y-1">{children}</div> : null}
    </div>
  );
}

interface NavItemButtonProps {
  label: string;
  icon: typeof MapPin;
  isActive: boolean;
  onClick: () => void;
}

function NavItemButton({ label, icon: Icon, isActive, onClick }: NavItemButtonProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-current={isActive ? "page" : undefined}
      className={cn(
        "flex w-full items-center gap-3 rounded-md px-3 py-2 text-left text-sm font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground",
        isActive && "bg-muted text-foreground",
      )}
    >
      <Icon className="h-4 w-4" aria-hidden="true" />
      {label}
    </button>
  );
}

interface NavSubSectionProps {
  title: string;
  icon: typeof MapPin;
  expanded: boolean;
  onToggle: () => void;
  children: ReactNode;
}

function NavSubSection({ title, icon: Icon, expanded, onToggle, children }: NavSubSectionProps) {
  return (
    <div className="space-y-1">
      <button
        type="button"
        onClick={onToggle}
        aria-expanded={expanded}
        className="flex w-full items-center gap-3 rounded-md px-3 py-2 text-left text-sm font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
      >
        <Icon className="h-4 w-4 shrink-0" aria-hidden="true" />
        <span className="flex-1">{title}</span>
        <ChevronDown
          className={cn("h-4 w-4 shrink-0 transition-transform duration-200", expanded && "rotate-180")}
          aria-hidden="true"
        />
      </button>
      {expanded ? <div className="ml-4 space-y-1 border-l pl-2">{children}</div> : null}
    </div>
  );
}

export function AppShell({ children, theme, onToggleTheme }: AppShellProps) {
  const [open, setOpen] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);
  const { isAuthenticated, user, role, isSuperAdmin, isPorteriaUser, canApproveVisitas, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const onPorteriaRoute = location.pathname.startsWith("/porteria");
  const onSuperAdminRoute = location.pathname.startsWith("/admin");
  const onAsignacionesRoute = asignacionesNavItems.some((item) =>
    isNavPathActive(location.pathname, item.path),
  );
  const onAuditoriaRoute = auditoriaNavItems.some((item) =>
    isNavPathActive(location.pathname, item.path),
  );
  const homePath = resolveDefaultAuthenticatedPath(accessFlagsFromUser(user));
  const [porteriaExpanded, setPorteriaExpanded] = useState(onPorteriaRoute);
  const [superAdminExpanded, setSuperAdminExpanded] = useState(onSuperAdminRoute);
  const [asignacionesExpanded, setAsignacionesExpanded] = useState(onAsignacionesRoute);
  const [auditoriaExpanded, setAuditoriaExpanded] = useState(onAuditoriaRoute);

  useEffect(() => {
    if (onPorteriaRoute) setPorteriaExpanded(true);
  }, [onPorteriaRoute]);

  useEffect(() => {
    if (onSuperAdminRoute) setSuperAdminExpanded(true);
  }, [onSuperAdminRoute]);

  useEffect(() => {
    if (onAsignacionesRoute) setAsignacionesExpanded(true);
  }, [onAsignacionesRoute]);

  useEffect(() => {
    if (onAuditoriaRoute) setAuditoriaExpanded(true);
  }, [onAuditoriaRoute]);

  function handleLogout() {
    setLoggingOut(true);
    void logout({ showToast: true }).finally(() => {
      setLoggingOut(false);
      setOpen(false);
    });
  }

  function goToPath(path: string) {
    navigate(path);
    setOpen(false);
  }

  type AdminLeaf = { label: string; icon: typeof MapPin; path: string };
  type AdminEntry =
    | ({ kind: "item" } & AdminLeaf)
    | {
        kind: "group";
        label: string;
        icon: typeof MapPin;
        items: AdminLeaf[];
        expanded: boolean;
        onToggle: () => void;
      };

  const adminEntries: AdminEntry[] = [
    ...superAdminNavItems
      .filter((item) => !item.strictSuperAdminOnly || role === "super_admin" || (item.path === "/admin/areas" && role === "admin_empresa"))
      .map((item) => ({
        kind: "item" as const,
        label: item.label,
        icon: item.icon,
        path: item.path,
      })),
    ...(role && role !== "portero"
      ? [
          {
            kind: "group" as const,
            label: "Asignaciones",
            icon: FolderCog,
            items: role === "super_admin"
              ? asignacionesNavItems
              : asignacionesNavItems.filter((item) => item.path === "/admin/usuario-empresa-seguridad"),
            expanded: asignacionesExpanded,
            onToggle: () => setAsignacionesExpanded((current) => !current),
          },
        ]
      : []),
    {
      kind: "group" as const,
      label: "Auditoría",
      icon: ClipboardList,
      items: auditoriaNavItems,
      expanded: auditoriaExpanded,
      onToggle: () => setAuditoriaExpanded((current) => !current),
    },
  ].sort((a, b) => a.label.localeCompare(b.label, "es"));

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-40 border-b bg-card/95 backdrop-blur">
        <div className="container flex min-h-16 items-center justify-between gap-3 py-2">
          <div className="flex min-w-0 flex-1 items-center gap-3">
            <Button
              variant="ghost"
              size="icon"
              type="button"
              aria-label="Abrir menú"
              onClick={() => setOpen(true)}
            >
              <Menu className="h-5 w-5" aria-hidden="true" />
            </Button>
            <div className="flex min-w-0 flex-1 flex-col items-start gap-1.5">
              <Link
                to={homePath}
                className="min-w-0 rounded-sm text-left transition-opacity hover:opacity-80 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                aria-label="Ir a Portería"
              >
                <p className="truncate text-base font-semibold leading-tight">Portería</p>
              </Link>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="icon"
              type="button"
              aria-label="Cambiar tema"
              onClick={onToggleTheme}
              title="Cambiar tema"
            >
              {theme === "dark" ? (
                <Sun className="h-4 w-4" aria-hidden="true" />
              ) : (
                <Moon className="h-4 w-4" aria-hidden="true" />
              )}
            </Button>
          </div>
        </div>
      </header>

      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-50 flex w-72 -translate-x-full flex-col border-r bg-card shadow-soft transition-transform",
          open && "translate-x-0",
        )}
        aria-hidden={!open}
      >
        <div className="flex h-16 items-center justify-between border-b px-4">
          <Link
            to={homePath}
            className="min-w-0 rounded-sm text-left transition-opacity hover:opacity-80 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
            onClick={() => setOpen(false)}
            aria-label="Ir a Portería"
          >
            <p className="truncate font-semibold leading-tight">Portería</p>
          </Link>
          <Button
            variant="ghost"
            size="icon"
            type="button"
            aria-label="Cerrar menú"
            onClick={() => setOpen(false)}
          >
            <X className="h-5 w-5" aria-hidden="true" />
          </Button>
        </div>
        <nav className="flex-1 space-y-1 p-3">
          {canApproveVisitas ? (
            <NavItemButton
              label="Aprobación de visitas"
              icon={ShieldCheck}
              isActive={isNavPathActive(location.pathname, "/aprobacion-visitas")}
              onClick={() => goToPath("/aprobacion-visitas")}
            />
          ) : null}
          {isPorteriaUser ? (
            <NavSection
              title="Portería"
              expanded={porteriaExpanded}
              onToggle={() => setPorteriaExpanded((current) => !current)}
              showBorder
            >
              {(role === "encargado_visita" ? [] : porteriaNavItems).map((item) => {
                const Icon = item.icon;
                const isActive = resolvePorteriaTab(location.pathname) === item.tab;
                return (
                  <button
                    key={item.label}
                    type="button"
                    onClick={() => goToPath(item.path)}
                    aria-current={isActive ? "page" : undefined}
                    className={cn(
                      "flex w-full items-center gap-3 rounded-md px-3 py-2 text-left text-sm font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground",
                      isActive && "bg-muted text-foreground",
                    )}
                  >
                    <Icon className="h-4 w-4" aria-hidden="true" />
                    {item.label}
                  </button>
                );
              })}
              {(role === "encargado_visita" ? [{ label: "Historial", icon: History, path: "/porteria/historial" }] : porteriaCrudItems).map((item) => {
                const Icon = item.icon;
                const isActive = isNavPathActive(location.pathname, item.path);
                return (
                  <button
                    key={item.label}
                    type="button"
                    onClick={() => goToPath(item.path)}
                    aria-current={isActive ? "page" : undefined}
                    className={cn(
                      "flex w-full items-center gap-3 rounded-md px-3 py-2 text-left text-sm font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground",
                      isActive && "bg-muted text-foreground",
                    )}
                  >
                    <Icon className="h-4 w-4" aria-hidden="true" />
                    {item.label}
                  </button>
                );
              })}
            </NavSection>
          ) : null}
          {isSuperAdmin ? (
            <NavSection
              title="Administración"
              expanded={superAdminExpanded}
              onToggle={() => setSuperAdminExpanded((current) => !current)}
              showBorder
            >
              {adminEntries.map((entry) => {
                if (entry.kind === "item") {
                  return (
                    <NavItemButton
                      key={entry.label}
                      label={entry.label}
                      icon={entry.icon}
                      isActive={isNavPathActive(location.pathname, entry.path)}
                      onClick={() => goToPath(entry.path)}
                    />
                  );
                }
                return (
                  <NavSubSection
                    key={entry.label}
                    title={entry.label}
                    icon={entry.icon}
                    expanded={entry.expanded}
                    onToggle={entry.onToggle}
                  >
                    {[...entry.items]
                      .sort((a, b) => a.label.localeCompare(b.label, "es"))
                      .map((item) => (
                        <NavItemButton
                          key={item.label}
                          label={item.label}
                          icon={item.icon}
                          isActive={isNavPathActive(location.pathname, item.path)}
                          onClick={() => goToPath(item.path)}
                        />
                      ))}
                  </NavSubSection>
                );
              })}
            </NavSection>
          ) : null}
        </nav>
        {isAuthenticated ? (
          <div className="border-t p-3">
            {user ? (
              <div className="mb-3 px-3">
                <p className="truncate text-sm font-medium">{user.name}</p>
                {user.sedeName ? (
                  <p className="truncate text-xs text-muted-foreground">{user.sedeName}</p>
                ) : null}
                <p className="truncate text-xs text-muted-foreground">{user.login}</p>
                <p className="mt-1 text-xs font-medium text-primary">{roleLabel(role)}</p>
              </div>
            ) : null}
            <Button
              variant="ghost"
              type="button"
              className="w-full justify-start gap-3 text-muted-foreground hover:text-destructive"
              disabled={loggingOut}
              onClick={handleLogout}
            >
              <LogOut className="h-4 w-4" aria-hidden="true" />
              {loggingOut ? "Cerrando sesión…" : "Cerrar sesión"}
            </Button>
          </div>
        ) : null}
        <div className="border-t p-3">
          <InstallAppButton />
        </div>
        <p className="border-t px-4 py-3 text-center text-xs text-muted-foreground">
          Hecho con{" "}
          <span className="text-destructive/80" aria-hidden="true">
            💡
          </span>{" "}
          por el equipo TI
        </p>
      </aside>

      {open ? (
        <button
          type="button"
          className="fixed inset-0 z-40 bg-black/35"
          aria-label="Cerrar menú"
          onClick={() => setOpen(false)}
        />
      ) : null}

      <main className="container py-5 pb-7 sm:py-7">{children}</main>
    </div>
  );
}

function isNavPathActive(pathname: string, path: string): boolean {
  return pathname === path || pathname.startsWith(`${path}/`);
}
