import { Link, NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useEffect, useRef, useState } from "react";

export default function Navbar() {
  const { user, logout } = useAuth();
  const nav = useNavigate();
  const [open, setOpen] = useState(false);
  const panelRef = useRef<HTMLDivElement>(null);

  // Sin usuario → no renderizar navbar privado
  if (!user) return null;

  const isAdmin = user.rol_usuario_id === 1;
  const isMod = user.rol_usuario_id === 2;
  // const isRes = user.rol_usuario_id === 3; // por si lo usas luego

  // Cerrar con click fuera y con ESC
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

  // Bloquear scroll cuando el panel está abierto
  useEffect(() => {
    const cls = "overflow-hidden";
    if (open) document.documentElement.classList.add(cls), document.body.classList.add(cls);
    else document.documentElement.classList.remove(cls), document.body.classList.remove(cls);
    return () => {
      document.documentElement.classList.remove(cls);
      document.body.classList.remove(cls);
    };
  }, [open]);

  const handleLogout = () => {
    logout();
    nav("/login");
  };

  // Ítem con subrayado animado como el público
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
      <Item to="/dashboard">Inicio</Item>

      {/* Marketplace para todos los roles autenticados */}
      <Item to="/publicaciones">Publicaciones</Item>

      {(isMod || isAdmin) && <Item to="/mod/usuarios">Usuarios</Item>}
      {isMod && <Item to="/mod/padron">Padrón</Item>}
      {isAdmin && <Item to="/admin/comunidades">Comunidades</Item>}
    </div>
  );

  return (
    <>
      {/* Header / Desktop */}
      <header className="sticky top-0 z-40 border-b border-slate-200 bg-white/80 backdrop-blur supports-[backdrop-filter]:bg-white/60">
        <nav className="mx-auto max-w-7xl h-16 px-4 flex items-center justify-between">
          {/* Izquierda: burger + logo */}
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

            {/* Solo logo (sin texto TeLoCambio) */}
            <Link to="/dashboard" className="flex items-center gap-3">
              <img src="/logo-telocambio.png" alt="TeLoCambio" className="h-8" />
            </Link>

            <NavItemsDesktop />
          </div>

          {/* Derecha: email + cerrar sesión */}
          <div className="flex items-center gap-3">
            <span
              className="hidden sm:block max-w-[28ch] truncate text-xs text-slate-600"
              title={user.correo}
            >
              {user.correo}
            </span>
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
        {/* Top dentro del panel */}
        <div className="sticky top-0 h-16 flex items-center justify-between px-4 border-b bg-white">
          <Link to="/dashboard" className="flex items-center gap-3" onClick={() => setOpen(false)}>
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

        {/* Enlaces */}
        <div className="h-[calc(100vh-64px)] overflow-y-auto">
          <nav className="p-3 space-y-1 text-sm">
            <NavLink
              to="/dashboard"
              onClick={() => setOpen(false)}
              className={({ isActive }) =>
                `block rounded-lg px-3 py-2 ${
                  isActive ? "bg-slate-100 text-slate-900" : "text-slate-700 hover:bg-slate-50"
                }`
              }
            >
              Inicio
            </NavLink>

            {/* Marketplace (mobile) */}
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

            {(isMod || isAdmin) && (
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
            )}

            {isMod && (
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
            )}

            {isAdmin && (
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
}
