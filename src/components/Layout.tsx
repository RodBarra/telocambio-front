import { Link, NavLink } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function Layout({ children }: { children: React.ReactNode }) {
  const { user, logout } = useAuth();
  return (
    <div className="min-h-screen">
      {/* NAVBAR */}
      <header className="sticky top-0 z-10 border-b border-slate-200 bg-white/70 backdrop-blur">
        <div className="container flex h-14 items-center justify-between">
          <Link to="/" className="text-lg font-semibold tracking-tight">
            TeLoCambio
          </Link>
          <nav className="flex items-center gap-2">
            {!user ? (
              <NavLink to="/login" className="btn btn-primary">Entrar</NavLink>
            ) : (
              <div className="flex items-center gap-3">
                <span className="text-sm text-slate-600 hidden sm:block">{user.correo}</span>
                <button onClick={logout} className="btn btn-outline">Salir</button>
              </div>
            )}
          </nav>
        </div>
      </header>

      <main className="container py-10">{children}</main>

      <footer className="mt-16 border-t border-slate-200">
        <div className="container py-6 text-sm text-slate-500">© {new Date().getFullYear()} TeLoCambio</div>
      </footer>
    </div>
  );
}
