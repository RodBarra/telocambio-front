import { FormEvent, useEffect, useMemo, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { AlertErr, AlertOk } from "../components/Alert";
import { Field } from "../components/form";
import { AuthApi } from "../services/auth";

type Tipo = "departamento" | "condominio";
type Errors = Partial<
  Record<
    | "codigo"
    | "correo"
    | "password"
    | "nombre"
    | "apellidos"
    | "telefono"
    | "torre"
    | "numero"
    | "direccion_texto",
    string
  >
>;

type VerifyState =
  | { status: "idle" }
  | { status: "checking" }
  | { status: "ok"; tipo_id: 1 | 2 }
  | { status: "error"; reason: string; detail?: string };

export default function Register() {
  const nav = useNavigate();
  const [tipo, setTipo] = useState<Tipo>("departamento");

  const [form, setForm] = useState({
    codigo: "",
    correo: "",
    password: "",
    nombre: "",
    apellidos: "",
    telefono: "",
    // residencia
    torre: "",
    direccion_texto: "",
    numero: "",
  });

  const [verify, setVerify] = useState<VerifyState>({ status: "idle" });
  const [errBanner, setErrBanner] = useState<string | null>(null);
  const [okBanner, setOkBanner] = useState<string | null>(null);
  const [errors, setErrors] = useState<Errors>({});
  const [loading, setLoading] = useState(false);

  const set = (k: string, v: string) => setForm((f) => ({ ...f, [k]: v }));

  const requiredForTipo = useMemo(() => {
    return tipo === "departamento"
      ? (["torre", "numero"] as const)
      : (["direccion_texto", "numero"] as const);
  }, [tipo]);

  const emailOk = /\S+@\S+\.\S+/.test(form.correo);
  const codeOk = !!form.codigo?.trim();

  // Debounce para verificar código vs tipo_id (requiere correo y código)
  const tRef = useRef<number | null>(null);
  useEffect(() => {
    // limpiar debounce anterior
    if (tRef.current) window.clearTimeout(tRef.current);
    // reiniciar estado si falta correo/código o correo inválido
    if (!emailOk || !codeOk) {
      setVerify({ status: "idle" });
      return;
    }
    setVerify({ status: "checking" });
    tRef.current = window.setTimeout(async () => {
      try {
        const { data } = await AuthApi.verifyAccess({
          codigo: form.codigo.trim(),
          correo: form.correo.trim(),
        });
        // /auth/verify-access devuelve 200 si ok; 400 si error (con reason)
        if (data?.ok && (data.tipo_id === 1 || data.tipo_id === 2)) {
          setVerify({ status: "ok", tipo_id: data.tipo_id });
        } else {
          setVerify({ status: "error", reason: data?.reason || "codigo_invalido" });
        }
      } catch (e: any) {
        const reason =
          e?.response?.data?.reason ||
          e?.response?.data?.detail ||
          "codigo_invalido";
        setVerify({ status: "error", reason });
      }
    }, 400);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [form.codigo, form.correo]);

  const tipoFromId = (id?: 1 | 2) =>
    id === 1 ? "departamento" : id === 2 ? "condominio" : undefined;

  const friendlyVerifyError: Record<string, string> = {
    codigo_invalido: "El código de comunidad no existe.",
    correo_no_autorizado: "Tu correo no está autorizado en el padrón de esta comunidad.",
    correo_no_habilitado: "Tu correo está en el padrón pero aún no ha sido habilitado.",
    correo_ya_usado: "Este correo ya fue utilizado para registrarse.",
    faltan_residencia: "Faltan datos de residencia (torre/dirección y número).",
  };

  const validate = (): boolean => {
    const e: Errors = {};
    if (!form.codigo) e.codigo = "Ingresa el código de comunidad.";
    if (!form.correo) e.correo = "Ingresa tu correo.";
    else if (!/\S+@\S+\.\S+/.test(form.correo)) e.correo = "Formato de correo inválido.";
    if (!form.password || form.password.length < 8) e.password = "La contraseña debe tener al menos 8 caracteres.";
    if (!form.nombre) e.nombre = "Ingresa tu nombre.";
    if (!form.apellidos) e.apellidos = "Ingresa tus apellidos.";

    if (tipo === "departamento") {
      if (!form.torre) e.torre = "Ingresa la torre/edificio.";
      if (!form.numero) e.numero = "Ingresa el número del depto.";
    } else {
      if (!form.direccion_texto) e.direccion_texto = "Ingresa la dirección.";
      if (!form.numero) e.numero = "Ingresa el número de la vivienda.";
    }

    // Validación de coherencia tipo <-> código usando verify.tipo_id (si se pudo verificar)
    if (verify.status === "ok") {
      const esperado = tipoFromId(verify.tipo_id);
      if (esperado && esperado !== tipo) {
        e.codigo =
          `El código ingresado corresponde a un ${esperado}. ` +
          `Cambia el tipo o corrige el código.`;
      }
    } else if (verify.status === "error") {
      // Si la verificación ya falló, muestro el motivo aquí para bloquear el envío
      e.codigo = friendlyVerifyError[verify.reason] || "Código o correo inválido para la comunidad.";
    } else if (verify.status === "checking") {
      // Evitar enviar mientras está verificando
      e.codigo = "Verificando código…";
    }

    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setErrBanner(null);
    setOkBanner(null);
    if (!validate()) return;

    setLoading(true);
    try {
      await AuthApi.register(form);
      setOkBanner("Cuenta creada con éxito. Ahora puedes iniciar sesión.");
      setTimeout(() => nav("/login"), 1000);
    } catch (e: any) {
      const reason = e?.response?.data?.reason;
      const friendly: Record<string, string> = {
        ...friendlyVerifyError,
      };
      const msg =
        friendly[reason] ||
        e?.response?.data?.detail ||
        "No se pudo crear la cuenta. Revisa los datos.";
      setErrBanner(msg);
    } finally {
      setLoading(false);
    }
  };

  // badge informativo debajo del campo Código (solo si verify es ok y no hay error local en código)
  const codigoHintOk =
    verify.status === "ok" && !errors.codigo
      ? `Código verificado: ${tipoFromId(verify.tipo_id) === "departamento" ? "Departamento" : "Condominio"}`
      : undefined;

  return (
    <div className="min-h-screen grid place-items-center bg-slate-50 p-4">
      <div className="w-full max-w-2xl">
        <div className="text-center mb-6">
          <h1 className="text-3xl font-bold">Crear cuenta</h1>
          <p className="text-slate-600 mt-2">Necesitas estar en el padrón de tu comunidad.</p>
        </div>

        <div className="card p-6">
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

          {/* Toggle tipo */}
          <div className="mb-4">
            <div className="inline-flex rounded-lg bg-slate-100 p-1">
              <button
                type="button"
                className={`px-4 py-2 text-sm rounded-md ${
                  tipo === "departamento" ? "bg-white shadow" : "text-slate-600"
                }`}
                onClick={() => setTipo("departamento")}
              >
                Departamento
              </button>
              <button
                type="button"
                className={`px-4 py-2 text-sm rounded-md ${
                  tipo === "condominio" ? "bg-white shadow" : "text-slate-600"
                }`}
                onClick={() => setTipo("condominio")}
              >
                Condominio
              </button>
            </div>
          </div>

          <form className="grid md:grid-cols-2 gap-4" onSubmit={onSubmit} noValidate>
            <div className="md:col-span-2">
              <Field
                label="Código de comunidad"
                error={errors.codigo}
                hint={codigoHintOk}
              >
                <input
                  className={`input ${errors.codigo ? "border-red-300 focus:ring-red-300" : ""}`}
                  value={form.codigo}
                  onChange={(e) => set("codigo", e.target.value)}
                  placeholder="DPT-LOSROBLES-001"
                />
              </Field>
            </div>

            <Field label="Correo" error={errors.correo}>
              <input
                type="email"
                className={`input ${errors.correo ? "border-red-300 focus:ring-red-300" : ""}`}
                value={form.correo}
                onChange={(e) => set("correo", e.target.value)}
              />
            </Field>

            <Field label="Contraseña" error={errors.password}>
              <input
                type="password"
                className={`input ${errors.password ? "border-red-300 focus:ring-red-300" : ""}`}
                value={form.password}
                onChange={(e) => set("password", e.target.value)}
                placeholder="Mínimo 8 caracteres"
              />
            </Field>

            <Field label="Nombre" error={errors.nombre}>
              <input
                className={`input ${errors.nombre ? "border-red-300 focus:ring-red-300" : ""}`}
                value={form.nombre}
                onChange={(e) => set("nombre", e.target.value)}
              />
            </Field>

            <Field label="Apellidos" error={errors.apellidos}>
              <input
                className={`input ${errors.apellidos ? "border-red-300 focus:ring-red-300" : ""}`}
                value={form.apellidos}
                onChange={(e) => set("apellidos", e.target.value)}
              />
            </Field>

            <div className="md:col-span-2">
              <Field label="Teléfono (opcional)" error={errors.telefono}>
                <input
                  className="input"
                  value={form.telefono}
                  onChange={(e) => set("telefono", e.target.value)}
                />
              </Field>
            </div>

            {/* Campos condicionales por tipo */}
            {tipo === "departamento" ? (
              <>
                <Field label="Torre/Edificio" error={errors.torre}>
                  <input
                    className={`input ${errors.torre ? "border-red-300 focus:ring-red-300" : ""}`}
                    value={form.torre}
                    onChange={(e) => set("torre", e.target.value)}
                    placeholder="Torre A"
                  />
                </Field>

                <Field label="N° Depto" error={errors.numero}>
                  <input
                    className={`input ${errors.numero ? "border-red-300 focus:ring-red-300" : ""}`}
                    value={form.numero}
                    onChange={(e) => set("numero", e.target.value)}
                    placeholder="101"
                  />
                </Field>
              </>
            ) : (
              <>
                <Field label="Dirección" error={errors.direccion_texto}>
                  <input
                    className={`input ${errors.direccion_texto ? "border-red-300 focus:ring-red-300" : ""}`}
                    value={form.direccion_texto}
                    onChange={(e) => set("direccion_texto", e.target.value)}
                    placeholder="Av. Siempre Viva #123"
                  />
                </Field>

                <Field label="N° Vivienda" error={errors.numero}>
                  <input
                    className={`input ${errors.numero ? "border-red-300 focus:ring-red-300" : ""}`}
                    value={form.numero}
                    onChange={(e) => set("numero", e.target.value)}
                    placeholder="23"
                  />
                </Field>
              </>
            )}

            <button className="btn-primary md:col-span-2" disabled={loading}>
              {loading ? "Creando..." : "Registrarme"}
            </button>
          </form>

          <div className="mt-6 text-center text-sm">
            ¿Ya tienes cuenta?{" "}
            <Link to="/login" className="text-blue-600 hover:underline">
              Inicia sesión
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
