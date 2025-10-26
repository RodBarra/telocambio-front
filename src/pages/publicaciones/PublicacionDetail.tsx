// src/pages/publicaciones/PublicacionDetail.tsx
import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import Spinner from "../../components/Spinner";
import { AlertErr } from "../../components/Alert";
import ImageCarousel from "../../components/ImageCarousel";
import OfferModal from "../../components/OfferModal";
import { getCategorias, getPublicacion } from "../../services/publicaciones";
import { createIntercambio, listIntercambios } from "../../services/intercambios";
import { useAuth } from "../../context/AuthContext";
import type { Categoria, Publicacion, Intercambio } from "../../types";

function StatusChip({ estado }: { estado: number }) {
  const map: Record<number, { text: string; cls: string }> = {
    1: { text: "Pendiente", cls: "bg-amber-50 text-amber-700 border-amber-200" },
    2: { text: "Finalizado", cls: "bg-emerald-50 text-emerald-700 border-emerald-200" },
    3: { text: "Cancelado", cls: "bg-rose-50 text-rose-700 border-rose-200" },
  };
  const o = map[estado] ?? { text: "—", cls: "bg-gray-100 text-gray-600 border-gray-200" };
  return <span className={`text-xs px-2 py-1 rounded border ${o.cls}`}>{o.text}</span>;
}

function PubStatusChip({ estado }: { estado: number }) {
  const map: Record<number, { text: string; cls: string }> = {
    1: { text: "Activa", cls: "bg-emerald-50 text-emerald-700 border-emerald-200" },
    2: { text: "Oculta", cls: "bg-amber-50 text-amber-700 border-amber-200" },
    3: { text: "Realizada", cls: "bg-gray-100 text-gray-700 border-gray-200" },
  };
  const o = map[estado] ?? { text: "—", cls: "bg-gray-100 text-gray-600 border-gray-200" };
  return <span className={`text-[11px] px-1.5 py-0.5 rounded border ${o.cls}`}>{o.text}</span>;
}

function metaFmt(dateStr?: string) {
  if (!dateStr) return "—";
  try { return new Date(dateStr).toLocaleString(); } catch { return dateStr; }
}

type PubMini = Pick<Publicacion, "id" | "titulo" | "estado_publicacion_id"> & { primera_imagen?: string | null };

// Resumen mínimo desde PublicacionDetail (si no la tenemos completa)
function toMini(pub?: Publicacion | null): PubMini | undefined {
  if (!pub) return undefined;
  const primera = pub.imagenes?.[0]?.url ?? null;
  return {
    id: pub.id,
    titulo: pub.titulo,
    estado_publicacion_id: pub.estado_publicacion_id,
    primera_imagen: primera,
  };
}

