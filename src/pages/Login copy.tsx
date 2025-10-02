import { FormEvent, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { AlertErr } from "../components/Alert";
import { Field } from "../components/Form";

type Errors = Partial<Record<"correo" | "password", string>>;

export default function Login() {
  const { login, loading } = useAuth();
  const nav = useNavigate();

  const [correo, setCorreo] = useState("");
  const [password, setPassword] = useState("");
  const [errBanner, setErrBanner] = useState<string | null>(null);
  const [errors, setErrors] = useState<Errors>({});

  const validate = (): boolean => {
    const e: Errors = {};
    if (!correo) e.correo = "Ingresa tu correo.";
    else if (!/\S+@\S+\.\S+/.test(correo)) e.correo = "Formato de correo inválido.";
    if (!password) e.password = "Ingresa tu contraseña.";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setErrBanner(null);
    if (!validate()) return;
    try {
      await login(correo, password);
      nav("/dashboard");
    } catch (e: any) {
      const msg =
        e?.response?.data?.detail ||
        e?.response?.data?.reason ||
        "No se pudo iniciar sesión. Verifica tus datos.";
      setErrBanner(msg);
    }
  };

  return (
    <section className="relative">
      {/* Fondo + overlay */}
      <div
        className="absolute inset-0 -z-10 bg-cover bg-center"
        style={{ backgroundImage: "url('/hero-login.jpg')" }}
        aria-hidden
      />
      <div className="absolute inset-0 -z-10 bg-black/35" aria-hidden />

      {/* Contenedor centrado vertical/horizontal bajo el navbar (64px aprox) */}
      <div className="min-h-[calc(100vh-64px)] grid place-items-center px-4">
        {/* Card modal centrado */}
        <div className="w-full max-w-xl rounded-2xl border border-white/50 bg-white/90 p-6 shadow-2xl backdrop-blur-md">
          {errBanner && (
            <div className="mb-4">
              <AlertErr>{errBanner}</AlertErr>
            </div>
          )}

          <h2 className="text-xl font-semibold text-slate-900">Inicia sesión</h2>
          <p className="mb-4 text-sm text-slate-600">
            Ingresa tus credenciales para continuar
          </p>

          <form className="space-y-4" onSubmit={onSubmit} noValidate>
            <Field label="Correo" error={errors.correo}>
              <input
                type="email"
                className={`input focus:ring-brand/30 ${
                  errors.correo ? "border-red-300 focus:ring-red-300" : ""
                }`}
                value={correo}
                onChange={(e) => setCorreo(e.target.value)}
                placeholder="tu@correo.cl"
              />
            </Field>

            <Field label="Contraseña" error={errors.password}>
              <input
                type="password"
                className={`input focus:ring-brand/30 ${
                  errors.password ? "border-red-300 focus:ring-red-300" : ""
                }`}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
              />
            </Field>

            <button className="btn-primary w-full" disabled={loading}>
              {loading ? "Ingresando..." : "Iniciar sesión"}
            </button>
          </form>

          <div className="mt-6 text-center text-sm text-slate-600">
            ¿No tienes cuenta?{" "}
            <Link to="/register" className="font-medium text-indigo-600 hover:underline">
              Crear cuenta
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
