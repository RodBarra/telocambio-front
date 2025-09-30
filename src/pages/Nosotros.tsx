export default function Nosotros() {
  const Value = ({
    title,
    text,
    icon,
  }: {
    title: string;
    text: string;
    icon: string;
  }) => (
    <div className="rounded-2xl border border-slate-200 bg-white p-6">
      <div className="text-2xl">{icon}</div>
      <h3 className="mt-3 text-lg font-semibold">{title}</h3>
      <p className="mt-2 text-slate-600 text-sm">{text}</p>
    </div>
  );

  const Stat = ({ kpi, label }: { kpi: string; label: string }) => (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 text-center">
      <div className="text-3xl font-extrabold tracking-tight">{kpi}</div>
      <div className="mt-1 text-slate-600 text-sm">{label}</div>
    </div>
  );

  const Step = ({
    n,
    title,
    text,
  }: {
    n: number;
    title: string;
    text: string;
  }) => (
    <div className="relative rounded-2xl border border-slate-200 bg-white p-6">
      <div className="absolute -top-3 -left-3 rounded-full bg-indigo-600 px-3 py-1 text-xs font-semibold text-white shadow">
        Paso {n}
      </div>
      <h4 className="text-base font-semibold">{title}</h4>
      <p className="mt-2 text-sm text-slate-600">{text}</p>
    </div>
  );

  return (
    <main>
      {/* HERO */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 -z-10 bg-gradient-to-b from-sky-50 to-white" aria-hidden />
        <div className="mx-auto max-w-7xl px-4 py-16 grid gap-10 md:grid-cols-2 items-center">
          <div>
            <h1 className="text-4xl font-extrabold tracking-tight text-slate-900">
              Intercambios simples y seguros dentro de tu comunidad
            </h1>
            <p className="mt-4 text-lg text-slate-700">
              En <span className="font-semibold">TeLoCambio</span> ayudamos a
              condominios y edificios a reutilizar, donar e{" "}
              <span className="font-semibold">intercambiar</span> bienes y
              servicios de forma interna y confiable. La experiencia está
              diseñada para vecinos, administraciones y comités.
            </p>

            <div className="mt-6 grid gap-3 text-sm">
              <div className="rounded-xl border border-slate-200 bg-white p-4">
                🔒 Accesos por padrón y roles (Admin / Moderador / Residente).
              </div>
              <div className="rounded-xl border border-slate-200 bg-white p-4">
                🔄 Publicaciones internas, ofertas y negociación por comunidad.
              </div>
              <div className="rounded-xl border border-slate-200 bg-white p-4">
                🧭 Herramientas de moderación y reportes para la administración.
              </div>
            </div>

            <div className="mt-8 flex flex-wrap gap-3">
              <a
                href="/ofertas"
                className="inline-flex items-center rounded-xl bg-indigo-600 px-5 py-3 text-sm font-semibold text-white shadow hover:bg-indigo-700"
              >
                Ver planes
              </a>
              <a
                href="/contacto"
                className="inline-flex items-center rounded-xl border border-slate-300 bg-white px-5 py-3 text-sm font-semibold text-slate-700 hover:bg-slate-50"
              >
                Hablar con nosotros
              </a>
            </div>
          </div>

          <div className="relative">
            <div className="rounded-2xl overflow-hidden shadow-xl ring-1 ring-white/60">
              <img
                src="/about-hero.jpg"
                alt="Vecinos interactuando en la comunidad"
                className="w-full h-[420px] object-cover"
              />
            </div>
            <div className="pointer-events-none absolute -inset-4 -z-10 rounded-[28px] bg-gradient-to-r from-indigo-200/40 to-sky-200/40 blur-2xl" />
          </div>
        </div>
      </section>

      {/* MÉTRICAS */}
      <section className="mx-auto max-w-7xl px-4 pb-4">
        <div className="grid gap-4 sm:grid-cols-3">
          <Stat kpi="100% interno" label="Intercambios solo entre vecinos" />
          <Stat kpi="Roles & Padrón" label="Acceso seguro por comunidad" />
          <Stat kpi="Soporte hábil" label="Acompañamiento por email" />
        </div>
      </section>

      {/* VALORES */}
      <section className="mx-auto max-w-7xl px-4 py-12">
        <h2 className="text-xl font-semibold">Nuestros valores</h2>
        <div className="mt-6 grid gap-6 md:grid-cols-3">
          <Value
            icon="🤝"
            title="Confianza"
            text="Identidad validada por padrón y reglas claras para una comunidad segura."
          />
          <Value
            icon="🌱"
            title="Reutilización"
            text="Impulsamos la economía circular dentro del edificio o condominio."
          />
          <Value
            icon="⚡"
            title="Simpleza"
            text="Publica, negocia y acuerda—todo en un flujo pensado para personas ocupadas."
          />
        </div>
      </section>

      {/* CÓMO TRABAJAMOS / TIMELINE */}
      <section className="relative overflow-hidden">
        <div
          className="absolute inset-0 -z-10 bg-gradient-to-b from-white to-indigo-50"
          aria-hidden
        />
        <div className="mx-auto max-w-7xl px-4 py-12">
          <h2 className="text-xl font-semibold">Cómo trabajamos con tu comunidad</h2>
          <div className="mt-6 grid gap-6 md:grid-cols-4">
            <Step
              n={1}
              title="Onboarding"
              text="Activamos tu comunidad, configuramos roles e importamos el padrón."
            />
            <Step
              n={2}
              title="Lanzamiento"
              text="Comunicamos a los residentes y entregamos el código de comunidad."
            />
            <Step
              n={3}
              title="Adopción"
              text="Publicaciones internas, ofertas y negociación guiada por el moderador."
            />
            <Step
              n={4}
              title="Mejora continua"
              text="Reportes, buenas prácticas y soporte para mantener el ecosistema vivo."
            />
          </div>
        </div>
      </section>

      {/* EQUIPO / SOPORTE */}
      <section className="mx-auto max-w-7xl px-4 py-12">
        <div className="grid gap-8 md:grid-cols-2 items-center">
          <div className="rounded-2xl overflow-hidden shadow-xl border border-slate-200">
            <img
              src="/about-team.jpg"
              alt="Equipo de soporte"
              className="w-full h-[380px] object-cover"
            />
          </div>
          <div>
            <h3 className="text-2xl font-bold tracking-tight">
              Soporte cercano y enfoque en comunidades
            </h3>
            <p className="mt-3 text-slate-700">
              Nuestro equipo acompaña a administradores y moderadores en todo el
              proceso. Configuramos el padrón, resolvemos dudas y compartimos
              buenas prácticas para que los vecinos adopten la plataforma.
            </p>
            <ul className="mt-4 space-y-2 text-sm text-slate-700">
              <li>✅ Setup inicial opcional</li>
              <li>✅ Guías de comunicación para residentes</li>
              <li>✅ Reportes y recomendaciones trimestrales</li>
            </ul>
            <a
              href="/contacto"
              className="mt-6 inline-flex items-center rounded-xl bg-indigo-600 px-5 py-3 text-sm font-semibold text-white shadow hover:bg-indigo-700"
            >
              Hablemos
            </a>
          </div>
        </div>
      </section>

      {/* CTA FINAL */}
      <section className="mx-auto max-w-7xl px-4 pb-16">
        <div className="rounded-2xl border border-indigo-200 bg-gradient-to-r from-indigo-50 to-blue-50 p-6">
          <div className="flex flex-col items-start gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <h3 className="text-xl font-semibold text-slate-900">
                ¿Listos para potenciar tu comunidad?
              </h3>
              <p className="text-slate-600">
                Comienza con un plan y te ayudamos con el onboarding.
              </p>
            </div>
            <div className="flex gap-3">
              <a
                href="/ofertas"
                className="inline-flex items-center rounded-xl border border-slate-300 bg-white px-5 py-3 text-sm font-semibold text-slate-700 hover:bg-slate-50"
              >
                Ver planes
              </a>
              <a
                href="/contacto"
                className="inline-flex items-center rounded-xl bg-indigo-600 px-5 py-3 text-sm font-semibold text-white shadow hover:bg-indigo-700"
              >
                Contacto
              </a>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
