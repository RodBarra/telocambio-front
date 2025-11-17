import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

// Componente reutilizable para los enlaces
const FooterLink = ({ to, children }: { to: string; children: React.ReactNode }) => (
  <li>
    <Link 
      to={to} 
      className="block px-2 py-1 rounded-md text-slate-600 hover:bg-blue-100 hover:text-blue-700 transition-colors"
    >
      {children}
    </Link>
  </li>
);

export default function SiteFooter() {
  const { user } = useAuth();

  // Determinamos los roles (si el usuario existe)
  const isAdmin = user?.rol_usuario_id === 1;
  const isMod   = user?.rol_usuario_id === 2;
  const isRes   = user?.rol_usuario_id === 3;

  return (
    <footer className="relative mt-0 bg-gradient-to-b from-white to-slate-50">
      {/* línea decorativa */}
      <div className="h-1 w-full bg-gradient-to-r from-indigo-500 via-sky-500 to-emerald-400" />

      <div className="mx-auto max-w-7xl px-4 py-12">
        <div className="grid gap-10 md:grid-cols-4">
          <div>
            <div className="flex items-center gap-2">
              <img src="/logo-telocambio.png" alt="TeLoCambio" className="h-7" />
            </div>
            <p className="mt-3 text-sm text-slate-600 max-w-xs">
              Intercambios seguros dentro de tu edificio o condominio.
            </p>
          </div>

          {/* --- INICIO DE LA MODIFICACIÓN (LÓGICA CONDICIONAL) --- */}

          {/* CASO 1: Usuario LOGUEADO (Admin, Mod, Res) */}
          {user && (
            <div>
              <h4 className="font-semibold text-slate-900">Navegación</h4>
              <ul className="mt-3 space-y-1 text-sm">
                {isAdmin && (
                  <>
                    <FooterLink to="/mod/usuarios">Usuarios</FooterLink>
                    <FooterLink to="/admin/comunidades">Comunidades</FooterLink>
                  </>
                )}
                {isMod && (
                  <>
                    <FooterLink to="/publicaciones">Publicaciones</FooterLink>
                    <FooterLink to="/intercambios">Intercambios</FooterLink>
                    <FooterLink to="/mod/usuarios">Usuarios</FooterLink>
                    <FooterLink to="/mod/padron">Padrón</FooterLink>
                  </>
                )}
                {isRes && (
                  <>
                    <FooterLink to="/publicaciones">Publicaciones</FooterLink>
                    <FooterLink to="/intercambios">Intercambios</FooterLink>
                  </>
                )}
              </ul>
            </div>
          )}

          {/* CASO 2: Usuario NO LOGUEADO (Público) */}
          {!user && (
            <div>
              <h4 className="font-semibold text-slate-900">Producto</h4>
              <ul className="mt-3 space-y-1 text-sm">
                <FooterLink to="/ofertas">Planes</FooterLink>
                <FooterLink to="/como-funciona">Cómo funciona</FooterLink>
                <FooterLink to="/nosotros">Nosotros</FooterLink>
                <FooterLink to="/contacto">Contacto</FooterLink>
              </ul>
            </div>
          )}
          {/* --- FIN DE LA MODIFICACIÓN --- */}

          <div>
            <h4 className="font-semibold text-slate-900">Soporte</h4>
            <ul className="mt-3 space-y-1 text-sm">
              <li>

              </li>
              <li>
                <a 
                  href="mailto:hola@telocambio.cl" 
                  className="block px-2 py-1 rounded-md text-slate-600 hover:bg-blue-100 hover:text-blue-700 transition-colors"
                >
                  hola@telocambio.cl
                </a>
              </li>
            </ul>
          </div>

          {/* --- INICIO DE LA MODIFICACIÓN (Ocultar Novedades si está logueado) --- */}
          {!user ? (
            <div>
              <h4 className="font-semibold text-slate-900">Novedades</h4>
              <p className="mt-3 text-sm text-slate-600">Déjanos tu correo para enterarte de mejoras y lanzamientos.</p>
              <form className="mt-4 flex gap-2">
                <input type="email" placeholder="tu@correo.cl" className="input h-10" />
                <button 
                  type="submit"
                  className="btn bg-white text-blue-500 border border-blue-500 hover:bg-blue-500 hover:text-white transition-colors h-10 rounded-xl px-4 text-sm"
                >
                  Suscribirme
                </button>
              </form>
            </div>
          ) : (
            <div>
              <h4 className="font-semibold text-slate-900">Comunidad</h4>
              <p className="mt-3 text-sm text-slate-600">
                Fomentando la economía circular y la confianza entre vecinos.
              </p>
            </div>
          )}
          {/* --- FIN DE LA MODIFICACIÓN --- */}

        </div>

        <div className="mt-10 flex flex-col items-center justify-between gap-4 border-t border-slate-200 pt-6 text-sm text-slate-500 md:flex-row">
          <p>© {new Date().getFullYear()} TeLoCambio. Todos los derechos reservados.</p>
          
          <div className="flex gap-4">
            <a className="text-slate-500 hover:text-blue-600 hover:underline transition-colors" href="#">Términos</a>
            <a className="text-slate-500 hover:text-blue-600 hover:underline transition-colors" href="#">Privacidad</a>
          </div>
        </div>
      </div>
    </footer>
  );
}