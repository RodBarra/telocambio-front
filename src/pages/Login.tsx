import { FormEvent, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { AlertErr } from "../components/Alert";
import { Field } from "../components/form";

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
      // No enviamos código de comunidad
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
    <div className="min-h-screen grid place-items-center bg-slate-50 p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-6">
          <h1 className="text-3xl font-bold">
            Bienvenido a <span className="text-blue-600">TeLoCambio</span>
          </h1>
          <p className="text-slate-600 mt-2">Inicia sesión para continuar</p>
        </div>

        <div className="card p-6">
          {errBanner && (
            <div className="mb-4">
              <AlertErr>{errBanner}</AlertErr>
            </div>
          )}

          <form className="space-y-4" onSubmit={onSubmit} noValidate>
            <Field label="Correo" error={errors.correo}>
              <input
                type="email"
                className={`input ${errors.correo ? "border-red-300 focus:ring-red-300" : ""}`}
                value={correo}
                onChange={(e) => setCorreo(e.target.value)}
                placeholder="tu@correo.cl"
              />
            </Field>

            <Field label="Contraseña" error={errors.password}>
              <input
                type="password"
                className={`input ${errors.password ? "border-red-300 focus:ring-red-300" : ""}`}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
              />
            </Field>

            <button className="btn-primary w-full" disabled={loading}>
              {loading ? "Ingresando..." : "Iniciar Sesión"}
            </button>
          </form>

          <div className="mt-6 text-center text-sm">
            ¿No tienes cuenta?{" "}
            <Link to="/register" className="text-blue-600 hover:underline">
              Crear cuenta
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
