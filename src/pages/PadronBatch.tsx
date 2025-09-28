import { useForm } from "react-hook-form";
import { useAuth } from "../context/AuthContext";
import { PadronApi } from "../services/padron";
import { useState } from "react";

type F = { correos: string; torre?: string; direccion_texto?: string; numero?: string; };

export default function PadronBatch() {
  const { user } = useAuth();
  const { register, handleSubmit } = useForm<F>();
  const [res, setRes] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  const comunidadId = user?.rol_usuario_id === 1
    ? (Number(localStorage.getItem("cid")) || 0)
    : user?.comunidad_id!;

  const onSubmit = async (f: F) => {
    try {
      setError(null);
      const { data } = await PadronApi.batch(comunidadId, f);
      setRes(data);
    } catch (e: any) {
      setRes(null);
      setError(e?.response?.data?.detail || "Error");
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-4">
      <h1 className="text-xl font-semibold mb-3">Carga por lote (pegar lista)</h1>
      <form className="space-y-3" onSubmit={handleSubmit(onSubmit)}>
        <textarea className="border px-3 py-2 w-full h-48" placeholder="correo1@...\ncorreo2@...\n..." {...register("correos")} />
        <div className="grid grid-cols-3 gap-2">
          <input className="border px-3 py-2" placeholder="Torre (Depto)" {...register("torre")} />
          <input className="border px-3 py-2" placeholder="Dirección (Condominio)" {...register("direccion_texto")} />
          <input className="border px-3 py-2" placeholder="N°" {...register("numero")} />
        </div>
        <button className="border px-4 py-2 rounded">Cargar</button>
      </form>
      {res && <pre className="mt-4 p-3 bg-gray-100 rounded text-sm">{JSON.stringify(res, null, 2)}</pre>}
      {error && <p className="text-red-600 mt-2">{error}</p>}
    </div>
  );
}
