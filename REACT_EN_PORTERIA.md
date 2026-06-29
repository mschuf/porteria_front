# Cómo se usa React en Portería

Guía práctica del frontend (`porteria_front`): stack, arquitectura, patrones y ejemplos tomados del código real del proyecto.

> Complementa [FRONT_BEST_PRACTICES.md](./FRONT_BEST_PRACTICES.md), que resume convenciones y reglas del equipo.

---

## 1. Stack tecnológico

| Tecnología | Uso en el proyecto |
|---|---|
| **React 18** | UI con componentes funcionales y hooks |
| **TypeScript** | Tipado estricto en componentes, hooks y servicios |
| **Vite** | Bundler y servidor de desarrollo |
| **React Router v6** | Rutas, layouts anidados y guards |
| **Tailwind CSS** | Estilos utilitarios y tema claro/oscuro |
| **Radix UI** (`@radix-ui/react-slot`) | Composición de componentes (patrón `asChild`) |
| **CVA** (`class-variance-authority`) | Variantes de estilos en componentes UI |
| **lucide-react** | Iconos |

No se usa Redux, Zustand ni React Query. El estado global vive en **Context API** y el estado de cada feature en **hooks personalizados**.

---

## 2. Estructura de carpetas

```text
porteria_front/src/
├── main.tsx              # Punto de entrada: monta React y proveedores globales
├── App.tsx               # Definición de rutas
├── api/
│   └── apiClient.ts      # Cliente HTTP centralizado
├── context/              # Estado global (auth, loading, toasts)
├── hooks/                # Lógica reutilizable por feature o utilidad
├── pages/                # Una página por ruta (componentes "contenedores")
├── components/
│   ├── layout/           # Shell, navegación, FAB móvil
│   ├── ui/               # Design system (Button, Input, Dialog…)
│   └── tickets/          # Componentes de dominio (por feature)
├── layouts/              # Layouts de React Router (Outlet)
├── services/             # Funciones que llaman a la API por dominio
├── lib/                  # Utilidades puras (tickets, http, utils)
├── types/                # Tipos TypeScript organizados por área
└── utils/                # Helpers (crypto, roles, etc.)
```

**Regla principal:** la página orquesta; el hook concentra la lógica; los componentes de dominio renderizan UI.

---

## 3. Punto de entrada: montaje y proveedores

`main.tsx` crea la raíz de React y envuelve la app con los proveedores globales en este orden:

```tsx
// src/main.tsx (simplificado)
ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <BrowserRouter>
      <ToastProvider>
        <LoadingProvider>
          <AuthProvider>
            <App />
          </AuthProvider>
        </LoadingProvider>
      </ToastProvider>
    </BrowserRouter>
  </React.StrictMode>
);
```

| Proveedor | Responsabilidad |
|---|---|
| `BrowserRouter` | Enrutamiento del lado del cliente |
| `ToastProvider` | Notificaciones (`toast.success`, `toast.error`…) |
| `LoadingProvider` | Backdrop global mientras hay peticiones HTTP |
| `AuthProvider` | Sesión, login/logout, roles |

También se inicializa el tema (`initTheme()`) y, en producción, el service worker PWA.

---

## 4. Enrutamiento

### 4.1 Rutas con lazy loading

Las páginas se cargan bajo demanda con `React.lazy` y `Suspense`:

```tsx
// src/App.tsx (simplificado)
const TicketsPage = lazy(() => import("./pages/TicketsPage"));

export default function App() {
  return (
    <Suspense fallback={<RouteFallback />}>
      <Routes>
        <Route path="/login" element={<PublicOnlyRoute><LoginPage /></PublicOnlyRoute>} />
        <Route path="/" element={<ProtectedRoute><AppShellLayout /></ProtectedRoute>}>
          <Route index element={<Navigate to="/tickets" replace />} />
          <Route path="tickets" element={<TicketsPage />} />
          <Route path="assistant" element={<AssistantPage />} />
          <Route path="admin/empresas" element={<SuperAdminRoute><EmpresasPage /></SuperAdminRoute>} />
        </Route>
      </Routes>
    </Suspense>
  );
}
```

