import { FormEvent, useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { ComunidadesApi } from "../../services/comunidades";
import type { Comunidad } from "../../services/comunidades";
import { UsuariosApi } from "../../services/usuarios";
import { AlertOk, AlertErr } from "../../components/Alert";
import { Field } from "../../components/form";

type FormState = {
  comunidad_id: number;
  correo: string;
  password: string;
  nombre: string;
  apellidos: string;
  telefono: string;
};

type Errors = Partial<Record<keyof FormState, string>>;

export default function AdminCreateModerador() {
  const [params] = useSearchParams();
  const preId = Number(params.get("comunidad_id") || 0);

  const [coms, setComs] = useState<Comunidad[]>([]);
  const [form, setForm] = useState<FormState>({
    comunidad_id: preId || 0,
    correo: "",
    password: "",
    nombre: "",
    apellidos: "",
    telefono: "",
  });

  const [errors, setErrors] = useState<Errors>({});
  const [submitted, setSubmitted] = useState(false); // <- mostrar errores solo tras submit
  const [ok, setOk] = useState<string | null>(null);
  const [err, setErr] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const set = <K extends keyof FormState>(k: K, v: FormState[K]) =>
    setForm((f) => ({ ...f, [k]: v }));

  useEffect(() => {
    // si el backend trae sin_moderador, lo usamos; si no, filtramos en cliente
    ComunidadesApi.list({ page_size: 1000, sin_moderador: 1 as any })
      .then(({ data }) => setComs((data.items || []).filter((c) => !c.moderador_correo)))
      .catch(async () => {
        try {
          const { data } = await ComunidadesApi.list({ page_size: 1000 });
          setComs((data.items || []).filter((c) => !c.moderador_correo));
        } catch {
          /* noop */
        }
      });
  }, []);

  const validate = (f: FormState): Errors => {
    const e: Errors = {};
    if (!f.comunidad_id) e.comunidad_id = "Selecciona una comunidad.";

    const correo = f.correo.trim();
    if (!correo) e.correo = "Correo es obligatorio.";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(correo)) e.correo = "Correo inválido.";

    if (!/^(?=.*[A-Z])(?=.*\d).{8,}$/.test(f.password)) {
      e.password = "Mínimo 8, con 1 mayúscula y 1 número.";
    }

    if (!f.nombre.trim()) e.nombre = "Nombre es obligatorio.";
    if (!f.apellidos.trim()) e.apellidos = "Apellidos son obligatorios.";
    // teléfono opcional
    return e;
  };

  const onSubmit = async (ev: FormEvent) => {
    ev.preventDefault();
    setOk(null);
    setErr(null);
    setSubmitted(true);

    const eNow = validate(form);
    setErrors(eNow);
    if (Object.keys(eNow).length > 0) return;

    setLoading(true);
    try {
      await UsuariosApi.createModerador({
        comunidad_id: form.comunidad_id,
        correo: form.correo.trim(),
        password: form.password,
        nombre: form.nombre.trim(),
        apellidos: form.apellidos.trim(),
        telefono: form.telefono.trim() || undefined,
      });
      setOk("Moderador creado correctamente.");

      // Reset manteniendo comunidad preseleccionada
      setForm({
        comunidad_id: preId || 0,
        correo: "",
        password: "",
        nombre: "",
        apellidos: "",
        telefono: "",
      });
      setErrors({});
      setSubmitted(false);
    } catch (e: any) {
      const payload = e?.response?.data;
      const msg =
        payload?.detail ||
        payload?.errors ||
        "No se pudo crear el moderador.";
      setErr(typeof msg === "string" ? msg : JSON.stringify(msg));
    } finally {
      setLoading(false);
    }
  };

  const showErr = (key: keyof Errors) => submitted && !!errors[key];

  return (
    <div className="max-w-xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-4">Crear moderador</h1>

      {ok && (
        <div className="mb-4">
          <AlertOk>{ok}</AlertOk>
        </div>
      )}
      {err && (
        <div className="mb-4">
          <AlertErr>{err}</AlertErr>
        </div>
      )}

      <form className="card p-6 space-y-4" onSubmit={onSubmit} noValidate>
        {/* Comunidad */}
        <div>
          <label className="label">Comunidad</label>
          <select
            className={`input ${showErr("comunidad_id") ? "border-red-300 focus:ring-red-300" : ""}`}
            value={form.comunidad_id}
            onChange={(e)=>set("comunidad_id", Number(e.target.value))}
          >
            <option value={0}>Selecciona...</option>
            {coms.map(c => (
              <option key={c.id} value={c.id}>
                {c.nombre} ({c.codigo})
              </option>
            ))}
          </select>
          {showErr("comunidad_id") && (
            <p className="mt-1 text-xs text-red-600">{errors.comunidad_id}</p>
          )}
        </div>

        {/* Correo */}
        <Field label="Correo" error={showErr("correo") ? errors.correo : undefined}>
          <input
            className={`input ${showErr("correo") ? "border-red-300 focus:ring-red-300" : ""}`}
            value={form.correo}
            onChange={(e)=>set("correo", e.target.value)}
            placeholder="moderador@comunidad.cl"
            inputMode="email"
          />
        </Field>

        {/* Contraseña */}
        <Field label="Contraseña" error={showErr("password") ? errors.password : undefined}>
          <input
            className={`input ${showErr("password") ? "border-red-300 focus:ring-red-300" : ""}`}
            type="password"
            value={form.password}
            onChange={(e)=>set("password", e.target.value)}
            placeholder="Mín. 8, 1 mayúscula, 1 número"
          />
        </Field>

        {/* Nombre */}
        <Field label="Nombre" error={showErr("nombre") ? errors.nombre : undefined}>
          <input
            className={`input ${showErr("nombre") ? "border-red-300 focus:ring-red-300" : ""}`}
            value={form.nombre}
            onChange={(e)=>set("nombre", e.target.value)}
          />
        </Field>

        {/* Apellidos */}
        <Field label="Apellidos" error={showErr("apellidos") ? errors.apellidos : undefined}>
          <input
            className={`input ${showErr("apellidos") ? "border-red-300 focus:ring-red-300" : ""}`}
            value={form.apellidos}
            onChange={(e)=>set("apellidos", e.target.value)}
          />
        </Field>

        {/* Teléfono (opcional) */}
        <Field label="Teléfono (opcional)">
          <input
            className="input"
            value={form.telefono}
            onChange={(e)=>set("telefono", e.target.value)}
          />
        </Field>

        <button className="btn-primary" disabled={loading}>
          {loading ? "Creando..." : "Crear"}
        </button>
      </form>
    </div>
  );
}
