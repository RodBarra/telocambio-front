import { Navigate, Route, Routes } from "react-router-dom";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import ProtectedRoute from "./components/ProtectedRoute";
import Navbar from "./components/Navbar";

import AdminCreateComunidad from "./pages/admin/AdminCreateComunidad";
import AdminCreateModerador from "./pages/admin/AdminCreateModerador";
import AdminComunidadesList from "./pages/admin/AdminComunidadesList";
import ModUsuarios from "./pages/mod/ModUsuarios";
import ModPadron from "./pages/mod/ModPadron";

// público
import PublicNavbar from "./components/PublicNavbar";
import SiteFooter from "./components/SiteFooter";
import Ofertas from "./pages/Ofertas";
import Nosotros from "./pages/Nosotros";
import ComoFunciona from "./pages/ComoFunciona";
import Contacto from "./pages/Contacto";

// marketplace (Sprint 2)
import { PublicacionesList, PublicacionForm } from "./pages/publicaciones";

function PrivateShell({ children }: { children: React.ReactNode }) {
  return (
    <>
      <Navbar />
      <main>{children}</main>
      <SiteFooter />
    </>
  );
}

function PublicShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex flex-col">
      <PublicNavbar />
      <main className="flex-1">{children}</main>
      <SiteFooter />
    </div>
  );
}

export default function App() {
  return (
    <Routes>
      {/* público */}
      <Route path="/" element={<Navigate to="/login" replace />} />
      <Route path="/login" element={<PublicShell><Login /></PublicShell>} />
      <Route path="/register" element={<PublicShell><Register /></PublicShell>} />
      <Route path="/ofertas" element={<PublicShell><Ofertas /></PublicShell>} />
      <Route path="/nosotros" element={<PublicShell><Nosotros /></PublicShell>} />
      <Route path="/como-funciona" element={<PublicShell><ComoFunciona /></PublicShell>} />
      <Route path="/contacto" element={<PublicShell><Contacto /></PublicShell>} />

      {/* privado */}
      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            <PrivateShell>
              <Dashboard />
            </PrivateShell>
          </ProtectedRoute>
        }
      />

      {/* Marketplace (todos los roles autenticados: Admin/Mod/Residente) */}
      <Route
        path="/publicaciones"
        element={
          <ProtectedRoute>
            <PrivateShell>
              <PublicacionesList />
            </PrivateShell>
          </ProtectedRoute>
        }
      />
      <Route
        path="/publicaciones/nueva"
        element={
          <ProtectedRoute>
            <PrivateShell>
              <PublicacionForm />
            </PrivateShell>
          </ProtectedRoute>
        }
      />
      <Route
        path="/publicaciones/:id/editar"
        element={
          <ProtectedRoute>
            <PrivateShell>
              <PublicacionForm />
            </PrivateShell>
          </ProtectedRoute>
        }
      />

      {/* Admin */}
      <Route
        path="/admin/comunidades/nueva"
        element={
          <ProtectedRoute roles={[1]}>
            <PrivateShell>
              <AdminCreateComunidad />
            </PrivateShell>
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/moderador/nuevo"
        element={
          <ProtectedRoute roles={[1]}>
            <PrivateShell>
              <AdminCreateModerador />
            </PrivateShell>
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/comunidades"
        element={
          <ProtectedRoute roles={[1]}>
            <PrivateShell>
              <AdminComunidadesList />
            </PrivateShell>
          </ProtectedRoute>
        }
      />

      {/* Moderador/Admin */}
      <Route
        path="/mod/usuarios"
        element={
          <ProtectedRoute roles={[1, 2]}>
            <PrivateShell>
              <ModUsuarios />
            </PrivateShell>
          </ProtectedRoute>
        }
      />
      <Route
        path="/mod/padron"
        element={
          <ProtectedRoute roles={[1, 2]}>
            <PrivateShell>
              <ModPadron />
            </PrivateShell>
          </ProtectedRoute>
        }
      />

      {/* fallback */}
      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  );
}