### 4.2 Guards de ruta

| Componente | Comportamiento |
|---|---|
| `PublicOnlyRoute` | Solo usuarios **sin** sesión (ej. `/login`) |
| `ProtectedRoute` | Exige autenticación; opcionalmente filtra por rol |
| `SuperAdminRoute` | Exige `isSuperAdmin` además de estar autenticado |

Ejemplo de guard:

```tsx
// src/components/ProtectedRoute.tsx
export default function ProtectedRoute({ children, roles }: ProtectedRouteProps) {
  const { isAuthenticated, isBootstrapping, role } = useAuth();

  if (isBootstrapping) return null;
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  if (roles?.length && !roles.includes(role!)) return <Navigate to="/tickets" replace />;

  return <>{children}</>;
}
```

### 4.3 Layout anidado

`AppShellLayout` usa `<Outlet />` de React Router para renderizar la página hija dentro del shell (header, menú, tema):

```tsx
// src/layouts/AppShellLayout.tsx
export default function AppShellLayout() {
  const { theme, toggleTheme } = useTheme();
  return (
    <AppShell theme={theme} onToggleTheme={toggleTheme}>
      <Outlet />
    </AppShell>
  );
}
```

---

## 5. Patrón por feature: Página → Hook → Componentes

El ejemplo más completo es **Tickets**.

### 5.1 La página (`TicketsPage`)

La página:
- Consume contextos (`useAuth`)
- Delega la lógica a hooks (`useTickets`, `useTiMetrics`)
- Mantiene solo estado de UI local (modales abiertos, etc.)
- Compone componentes de dominio

```tsx
// src/pages/TicketsPage.tsx (simplificado)
export default function TicketsPage() {
  const { user, isTechnician } = useAuth();

  const {
    tab, setTab, tickets, filters, loading,
    handleCreateTicket, handleStatusChange, refreshTickets,
  } = useTickets({ onTicketCreated: () => refreshMetricsRef.current?.() });

  const [resolveTarget, setResolveTarget] = useState<TicketResponseDto | null>(null);

  return (
    <div>
      {/* pestañas, métricas, formulario, tabla… */}
      <TicketForm
        categories={categories}
        locations={locations}
        user={user!}
        isTechnician={isTechnician}
        onSubmit={handleCreateTicket}
      />
      <TicketTable tickets={tickets} onStatusChange={handleTicketStatusChange} />
    </div>
  );
}
```

### 5.2 El hook (`useTickets`)

Concentra estado, efectos, llamadas a servicios y handlers:

```tsx
// src/hooks/useTickets.ts (simplificado)
export function useTickets(options: UseTicketsOptions = {}): UseTicketsResult {
  const { user } = useAuth();
  const toast = useToast();
  const [searchParams, setSearchParams] = useSearchParams();
  const tab = readTab(searchParams.get("tab"));

  const [tickets, setTickets] = useState<TicketResponseDto[]>([]);
  const [loading, setLoading] = useState(false);

  const handleCreateTicket = useCallback(async (input) => {
    try {
      await createTicket(input);
      toast.success("Ticket creado.");
      // recargar listado, cambiar pestaña…
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Error al crear.");
    }
  }, [toast]);

  return { tab, tickets, loading, handleCreateTicket, /* … */ };
}
```

### 5.3 Componentes de dominio (`TicketForm`, `TicketTable`…)

Reciben datos y callbacks por props. No llaman a la API directamente:

```tsx
// src/components/tickets/TicketForm.tsx (interfaz de props)
interface TicketFormProps {
  categories: CategoryDto[];
  locations: LocationDto[];
  isTechnician: boolean;
  user: AuthUser;
  onSubmit: (input: CreateTicketInput) => Promise<void>;
}
```

**Plantilla para una feature nueva:**

```text
pages/MiFeaturePage.tsx       → orquesta UI
hooks/useMiFeature.ts         → estado + efectos + API
components/mi-feature/        → piezas visuales
services/miFeatureService.ts  → funciones HTTP
types/pages/mi-feature.types.ts
```

---

