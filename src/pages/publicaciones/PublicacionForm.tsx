// src/pages/publicaciones/PublicacionForm.tsx
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import Spinner from "../../components/Spinner";
import { AlertErr } from "../../components/Alert";
import ImageGalleryEditor from "../../components/ImageGalleryEditor";
import {
  getCategorias,
  createPublicacion,
  getPublicacion,
  setImagenes,
  updatePublicacion,
  uploadImagenesArchivo,
} from "../../services/publicaciones";
import { useAuth } from "../../context/AuthContext";
import type { Categoria, Publicacion } from "../../types";

const ESTADO = { ACTIVA: 1, OCULTA: 2, REALIZADA: 3 } as const;

type GalleryItem = {
  id?: number;
  url?: string;
  file?: File;
  preview?: string;
  posicion?: number;
};

export default function PublicacionForm() {
  const { id } = useParams();
  const editing = Boolean(id);
  const nav = useNavigate();
  const { user } = useAuth();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const [info, setInfo] = useState<string | null>(null);
  const [cats, setCats] = useState<Categoria[]>([]);
  const [estadoActual, setEstadoActual] = useState<number | null>(null);

  const [form, setForm] = useState({
    categoria_id: 0,
    tipo_publicacion_id: 2,
    titulo: "",
    descripcion: "",
    condicion_publicacion_id: 1,
  });

  const [images, setImages] = useState<GalleryItem[]>([]);

  function setField<K extends keyof typeof form>(k: K, v: (typeof form)[K]) {
    setForm((f) => ({ ...f, [k]: v }));
  }

  async function load() {
    try {
      setLoading(true);
      setErr(null);
      setInfo(null);

      const catsData = await getCategorias();
      setCats(catsData);

      if (editing && id) {
        const pub = await getPublicacion(Number(id));

        // ------- GUARDIA DE PERMISOS (cliente) -------
        const esOwner = !!user && pub.propietario_usuario_id === user.id;
        const esMod = !!user && (user.rol_usuario_id === 1 || user.rol_usuario_id === 2);
        if (!esOwner && !esMod) {
          // No permitir ver/editar si no es dueño ni moderador
          setErr("No estás autorizado para editar esta publicación.");
          // Redirige y corta el flujo
          nav("/publicaciones", { replace: true });
          return;
        }
        // --------------------------------------------

        setForm({
          categoria_id: pub.categoria_id,
          tipo_publicacion_id: pub.tipo_publicacion_id,
          titulo: pub.titulo,
          descripcion: pub.descripcion ?? "",
          condicion_publicacion_id: pub.condicion_publicacion_id,
        });
        setEstadoActual(pub.estado_publicacion_id);

        const imgs = (pub.imagenes ?? []).map((x) => ({
          id: x.id,
          url: x.url,
          posicion: x.posicion,
        }));
        imgs.sort((a, b) => (a.posicion ?? 0) - (b.posicion ?? 0));
        setImages(imgs);
      }
    } catch (e: any) {
      const msg =
        e?.response?.data?.detail ??
        (Array.isArray(e?.response?.data) ? e.response.data[0] : null) ??
        e?.message ??
        "Error al cargar formulario.";
      setErr(String(msg));
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  /**
   * Persiste el estado visual EXACTO del componente `images`:
   * - Sube primero los `file` nuevos y obtiene sus URLs.
   * - Reemplaza, en el MISMO orden del array `images`, los items con `file` por las URLs subidas.
   * - Llama a `setImagenes(pubId, payload)` con la lista combinada final (máx 4) y sus posiciones.
   *   (Si queda vacío, enviamos [], para que el backend elimine todas en DB y bucket.)
   */
  async function persistImages(pubId: number) {
    const current = images.slice(0, 4);

    // 1) Identifica archivos nuevos
    const fileIndices: number[] = [];
    const filesToUpload: File[] = [];
    current.forEach((it, idx) => {
      if (it.file) {
        fileIndices.push(idx);
        filesToUpload.push(it.file);
      }
    });

    // 2) Sube los nuevos (si hay) y captura posible `info` del backend
    const uploadedUrlsByIndex: Record<number, string> = {};
    if (filesToUpload.length > 0) {
      const res = await uploadImagenesArchivo(pubId, filesToUpload);
      if (res?.info) setInfo(String(res.info));
      const uploaded = Array.isArray(res?.data) ? res.data : [];
      uploaded.forEach((u: any, i: number) => {
        const idxEnImages = fileIndices[i];
        uploadedUrlsByIndex[idxEnImages] = u.url;
      });
    }

    // 3) Construye el arreglo final respetando orden visual
    const finalOrdered: { url: string; posicion: number }[] = current
      .map((it, idx) => {
        const url = it.file ? uploadedUrlsByIndex[idx] : it.url || "";
        return { url, posicion: idx };
      })
      .filter((x) => !!x.url);

    // 4) Persistir SIEMPRE
    await setImagenes(pubId, finalOrdered);
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    try {
      setSaving(true);
      setErr(null);
      setInfo(null);

      if (!form.titulo.trim()) throw new Error("El título es obligatorio.");
      if (!form.categoria_id) throw new Error("Selecciona una categoría.");

      let pub: Publicacion;
      if (!editing) {
        const res = await createPublicacion(form);
        pub = res.data;
      } else {
        const res = await updatePublicacion(Number(id), form);
        pub = res.data;
      }

      await persistImages(pub.id);
      nav("/publicaciones");
    } catch (e: any) {
      const msg =
        e?.response?.data?.detail ??
        (Array.isArray(e?.response?.data) ? e.response.data[0] : null) ??
        e?.message ??
        "Error al guardar.";
      setErr(String(msg));
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <div className="py-16">
        <Spinner />
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-6 relative">
      {/* Overlay al guardar */}
      {saving && (
        <div className="absolute inset-0 bg-white/60 backdrop-blur-[1px] z-10 flex items-center justify-center rounded-xl">
          <Spinner />
        </div>
      )}

      <h1 className="text-2xl font-bold mb-4">
        {editing ? "Editar publicación" : "Nueva publicación"}
      </h1>

      {err && <AlertErr>{err}</AlertErr>}
      {info && (
        <div className="mt-3 text-sm text-blue-700 bg-blue-50 border border-blue-200 rounded-md p-3">
          {info}
        </div>
      )}

      <form
        onSubmit={onSubmit}
        className="bg-white rounded-2xl shadow-sm border p-4 sm:p-6 space-y-6"
      >
        {/* ========================== Campos básicos ========================== */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm text-gray-600 mb-1">Título *</label>
            <input
              value={form.titulo}
              onChange={(e) => setField("titulo", e.target.value)}
              className="w-full rounded-lg border-gray-300 bg-white"
              maxLength={120}
              disabled={saving}
            />
            <p className="text-xs text-gray-400 mt-1">3–120 caracteres.</p>
          </div>

          <div>
            <label className="block text-sm text-gray-600 mb-1">Categoría *</label>
            <select
              value={form.categoria_id}
              onChange={(e) => setField("categoria_id", Number(e.target.value))}
              className="w-full rounded-lg border-gray-300 bg-white"
              disabled={saving}
            >
              <option value={0}>Selecciona…</option>
              {cats.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.nombre}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm text-gray-600 mb-1">Tipo</label>
            <select
              value={form.tipo_publicacion_id}
              onChange={(e) => setField("tipo_publicacion_id", Number(e.target.value))}
              className="w-full rounded-lg border-gray-300 bg-white"
              disabled={saving}
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
              disabled={saving}
            >
              <option value={1}>Nuevo</option>
              <option value={2}>Usado</option>
              <option value={3}>Malo</option>
            </select>
          </div>

          {editing && estadoActual != null && (
            <div className="md:col-span-2">
              <span className="inline-block text-xs px-2 py-1 rounded bg-slate-100 text-slate-700">
                Estado actual:{" "}
                {estadoActual === ESTADO.ACTIVA
                  ? "Activa"
                  : estadoActual === ESTADO.OCULTA
                  ? "Oculta"
                  : "Realizada"}
              </span>
            </div>
          )}
        </div>

        {/* ========================== Descripción ========================== */}
        <div>
          <label className="block text-sm text-gray-600 mb-1">Descripción</label>
          <textarea
            value={form.descripcion}
            onChange={(e) => setField("descripcion", e.target.value)}
            rows={5}
            maxLength={2000}
            className="w-full rounded-lg border-gray-300 bg-white"
            disabled={saving}
          />
          <p className="text-xs text-gray-400 mt-1">0–2000 caracteres.</p>
        </div>

        {/* ========================== Imágenes ========================== */}
        <div className="rounded-xl bg-blue-50 p-4 border border-blue-100">
          <div className="flex items-center justify-between mb-2">
            <h2 className="font-semibold">Imágenes (máx. 4)</h2>
            {saving && (
              <span className="text-xs text-blue-700 bg-blue-100 px-2 py-0.5 rounded">
                Guardando...
              </span>
            )}
          </div>
          <ImageGalleryEditor images={images} onChange={setImages} />
          <p className="text-xs text-amber-700 bg-amber-50 border border-amber-200 rounded-md p-2 mt-3">
            Consejo: arrastra para cambiar el orden; la imagen #1 será la portada.
          </p>
        </div>

        <div className="pt-2 flex items-center justify-end gap-2">
          <button
            type="button"
            className="btn btn-outline"
            onClick={() => nav(-1)}
            disabled={saving}
          >
            Cancelar
          </button>
          <button className="btn btn-primary" type="submit" disabled={saving}>
            {editing ? "Guardar cambios" : "Crear publicación"}
          </button>
        </div>
      </form>
    </div>
  );
}
