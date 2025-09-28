import { useEffect, useState } from "react";
import { ComunidadesApi } from "../services/comunidades";

export default function ComunidadesAdmin() {
  const [rows, setRows] = useState<any[]>([]);
  const [q, setQ] = useState("");

  useEffect(() => {
    ComunidadesApi.list(q).then(({ data }) => setRows(data.items || data));
  }, [q]);

  return (
    <div className="p-4">
      <h1 className="text-xl font-semibold mb-3">Comunidades (Admin)</h1>
      <input className="border px-3 py-2 mb-3 w-full" placeholder="Buscar..." value={q} onChange={(e)=>setQ(e.target.value)} />
      <div className="overflow-x-auto">
        <table className="min-w-full text-sm border">
          <thead className="bg-gray-50">
            <tr>
              <th className="border px-2 py-1">ID</th>
              <th className="border px-2 py-1">Nombre</th>
              <th className="border px-2 py-1">Tipo</th>
              <th className="border px-2 py-1">Código</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r:any)=>(
              <tr key={r.id}>
                <td className="border px-2 py-1">{r.id}</td>
                <td className="border px-2 py-1">{r.nombre}</td>
                <td className="border px-2 py-1">{r.tipo_id===1?'Departamento':'Condominio'}</td>
                <td className="border px-2 py-1">{r.codigo}</td>
              </tr>
            ))}
            {rows.length===0 && <tr><td className="px-2 py-3 text-center" colSpan={4}>Sin resultados</td></tr>}
          </tbody>
        </table>
      </div>
    </div>
  );
}
