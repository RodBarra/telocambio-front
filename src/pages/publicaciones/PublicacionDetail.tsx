// src/pages/publicaciones/PublicacionDetail.tsx
import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import Spinner from "../../components/Spinner";
import { AlertErr } from "../../components/Alert";
import ImageCarousel from "../../components/ImageCarousel";
import { getCategorias, getPublicacion } from "../../services/publicaciones";
import { useAuth } from "../../context/AuthContext";
import type { Categoria, Publicacion } from "../../types";

function StatusChip({ estado }: { estado: number }) {
  const map: Record<number, { text: string; cls: string }> = {
    1: { text: "Activa", cls: "bg-emerald-50 text-emerald-700 border-emerald-200" },
    2: { text: "Oculta", cls: "bg-amber-50 text-amber-700 border-amber-200" },
    3: { text: "Realizada", cls: "bg-gray-100 text-gray-700 border-gray-200" },
  };
  const o = map[estado] ?? { text: "—", cls: "bg-gray-100 text-gray-600 border-gray-200" };
  return <span className={`text-xs px-2 py-1 rounded border ${o.cls}`}>{o.text}</span>;
}

function metaFmt(dateStr?: string) {
  if (!dateStr) return "—";
  try {
    const d = new Date(dateStr);
    return d.toLocaleString();
  } catch {
    return dateStr;
  }
}

export default function PublicacionDetail() {
  const { id } = useParams();
  const nav = useNavigate();
  const { user } = useAuth();

  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string | null>(null);
  const [pub, setPub] = useState<Publicacion | null>(null);
  const [cats, setCats] = useState<Categoria[]>([]);

  const categoriaNombre = useMemo(() => {
    if (!pub) return "—";
    const c = cats.find((x) => x.id === pub.categoria_id);
    return c?.nombre ?? `#${pub.categoria_id}`;
  }, [cats, pub]);

  useEffect(() => {
    (async () => {
      try {
        setLoading(true);
        setErr(null);
        const [catsData, pubData] = await Promise.all([
          getCategorias(),
          getPublicacion(Number(id)),
        ]);
        setCats(catsData);
        setPub(pubData);
      } catch (e: any) {
        setErr(e?.message || "Error al cargar la publicación.");
      } finally {
        setLoading(false);
      }
    })();
  }, [id]);

  const images = useMemo(
    () =>
      (pub?.imagenes ?? []).slice(0, 4).map((x) => ({
        id: x.id,
        url: x.url,
        alt: pub?.titulo ?? `Imagen ${x.posicion + 1}`,
      })),
    [pub]
  );

  // Autor desde el backend (campos embebidos en el serializer de detalle)
  const autorNombre = (pub?.propietario_nombre ?? "").trim();
  const autorApellidos = (pub?.propietario_apellidos ?? "").trim();
  const autorInicial =
    (autorNombre || autorApellidos ? (autorNombre || autorApellidos)[0] : "U").toUpperCase();

  // Permisos de edición (cliente)
  const puedeEditar =
    !!user &&
    (user.rol_usuario_id === 1 || // Admin
      user.rol_usuario_id === 2 || // Moderador
      (pub && pub.propietario_usuario_id === user.id)); // Dueño

  if (loading) return <div className="py-16"><Spinner /></div>;
  if (err) return <div className="max-w-5xl mx-auto px-4 py-6"><AlertErr>{err}</AlertErr></div>;
  if (!pub) return <div className="max-w-5xl mx-auto px-4 py-6"><AlertErr>No se encontró la publicación.</AlertErr></div>;

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      {/* Header + breadcrumb */}
      <div className="mb-4 text-sm text-gray-500">
        <button className="hover:underline" onClick={() => nav(-1)}>&larr; Volver</button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Columna izquierda: Galería */}
        <div className="lg:col-span-7">
          <ImageCarousel images={images} aspect="aspect-[4/3] md:aspect-square" />
        </div>

        {/* Columna derecha: Meta + Autor + Acciones */}
        <div className="lg:col-span-5">
          <div className="bg-white rounded-2xl border shadow-sm p-5 space-y-4">
            <div className="flex items-start justify-between gap-3">
              <div>
                <h1 className="text-xl font-bold leading-snug">{pub.titulo}</h1>
                <div className="flex items-center gap-2 mt-1">
                  <StatusChip estado={pub.estado_publicacion_id} />
                  <span className="text-xs text-gray-500">ID: {pub.id}</span>
                </div>
              </div>
            </div>

            <div className="text-sm text-gray-600 space-y-1">
              <div><span className="text-gray-500">Categoría: </span><b>{categoriaNombre}</b></div>
              <div><span className="text-gray-500">Tipo: </span>
                {pub.tipo_publicacion_id === 1 ? "Servicio" : pub.tipo_publicacion_id === 2 ? "Producto" : "Regalo"}
              </div>
              <div><span className="text-gray-500">Condición: </span>
                {pub.condicion_publicacion_id === 1 ? "Nuevo" : pub.condicion_publicacion_id === 2 ? "Usado" : "Malo"}
              </div>
              <div className="text-xs pt-1 text-gray-500">
                Creada: {metaFmt(pub.creada_en)} · Actualizada: {metaFmt(pub.actualizada_en)}
              </div>
            </div>

            {/* Autor */}
            <div className="border-t pt-4">
              <h3 className="text-sm font-semibold mb-2">Publicado por</h3>
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-full bg-gradient-to-br from-blue-200 to-blue-400 grid place-items-center text-white font-semibold">
                  {autorInicial}
                </div>
                <div className="text-sm">
                  <div className="font-medium">
                    {autorNombre || autorApellidos
                      ? `${autorNombre} ${autorApellidos}`.trim()
                      : `Usuario #${pub.propietario_usuario_id}`}
                  </div>
                </div>
              </div>
            </div>

            {/* Acciones */}
            <div className="pt-2 flex flex-col sm:flex-row gap-2">
              <Link
                to={`/trueques/nuevo?pub=${pub.id}`}
                className="btn btn-primary w-full sm:w-auto"
              >
                Iniciar intercambio
              </Link>

              {puedeEditar && (
                <Link
                  to={`/publicaciones/${pub.id}/editar`}
                  className="btn btn-outline w-full sm:w-auto"
                >
                  Editar
                </Link>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Descripción */}
      <div className="mt-6 bg-white rounded-2xl border shadow-sm p-5">
        <h2 className="text-base font-semibold mb-2">Descripción</h2>
        <p className="text-gray-700 whitespace-pre-line">
          {pub.descripcion?.trim() || "Sin descripción."}
        </p>
      </div>

      {/* Ofertas (placeholder) */}
      <div className="mt-6 bg-white rounded-2xl border shadow-sm p-5">
        <div className="flex items-center justify-between mb-2">
          <h2 className="text-base font-semibold">Ofertas</h2>
          <span className="text-xs text-gray-500">Pronto: listado de ofertas/trueques</span>
        </div>
        <div className="text-gray-500 text-sm">
          Aún no hay ofertas. Cuando otro residente proponga un intercambio, aparecerá aquí.
        </div>
      </div>
    </div>
  );
}
