import { Link } from "react-router-dom";

export default function SiteFooter() {
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

          <div>
            <h4 className="font-semibold text-slate-900">Producto</h4>
            <ul className="mt-3 space-y-2 text-sm">
              <li><Link to="/ofertas" className="hover:text-slate-900 text-slate-600">Planes</Link></li>
              <li><Link to="/como-funciona" className="hover:text-slate-900 text-slate-600">Cómo funciona</Link></li>
              <li><Link to="/nosotros" className="hover:text-slate-900 text-slate-600">Nosotros</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold text-slate-900">Soporte</h4>
            <ul className="mt-3 space-y-2 text-sm">
              <li><Link to="/contacto" className="hover:text-slate-900 text-slate-600">Contacto</Link></li>
              <li><a href="mailto:hola@telocambio.cl" className="hover:text-slate-900 text-slate-600">hola@telocambio.cl</a></li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold text-slate-900">Novedades</h4>
            <p className="mt-3 text-sm text-slate-600">Déjanos tu correo para enterarte de mejoras y lanzamientos.</p>
            <form className="mt-4 flex gap-2">
              <input type="email" placeholder="tu@correo.cl" className="input h-10" />
              <button className="btn-primary h-10 rounded-xl">Suscribirme</button>
            </form>
          </div>
        </div>

        <div className="mt-10 flex flex-col items-center justify-between gap-4 border-t border-slate-200 pt-6 text-sm text-slate-500 md:flex-row">
          <p>© {new Date().getFullYear()} TeLoCambio. Todos los derechos reservados.</p>
          <div className="flex gap-4">
            <a className="hover:text-slate-900" href="#">Términos</a>
            <a className="hover:text-slate-900" href="#">Privacidad</a>
          </div>
        </div>
      </div>
    </footer>
  );
}
