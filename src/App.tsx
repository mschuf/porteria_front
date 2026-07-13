/**

 * @file App.tsx

 * @description Enrutamiento principal de la aplicación con rutas públicas, protegidas y lazy loading.

 */

import { Suspense, lazy } from "react";

import { Navigate, Route, Routes } from "react-router-dom";

import ProtectedRoute from "@/components/ProtectedRoute";

import PublicOnlyRoute from "@/components/PublicOnlyRoute";

import PorteriaRoute from "@/components/PorteriaRoute";

import SuperAdminRoute from "@/components/SuperAdminRoute";
import StrictSuperAdminRoute from "@/components/StrictSuperAdminRoute";

import { Loading } from "@/components/ui/loading";

import { useAuth } from "./context/AuthContext";
import { accessFlagsFromUser, resolveDefaultAuthenticatedPath } from "./utils/auth-access";



const AppShellLayout = lazy(() => import("./layouts/AppShellLayout"));

const PorteriaLayout = lazy(() => import("./layouts/PorteriaLayout"));

const PorteriaIndicadoresPage = lazy(() => import("./pages/PorteriaIndicadoresPage"));

const PorteriaHistorialPage = lazy(() => import("./pages/PorteriaHistorialPage"));

const LoginPage = lazy(() => import("./pages/LoginPage"));

const PersonasPage = lazy(() => import("./pages/PersonasPage"));

const ProveedoresPage = lazy(() => import("./pages/ProveedoresPage"));

const MotivosVisitaPage = lazy(() => import("./pages/MotivosVisitaPage"));

const VisitasPage = lazy(() => import("./pages/VisitasPage"));

const PorteriaReportPage = lazy(() => import("./pages/PorteriaReportPage"));
const PorteriaAuditReportPage = lazy(() => import("./pages/PorteriaAuditReportPage"));
const EmpresasPage = lazy(() => import("./pages/EmpresasPage"));
const EmpresaPorteriaPage = lazy(() => import("./pages/EmpresaPorteriaPage"));
const SedesPage = lazy(() => import("./pages/SedesPage"));
const SedeEmpresaPorteriaPage = lazy(() => import("./pages/SedeEmpresaPorteriaPage"));
const UsuarioEmpresaPorteriaPage = lazy(() => import("./pages/UsuarioEmpresaPorteriaPage"));

const UsuariosAdminPage = lazy(() => import("./pages/UsuariosAdminPage"));
const AreasPage = lazy(() => import("./pages/AreasPage"));
const TarjetasPage = lazy(() => import("./pages/TarjetasPage"));



/**

 * Componente raíz con definición de rutas y guards de autenticación.

 * @returns Árbol de rutas de React Router con carga diferida por página.

 */

export default function App() {

  const { isAuthenticated, user } = useAuth();

  const defaultAuthenticatedPath = resolveDefaultAuthenticatedPath(accessFlagsFromUser(user));



  return (

    <Suspense fallback={<RouteFallback />}>

      <Routes>

        <Route

          path="/login"

          element={

            <PublicOnlyRoute>

              <LoginPage />

            </PublicOnlyRoute>

          }

        />

        <Route

          path="/"

          element={

            <ProtectedRoute>

              <AppShellLayout />

            </ProtectedRoute>

          }

        >

          <Route index element={<Navigate to={defaultAuthenticatedPath} replace />} />

          <Route

            path="porteria"

            element={

              <PorteriaRoute>

                <PorteriaLayout />

              </PorteriaRoute>

            }

          >

            <Route index element={<PorteriaIndicadoresPage />} />

            <Route path="historial" element={<PorteriaHistorialPage />} />

            <Route path="visitas" element={<VisitasPage />} />

            <Route path="personas" element={<PersonasPage />} />

            <Route path="motivos-visita" element={<MotivosVisitaPage />} />

            <Route path="proveedores" element={<ProveedoresPage />} />

          </Route>

          <Route

            path="admin/empresas"

            element={

              <StrictSuperAdminRoute>

                <EmpresasPage />

              </StrictSuperAdminRoute>

            }

          />

          <Route

            path="admin/empresa-porteria"

            element={

              <StrictSuperAdminRoute>

                <EmpresaPorteriaPage />

              </StrictSuperAdminRoute>

            }

          />

          <Route

            path="admin/sedes"

            element={

              <StrictSuperAdminRoute>

                <SedesPage />

              </StrictSuperAdminRoute>

            }

          />

          <Route

            path="admin/sede-empresa-porteria"

            element={

              <StrictSuperAdminRoute>

                <SedeEmpresaPorteriaPage />

              </StrictSuperAdminRoute>

            }

          />

          <Route

            path="admin/usuario-empresa"

            element={<Navigate to="/admin/usuarios" replace />}

          />

          <Route

            path="admin/usuario-empresa-porteria"

            element={

              <StrictSuperAdminRoute>

                <UsuarioEmpresaPorteriaPage />

              </StrictSuperAdminRoute>

            }

          />

          <Route

            path="admin/usuarios"

            element={

                <SuperAdminRoute>

                  <UsuariosAdminPage />

                </SuperAdminRoute>

            }

          />

          <Route

            path="admin/areas"

            element={

                <SuperAdminRoute>

                  <AreasPage />

                </SuperAdminRoute>

            }

          />

          <Route

            path="admin/tarjetas"

            element={

                <SuperAdminRoute>

                  <TarjetasPage />

                </SuperAdminRoute>

            }

          />

          <Route

            path="admin/reporte-porteria"

            element={

              <SuperAdminRoute>

                <PorteriaReportPage />

              </SuperAdminRoute>

            }

          />

          <Route

            path="admin/reporte-porteria-auditoria"

            element={

              <SuperAdminRoute>

                <PorteriaAuditReportPage />

              </SuperAdminRoute>

            }

          />

        </Route>

        <Route

          path="*"

          element={<Navigate to={isAuthenticated ? defaultAuthenticatedPath : "/login"} replace />}

        />

      </Routes>

    </Suspense>

  );

}



/**

 * Pantalla de espera mostrada mientras se cargan módulos con `React.lazy`.

 * @returns Contenedor centrado con indicador de carga.

 */

function RouteFallback() {

  return (

    <div className="flex min-h-screen items-center justify-center bg-background px-4">

      <Loading label="Cargando módulo..." />

    </div>

  );

}

