// src/pages/Dashboard.tsx
import { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import { ComunidadesApi } from "../services/comunidades";
import type { Comunidad } from "../services/comunidades";

export default function Dashboard() {
  const { user } = useAuth();
  const [comunidad, setComunidad] = useState<Comunidad | null>(null);
  const isAdmin = user?.rol_usuario_id === 1;

  useEffect(() => {
    const load = async () => {
      if (user?.comunidad_id) {
        try {
          const { data } = await ComunidadesApi.get(user.comunidad_id);
          setComunidad(data);
        } catch {
          setComunidad(null);
        }
      }
    };
    load();
  }, [user?.comunidad_id]);

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Bienvenido{user?.nombre ? `, ${user.nombre}` : ""}</h1>
          {user?.comunidad_id ? (
            <p className="text-slate-600">
              Comunidad: <b>{comunidad?.nombre ?? "..."}</b> ({comunidad?.codigo ?? "..."})
            </p>
          ) : (
            <p className="text-slate-600">Rol: <b>Administrador</b></p>
          )}
        </div>
      </div>

      {/* Carrusel mock */}
      <div className="card p-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[1,2,3].map((i) => (
            <div key={i} className="h-36 rounded-xl bg-gradient-to-br from-slate-100 to-slate-200 grid place-items-center">
              <span className="text-slate-500">Banner {i}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Listado mock */}
      <div className="card p-4">
        <h2 className="font-semibold mb-3">Publicaciones recientes</h2>
        <div className="grid md:grid-cols-3 gap-4">
          {[1,2,3,4,5,6].map((i) => (
            <div key={i} className="rounded-xl border p-4">
              <div className="h-24 bg-slate-100 rounded-lg mb-3"/>
              <div className="font-medium">Publicación #{i}</div>
              <div className="text-xs text-slate-500">Descripción breve de ejemplo…</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
