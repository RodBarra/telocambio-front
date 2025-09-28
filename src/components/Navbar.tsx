import { Link, NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useEffect, useRef, useState } from "react";

export default function Navbar() {
  const { user, logout } = useAuth();
  const nav = useNavigate();
  const [open, setOpen] = useState(false);
  const panelRef = useRef<HTMLDivElement>(null);

  // Cerrar con click fuera (ignorando el botón toggle) y con ESC
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

  // Bloquear scroll del body cuando el panel está abierto
  useEffect(() => {
    const cls = "overflow-hidden";
    if (open) document.documentElement.classList.add(cls), document.body.classList.add(cls);
    else document.documentElement.classList.remove(cls), document.body.classList.remove(cls);
    return () => {
      document.documentElement.classList.remove(cls);
      document.body.classList.remove(cls);
    };
  }, [open]);

  if (!user) return null;

  const isAdmin = user.rol_usuario_id === 1;
  const isMod = user.rol_usuario_id === 2;

  const handleLogout = () => {
    logout();
    nav("/login");
  };

  const NavItemsDesktop = () => (
    <ul className="hidden md:flex items-center gap-4 text-sm">
      <li>
        <NavLink
          to="/dashboard"
          className={({ isActive }) =>
            `px-2 py-1 rounded-md ${isActive ? "text-blue-600" : "text-slate-600 hover:text-slate-900"}`
          }
        >
          Inicio
        </NavLink>
      </li>

      {isMod && (
        <>
          <li>
            <NavLink
              to="/mod/usuarios"
              className={({ isActive }) =>
                `px-2 py-1 rounded-md ${isActive ? "text-blue-600" : "text-slate-600 hover:text-slate-900"}`
              }
            >
              Usuarios
            </NavLink>
          </li>
          <li>
            <NavLink
              to="/mod/padron"
              className={({ isActive }) =>
                `px-2 py-1 rounded-md ${isActive ? "text-blue-600" : "text-slate-600 hover:text-slate-900"}`
              }
            >
              Padrón
            </NavLink>
          </li>
        </>
      )}

      {isAdmin && (
        <>
          <li>
            <NavLink
              to="/mod/usuarios"
              className={({ isActive }) =>
                `px-2 py-1 rounded-md ${isActive ? "text-blue-600" : "text-slate-600 hover:text-slate-900"}`
              }
            >
              Usuarios
            </NavLink>
          </li>
          <li>
            <NavLink
              to="/admin/comunidades"
              className={({ isActive }) =>
                `px-2 py-1 rounded-md ${isActive ? "text-blue-600" : "text-slate-600 hover:text-slate-900"}`
              }
            >
              Comunidades
            </NavLink>
          </li>
        </>
      )}
    </ul>
  );

  // Header fijo (SOLO header)
  const HeaderBar = () => (
    <header className="sticky top-0 z-30 bg-white/80 backdrop-blur border-b border-slate-200">
      <nav className="max-w-7xl mx-auto flex items-center justify-between px-4 h-14">
        <div className="flex items-center gap-3">
          {/* Burger (md-) */}
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

          <Link to="/dashboard" className="text-lg font-semibold tracking-tight">
            TeLoCambio
          </Link>

          <NavItemsDesktop />
        </div>

        <div className="flex items-center gap-3">
          <span className="text-sm text-slate-600 hidden sm:block max-w-[28ch] truncate" title={user.correo}>
            {user.correo}
          </span>
          <button onClick={handleLogout} className="btn btn-outline">Cerrar sesión</button>
        </div>
      </nav>
    </header>
  );

  // Panel móvil y backdrop (FUERA del header)
  const MobilePanel = () => (
    <>
      {open && (
        <div
          className="fixed inset-0 z-40 bg-black/40"
          aria-hidden
          onClick={() => setOpen(false)}
        />
      )}

      <aside
        ref={panelRef}
        id="mobile-menu"
        className={`fixed z-50 inset-y-0 left-0 w-72 bg-white shadow-lg border-r border-slate-200 transform transition-transform will-change-transform ${
          open ? "translate-x-0" : "-translate-x-full"
        }`}
        aria-hidden={!open}
        role="dialog"
        aria-modal="true"
      >
        {/* Top del panel (sticky dentro del aside) */}
        <div className="sticky top-0 h-14 flex items-center justify-between px-4 border-b bg-white">
          <Link
            to="/dashboard"
            className="text-lg font-semibold tracking-tight"
            onClick={() => setOpen(false)}
          >
            TeLoCambio
          </Link>
          <button
            className="p-2 rounded-md hover:bg-slate-100"
            onClick={() => setOpen(false)}
            aria-label="Cerrar menú"
          >
            ✕
          </button>
        </div>

        {/* Contenido scrollable */}
        <div className="h-[calc(100vh-56px)] overflow-y-auto">
          <nav className="p-3 space-y-1 text-sm">
            <NavLink
              to="/dashboard"
              onClick={() => setOpen(false)}
              className={({ isActive }) =>
                `block rounded-lg px-3 py-2 ${isActive ? "bg-slate-100 text-slate-900" : "text-slate-700 hover:bg-slate-50"}`
              }
            >
              Inicio
            </NavLink>

            {isMod && (
              <>
                <NavLink
                  to="/mod/usuarios"
                  onClick={() => setOpen(false)}
                  className={({ isActive }) =>
                    `block rounded-lg px-3 py-2 ${isActive ? "bg-slate-100 text-slate-900" : "text-slate-700 hover:bg-slate-50"}`
                  }
                >
                  Usuarios
                </NavLink>
                <NavLink
                  to="/mod/padron"
                  onClick={() => setOpen(false)}
                  className={({ isActive }) =>
                    `block rounded-lg px-3 py-2 ${isActive ? "bg-slate-100 text-slate-900" : "text-slate-700 hover:bg-slate-50"}`
                  }
                >
                  Padrón
                </NavLink>
              </>
            )}

            {isAdmin && (
              <>
                <NavLink
                  to="/mod/usuarios"
                  onClick={() => setOpen(false)}
                  className={({ isActive }) =>
                    `block rounded-lg px-3 py-2 ${isActive ? "bg-slate-100 text-slate-900" : "text-slate-700 hover:bg-slate-50"}`
                  }
                >
                  Usuarios
                </NavLink>
                <NavLink
                  to="/admin/comunidades"
                  onClick={() => setOpen(false)}
                  className={({ isActive }) =>
                    `block rounded-lg px-3 py-2 ${isActive ? "bg-slate-100 text-slate-900" : "text-slate-700 hover:bg-slate-50"}`
                  }
                >
                  Comunidades
                </NavLink>
              </>
            )}
          </nav>

          <div className="mt-6 p-3 border-t">
            <div className="mb-2 truncate text-slate-500 text-xs">{user.correo}</div>
            <button className="btn btn-outline w-full" onClick={handleLogout}>
              Cerrar sesión
            </button>
          </div>
        </div>
      </aside>
    </>
  );

  return (
    <>
      <HeaderBar />
      {/* Render fuera del header para que no quede “aplastado” */}
      <div className="md:hidden">
        <MobilePanel />
      </div>
    </>
  );
}