## 6. Context API: estado global

### 6.1 Patrón estándar

Todos los contextos siguen la misma forma:

1. `createContext` con valor `undefined`
2. `Provider` con estado y funciones memoizadas
3. Hook `useXxx()` que lanza error si se usa fuera del provider

```tsx
// Patrón usado en AuthContext, ToastContext, LoadingContext
const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<AuthUser | null>(null);

  const login = useCallback(async (credentials) => { /* … */ }, []);
  const logout = useCallback(async () => { /* … */ }, []);

  const value = useMemo(() => ({
    user,
    isAuthenticated: Boolean(user),
    login,
    logout,
  }), [user, login, logout]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth debe usarse dentro de AuthProvider");
  return context;
}
```

### 6.2 Contextos disponibles

| Hook | Uso típico |
|---|---|
| `useAuth()` | `user`, `login()`, `logout()`, `isTechnician`, `isSuperAdmin` |
| `useToast()` | `toast.success()`, `toast.error()`, `toast.info()` |
| `useLoading()` | `isLoading` (raro en páginas; lo usa `apiClient` internamente) |

Ejemplo en una página de login:

```tsx
// src/pages/LoginPage.tsx (simplificado)
export default function LoginPage() {
  const { login } = useAuth();
  const toast = useToast();
  const [form, setForm] = useState({ username: "", password: "" });

  const onSubmit = async (event: FormEvent) => {
    event.preventDefault();
    try {
      await login(form);
      toast.success("Inicio de sesión correcto.");
      navigate("/tickets");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "No se pudo iniciar sesión.");
    }
  };

  return (
    <form onSubmit={onSubmit}>
      <Input value={form.username} onChange={(e) => setForm((p) => ({ ...p, username: e.target.value }))} />
      {/* … */}
    </form>
  );
}
```

---

## 7. Comunicación con el backend

### 7.1 Capas

```text
Componente/Página
    ↓ llama
Hook (useTickets, etc.)
    ↓ llama
Service (ticketsService.ts)
    ↓ llama
apiClient (api/apiClient.ts)
    ↓ fetch con cookies
Backend (porteria_back)
```

### 7.2 `apiClient`

Cliente HTTP único. Características:

- Base URL: `VITE_API_URL` o `/api/v1` en desarrollo (proxy de Vite)
- Cookies con `credentials: 'include'` (sesión HttpOnly)
- Backdrop automático en cada petición
- Redirección a login en 401 / token expirado
- Errores tipados como `ApiError`

```tsx
// src/services/ticketsService.ts (ejemplo)
export async function listCategories(options?: ReadRequestOptions) {
  return apiClient.get<CategoryDto[]>("/categories", options);
}

export async function createTicket(input: CreateTicketInput) {
  return apiClient.post<CreateTicketResponse>("/tickets", input);
}
```

### 7.3 Proxy en desarrollo

```ts
// vite.config.ts
server: {
  proxy: {
    "/api": { target: "http://localhost:1001", changeOrigin: true }
  }
}
```

---

## 8. Componentes UI (design system)

Los componentes en `src/components/ui/` son reutilizables en toda la app. Siguen el estilo **shadcn-like**:

- `forwardRef` para referencias DOM
- Variantes con **CVA**
- Clases fusionadas con `cn()` (`clsx` + `tailwind-merge`)

### Ejemplo: `Button`

```tsx
// src/components/ui/button.tsx (simplificado)
const buttonVariants = cva("inline-flex items-center …", {
  variants: {
    variant: { default: "bg-primary …", outline: "border …", ghost: "hover:bg-muted" },
    size: { default: "h-10 px-4", sm: "h-9 px-3", icon: "h-10 w-10" },
  },
});

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";
    return <Comp className={cn(buttonVariants({ variant, size, className }))} ref={ref} {...props} />;
  }
);
```

### Uso en componentes

```tsx
import { Button } from "@/components/ui/button";
import { Field } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Loading } from "@/components/ui/loading";
import { EmptyState } from "@/components/ui/empty-state";
import { Dialog } from "@/components/ui/dialog";

// Variantes
<Button variant="outline" size="sm">Cancelar</Button>
<Button variant="destructive">Eliminar</Button>

// Estados
{loading && <Loading label="Cargando tickets…" />}
{!tickets.length && <EmptyState title="Sin resultados" />}
```

