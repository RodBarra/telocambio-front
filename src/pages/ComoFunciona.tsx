// src/pages/ComoFunciona.tsx
function Step({
  n,
  title,
  children,
}: {
  n: number;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="relative pl-8">
      {/* Línea y pin a la izquierda */}
      <div className="absolute left-0 top-0 h-full w-px bg-indigo-700/40" aria-hidden />
      <div className="absolute -left-[9px] top-2 h-4 w-4 rounded-full bg-indigo-500 ring-4 ring-slate-900" aria-hidden />
      {/* Card */}
      <div className="rounded-2xl bg-slate-800/80 border border-slate-700 shadow-sm p-5">
        <div className="flex items-center gap-2 text-xs font-semibold">
          <span className="inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-indigo-200/10 px-2 text-indigo-300">
            {n}
          </span>
          <span className="text-indigo-300">Paso {n}</span>
        </div>
        <h3 className="mt-1 font-semibold tracking-tight text-white">{title}</h3>
        <p className="text-slate-300 text-sm mt-2 leading-relaxed">{children}</p>
      </div>
    </div>
  );
}

export default function ComoFunciona() {
  return (
    <main className="bg-slate-900 text-slate-100">
      {/* ========================== HERO ========================== */}
      <section className="relative overflow-hidden">
        {/* imagen opcional (puedes cambiarla o quitarla) */}
        <div
          className="absolute inset-0 -z-10 bg-cover bg-center opacity-20"
          style={{ backgroundImage: "url('/process-hero.jpg')" }}
          aria-hidden
        />
        {/* degradé para reforzar el contraste */}
        <div
          className="absolute inset-0 -z-10 bg-gradient-to-b from-slate-900 via-slate-900/95 to-slate-900"
          aria-hidden
        />
        {/* brillo radial muy sutil */}
        <div
          className="absolute -z-10 left-1/2 top-1/2 h-[900px] w-[900px] -translate-x-1/2 -translate-y-1/2 rounded-full opacity-30 blur-3xl"
          style={{
            background:
              "radial-gradient(50% 50% at 50% 50%, rgba(99,102,241,0.25) 0%, rgba(2,6,23,0) 60%)",
          }}
          aria-hidden
        />

        <div className="mx-auto max-w-6xl px-4 py-16">
          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-2 rounded-full border border-indigo-700/40 bg-slate-800/60 px-3 py-1 text-xs font-medium text-indigo-200">
              <span>🔒 Acceso por padrón y código</span>
              <span className="h-1 w-1 rounded-full bg-indigo-500/50" />
              <span>🏢 Hecho para comunidades</span>
            </div>
            <h1 className="mt-4 text-4xl font-extrabold tracking-tight">
              Cómo funciona <span className="text-indigo-400">TeLoCambio</span>
            </h1>
            <p className="mt-4 text-lg text-slate-300">
              De la activación de la comunidad al intercambio presencial entre vecinos.
              Claro, seguro y 100% interno.
            </p>
            <div className="mt-6 flex gap-3">
              <a
                href="/ofertas"
                className="inline-flex items-center rounded-xl bg-indigo-600 px-5 py-3 text-sm font-semibold text-white shadow hover:bg-indigo-500"
              >
                Ver planes
              </a>
              <a
                href="/contacto"
                className="inline-flex items-center rounded-xl border border-slate-700 bg-slate-800 px-5 py-3 text-sm font-semibold text-slate-200 hover:bg-slate-800/70"
              >
                Hablar con nosotros
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* ============== TIMELINE: 1 COLUMNA, ANCHA, CENTRADA ============== */}
      <section className="relative">
        <div className="mx-auto max-w-3xl px-4 py-12">
          <h2 className="text-xl font-semibold text-white">Paso a paso</h2>
          <p className="mt-2 text-slate-300">
            Un flujo simple para admins, moderadores y residentes.
          </p>

          {/* Columna única: cards apiladas y anchas */}
          <div className="mt-10 space-y-6">
            <Step n={1} title="Contratación del plan">
              La administración elige el plan (Básico, Medio o Grande) según el número de
              usuarios activos. Habilitamos la comunidad y entregamos acceso al panel.
            </Step>

            <Step n={2} title="Padrón y código de comunidad">
              El moderador carga correos autorizados (manual o importación) y comparte el{" "}
              <strong className="text-slate-100">código de comunidad</strong> por canales internos.
            </Step>

            <Step n={3} title="Registro del residente">
              Cada vecino crea su cuenta con el correo del padrón y el código, agrega datos de
              vivienda y contacto. Validación automática de pertenencia.
            </Step>

            <Step n={4} title="Publicar y descubrir">
              Publicaciones de objetos/servicios con fotos y estado (nuevo, usado, con detalles).
              El feed es **solo** de tu comunidad.
            </Step>

            <Step n={5} title="Ofertas y negociación">
              Ofrece una publicación propia por otra, conversa en el hilo, contraoferta y acuerda
              la alternativa que más te convenga.
            </Step>

            <Step n={6} title="Moderación y convivencia">
              El moderador define reglas, puede pausar/ocultar publicaciones y ver métricas de
              participación para mantener una sana convivencia.
            </Step>

            <Step n={7} title="Acuerdo e intercambio presencial">
              Coordinen el encuentro en zonas comunes. Recomendamos revisar el estado del artículo
              y concretar con cordialidad.
            </Step>
          </div>
        </div>
      </section>

      {/* ============== BLOQUE DE BUENAS PRÁCTICAS (oscuro total) ============== */}
      <section className="border-t border-slate-800">
        <div className="mx-auto max-w-6xl px-4 py-14">
          <h3 className="text-xl font-semibold text-white">
            Buenas prácticas de seguridad
          </h3>
          <p className="mt-2 text-slate-300 max-w-3xl">
            Recomendaciones para un intercambio seguro y agradable entre vecinos.
          </p>
          <div className="mt-6 grid gap-4 md:grid-cols-3">
            <div className="rounded-xl border border-slate-700 bg-slate-800 p-5 text-slate-200">
              🤝 Intercambia en zonas comunes y, si puedes, avisa al conserje.
            </div>
            <div className="rounded-xl border border-slate-700 bg-slate-800 p-5 text-slate-200">
              🖼️ Sube fotos reales y describe el estado con honestidad.
            </div>
            <div className="rounded-xl border border-slate-700 bg-slate-800 p-5 text-slate-200">
              🧾 Deja registro del acuerdo (fecha, lugar y condiciones) en la conversación.
            </div>
          </div>
        </div>
      </section>

      {/* ========================= CTA FINAL ========================= */}
      <section className="border-t border-slate-800">
        <div className="mx-auto max-w-6xl px-4 py-14">
          <div className="rounded-2xl border border-indigo-800/50 bg-gradient-to-r from-indigo-900/40 to-slate-800 p-6">
            <div className="flex flex-col items-start gap-4 md:flex-row md:items-center md:justify-between">
              <div>
                <h3 className="text-xl font-semibold text-white">
                  ¿Listos para empezar?
                </h3>
                <p className="text-slate-300">
                  Activa tu comunidad en minutos y promueve la reutilización segura entre vecinos.
                </p>
              </div>
              <div className="flex gap-3">
                <a
                  href="/ofertas"
                  className="inline-flex items-center rounded-xl bg-indigo-600 px-5 py-3 text-sm font-semibold text-white shadow hover:bg-indigo-500"
                >
                  Ver planes
                </a>
                <a
                  href="/contacto"
                  className="inline-flex items-center rounded-xl border border-slate-700 bg-slate-800 px-5 py-3 text-sm font-semibold text-slate-200 hover:bg-slate-800/70"
                >
                  Hablar con nosotros
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
