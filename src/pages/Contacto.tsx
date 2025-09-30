export default function Contacto() {
  return (
    <main>
      <section className="mx-auto max-w-7xl px-4 py-16">
        <div className="grid gap-8 md:grid-cols-2 items-stretch">
          {/* imagen lateral */}
          <div className="rounded-2xl overflow-hidden border border-slate-200 shadow-sm">
            <img src="/contact-side.jpg" alt="Soporte TeLoCambio" className="w-full h-full object-cover md:h-full" />
          </div>

          {/* form */}
          <form
            className="card p-6"
            onSubmit={(e) => { e.preventDefault(); window.location.href = "mailto:hola@telocambio.cl"; }}
          >
            <h1 className="text-3xl font-bold tracking-tight">Contacto</h1>
            <p className="mt-2 text-slate-600">¿Quieres una demo o cotizar para tu edificio? Escríbenos.</p>

            <div className="mt-6 grid gap-3">
              <input className="input" placeholder="Nombre" required />
              <input className="input" type="email" placeholder="Correo" required />
              <input className="input" placeholder="Asunto" />
              <textarea className="input h-28" placeholder="Cuéntanos de tu comunidad..." />
              <button className="btn btn-primary">Enviar</button>
            </div>

            <div className="mt-6 rounded-xl border border-slate-200 bg-slate-50 p-4 text-sm">
              <div>📧 <a className="text-blue-600 hover:underline" href="mailto:hola@telocambio.cl">hola@telocambio.cl</a></div>
              <div className="mt-1">🕑 Lunes a viernes 9:00–18:00</div>
            </div>
          </form>
        </div>
      </section>
    </main>
  );
}
