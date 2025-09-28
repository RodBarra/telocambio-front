// src/components/AppShell.tsx
import { NavLink, Outlet, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function AppShell() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex flex-col">
      <header className="border-b bg-white/70 backdrop-blur">
        <div className="mx-auto max-w-6xl px-4 h-14 flex items-center justify-between">
          <NavLink to="/dashboard" className="text-lg font-semibold text-slate-800">
            TeLoCambio
          </NavLink>
          <nav className="flex items-center gap-4">
            <span className="text-sm text-slate-600">{user?.correo}</span>
            <button
              className="btn-outline rounded-md"
              onClick={() => {
                logout();
                navigate("/login", { replace: true });
              }}
            >
              Salir
            </button>
          </nav>
        </div>
      </header>

      <main className="flex-1">
        <div className="mx-auto max-w-6xl px-4 py-10">
          <Outlet />
        </div>
      </main>

      <footer className="border-t bg-white">
        <div className="mx-auto max-w-6xl px-4 h-12 flex items-center text-sm text-slate-500">
          © {new Date().getFullYear()} TeLoCambio
        </div>
      </footer>
    </div>
  );
}
