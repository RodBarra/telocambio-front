import { FormEvent, useEffect, useMemo, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { AlertErr, AlertOk } from "../components/Alert";
import { Field } from "../components/form";
import { AuthApi } from "../services/auth";

type Tipo = "departamento" | "condominio";
type Errors = Partial<Record<"codigo" | "correo" | "password" | "nombre" | "apellidos" | "telefono" | "torre" | "numero" | "direccion_texto", string>>;
type VerifyState = { status: "idle" } | { status: "checking" } | { status: "ok"; tipo_id: 1 | 2 } | { status: "error"; reason: string; detail?: string };

export default function Register() {
  const nav = useNavigate();
  const [tipo, setTipo] = useState<Tipo>("departamento");
  const [form, setForm] = useState({
    codigo: "", correo: "", password: "", nombre: "", apellidos: "", telefono: "", torre: "", direccion_texto: "", numero: "",
  });
  const [verify, setVerify] = useState<VerifyState>({ status: "idle" });
  const [errBanner, setErrBanner] = useState<string | null>(null);
  const [okBanner, setOkBanner] = useState<string | null>(null);
  const [errors, setErrors] = useState<Errors>({});
  const [loading, setLoading] = useState(false);
  const set = (k: string, v: string) => setForm((f) => ({ ...f, [k]: v }));
  
  const requiredForTipo = useMemo(() => {
    return tipo === "departamento" ? (["torre", "numero"] as const) : (["direccion_texto", "numero"] as const);
  }, [tipo]);
  const emailOk = /\S+@\S+\.\S+/.test(form.correo);
  const codeOk = !!form.codigo?.trim();
  const tRef = useRef<number | null>(null);
  useEffect(() => {
    if (tRef.current) window.clearTimeout(tRef.current);
    if (!emailOk || !codeOk) { setVerify({ status: "idle" }); return; }
    setVerify({ status: "checking" });
    tRef.current = window.setTimeout(async () => {
      try {
        const { data } = await AuthApi.verifyAccess({ codigo: form.codigo.trim(), correo: form.correo.trim() });
        if (data?.ok && (data.tipo_id === 1 || data.tipo_id === 2)) {
          setVerify({ status: "ok", tipo_id: data.tipo_id });
        } else {
          setVerify({ status: "error", reason: data?.reason || "codigo_invalido" });
        }
      } catch (e: any) {
        const reason = e?.response?.data?.reason || e?.response?.data?.detail || "codigo_invalido";
        setVerify({ status: "error", reason });
      }
    }, 400);
  }, [form.codigo, form.correo]);
  const tipoFromId = (id?: 1 | 2) => id === 1 ? "departamento" : id === 2 ? "condominio" : undefined;
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
    if (verify.status === "ok") {
      const esperado = tipoFromId(verify.tipo_id);
      if (esperado && esperado !== tipo) {
        e.codigo = `El código ingresado corresponde a un ${esperado}. Cambia el tipo o corrige el código.`;
      }
    } else if (verify.status === "error") {
      e.codigo = friendlyVerifyError[verify.reason] || "Código o correo inválido para la comunidad.";
    } else if (verify.status === "checking") {
      e.codigo = "Verificando código…";
    }
    setErrors(e);
    return Object.keys(e).length === 0;
  };
  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setErrBanner(null); setOkBanner(null);
    if (!validate()) return;
    setLoading(true);
    try {
      await AuthApi.register(form);
      setOkBanner("Cuenta creada con éxito. Ahora puedes iniciar sesión.");
      setTimeout(() => nav("/login"), 1000);
    } catch (e: any) {
      const reason = e?.response?.data?.reason;
      const friendly: Record<string, string> = { ...friendlyVerifyError };
      const msg = friendly[reason] || e?.response?.data?.detail || "No se pudo crear la cuenta. Revisa los datos.";
      setErrBanner(msg);
    } finally {
      setLoading(false);
    }
  };
  const codigoHintOk = verify.status === "ok" && !errors.codigo ? `Código verificado: ${tipoFromId(verify.tipo_id) === "departamento" ? "Departamento" : "Condominio"}` : undefined;

  return (
    <div className="min-h-screen bg-slate-100 flex items-center justify-center p-4">
      <div className="w-full max-w-6xl overflow-hidden rounded-2xl bg-white shadow-2xl md:grid md:grid-cols-2">
        
        {/* --- CAMBIOS AQUÍ --- */}
        <div className="hidden flex-col items-center bg-indigo-600 p-12 text-white md:flex justify-center">
            <img 
              src="/logo-telocambio.png" 
              alt="Logo TeLoCambio" 
              className="w-70" // 1. MÁS GRANDE (w-40) y 2. EN COLORES (sin 'invert')
            />
          <h2 className="mt-6 text-3xl font-bold">Únete a tu comunidad</h2>
          <p className="mt-4 text-indigo-100">
            Crea tu cuenta para empezar a intercambiar artículos y servicios de forma segura con tus vecinos.
          </p>
        </div>
        {/* --- FIN DE LOS CAMBIOS --- */}

        <div className="p-8">
          <div className="mb-6">
            <h1 className="text-3xl font-bold text-slate-900">Crear cuenta</h1>
            <p className="text-slate-600 mt-2">Necesitas un código y estar en el padrón de tu comunidad.</p>
          </div>

          {okBanner && <div className="mb-4"><AlertOk>{okBanner}</AlertOk></div>}
          {errBanner && <div className="mb-4"><AlertErr>{errBanner}</AlertErr></div>}
          
          <form onSubmit={onSubmit} noValidate>
            <fieldset className="mb-6">
              <legend className="block text-sm font-medium text-slate-700 mb-2">1. Selecciona tu tipo de vivienda</legend>
              <div className="grid grid-cols-2 gap-3 rounded-lg bg-slate-100 p-1">
                <button
                  type="button"
                  className={`rounded-md py-2 text-sm font-semibold transition-all ${tipo === "departamento" ? "bg-white shadow" : "text-slate-600 hover:bg-slate-200"}`}
                  onClick={() => setTipo("departamento")}
                >
                  Departamento
                </button>
                <button
                  type="button"
                  className={`rounded-md py-2 text-sm font-semibold transition-all ${tipo === "condominio" ? "bg-white shadow" : "text-slate-600 hover:bg-slate-200"}`}
                  onClick={() => setTipo("condominio")}
                >
                  Condominio
                </button>
              </div>
            </fieldset>

            <fieldset className="grid md:grid-cols-2 gap-4 border-t border-slate-200 pt-6 mb-6">
                <legend className="w-full md:col-span-2 block text-sm font-medium text-slate-700 mb-2">2. Datos de Acceso</legend>
                <div className="md:col-span-2">
                    <Field label="Código de comunidad" error={errors.codigo} hint={codigoHintOk}>
                        <input className={`input ${errors.codigo ? "border-red-300" : ""}`} value={form.codigo} onChange={(e) => set("codigo", e.target.value)} placeholder="Ej: COMUNIDAD-123"/>
                    </Field>
                </div>
                <Field label="Correo" error={errors.correo}>
                    <input type="email" className={`input ${errors.correo ? "border-red-300" : ""}`} value={form.correo} onChange={(e) => set("correo", e.target.value)} />
                </Field>
                <Field label="Contraseña" error={errors.password}>
                    <input type="password" className={`input ${errors.password ? "border-red-300" : ""}`} value={form.password} onChange={(e) => set("password", e.target.value)} placeholder="Mínimo 8 caracteres"/>
                </Field>
            </fieldset>
            
            <fieldset className="grid md:grid-cols-2 gap-4 border-t border-slate-200 pt-6 mb-6">
                <legend className="w-full md:col-span-2 block text-sm font-medium text-slate-700 mb-2">3. Datos Personales</legend>
                <Field label="Nombre" error={errors.nombre}><input className={`input ${errors.nombre ? "border-red-300" : ""}`} value={form.nombre} onChange={(e) => set("nombre", e.target.value)} /></Field>
                <Field label="Apellidos" error={errors.apellidos}><input className={`input ${errors.apellidos ? "border-red-300" : ""}`} value={form.apellidos} onChange={(e) => set("apellidos", e.target.value)} /></Field>
                <div className="md:col-span-2"><Field label="Teléfono (opcional)" error={errors.telefono}><input className="input" value={form.telefono} onChange={(e) => set("telefono", e.target.value)} /></Field></div>
            </fieldset>

            <fieldset className="grid md:grid-cols-2 gap-4 border-t border-slate-200 pt-6 mb-6">
                <legend className="w-full md:col-span-2 block text-sm font-medium text-slate-700 mb-2">4. Tu Vivienda</legend>
                {tipo === "departamento" ? (
                  <>
                    <Field label="Torre/Edificio" error={errors.torre}><input className={`input ${errors.torre ? "border-red-300" : ""}`} value={form.torre} onChange={(e) => set("torre", e.target.value)} placeholder="Torre A" /></Field>
                    <Field label="N° Depto" error={errors.numero}><input className={`input ${errors.numero ? "border-red-300" : ""}`} value={form.numero} onChange={(e) => set("numero", e.target.value)} placeholder="101" /></Field>
                  </>
                ) : (
                  <>
                    <Field label="Dirección" error={errors.direccion_texto}><input className={`input ${errors.direccion_texto ? "border-red-300" : ""}`} value={form.direccion_texto} onChange={(e) => set("direccion_texto", e.target.value)} placeholder="Av. Siempre Viva #123" /></Field>
                    <Field label="N° Vivienda" error={errors.numero}><input className={`input ${errors.numero ? "border-red-300" : ""}`} value={form.numero} onChange={(e) => set("numero", e.target.value)} placeholder="23" /></Field>
                  </>
                )}
            </fieldset>
            
            <button className="btn-primary flex w-full justify-center" disabled={loading}>
              {loading ? "Creando cuenta..." : "Registrarme"}
            </button>
          </form>

          <div className="mt-6 text-center text-sm text-slate-600">
            <div>
              ¿Ya tienes cuenta?{" "}
              <Link to="/login" className="font-medium text-indigo-600 hover:underline">
                Inicia sesión
              </Link>
            </div>
            <div className="mt-2">
              <Link
                to="#"
                onClick={(e) => e.preventDefault()}
                className="font-medium text-slate-400 cursor-not-allowed"
                aria-disabled="true"
              >
                ¿Olvidó su clave?
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}