### Utilidad `cn`

```tsx
import { cn } from "@/lib/utils";

<div className={cn("rounded-lg border p-4", isActive && "border-primary", className)} />
```

---

## 9. Hooks personalizados

| Hook | Propósito |
|---|---|
| `useTickets` | Toda la lógica de la página de tickets |
| `useTiMetrics` | Métricas/indicadores (carga condicional por pestaña) |
| `useTheme` | Tema claro/oscuro con `localStorage` |
| `useDebouncedValue` | Retrasar actualizaciones (búsquedas) |
| `useTokenTimer` | Expiración automática de sesión |

### Ejemplo: debounce para búsqueda

```tsx
const [search, setSearch] = useState("");
const debouncedSearch = useDebouncedValue(search, 300);

useEffect(() => {
  void loadTickets({ search: debouncedSearch });
}, [debouncedSearch]);
```

### Ejemplo: tema

```tsx
const { theme, toggleTheme } = useTheme();
// theme: "light" | "dark"
// toggleTheme alterna y persiste en localStorage
```

---

## 10. Estilos y tema

- **Tailwind** con variables CSS en `index.css` (`bg-background`, `text-muted-foreground`, etc.)
- Modo oscuro: clase `dark` en `<html>` (controlada por `useTheme`)
- Iconos: `lucide-react` (`import { RefreshCw } from "lucide-react"`)

---

## 11. Alias de imports

TypeScript y Vite resuelven `@/` como `src/`:

```tsx
import { Button } from "@/components/ui/button";
import { useAuth } from "@/context/AuthContext";
import { cn } from "@/lib/utils";
```

Configurado en `tsconfig.app.json` y `vite.config.ts`.

---

## 12. Cómo crear algo nuevo (checklist)

### Nueva página protegida

1. Crear `src/pages/MiPagina.tsx` (export default)
2. Crear `src/hooks/useMiPagina.ts` si hay lógica de estado/API
3. Registrar ruta en `App.tsx` con `lazy()` dentro de `ProtectedRoute`
4. Si hace falta, agregar entrada en el menú de `AppShell.tsx`

### Nuevo formulario con API

```tsx
// 1. Service
// src/services/miService.ts
export function guardarItem(data: ItemInput) {
  return apiClient.post<Item>("/items", data);
}

// 2. Hook o lógica en la página
const [saving, setSaving] = useState(false);
const toast = useToast();

async function handleSubmit(data: ItemInput) {
  setSaving(true);
  try {
    await guardarItem(data);
    toast.success("Guardado.");
  } catch (e) {
    toast.error(e instanceof ApiError ? e.message : "Error.");
  } finally {
    setSaving(false);
  }
}

// 3. Componente
<Button disabled={saving} type="submit">Guardar</Button>
```

### Nuevo componente UI

1. Crear en `src/components/ui/mi-componente.tsx`
2. Usar `forwardRef`, `cn()` y variantes CVA si aplica
3. Exportar tipos de props con `interface`

---

## 13. Comandos útiles

```bash
cd porteria_front
npm install
npm run dev      # http://localhost:5173
npm run build    # TypeScript + bundle de producción
npm run preview  # Previsualizar build
```

Variables de entorno: copiar `.env.example` a `.env` y configurar `VITE_API_URL` si aplica.

---

## 14. Resumen mental

```text
main.tsx          → monta React + providers
App.tsx           → rutas + lazy + guards
Page              → compone UI, poco estado local
Hook              → estado, efectos, handlers, API
Service           → funciones HTTP por dominio
apiClient         → fetch centralizado
Context           → auth, toasts, loading global
components/ui     → piezas visuales reutilizables
components/<feat> → piezas de negocio por módulo
```

React en este proyecto es **intencionalmente simple**: sin librerías de estado externas, con separación clara entre presentación (componentes), lógica (hooks) y datos (services + apiClient).
