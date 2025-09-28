import { FormEvent, useEffect, useState } from "react";
import { useAuth } from "../../context/AuthContext";
import { PadronApi, type PadronItem } from "../../services/padron";
import { AlertErr, AlertOk } from "../../components/Alert";
import ConfirmModal from "../../components/ConfirmModal";

type EstadoFiltro = "" | "Libre" | "Usado";

export default function ModPadron() {
  const { user } = useAuth();
  const [items, setItems] = useState<PadronItem[]>([]);
  const [q, setQ] = useState("");
  const [estado, setEstado] = useState<EstadoFiltro>("");
  const [habilitado, setHabilitado] = useState<"" | "1" | "0">("");
  const [err, setErr] = useState<string | null>(null);
  const [ok, setOk] = useState<string | null>(null);
  const [form, setForm] = useState({ correo: "" });
  const [loadingAdd, setLoadingAdd] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editingCorreo, setEditingCorreo] = useState<string>("");

  // modal eliminar
  const [toDelete, setToDelete] = useState<PadronItem | null>(null);
  const openDelete = (row: PadronItem) => setToDelete(row);
  const closeDelete = () => setToDelete(null);

  const load = async () => {
    setErr(null);
    try {
      if (!user?.comunidad_id) return;
      const params: any = {};
      if (q) params.q = q;
      if (estado) params.estado = estado;
      if (habilitado !== "") params.habilitado = habilitado === "1";
      const { data } = await PadronApi.list(user.comunidad_id, params);
      setItems(data.items || []);
    } catch (e: any) {
      setErr(e?.response?.data?.detail || "No se pudo cargar el padrón.");
    }
  };

  useEffect(() => { load();   // eslint-disable-next-line
  }, [user?.comunidad_id]);

  const onSearch = async () => {
    await load();
  };

  const onAdd = async (e: FormEvent) => {
    e.preventDefault();
    setOk(null); setErr(null);
    if (!user?.comunidad_id) return;
    if (!form.correo.trim()) return;
    setLoadingAdd(true);
    try {
      await PadronApi.add(user.comunidad_id, { correo: form.correo.trim() });
      setForm({ correo: "" });
      setOk("Correo agregado al padrón.");
      await load();
    } catch (e: any) {
      setErr(e?.response?.data?.detail || "No se pudo agregar el correo.");
    } finally {
      setLoadingAdd(false);
    }
  };

  const startEdit = (row: PadronItem) => {
    setEditingId(row.id);
    setEditingCorreo(row.correo);
  };

  const saveEdit = async (row: PadronItem) => {
    if (!user?.comunidad_id || editingId !== row.id) return;
    try {
      await PadronApi.updateCorreo(user.comunidad_id, row.id, editingCorreo.trim());
      setEditingId(null);
      setEditingCorreo("");
      await load();
    } catch (e: any) {
      setErr(e?.response?.data?.detail || "No se pudo actualizar el correo.");
    }
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditingCorreo("");
  };

  const remove = async (row: PadronItem) => {
    if (!user?.comunidad_id) return;
    openDelete(row);
  };

  const confirmDelete = async () => {
    if (!user?.comunidad_id || !toDelete) return;
    try {
      await PadronApi.remove(user.comunidad_id, toDelete.id);
      closeDelete();
      await load();
    } catch (e: any) {
      setErr(e?.response?.data?.detail || "No se pudo eliminar el padrón.");
      closeDelete();
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Padrón</h1>
        <div className="flex gap-2">
          <input className="input" placeholder="Buscar correo…" value={q} onChange={(e)=>setQ(e.target.value)} />
          <select className="input" value={estado} onChange={(e)=>setEstado(e.target.value as EstadoFiltro)}>
            <option value="">Estado (todos)</option>
            <option value="Libre">Libre</option>
            <option value="Usado">Usado</option>
          </select>
          <select className="input" value={habilitado} onChange={(e)=>setHabilitado(e.target.value as any)}>
            <option value="">Habilitado (todos)</option>
            <option value="1">Sí</option>
            <option value="0">No</option>
          </select>
          <button className="btn btn-outline" onClick={onSearch}>Buscar</button>
        </div>
      </div>

      {ok && <AlertOk>{ok}</AlertOk>}
      {err && <AlertErr>{err}</AlertErr>}

      <div className="card overflow-x-auto">
        <table className="min-w-full text-sm">
          <thead>
            <tr className="bg-slate-50 text-left">
              <th className="px-4 py-2">Correo</th>
              <th className="px-4 py-2">Habilitado</th>
              <th className="px-4 py-2">Estado</th>
              <th className="px-4 py-2">Cargado en</th>
              <th className="px-4 py-2 text-right">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {items.map((row) => {
              const libre = row.estado === "Libre";
              return (
                <tr key={row.id} className="border-t">
                  <td className="px-4 py-2">
                    {editingId === row.id ? (
                      <input
                        className="input h-8"
                        value={editingCorreo}
                        onChange={(e)=>setEditingCorreo(e.target.value)}
                      />
                    ) : (
                      row.correo
                    )}
                  </td>
                  <td className="px-4 py-2">
                    <span className={`inline-flex items-center rounded-full border px-2 py-0.5 text-xs ${
                      row.habilitado ? "border-emerald-200 bg-emerald-50 text-emerald-700" : "border-slate-200 bg-slate-50 text-slate-600"
                    }`}>
                      {row.habilitado ? "Sí" : "No"}
                    </span>
                  </td>
                  <td className="px-4 py-2">
                    <span className={`inline-flex items-center rounded-full border px-2 py-0.5 text-xs ${
                      libre ? "border-sky-200 bg-sky-50 text-sky-700" : "border-slate-200 bg-slate-50 text-slate-600"
                    }`}>
                      {row.estado}
                    </span>
                  </td>
                  <td className="px-4 py-2">
                    {row.cargado_en ? new Date(row.cargado_en).toLocaleString() : "-"}
                  </td>
                  <td className="px-4 py-2 text-right">
                    {editingId === row.id ? (
                      <div className="flex justify-end gap-2">
                        <button className="btn btn-primary h-8 px-3 py-1" onClick={()=>saveEdit(row)}>Guardar</button>
                        <button className="btn btn-outline h-8 px-3 py-1" onClick={cancelEdit}>Cancelar</button>
                      </div>
                    ) : (
                      <div className="flex justify-end gap-2">
                        <button
                          className="btn btn-outline h-8 px-3 py-1"
                          title={libre ? "Editar correo" : "No editable si está Usado"}
                          onClick={()=>libre && startEdit(row)}
                          disabled={!libre}
                        >
                          ✏️
                        </button>
                        <button
                          className="btn btn-outline h-8 px-3 py-1"
                          title="Eliminar"
                          onClick={()=>remove(row)}
                        >
                          🗑️
                        </button>
                      </div>
                    )}
                  </td>
                </tr>
              );
            })}
            {items.length === 0 && (
              <tr>
                <td colSpan={5} className="px-4 py-10 text-center text-slate-500">
                  Sin correos cargados
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <div className="card p-6">
        <h2 className="font-semibold mb-3">Agregar correo al padrón</h2>
        <form className="grid md:grid-cols-4 gap-3" onSubmit={onAdd}>
          <input
            className="input md:col-span-3"
            placeholder="correo@ejemplo.cl"
            value={form.correo}
            onChange={(e)=>setForm({ correo: e.target.value })}
            required
          />
          <button className="btn btn-primary" disabled={loadingAdd}>
            {loadingAdd ? "Agregando..." : "Agregar"}
          </button>
        </form>
      </div>

      {/* MODAL eliminar padrón */}
      <ConfirmModal
        open={!!toDelete}
        title="Eliminar del padrón"
        message={
          <>
            Esta acción es <strong>definitiva</strong>. Se eliminará del padrón el correo:{" "}
            <span className="font-mono">{toDelete?.correo}</span>
          </>
        }
        confirmText="Eliminar del padrón"
        cancelText="Cancelar"
        onConfirm={confirmDelete}
        onCancel={closeDelete}
      />
    </div>
  );
}
