// src/pages/ComoFunciona.tsx - VERSIÓN FINAL CON HOVER EN PASOS

// --- COMPONENTE STEP CON EFECTO HOVER ---
function Step({
  n,
  title,
  icon,
  direction,
  children,
}: {
  n: number;
  title: string;
  icon: React.ReactNode;
  direction: "left" | "right";
  children: React.ReactNode;
}) {
  const isRight = direction === "right";
  return (
    // Añadimos la clase 'group' para habilitar el hover en los elementos hijos
    <div className="grid grid-cols-1 md:grid-cols-[1fr_auto_1fr] items-start gap-6 md:gap-8 group">
      {/* Contenido */}
      <div className={isRight ? "md:order-3 text-left" : "md:order-1 md:text-right"}>
        <p className="text-sm font-semibold text-indigo-600">Paso {n}</p>
        {/* El título cambia de color al hacer hover en el 'group' */}
        <h3 className="mt-1 text-xl font-bold tracking-tight text-slate-900 transition-colors group-hover:text-indigo-600">
          {title}
        </h3>
        <p className="mt-2 text-slate-600 leading-relaxed">{children}</p>
      </div>

      {/* Timeline con colores claros */}
      <div className="order-first md:order-2 row-span-2 hidden h-full flex-col items-center md:flex">
        {/* El círculo cambia de color al hacer hover en el 'group' */}
        <div className="flex h-16 w-16 flex-shrink-0 items-center justify-center rounded-full bg-white ring-8 ring-gray-50 transition-colors group-hover:bg-indigo-100">
          {icon}
        </div>
        <div className="h-full w-0.5 bg-slate-200" />
      </div>
      
      <div className={isRight ? "md:order-1" : "md:order-3"} />
    </div>
  );
}

