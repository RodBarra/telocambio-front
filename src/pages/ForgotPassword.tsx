// src/pages/ForgotPassword.tsx
import { FormEvent, useState } from "react";
import { useNavigate } from "react-router-dom";
import { AuthApi } from "../services/auth";

type Errors = Partial<Record<"correo", string>>;

export default function ForgotPassword() {
  const nav = useNavigate();
  const [correo, setCorreo] = useState("");
  const [codigo, setCodigo] = useState("");
  const [errors, setErrors] = useState<Errors>({});
  const [loading, setLoading] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const validate = (): boolean => {
    const newErrors: Errors = {};
    if (!correo) newErrors.correo = "Por favor, ingresa tu correo.";
    else if (!/\S+@\S+\.\S+/.test(correo)) newErrors.correo = "El formato del correo no es válido.";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setServerError(null);
    setSuccessMsg(null);

    if (!validate()) return;

    try {
      setLoading(true);
      await AuthApi.solicitarRestauracionPassword(correo.trim(), codigo.trim() || undefined);
      setSuccessMsg(
        "Si el correo está registrado, te enviaremos un enlace para restablecer la contraseña."
      );
    } catch (e: any) {
      const msg =
        e?.response?.data?.detail ||
        e?.response?.data?.error ||
        "No se pudo procesar la solicitud. Inténtalo nuevamente.";
      setServerError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="relative">
      <div
        className="absolute inset-0 -z-10 bg-cover bg-center"
        style={{ backgroundImage: "url('/hero-login.jpg')" }}
        aria-hidden
      />
      <div className="absolute inset-0 -z-10 bg-black/40" aria-hidden />

      <div className="min-h-[calc(100vh-64px)] grid place-items-center px-4 py-8">
        <div className="w-full max-w-xl rounded-2xl bg-white/95 shadow-2xl backdrop-blur">
          <div className="border-b border-slate-100 px-6 py-5">
            <h1 className="text-xl font-bold text-slate-900">
              ¿Olvidaste tu contraseña?
            </h1>
            <p className="mt-1 text-sm text-slate-600">
              Ingresa tu correo y, si está registrado, te enviaremos un enlace para crear una nueva
              contraseña.
            </p>
          </div>

          <form className="space-y-4 px-6 py-5" onSubmit={handleSubmit} noValidate>
            {serverError && (
              <div className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
                {serverError}
              </div>
            )}

            {successMsg && (
              <div className="rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-700">
                {successMsg}
              </div>
            )}

            <div className="space-y-1">
              <label className="text-sm font-medium text-slate-700">Correo</label>
              <input
                type="email"
                className={`input w-full ${
                  errors.correo ? "border-red-500" : "focus:ring-brand/30"
                }`}
                value={correo}
                onChange={(e) => setCorreo(e.target.value)}
                onBlur={validate}
                placeholder="tu@correo.cl"
              />
              {errors.correo && (
                <p className="text-xs text-red-600">{errors.correo}</p>
              )}
            </div>

            <div className="space-y-1">
              <label className="text-sm font-medium text-slate-700">
                Código de comunidad{" "}
                <span className="font-normal text-slate-400">(opcional)</span>
              </label>
              <input
                type="text"
                className="input w-full"
                value={codigo}
                onChange={(e) => setCodigo(e.target.value)}
                placeholder="DPT-NORTE-001"
              />
              <p className="text-xs text-slate-500">
                Solo necesitas esto si el mismo correo podría estar registrado en más de una
                comunidad.
              </p>
            </div>

            <button
              type="submit"
              className="btn-primary flex w-full justify-center pt-2 pb-2"
              disabled={loading}
            >
              {loading ? "Enviando enlace..." : "Enviar enlace de restauración"}
            </button>

            <button
              type="button"
              className="mt-2 w-full text-center text-sm text-slate-600 hover:text-slate-800"
              onClick={() => nav("/login")}
            >
              ← Volver al inicio de sesión
            </button>
          </form>
        </div>
      </div>
    </section>
  );
}
