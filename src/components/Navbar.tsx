// src/components/Navbar.tsx
import { Link, NavLink, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useEffect, useRef, useState } from "react";

export default function Navbar() {
  const { user, logout } = useAuth();
  const nav = useNavigate();
  const location = useLocation();
  const [open, setOpen] = useState(false);
  const panelRef = useRef<HTMLDivElement>(null);

  if (!user) return null;

  const isAdmin = user.rol_usuario_id === 1;
  const isMod   = user.rol_usuario_id === 2;
  const isRes   = user.rol_usuario_id === 3;

  // Home por rol
  const homePath = isAdmin ? "/mod/usuarios" : "/publicaciones";

  // ACTIVO SOLO EN /perfil (no en /perfil/:id)
  const isMyProfile = location.pathname === "/perfil";

  // Redirección inicial (opcional)
  useEffect(() => {
    const path = location.pathname;
    if (isAdmin) {
      if (path === "/" || path === "/dashboard" || path === "/login") {
        nav("/mod/usuarios", { replace: true });
      }
    } else if (isMod || isRes) {
      if (path === "/" || path === "/dashboard" || path === "/login") {
        nav("/publicaciones", { replace: true });
      }
    }
  }, [isAdmin, isMod, isRes, location.pathname, nav]);

  // Cerrar panel al click afuera o ESC
  useEffect(() => {
    const onDocClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement | null;
      if (target && target.closest("[data-menu-toggle]")) return;
      if (!panelRef.current) return;
      if (!panelRef.current.contains(target as Node)) setOpen(false);
    };
    const onEsc = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    document.addEventListener("click", onDocClick);
    document.addEventListener("keydown", onEsc);
    return () => {
      document.removeEventListener("click", onDocClick);
      document.removeEventListener("keydown", onEsc);
    };
  }, []);

  // Bloqueo de scroll al abrir panel mobile
  useEffect(() => {
    const cls = "overflow-hidden";
    if (open) {
      document.documentElement.classList.add(cls);
      document.body.classList.add(cls);
    } else {
      document.documentElement.classList.remove(cls);
      document.body.classList.remove(cls);
    }
    return () => {
      document.documentElement.classList.remove(cls);
      document.body.classList.remove(cls);
    };
  }, [open]);

  const handleLogout = () => {
    logout();
    nav("/login");
  };

  const Item = ({ to, children }: { to: string; children: React.ReactNode }) => (
    <NavLink
      to={to}
      className={({ isActive }) =>
        [
          "relative px-3 py-2 text-sm font-medium transition-colors",
          isActive ? "text-slate-900" : "text-slate-600 hover:text-slate-900",
          "after:absolute after:left-3 after:right-3 after:-bottom-[2px] after:h-[3px] after:rounded-full",
          "after:bg-gradient-to-r after:from-blue-500 after:to-emerald-500",
          isActive
            ? "after:scale-x-100 after:opacity-100"
            : "after:scale-x-0 after:opacity-0 hover:after:scale-x-100 hover:after:opacity-100",
          "after:transition after:duration-300 after:ease-out after:origin-center",
        ].join(" ")
      }
    >
      {children}
    </NavLink>
  );

  const NavItemsDesktop = () => (
    <div className="hidden md:flex items-center gap-1">
      {isAdmin && (
        <>
          <Item to="/mod/usuarios">Usuarios</Item>
          <Item to="/admin/comunidades">Comunidades</Item>
        </>
      )}
      {isMod && (
        <>
          <Item to="/publicaciones">Publicaciones</Item>
          <Item to="/intercambios">Intercambios</Item>
          <Item to="/mod/usuarios">Usuarios</Item>
          <Item to="/mod/padron">Padrón</Item>
        </>
      )}
      {isRes && (
        <>
          <Item to="/publicaciones">Publicaciones</Item>
          <Item to="/intercambios">Intercambios</Item>
        </>
      )}
    </div>
  );

  const ProfileEmail = () => (
    <NavLink
      to="/perfil"
      end
      className={({ isActive }) =>
        [
          "relative hidden sm:block max-w-[28ch] truncate text-xs transition-colors",
          isActive ? "text-slate-900" : "text-slate-600 hover:text-slate-900",
          "after:absolute after:left-0 after:right-0 after:-bottom-[2px] after:h-[2px] after:rounded-full",
          "after:bg-gradient-to-r after:from-blue-500 after:to-emerald-500",
          isActive
            ? "after:scale-x-100 after:opacity-100"
            : "after:scale-x-0 after:opacity-0 hover:after:scale-x-100 hover:after:opacity-100",
          "after:transition after:duration-300 after:ease-out after:origin-center",
        ].join(" ")
      }
      title={user.correo}
    >
      {user.correo}
    </NavLink>
  );

  const ProfileButton = () => (
    <Link
      to="/perfil"
      className={[
        "relative inline-flex h-9 w-9 items-center justify-center rounded-full",
        "border border-slate-300 bg-white shadow hover:bg-slate-50",
        "focus:outline-none focus:ring-2 focus:ring-blue-500",
        isMyProfile ? "ring-2 ring-blue-500" : "ring-0",
      ].join(" ")}
      aria-label="Perfil"
      title="Perfil"
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        className="h-5 w-5 text-slate-700"
        strokeWidth="1.8"
      >
        <path d="M12 12a4 4 0 1 0-4-4 4 4 0 0 0 4 4Z" />
        <path d="M4 20a8 8 0 0 1 16 0" />
      </svg>
    </Link>
  );

  return (
    <>
      <header className="sticky top-0 z-40 border-b border-slate-200 bg-white/80 backdrop-blur supports-[backdrop-filter]:bg-white/60">
        <nav className="mx-auto max-w-7xl h-16 px-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              type="button"
              data-menu-toggle
              className="md:hidden p-2 rounded-md hover:bg-slate-100"
              onClick={() => setOpen(true)}
              aria-label="Abrir menú"
              aria-expanded={open}
              aria-controls="mobile-menu"
            >
              ☰
            </button>

            <Link to={homePath} className="flex items-center gap-3">
              <img src="/logo-telocambio.png" alt="TeLoCambio" className="h-8" />
            </Link>

            <NavItemsDesktop />
          </div>

          <div className="flex items-center gap-3">
            <ProfileEmail />
            <ProfileButton />

            <Link
              to="/notificaciones"
              className="relative inline-flex h-9 w-9 items-center justify-center rounded-full hover:bg-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
              aria-label="Notificaciones"
              title="Notificaciones"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                className="h-5 w-5 text-slate-700"
                strokeWidth="1.8"
              >
                <path d="M15 17h5l-1.4-1.4A2 2 0 0 1 18 14.2V11a6 6 0 1 0-12 0v3.2c0 .5-.2 1-.6 1.4L4 17h5" />
                <path d="M9 17a3 3 0 0 0 6 0" />
              </svg>
            </Link>

            <button
              onClick={handleLogout}
              className="inline-flex items-center rounded-xl border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 shadow hover:bg-slate-50"
            >
              Cerrar sesión
            </button>
          </div>
        </nav>
      </header>

      {/* Backdrop + Panel Mobile */}
      {open && (
        <div
          className="fixed inset-0 z-40 bg-black/40 md:hidden"
          aria-hidden
          onClick={() => setOpen(false)}
        />
      )}
      <aside
        ref={panelRef}
        id="mobile-menu"
        className={`fixed z-50 inset-y-0 left-0 w-72 bg-white shadow-lg border-r border-slate-200 transform transition-transform will-change-transform md:hidden ${
          open ? "translate-x-0" : "-translate-x-full"
        }`}
        aria-hidden={!open}
        role="dialog"
        aria-modal="true"
      >
        <div className="sticky top-0 h-16 flex items-center justify-between px-4 border-b bg-white">
          <Link to={homePath} className="flex items-center gap-3" onClick={() => setOpen(false)}>
            <img src="/logo-telocambio.png" alt="TeLoCambio" className="h-8" />
          </Link>
          <button
            className="p-2 rounded-md hover:bg-slate-100"
            onClick={() => setOpen(false)}
            aria-label="Cerrar menú"
          >
            ✕
          </button>
        </div>

        <div className="h-[calc(100vh-64px)] overflow-y-auto">
          <nav className="p-3 space-y-1 text-sm">
            {isAdmin && (
              <>
                <NavLink
                  to="/mod/usuarios"
                  onClick={() => setOpen(false)}
                  className={({ isActive }) =>
                    `block rounded-lg px-3 py-2 ${
                      isActive ? "bg-slate-100 text-slate-900" : "text-slate-700 hover:bg-slate-50"
                    }`
                  }
                >
                  Usuarios
                </NavLink>
                <NavLink
                  to="/admin/comunidades"
                  onClick={() => setOpen(false)}
                  className={({ isActive }) =>
                    `block rounded-lg px-3 py-2 ${
                      isActive ? "bg-slate-100 text-slate-900" : "text-slate-700 hover:bg-slate-50"
                    }`
                  }
                >
                  Comunidades
                </NavLink>
              </>
            )}

            {isMod && (
              <>
                <NavLink
                  to="/publicaciones"
                  onClick={() => setOpen(false)}
                  className={({ isActive }) =>
                    `block rounded-lg px-3 py-2 ${
                      isActive ? "bg-slate-100 text-slate-900" : "text-slate-700 hover:bg-slate-50"
                    }`
                  }
                >
                  Publicaciones
                </NavLink>
                <NavLink
                  to="/intercambios"
                  onClick={() => setOpen(false)}
                  className={({ isActive }) =>
                    `block rounded-lg px-3 py-2 ${
                      isActive ? "bg-slate-100 text-slate-900" : "text-slate-700 hover:bg-slate-50"
                    }`
                  }
                >
                  Intercambios
                </NavLink>
                <NavLink
                  to="/mod/usuarios"
                  onClick={() => setOpen(false)}
                  className={({ isActive }) =>
                    `block rounded-lg px-3 py-2 ${
                      isActive ? "bg-slate-100 text-slate-900" : "text-slate-700 hover:bg-slate-50"
                    }`
                  }
                >
                  Usuarios
                </NavLink>
                <NavLink
                  to="/mod/padron"
                  onClick={() => setOpen(false)}
                  className={({ isActive }) =>
                    `block rounded-lg px-3 py-2 ${
                      isActive ? "bg-slate-100 text-slate-900" : "text-slate-700 hover:bg-slate-50"
                    }`
                  }
                >
                  Padrón
                </NavLink>
              </>
            )}

            {isRes && (
              <>
                <NavLink
                  to="/publicaciones"
                  onClick={() => setOpen(false)}
                  className={({ isActive }) =>
                    `block rounded-lg px-3 py-2 ${
                      isActive ? "bg-slate-100 text-slate-900" : "text-slate-700 hover:bg-slate-50"
                    }`
                  }
                >
                  Publicaciones
                </NavLink>
                <NavLink
                  to="/intercambios"
                  onClick={() => setOpen(false)}
                  className={({ isActive }) =>
                    `block rounded-lg px-3 py-2 ${
                      isActive ? "bg-slate-100 text-slate-900" : "text-slate-700 hover:bg-slate-50"
                    }`
                  }
                >
                  Intercambios
                </NavLink>
              </>
            )}
          </nav>

          {/* Accesos universales (Mobile) */}
          <div className="mt-4 p-3 border-t space-y-2">
            <NavLink
              to="/notificaciones"
              onClick={() => setOpen(false)}
              className={({ isActive }) =>
                `block rounded-lg px-3 py-2 ${
                  isActive ? "bg-slate-100 text-slate-900" : "text-slate-700 hover:bg-slate-50"
                }`
              }
            >
              🔔 Notificaciones
            </NavLink>
            {/* end => activo solo en /perfil */}
            <NavLink
              to="/perfil"
              end
              onClick={() => setOpen(false)}
              className={({ isActive }) =>
                `block rounded-lg px-3 py-2 ${
                  isActive ? "bg-slate-100 text-slate-900" : "text-slate-700 hover:bg-slate-50"
                }`
              }
            >
              👤 Perfil
            </NavLink>

            <div className="pt-2 border-t">
              <div className="mb-2 truncate text-slate-500 text-xs">{user.correo}</div>
              <button className="btn btn-outline w-full" onClick={handleLogout}>
                Cerrar sesión
              </button>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
}
