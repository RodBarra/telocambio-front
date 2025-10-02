export default function Ofertas() {
  const plans = [
    {
      name: "Básico",
      users: "Hasta 50 usuarios por comunidad",
      price: "29.990",
      highlight: false,
      color: "from-sky-50 to-white",
      ctaStyle: "btn-outline",
    },
    {
      name: "Medio",
      users: "Hasta 150 usuarios por comunidad",
      price: "59.990",
      highlight: true,
      color: "from-blue-50 to-white",
      ctaStyle:
        "w-full inline-flex items-center justify-center rounded-xl bg-gradient-to-r from-indigo-600 to-blue-600 px-4 py-2 text-sm font-semibold text-white shadow hover:from-indigo-700 hover:to-blue-700",
    },
    {
      name: "Grande",
      users: "Hasta 400 usuarios por comunidad",
      price: "119.990",
      highlight: false,
      color: "from-indigo-50 to-white",
      ctaStyle: "btn-outline",
    },
  ];

  const Feature = ({ children }: { children: React.ReactNode }) => (
    <li className="flex items-start gap-2">
      <span className="mt-1">✅</span>
      <span>{children}</span>
    </li>
  );

  return (
    <main>
      {/* HERO CON IMAGEN (más visible) */}
      <section className="relative overflow-hidden">
        <div
          className="absolute inset-0 -z-10 bg-cover bg-center"
          style={{ backgroundImage: "url('/hero-planes.jpg')" }}
          aria-hidden
        />
        {/* overlay: deja ver bien la foto */}
        <div className="absolute inset-0 -z-10 bg-gradient-to-b from-slate-900/35 via-white/10 to-white/92" aria-hidden />
        <div className="mx-auto max-w-7xl px-4 py-16">
          <div className="max-w-3xl">
            <h1 className="text-4xl font-extrabold tracking-tight text-slate-900">
              Planes para tu comunidad
            </h1>
            <p className="mt-3 text-lg text-slate-700">
              Elige el plan ideal. Todos incluyen autenticación por padrón,
              publicaciones internas, ofertas de intercambio y panel para
              moderadores. Precios en CLP <span className="text-slate-500">(+IVA)</span>.
            </p>
          </div>

          {/* TARJETAS */}
          <div className="mt-10 grid gap-6 md:grid-cols-3">
            {plans.map((p) => (
              <div
                key={p.name}
                className={[
                  "rounded-2xl border p-6 shadow-sm bg-gradient-to-b",
                  p.color,
                  p.highlight ? "ring-2 ring-blue-600 border-transparent" : "border-slate-200",
                ].join(" ")}
              >
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="text-2xl font-bold">{p.name}</h3>
                    {/* usuarios más grande y notorio */}
                    <p className="mt-1 text-[15px] text-slate-700">
                      <span className="inline-flex items-center rounded-full bg-slate-900/5 px-3 py-1 text-sm font-medium">
                        {p.users}
                      </span>
                    </p>
                  </div>
                  {p.highlight && (
                    <span className="text-xs rounded-full bg-blue-50 border border-blue-200 text-blue-700 px-2 py-0.5">
                      Recomendado
                    </span>
                  )}
                </div>

                <div className="mt-5">
                  <div className="flex items-end gap-1">
                    <span className="text-4xl font-extrabold text-slate-900">${p.price}</span>
                    <span className="mb-1 text-slate-500">/ mes</span>
                  </div>
                </div>

                <ul className="mt-5 space-y-2 text-sm text-slate-700">
                  <Feature>Acceso seguro por padrón y rol</Feature>
                  <Feature>Publicaciones internas por comunidad</Feature>
                  <Feature>Ofertas de intercambio y negociación</Feature>
                  <Feature>Panel de moderación</Feature>
                  <Feature>Soporte por email en horario hábil</Feature>
                </ul>

                <button
                  className={["w-full mt-6", p.ctaStyle].join(" ")}
                  aria-label={`Contratar plan ${p.name}`}
                >
                  Contratar
                </button>

                <p className="mt-3 text-xs text-slate-500">
                  Sin permanencia. Cancela cuando quieras.
                </p>
              </div>
            ))}
          </div>

          {/* FRANJA COMPARATIVA */}
          <div className="mt-12 rounded-2xl bg-white/80 backdrop-blur border border-slate-200 p-6">
            <h2 className="text-lg font-semibold">Comparativa rápida</h2>
            <div className="mt-4 grid gap-4 sm:grid-cols-3">
              <div className="rounded-xl border border-slate-200 p-4">
                <div className="text-sm text-slate-500">Usuarios activos</div>
                <div className="mt-1 text-2xl font-bold">50 / 150 / 400</div>
              </div>
              <div className="rounded-xl border border-slate-200 p-4">
                <div className="text-sm text-slate-500">Soporte</div>
                <div className="mt-1 text-2xl font-bold">Email</div>
                <div className="text-xs text-slate-500">Prioridad mayor en plan Grande</div>
              </div>
              <div className="rounded-xl border border-slate-200 p-4">
                <div className="text-sm text-slate-500">Funciones</div>
                <div className="mt-1 text-2xl font-bold">Completas</div>
                <div className="text-xs text-slate-500">Todas las funciones en todos los planes</div>
              </div>
            </div>
          </div>

          {/* ADD-ONS */}
          <div className="mt-12 rounded-2xl border border-slate-200 bg-white/90 backdrop-blur p-6">
            <h2 className="text-lg font-semibold">Add-ons opcionales</h2>
            <div className="mt-4 grid gap-4 md:grid-cols-3">
              <div className="rounded-xl border border-slate-200 p-4 bg-sky-50/60">
                <div className="font-medium">Setup inicial</div>
                <div className="text-slate-600 text-sm">Pago único</div>
                <div className="mt-1 text-slate-900 font-semibold">$49.990</div>
              </div>
              <div className="rounded-xl border border-slate-200 p-4 bg-blue-50/60">
                <div className="font-medium">Reportes avanzados</div>
                <div className="text-slate-600 text-sm">Métricas y exportaciones</div>
                <div className="mt-1 text-slate-900 font-semibold">$9.990 / mes</div>
              </div>
              <div className="rounded-xl border border-slate-200 p-4 bg-indigo-50/60">
                <div className="font-medium">Moderación asistida</div>
                <div className="text-slate-600 text-sm">Revisión de contenido</div>
                <div className="mt-1 text-slate-900 font-semibold">$24.990 / mes</div>
              </div>
            </div>
            <p className="mt-4 text-sm text-slate-600">
              Anuncios internos (comercios): a definir según volumen y alcance.
            </p>
          </div>

          {/* FAQ */}
          <div className="mt-12 grid gap-6 md:grid-cols-2">
            <div className="rounded-2xl border border-slate-200 bg-white p-6">
              <h3 className="font-semibold">¿Cómo se cuentan los usuarios?</h3>
              <p className="mt-2 text-sm text-slate-600">
                Se consideran usuarios activos de una comunidad durante el mes. Si superan el
                límite del plan elegido, puedes subir de plan en cualquier momento.
              </p>
            </div>
            <div className="rounded-2xl border border-slate-200 bg-white p-6">
              <h3 className="font-semibold">¿Hay permanencia mínima?</h3>
              <p className="mt-2 text-sm text-slate-600">
                No. Puedes cancelar cuando quieras. El cobro es mes a mes, por comunidad.
              </p>
            </div>
          </div>

          {/* CTA FINAL */}
          <div className="mt-12 rounded-2xl border border-indigo-200 bg-gradient-to-r from-indigo-50 to-blue-50 p-6">
            <div className="flex flex-col items-start gap-4 md:flex-row md:items-center md:justify-between">
              <div>
                <h3 className="text-xl font-semibold text-slate-900">
                  ¿Listo para comenzar en tu comunidad?
                </h3>
                <p className="text-slate-600">
                  Te ayudamos con el setup inicial y la carga del padrón.
                </p>
              </div>
              <a
                href="/contacto"
                className="inline-flex items-center rounded-xl bg-indigo-600 px-5 py-3 text-sm font-semibold text-white shadow hover:bg-indigo-700"
              >
                Hablar con ventas
              </a>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