export default function PublicacionDetail() {
  const { id } = useParams();
  const pubId = Number(id);
  const nav = useNavigate();
  const { user } = useAuth();

  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string | null>(null);
  const [pub, setPub] = useState<Publicacion | null>(null);
  const [cats, setCats] = useState<Categoria[]>([]);

  // Ofertas
  const [misOfertas, setMisOfertas] = useState<Intercambio[]>([]);
  const [ofertasRecibidas, setOfertasRecibidas] = useState<Intercambio[]>([]);
  const [loadingOfertas, setLoadingOfertas] = useState(false);
  const [loadingRecibidas, setLoadingRecibidas] = useState(false);

  // Modal ofrecer
  const [offerOpen, setOfferOpen] = useState(false);
  const [pendingMyOfferIds, setPendingMyOfferIds] = useState<number[]>([]); // publicaciones mías ya ofrecidas y pendientes

  // Caché local de publicaciones por id (para mostrar tarjeta con imagen/título)
  const [pubCache, setPubCache] = useState<Record<number, PubMini>>({});

  // cargar publicación + catálogo
  useEffect(() => {
    (async () => {
      try {
        setLoading(true);
        setErr(null);
        const [catsData, pubData] = await Promise.all([getCategorias(), getPublicacion(pubId)]);
        setCats(catsData);
        setPub(pubData);
        // precarga el propio detalle por si lo necesitamos como mini
        const mini = toMini(pubData);
        if (mini) setPubCache((m) => ({ ...m, [mini.id]: mini }));
      } catch (e: any) {
        setErr(e?.message || "Error al cargar la publicación.");
      } finally {
        setLoading(false);
      }
    })();
  }, [pubId]);

  const soyDueno = !!user && pub && user.id === pub.propietario_usuario_id;

  // Mis ofertas hacia esta publicación (outbox)
  useEffect(() => {
    if (!user || !pubId || soyDueno) return;
    (async () => {
      try {
        setLoadingOfertas(true);
        const data = await listIntercambios({
          box: "outbox",
          publicacion_solicitada_id: pubId,
          page_size: 100,
        });
        const rows = Array.isArray(data) ? data : (Array.isArray((data as any)?.results) ? (data as any).results : []);
        setMisOfertas(rows);
        // bloquear publicaciones ya ofrecidas y pendientes
        setPendingMyOfferIds(rows.filter(r => r.estado_intercambio_id === 1).map(r => r.publicacion_ofrecida_id));
      } finally {
        setLoadingOfertas(false);
      }
    })();
  }, [user, pubId, soyDueno]);

  // Ofertas recibidas (inbox) si soy dueño
  useEffect(() => {
    if (!user || !pubId || !soyDueno) return;
    (async () => {
      try {
        setLoadingRecibidas(true);
        const data = await listIntercambios({
          box: "inbox",
          publicacion_solicitada_id: pubId,
          page_size: 100,
        });
        const rows = Array.isArray(data) ? data : (Array.isArray((data as any)?.results) ? (data as any).results : []);
        setOfertasRecibidas(rows);
      } finally {
        setLoadingRecibidas(false);
      }
    })();
  }, [user, pubId, soyDueno]);

  // Prefetch de publicaciones relacionadas (las ofrecidas en outbox/inbox)
  useEffect(() => {
    const ids = new Set<number>();
    misOfertas.forEach((o) => ids.add(o.publicacion_ofrecida_id));
    ofertasRecibidas.forEach((o) => ids.add(o.publicacion_ofrecida_id));
    // no refetch si ya están en cache
    const pending = Array.from(ids).filter((id) => !pubCache[id]);
    if (pending.length === 0) return;

    (async () => {
      try {
        const results = await Promise.allSettled(pending.map((pid) => getPublicacion(pid)));
        const toMerge: Record<number, PubMini> = {};
        results.forEach((res, i) => {
          if (res.status === "fulfilled") {
            const mini = toMini(res.value);
            if (mini) toMerge[mini.id] = mini;
          }
        });
        if (Object.keys(toMerge).length) {
          setPubCache((m) => ({ ...m, ...toMerge }));
        }
      } catch {
        // silencioso; si falla, se verá con placeholders
      }
    })();
  }, [misOfertas, ofertasRecibidas]); // eslint-disable-line react-hooks/exhaustive-deps

  // Crear oferta y refrescar
  const onOfferPick = async (pubOfrecidaId: number) => {
    await createIntercambio({
      publicacion_solicitada_id: pubId,
      publicacion_ofrecida_id: pubOfrecidaId,
    });

    // deshabilitar de inmediato esa card en el modal
    setPendingMyOfferIds((prev) => Array.from(new Set([...prev, pubOfrecidaId])));

    // refrescar mis ofertas
    const data = await listIntercambios({
      box: "outbox",
      publicacion_solicitada_id: pubId,
      page_size: 100,
    });
    const rows = Array.isArray(data) ? data : (Array.isArray((data as any)?.results) ? (data as any).results : []);
    setMisOfertas(rows);
    setPendingMyOfferIds(rows.filter((r) => r.estado_intercambio_id === 1).map((r) => r.publicacion_ofrecida_id));
    setOfferOpen(false);
  };

  const images = useMemo(
    () => (pub?.imagenes ?? []).slice(0, 4).map(x => ({ id: x.id, url: x.url, alt: pub?.titulo ?? `Imagen ${x.posicion + 1}` })),
    [pub]
  );

  const categoriaNombre = useMemo(() => {
    if (!pub) return "—";
    const c = cats.find(x => x.id === pub.categoria_id);
    return c?.nombre ?? `#${pub.categoria_id}`;
  }, [cats, pub]);

  const autorNombre = (pub?.propietario_nombre ?? "").trim();
  const autorApellidos = (pub?.propietario_apellidos ?? "").trim();
  const autorInicial = (autorNombre || autorApellidos ? (autorNombre || autorApellidos)[0] : "U").toUpperCase();

  const puedeEditar =
    !!user &&
    (user.rol_usuario_id === 1 ||
      user.rol_usuario_id === 2 ||
      (pub && pub.propietario_usuario_id === user.id));

  if (loading) return <div className="py-16"><Spinner /></div>;
  if (err) return <div className="max-w-5xl mx-auto px-4 py-6"><AlertErr>{err}</AlertErr></div>;
  if (!pub) return <div className="max-w-5xl mx-auto px-4 py-6"><AlertErr>No se encontró la publicación.</AlertErr></div>;

  // Componente tarjeta para una oferta (usa pubCache para enriquecer)
  const OfferCard = ({ o }: { o: Intercambio }) => {
    const mini = pubCache[o.publicacion_ofrecida_id];
    return (
      <li className="rounded-xl border shadow-sm p-3 flex gap-3 items-stretch">
        <div className="relative">
          <img
            src={mini?.primera_imagen || "/img/no-image.png"}
            alt={mini?.titulo || `Publicación #${o.publicacion_ofrecida_id}`}
            className="w-24 h-24 object-cover rounded-lg border"
          />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <div className="text-sm font-medium truncate">
                {mini?.titulo || `Publicación #${o.publicacion_ofrecida_id}`}
              </div>
              <div className="mt-1 text-xs text-gray-500">
                Oferta #{o.id} • creada {metaFmt(o.creada_en)}
              </div>
            </div>
            <StatusChip estado={o.estado_intercambio_id} />
          </div>

          {mini && (
            <div className="mt-2">
              <PubStatusChip estado={mini.estado_publicacion_id} />
            </div>
          )}

          <div className="mt-3 flex gap-2">
            <Link
              to={`/publicaciones/${o.publicacion_ofrecida_id}`}
              target="_blank"
              className="btn btn-outline btn-sm"
            >
              Ver publicación
            </Link>
            {o.estado_intercambio_id === 1 && (
              <span className="text-[11px] text-amber-600 bg-amber-50 border border-amber-200 rounded px-2 py-0.5">
                Pendiente de respuesta
              </span>
            )}
          </div>
        </div>
      </li>
    );
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      <div className="mb-4 text-sm text-gray-500">
        <button className="hover:underline" onClick={() => nav(-1)}>&larr; Volver</button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Galería */}
        <div className="lg:col-span-7">
          <ImageCarousel images={images} aspect="aspect-[4/3] md:aspect-square" />
        </div>

        {/* Meta + Autor + Acciones */}
        <div className="lg:col-span-5">
          <div className="bg-white rounded-2xl border shadow-sm p-5 space-y-4">
            <div className="flex items-start justify-between gap-3">
              <div>
                <h1 className="text-xl font-bold leading-snug">{pub.titulo}</h1>
                <div className="flex items-center gap-2 mt-1">
                  <PubStatusChip estado={pub.estado_publicacion_id} />
                  <span className="text-xs text-gray-500">ID: {pub.id}</span>
                </div>
              </div>
            </div>

            <div className="text-sm text-gray-600 space-y-1">
              <div><span className="text-gray-500">Categoría: </span><b>{categoriaNombre}</b></div>
              <div><span className="text-gray-500">Tipo: </span>{pub.tipo_publicacion_id === 1 ? "Servicio" : pub.tipo_publicacion_id === 2 ? "Producto" : "Regalo"}</div>
              <div><span className="text-gray-500">Condición: </span>{pub.condicion_publicacion_id === 1 ? "Nuevo" : pub.condicion_publicacion_id === 2 ? "Usado" : "Malo"}</div>

              <div className="flex gap-3 pt-1">
                <span className="text-xs px-2 py-1 rounded bg-blue-50 border border-blue-200 text-blue-700">
                  Ofertas totales: <b>{pub.ofertas_count_total ?? 0}</b>
                </span>
                <span className="text-xs px-2 py-1 rounded bg-amber-50 border border-amber-200 text-amber-700">
                  Pendientes: <b>{pub.ofertas_count_pendientes ?? 0}</b>
                </span>
              </div>

              <div className="text-xs pt-1 text-gray-500 space-y-0.5">
                <div>Creada: {metaFmt(pub.creada_en)}</div>
                <div>Actualizada: {metaFmt(pub.actualizada_en)}</div>
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
              {!soyDueno && (
                <button className="btn btn-primary w-full sm:w-auto" onClick={() => setOfferOpen(true)}>
                  Ofrecer publicación
                </button>
              )}
              {puedeEditar && (
                <Link to={`/publicaciones/${pub.id}/editar`} className="btn btn-outline w-full sm:w-auto">
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
        <p className="text-gray-700 whitespace-pre-line">{pub.descripcion?.trim() || "Sin descripción."}</p>
      </div>

      {/* Ofertas */}
      {soyDueno ? (
        <div className="mt-6 bg-white rounded-2xl border shadow-sm p-5">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-base font-semibold">Ofertas recibidas para esta publicación</h2>
            {loadingRecibidas && <span className="text-xs text-gray-500">Cargando…</span>}
          </div>
          {ofertasRecibidas.length === 0 ? (
            <div className="text-gray-500 text-sm">Aún no has recibido ofertas.</div>
          ) : (
            <ul className="grid md:grid-cols-2 gap-3">
              {ofertasRecibidas.map((o) => (
                <OfferCard key={o.id} o={o} />
              ))}
            </ul>
          )}
        </div>
      ) : (
        <div className="mt-6 bg-white rounded-2xl border shadow-sm p-5">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-base font-semibold">Mis ofertas a esta publicación</h2>
            {loadingOfertas && <span className="text-xs text-gray-500">Cargando…</span>}
          </div>
          {misOfertas.length === 0 ? (
            <div className="text-gray-500 text-sm">Aún no has enviado ofertas para esta publicación.</div>
          ) : (
            <ul className="grid md:grid-cols-2 gap-3">
              {misOfertas.map((o) => (
                <OfferCard key={o.id} o={o} />
              ))}
            </ul>
          )}
        </div>
      )}

      {/* Modal para elegir publicación a ofrecer */}
      <OfferModal
        open={offerOpen}
        onClose={() => setOfferOpen(false)}
        onPick={onOfferPick}
        disableIds={pendingMyOfferIds}
      />
    </div>
  );
}
