// src/pages/ResetPassword.tsx
import { FormEvent, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { AuthApi } from "../services/auth";

type Errors = Partial<Record<"password" | "password2", string>>;

export default function ResetPassword() {
  const nav = useNavigate();
  const [params] = useSearchParams();
  const token = params.get("token") ?? "";

  const [password, setPassword] = useState("");
  const [password2, setPassword2] = useState("");
  const [errors, setErrors] = useState<Errors>({});
  const [loading, setLoading] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const validate = (): boolean => {
    const newErrors: Errors = {};

    if (!password) {
      newErrors.password = "Debes ingresar una contraseña.";
    }

    if (!password2) {
      newErrors.password2 = "Debes repetir la contraseña.";
    } else if (password && password2 && password !== password2) {
      newErrors.password2 = "Las contraseñas no coinciden.";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setServerError(null);
    setSuccessMsg(null);

    if (!token) {
      setServerError(
        "El enlace de restauración no es válido. Vuelve a solicitarlo desde la pantalla de recuperación."
      );
      return;
    }

    if (!validate()) return;

    try {
      setLoading(true);
      await AuthApi.confirmarRestauracionPassword(token, password);
      setSuccessMsg("Tu contraseña se ha actualizado correctamente.");

      setTimeout(() => {
        nav("/login");
      }, 2000);
    } catch (e: any) {
      const msg =
        e?.response?.data?.detail ||
        e?.response?.data?.error ||
        "No se pudo actualizar la contraseña. Es posible que el enlace haya expirado.";
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
              Crea una nueva contraseña
            </h1>
            <p className="mt-1 text-sm text-slate-600">
              Debe tener al menos 8 caracteres, una mayúscula, un número y un símbolo.
            </p>
          </div>

          <form className="space-y-4 px-6 py-5" onSubmit={handleSubmit} noValidate>
            {!token && (
              <div className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
                El enlace no contiene un token válido. Solicita nuevamente la restauración de
                contraseña.
              </div>
            )}

            {serverError && (
              <div className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
                {serverError}
              </div>
            )}

            {successMsg && (
              <div className="rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-700">
                {successMsg} Redirigiendo al inicio de sesión…
              </div>
            )}

            <div className="space-y-1">
              <label className="text-sm font-medium text-slate-700">
                Nueva contraseña
              </label>
              <input
                type="password"
                className={`input w-full ${
                  errors.password ? "border-red-500" : "focus:ring-brand/30"
                }`}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="NuevaClaveSegura1!"
              />
              {errors.password && (
                <p className="text-xs text-red-600">{errors.password}</p>
              )}
            </div>

            <div className="space-y-1">
              <label className="text-sm font-medium text-slate-700">
                Repite la nueva contraseña
              </label>
              <input
                type="password"
                className={`input w-full ${
                  errors.password2 ? "border-red-500" : "focus:ring-brand/30"
                }`}
                value={password2}
                onChange={(e) => setPassword2(e.target.value)}
                placeholder="Repite la contraseña"
              />
              {errors.password2 && (
                <p className="text-xs text-red-600">{errors.password2}</p>
              )}
            </div>

            <button
              type="submit"
              className="btn-primary flex w-full justify-center pt-2 pb-2"
              disabled={loading || !token}
            >
              {loading ? "Guardando..." : "Guardar nueva contraseña"}
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
