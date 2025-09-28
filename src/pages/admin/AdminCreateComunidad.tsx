import { FormEvent, useState } from "react";
import { ComunidadesApi } from "../../services/comunidades";
import { AlertOk, AlertErr } from "../../components/Alert";
import { Field } from "../../components/form";

type FormState = {
  nombre: string;
  tipo_id: 1 | 2;
  direccion: string;
  codigo: string;
};

type Errors = Partial<Record<keyof FormState, string>>;

const initialForm: FormState = {
  nombre: "",
  tipo_id: 1,
  direccion: "",
  codigo: "",
};

// Normaliza: mayúsculas, sin espacios, solo A–Z, 0–9 y '-'
function normalizeCodigo(raw: string) {
  const up = (raw || "").toUpperCase().replace(/\s+/g, "-");
  return up.replace(/[^A-Z0-9-]/g, "-");
}

function validateForm(f: FormState): Errors {
  const e: Errors = {};

  // Nombre
  const nombre = f.nombre.trim();
  if (!nombre) e.nombre = "El nombre es obligatorio.";
  else if (nombre.length < 3) e.nombre = "Mínimo 3 caracteres.";
  else if (nombre.length > 120) e.nombre = "Máximo 120 caracteres.";

  // Tipo
  if (![1, 2].includes(f.tipo_id)) e.tipo_id = "Selecciona un tipo válido.";

  // Dirección (opcional)
  if (f.direccion && f.direccion.length > 120) {
    e.direccion = "Máximo 120 caracteres.";
  }

  // Código
  const cod = f.codigo.trim();
  if (!cod) e.codigo = "Ingresa el código de comunidad.";
  else if (!/^[A-Z0-9-]{3,32}$/.test(cod)) {
    e.codigo = "Usa mayúsculas, números y guiones (3–32). Ej: DPT-LOSROBLES-001";
  }

  return e;
}

export default function AdminCreateComunidad() {
  const [form, setForm] = useState<FormState>(initialForm);
  const [errors, setErrors] = useState<Errors>({});
  const [okBanner, setOkBanner] = useState<string | null>(null);
  const [errBanner, setErrBanner] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const set = <K extends keyof FormState>(k: K, v: FormState[K]) =>
    setForm((f) => ({ ...f, [k]: v }));

  const touchField = (k: keyof FormState) => {
    // valida sólo ese campo
    const e = validateForm(form);
    setErrors((prev) => ({ ...prev, [k]: e[k] }));
  };

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setOkBanner(null);
    setErrBanner(null);

    const eNow = validateForm(form);
    setErrors(eNow);
    if (Object.keys(eNow).length > 0) return;

    setLoading(true);
    try {
      await ComunidadesApi.create({
        nombre: form.nombre.trim(),
        tipo_id: form.tipo_id,
        direccion: form.direccion.trim() || undefined,
        codigo: form.codigo.trim(),
      });
      setOkBanner("Comunidad creada correctamente.");
      setForm(initialForm);
      setErrors({});
    } catch (err: any) {
      const payload = err?.response?.data;
      const msg =
        payload?.detail ||
        payload?.errors ||
        "No se pudo crear la comunidad. Revisa los datos.";
      setErrBanner(typeof msg === "string" ? msg : JSON.stringify(msg));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mx-auto w-full max-w-3xl px-4 py-10">
      <h1 className="mb-6 text-center text-3xl font-extrabold tracking-tight">
        Crear comunidad
      </h1>

      {okBanner && (
        <div className="mb-4">
          <AlertOk>{okBanner}</AlertOk>
        </div>
      )}
      {errBanner && (
        <div className="mb-4">
          <AlertErr>{errBanner}</AlertErr>
        </div>
      )}

      <form className="card p-6 sm:p-8 space-y-6" onSubmit={onSubmit} noValidate>
        {/* Nombre */}
        <Field label="Nombre" error={errors.nombre}>
          <input
            className={`input ${errors.nombre ? "border-red-300 focus:ring-red-300" : ""}`}
            value={form.nombre}
            onChange={(e) => set("nombre", e.target.value)}
            onBlur={() => touchField("nombre")}
            placeholder="Ej: Condominio Los Robles"
            maxLength={120}
          />
          {!errors.nombre && (
            <p className="mt-1 text-xs text-slate-500">
              Nombre público de la comunidad (máx. 120).
            </p>
          )}
        </Field>

        {/* Tipo */}
        <div>
          <label className="label">Tipo</label>
          <div className="inline-flex rounded-lg bg-slate-100 p-1">
            <button
              type="button"
              className={`px-4 py-2 text-sm rounded-md ${
                form.tipo_id === 1 ? "bg-white shadow" : "text-slate-600"
              }`}
              onClick={() => {
                set("tipo_id", 1);
                touchField("tipo_id");
              }}
            >
              Departamento
            </button>
            <button
              type="button"
              className={`px-4 py-2 text-sm rounded-md ${
                form.tipo_id === 2 ? "bg-white shadow" : "text-slate-600"
              }`}
              onClick={() => {
                set("tipo_id", 2);
                touchField("tipo_id");
              }}
            >
              Condominio
            </button>
          </div>
          {errors.tipo_id && <p className="mt-1 text-xs text-red-600">{errors.tipo_id}</p>}
        </div>

        {/* Dirección (opcional) */}
        <Field label="Dirección (opcional)" error={errors.direccion}>
          <input
            className={`input ${errors.direccion ? "border-red-300 focus:ring-red-300" : ""}`}
            value={form.direccion}
            onChange={(e) => set("direccion", e.target.value)}
            onBlur={() => touchField("direccion")}
            placeholder="Ej: Av. Siempre Viva 742"
            maxLength={120}
          />
          {!errors.direccion && (
            <p className="mt-1 text-xs text-slate-500">Máximo 120 caracteres.</p>
          )}
        </Field>

        {/* Código */}
        <Field label="Código" error={errors.codigo}>
          <input
            className={`input ${errors.codigo ? "border-red-300 focus:ring-red-300" : ""}`}
            value={form.codigo}
            onChange={(e) => set("codigo", normalizeCodigo(e.target.value))}
            onBlur={() => {
              set("codigo", normalizeCodigo(form.codigo));
              touchField("codigo");
            }}
            placeholder="DPT-LOSROBLES-001"
            maxLength={32}
          />
          {!errors.codigo && (
            <p className="mt-1 text-xs text-slate-500">
              Solo mayúsculas, números y guiones (3–32). Ej: <code>DPT-LOSROBLES-001</code>
            </p>
          )}
        </Field>

        <button type="submit" className="btn-primary" disabled={loading}>
          {loading ? "Creando..." : "Crear comunidad"}
        </button>
      </form>
    </div>
  );
}
