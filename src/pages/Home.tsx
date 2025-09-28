export default function Home() {
  return (
    <section className="space-y-6">
      <h1 className="text-3xl font-bold tracking-tight text-slate-900">
        Bienvenido a <span className="text-brand">TeLoCambio</span>
      </h1>

      <div className="grid gap-6 md:grid-cols-2">
        <div className="card p-6">
          <h2 className="text-lg font-semibold text-slate-800">
            Módulo Auth + Padrón
          </h2>
          <p className="mt-2 text-slate-600">
            Este proyecto ya está configurado con Tailwind v3 y enrutamiento.
          </p>
        </div>
        <div className="card p-6">
          <h2 className="text-lg font-semibold text-slate-800">
            Siguiente paso
          </h2>
          <p className="mt-2 text-slate-600">
            Ve a <span className="font-medium">/login</span> para probar el login.
          </p>
        </div>
      </div>
    </section>
  );
}