export default function ComoFunciona() {
  const steps = [
    { title: "Contratación del plan", icon: <svg className="h-8 w-8 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" /></svg>, content: "La administración elige el plan (Básico, Medio o Grande) según el número de usuarios activos. Habilitamos la comunidad y entregamos acceso al panel." },
    { title: "Padrón y código de comunidad", icon: <svg className="h-8 w-8 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-4.663l.005-.004c.285.342.55.715.785 1.118M15 19.128a9.37 9.37 0 00-7.125-3.472M6.375 15a9.37 9.37 0 01-4.125-3.472A9.337 9.337 0 012.25 8.25c0-2.331.645-4.512 1.766-6.374m12.374 0c1.121 1.862 1.766 4.043 1.766 6.374s-.645 4.512-1.766 6.374M3.404 15a9.37 9.37 0 010-6.254" /></svg>, content: "El moderador carga correos autorizados (manual o importación) y comparte el código de comunidad por canales internos." },
    { title: "Registro del residente", icon: <svg className="h-8 w-8 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" /></svg>, content: "Cada vecino crea su cuenta con el correo del padrón y el código, agrega datos de vivienda y contacto. Validación automática de pertenencia." },
    { title: "Publicar y descubrir", icon: <svg className="h-8 w-8 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 10.5v6m3-3H9m4.06-7.19l-2.12-2.12a1.5 1.5 0 00-1.061-.44H4.5A2.25 2.25 0 002.25 6v12a2.25 2.25 0 002.25 2.25h15A2.25 2.25 0 0021.75 18V9a2.25 2.25 0 00-2.25-2.25h-5.379a1.5 1.5 0 01-1.06-.44z" /></svg>, content: "Publicaciones de objetos/servicios con fotos y estado (nuevo, usado, con detalles). El feed es solo de tu comunidad." },
    { title: "Ofertas y negociación", icon: <svg className="h-8 w-8 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7.5 21L3 16.5M3 16.5L7.5 12M3 16.5H16.5M16.5 3L21 7.5M21 7.5L16.5 12M21 7.5H7.5" /></svg>, content: "Ofrece una publicación propia por otra, conversa en el hilo, contraoferta y acuerda la alternativa que más te convenga." },
    { title: "Moderación y convivencia", icon: <svg className="h-8 w-8 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.6-3.751A11.959 11.959 0 0112 2.714z" /></svg>, content: "El moderador define reglas, puede pausar/ocultar publicaciones y ver métricas de participación para mantener una sana convivencia." },
    { title: "Acuerdo e intercambio presencial", icon: <svg className="h-8 w-8 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M18 18.72a9.094 9.094 0 003.741-.479 3 3 0 00-4.682-2.72m-7.5-2.962c.57-1.023 1.535-1.85 2.7-2.506C13.174 10.022 14.53 9.75 16 9.75c1.47 0 2.826.272 4.006.805M17.25 7.5a.75.75 0 01.75.75v.008c0 .414-.336.75-.75.75h-.008a.75.75 0 01-.75-.75v-.008c0-.414.336.75.75-.75z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 9a3.75 3.75 0 100 7.5A3.75 3.75 0 0012 9zM6.375 12a5.625 5.625 0 1111.25 0 5.625 5.625 0 01-11.25 0z" /></svg>, content: "Coordinen el encuentro en zonas comunes. Recomendamos revisar el estado del artículo y concretar con cordialidad." },
  ];

  return (
    <main>
      <section className="relative overflow-hidden bg-white">
        <div
          className="absolute inset-0 -z-10 bg-cover bg-center opacity-10 saturate-0"
          style={{ backgroundImage: "url('/condominio.png')" }}
          aria-hidden
        />
        <div
          className="absolute inset-0 -z-10 bg-gradient-to-b from-white via-white/95 to-white"
          aria-hidden
        />
        <div
          className="absolute -z-10 left-1/2 top-1/2 h-[900px] w-[900px] -translate-x-1/2 -translate-y-1/2 rounded-full opacity-10 blur-3xl"
          style={{
            background:
              "radial-gradient(50% 50% at 50% 50%, rgba(99,102,241,0.25) 0%, rgba(255,255,255,0) 60%)",
          }}
          aria-hidden
        />
        <div className="mx-auto max-w-6xl px-4 py-16">
          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-xs font-medium text-indigo-600">
              <span>🔒 Acceso por padrón y código</span>
              <span className="h-1 w-1 rounded-full bg-indigo-400/50" />
              <span>🏢 Hecho para comunidades</span>
            </div>
            <h1 className="mt-4 text-4xl font-extrabold tracking-tight text-slate-900">
              Cómo funciona <span className="text-indigo-600">TeLoCambio</span>
            </h1>
            <p className="mt-4 text-lg text-slate-600">
              De la activación de la comunidad al intercambio presencial entre vecinos.
              Claro, seguro y 100% interno.
            </p>
            <div className="mt-6 flex gap-3">
              <a
                href="/ofertas"
                className="inline-flex items-center rounded-xl bg-indigo-600 px-5 py-3 text-sm font-semibold text-white shadow transition-colors hover:bg-indigo-700"
              >
                Ver planes
              </a>
              <a
                href="/contacto"
                className="inline-flex items-center rounded-xl border border-slate-300 bg-transparent px-5 py-3 text-sm font-semibold text-slate-700 transition-colors hover:bg-indigo-600 hover:text-white hover:border-indigo-600"
              >
                Hablar con nosotros
              </a>
            </div>
          </div>
        </div>
      </section>

      <section className="relative bg-gray-50 py-16">
        <div className="mx-auto max-w-5xl px-4">
          <div className="text-center">
            <h2 className="text-3xl font-extrabold text-slate-900">Paso a paso</h2>
            <p className="mx-auto mt-4 max-w-2xl text-lg text-slate-600">
              Un flujo simple para admins, moderadores y residentes.
            </p>
          </div>
          <div className="mt-16 flex flex-col gap-8">
            {steps.map((step, index) => (
              <Step
                key={step.title}
                n={index + 1}
                title={step.title}
                icon={step.icon}
                direction={index % 2 === 0 ? "right" : "left"}
              >
                {step.content}
              </Step>
            ))}
          </div>
        </div>
      </section>
      
      <section className="border-t border-slate-200 bg-white">
        <div className="mx-auto max-w-6xl px-4 py-14">
          <h3 className="text-xl font-semibold text-slate-900">
            Buenas prácticas de seguridad
          </h3>
          <p className="mt-2 text-slate-600 max-w-3xl">
            Recomendaciones para un intercambio seguro y agradable entre vecinos.
          </p>
          <div className="mt-6 grid gap-4 md:grid-cols-3">
            <div className="rounded-xl border border-slate-200 bg-slate-50 p-5 text-slate-700">
              🤝 Intercambia en zonas comunes y, si puedes, avisa al conserje.
            </div>
            <div className="rounded-xl border border-slate-200 bg-slate-50 p-5 text-slate-700">
              🖼️ Sube fotos reales y describe el estado con honestidad.
            </div>
            <div className="rounded-xl border border-slate-200 bg-slate-50 p-5 text-slate-700">
              🧾 Deja registro del acuerdo (fecha, lugar y condiciones) en la conversación.
            </div>
          </div>
        </div>
      </section>

      <section className="border-t border-slate-200 bg-gray-50">
        <div className="mx-auto max-w-6xl px-4 py-14">
          <div className="rounded-2xl border border-indigo-200 bg-gradient-to-r from-indigo-50 to-blue-50 p-6">
            <div className="flex flex-col items-start gap-4 md:flex-row md:items-center md:justify-between">
              <div>
                <h3 className="text-xl font-semibold text-slate-900">
                  ¿Listos para empezar?
                </h3>
                <p className="text-slate-600">
                  Activa tu comunidad en minutos y promueve la reutilización segura entre vecinos.
                </p>
              </div>
              <div className="flex gap-3">
                <a
                  href="/ofertas"
                  className="inline-flex items-center rounded-xl bg-indigo-600 px-5 py-3 text-sm font-semibold text-white shadow transition-colors hover:bg-indigo-700"
                >
                  Ver planes
                </a>
                <a
                  href="/contacto"
                  className="inline-flex items-center rounded-xl border border-slate-300 bg-transparent px-5 py-3 text-sm font-semibold text-slate-700 transition-colors hover:bg-indigo-600 hover:text-white hover:border-indigo-600"
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