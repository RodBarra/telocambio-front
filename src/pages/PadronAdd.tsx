import { useForm } from "react-hook-form";
import { useAuth } from "../context/AuthContext";
import { PadronApi } from "../services/padron";
import { useState } from "react";

type F = { correo: string; torre?: string; direccion_texto?: string; numero?: string; };

export default function PadronAdd() {
  const { user } = useAuth();
  const { register, handleSubmit } = useForm<F>();
  const [msg, setMsg] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const comunidadId = user?.rol_usuario_id === 1
    ? (Number(localStorage.getItem("cid")) || 0)
    : user?.comunidad_id!;

  const onSubmit = async (f: F) => {
    try {
      setError(null);
      await PadronApi.add(comunidadId, f);
      setMsg("Correo agregado al padrón");
    } catch (e: any) {
      setMsg(null);
      setError(e?.response?.data?.detail || "Error");
    }
  };

  return (
    <div className="max-w-lg mx-auto p-4">
      <h1 className="text-xl font-semibold mb-3">Agregar correo al padrón</h1>
      <form className="space-y-3" onSubmit={handleSubmit(onSubmit)}>
        <input className="border px-3 py-2 w-full" placeholder="correo@ejemplo.cl" {...register("correo")} />
        <input className="border px-3 py-2 w-full" placeholder="Torre (Depto)" {...register("torre")} />
        <input className="border px-3 py-2 w-full" placeholder="Dirección (Condominio)" {...register("direccion_texto")} />
        <input className="border px-3 py-2 w-full" placeholder="Número vivienda" {...register("numero")} />
        <button className="border px-4 py-2 rounded">Agregar</button>
      </form>
      {msg && <p className="text-green-600 mt-2">{msg}</p>}
      {error && <p className="text-red-600 mt-2">{error}</p>}
    </div>
  );
}
