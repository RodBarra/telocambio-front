// src/pages/publicaciones/PublicacionForm.tsx
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import Spinner from "../../components/Spinner";
import { AlertErr } from "../../components/Alert";
import {
  getCategorias,
  createPublicacion,
  getPublicacion,
  setImagenes,
  updatePublicacion,
} from "../../services/publicaciones";
import type { Categoria, Publicacion } from "../../types";

// Estados del sistema (solo informativos aquí)
const ESTADO = { ACTIVA: 1, OCULTA: 2, REALIZADA: 3 } as const;
type ImgDraft = { url: string; posicion: number };

function normalizeCats(input: any): Categoria[] {
  if (Array.isArray(input)) return input as Categoria[];
  if (input?.results) return input.results as Categoria[];
  if (input?.items) return input.items as Categoria[];
  if (input?.data) return input.data as Categoria[];
  return [];
}

export default function PublicacionForm() {
  const { id } = useParams();
  const editing = Boolean(id);
  const nav = useNavigate();

  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string | null>(null);

  const [cats, setCats] = useState<Categoria[]>([]);
  const [form, setForm] = useState({
    categoria_id: 0,
    tipo_publicacion_id: 2, // por defecto "Producto" (1=Servicio, 2=Producto, 3=Regalo)
    titulo: "",
    descripcion: "",
    condicion_publicacion_id: 1, // 1=Nuevo, 2=Usado, 3=Malo
  });

  // Para edición, si quieres mostrar el estado actual de forma informativa:
  const [estadoActual, setEstadoActual] = useState<number | null>(null);

  const [imgs, setImgs] = useState<ImgDraft[]>([]); // máximo 4

  function setField<K extends keyof typeof form>(k: K, v: (typeof form)[K]) {
    setForm((f) => ({ ...f, [k]: v }));
  }

  async function load() {
    try {
      setLoading(true);
      setErr(null);

      const catsRaw = await getCategorias();
      setCats(normalizeCats(catsRaw));

      if (editing && id) {
        const pub = await getPublicacion(Number(id));
        setForm({
          categoria_id: pub.categoria_id,
          tipo_publicacion_id: pub.tipo_publicacion_id,
          titulo: pub.titulo,
          descripcion: pub.descripcion ?? "",
          condicion_publicacion_id: pub.condicion_publicacion_id,
        });
        setEstadoActual(pub.estado_publicacion_id);

        const imgsDraft = (pub.imagenes ?? [])
          .slice(0, 4)
          .map((x) => ({ url: x.url, posicion: x.posicion }));
        setImgs(imgsDraft);
      }
    } catch (e: any) {
      setErr(e?.message || "Error al cargar formulario");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { load(); }, []);

  async function saveImages(pubId: number) {
    const payload = imgs.slice(0, 4).map((x, i) => ({
      url: x.url.trim(),
      posicion: i,
    }));
    if (payload.length) await setImagenes(pubId, payload);
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    try {
      setErr(null);
      if (!form.titulo.trim()) throw new Error("El título es obligatorio.");
      if (!form.categoria_id) throw new Error("Selecciona una categoría.");

      if (!editing) {
        // Crear: SIN enviar estado. Backend la deja en Activa (1).
        const res = await createPublicacion(form);
        const pub = res.data as Publicacion;
        await saveImages(pub.id);
        nav("/publicaciones");
      } else {
        // Editar: SIN tocar estado desde el formulario
        const res = await updatePublicacion(Number(id), form);
        const pub = res.data as Publicacion;
        await saveImages(pub.id);
        nav("/publicaciones");
      }
    } catch (e: any) {
      setErr(e?.message || "Error al guardar.");
    }
  }

  const addImg = () => {
    if (imgs.length >= 4) return alert("Máximo 4 imágenes.");
    setImgs((arr) => [...arr, { url: "", posicion: arr.length }]);
  };
  const setImg = (i: number, url: string) => {
    setImgs((arr) => arr.map((x, idx) => (idx === i ? { ...x, url } : x)));
  };
  const delImg = (i: number) => setImgs((arr) => arr.filter((_, idx) => idx !== i));
  const move = (i: number, dir: -1 | 1) => {
    const j = i + dir;
    if (j < 0 || j >= imgs.length) return;
    const next = [...imgs];
    [next[i], next[j]] = [next[j], next[i]];
    setImgs(next);
  };

  if (loading) return <div className="py-16"><Spinner /></div>;

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      <h1 className="text-2xl font-bold mb-4">
        {editing ? "Editar publicación" : "Nueva publicación"}
      </h1>

      {err && <AlertErr>{err}</AlertErr>}

      <form onSubmit={onSubmit} className="bg-white rounded-2xl shadow-sm border p-4 sm:p-6 space-y-4">
        {/* Sección básica */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm text-gray-600 mb-1">Título *</label>
            <input
              value={form.titulo}
              onChange={(e) => setField("titulo", e.target.value)}
              className="w-full rounded-lg border-gray-300 bg-white"
            />
          </div>

          <div>
            <label className="block text-sm text-gray-600 mb-1">Categoría *</label>
            <select
              value={form.categoria_id}
              onChange={(e) => setField("categoria_id", Number(e.target.value))}
              className="w-full rounded-lg border-gray-300 bg-white"
            >
              <option value={0}>Selecciona…</option>
              {cats.map((c) => (
                <option key={c.id} value={c.id}>{c.nombre}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm text-gray-600 mb-1">Tipo</label>
            <select
              value={form.tipo_publicacion_id}
              onChange={(e) => setField("tipo_publicacion_id", Number(e.target.value))}
              className="w-full rounded-lg border-gray-300 bg-white"
            >
              <option value={1}>Servicio</option>
              <option value={2}>Producto</option>
              <option value={3}>Regalo</option>
            </select>
          </div>

          <div>
            <label className="block text-sm text-gray-600 mb-1">Condición</label>
            <select
              value={form.condicion_publicacion_id}
              onChange={(e) => setField("condicion_publicacion_id", Number(e.target.value))}
              className="w-full rounded-lg border-gray-300 bg-white"
            >
              <option value={1}>Nuevo</option>
              <option value={2}>Usado</option>
              <option value={3}>Malo</option>
            </select>
          </div>

          {editing && estadoActual != null && (
            <div className="md:col-span-2">
              <span className="inline-block text-xs px-2 py-1 rounded bg-slate-100 text-slate-700">
                Estado actual: {estadoActual === ESTADO.ACTIVA ? "Activa" : estadoActual === ESTADO.OCULTA ? "Oculta" : "Realizada"}
              </span>
            </div>
          )}
        </div>

        <div>
          <label className="block text-sm text-gray-600 mb-1">Descripción</label>
          <textarea
            value={form.descripcion}
            onChange={(e) => setField("descripcion", e.target.value)}
            rows={5}
            className="w-full rounded-lg border-gray-300 bg-white"
          />
        </div>

        {/* Imágenes */}
        <div className="rounded-xl bg-blue-50 p-4 border border-blue-100">
          <div className="flex items-center justify-between mb-2">
            <h2 className="font-semibold">Imágenes (máx. 4)</h2>
            <button type="button" onClick={addImg} className="btn btn-outline">Agregar</button>
          </div>

          <div className="grid grid-cols-1 gap-3">
            {imgs.map((img, i) => (
              <div key={i} className="bg-white rounded-lg border p-3">
                <div className="flex items-center gap-3">
                  <input
                    value={img.url}
                    onChange={(e) => setImg(i, e.target.value)}
                    placeholder="https://…"
                    className="flex-1 rounded-lg border-gray-300 bg-white"
                  />
                  <div className="flex items-center gap-1">
                    <button type="button" className="btn btn-outline" onClick={() => move(i, -1)} disabled={i === 0}>↑</button>
                    <button type="button" className="btn btn-outline" onClick={() => move(i, +1)} disabled={i === imgs.length - 1}>↓</button>
                    <button type="button" className="btn btn-outline" onClick={() => delImg(i)}>Eliminar</button>
                  </div>
                </div>
                {img.url && (
                  <div className="mt-2 overflow-hidden rounded-md border">
                    <img src={img.url} alt={`img-${i}`} className="w-full max-h-64 object-cover" />
                  </div>
                )}
              </div>
            ))}
            {imgs.length === 0 && (
              <div className="text-sm text-gray-600">
                Puedes crear como “Activa” sin imágenes (si el backend lo permite). Lo ideal es subir al menos una.
              </div>
            )}
          </div>
        </div>

        <div className="pt-2 flex items-center justify-end gap-2">
          <button type="button" className="btn btn-outline" onClick={() => nav(-1)}>Cancelar</button>
          <button className="btn btn-primary" type="submit">
            {editing ? "Guardar cambios" : "Crear publicación"}
          </button>
        </div>
      </form>
    </div>
  );
}
