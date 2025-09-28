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

function Shell({ children }: { children: React.ReactNode }) {
  return (
    <>
      <Navbar />
      <main>{children}</main>
    </>
  );
}

export default function App() {
  return (
    <Routes>
      {/* público */}
      <Route path="/" element={<Navigate to="/login" replace />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />

      {/* privado */}
      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            <Shell>
              <Dashboard />
            </Shell>
          </ProtectedRoute>
        }
      />

      {/* Admin */}
      <Route
        path="/admin/comunidades/nueva"
        element={
          <ProtectedRoute roles={[1]}>
            <Shell>
              <AdminCreateComunidad />
            </Shell>
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/moderador/nuevo"
        element={
          <ProtectedRoute roles={[1]}>
            <Shell>
              <AdminCreateModerador />
            </Shell>
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/comunidades"
        element={
          <ProtectedRoute roles={[1]}>
            <Shell>
              <AdminComunidadesList />
            </Shell>
          </ProtectedRoute>
        }
      />

      {/* Moderador/Admin */}
      <Route
        path="/mod/usuarios"
        element={
          <ProtectedRoute roles={[1, 2]}>
            <Shell>
              <ModUsuarios />
            </Shell>
          </ProtectedRoute>
        }
      />
      <Route
        path="/mod/padron"
        element={
          <ProtectedRoute roles={[1, 2]}>
            <Shell>
              <ModPadron />
            </Shell>
          </ProtectedRoute>
        }
      />

      {/* fallback */}
      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  );
}
