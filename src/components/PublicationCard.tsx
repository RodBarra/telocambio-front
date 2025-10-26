// src/components/PublicationCard.tsx
import React, { useMemo } from "react";
import { Link } from "react-router-dom";
import type { PublicacionListItem } from "../types";

type Props = {
  item: PublicacionListItem;
  showActions?: boolean;
  onEdit?: (id: number) => void;
  onToggleVisibility?: (item: PublicacionListItem) => Promise<void> | void;
  onDone?: (id: number) => Promise<void> | void;         // compatibilidad
  onDelete?: (id: number) => Promise<void> | void;       // abre modal en el padre
  highlight?: string;
};

const ESTADO_LABEL: Record<number, string> = {
  1: "Activa",
  2: "Oculta",
  3: "Realizada",
};

function Highlight({ text, needle }: { text: string; needle?: string }) {
  if (!needle) return <>{text}</>;
  const re = new RegExp(`(${needle.replace(/[.*+?^${}()|[\\]\\\\]/g, "\\$&")})`, "ig");
  const parts = text.split(re);
  return (
    <>
      {parts.map((p, i) =>
        re.test(p) ? (
          <mark key={i} className="bg-yellow-200/60 rounded px-0.5">
            {p}
          </mark>
        ) : (
          <span key={i}>{p}</span>
        )
      )}
    </>
  );
}

export default function PublicationCard({
  item,
  showActions = false,
  onEdit,
  onToggleVisibility,
  onDone,             // no se usa
  onDelete,
  highlight,
}: Props) {
  const img =
    item.primera_imagen && item.primera_imagen.trim().length > 0
      ? item.primera_imagen
      : "/img/no-image.png";

  const estadoTxt = ESTADO_LABEL[item.estado_publicacion_id] ?? "—";
  const isOculta = item.estado_publicacion_id === 2;
  const toggleLabel = isOculta ? "Mostrar" : "Ocultar";
  const toggleTitle = isOculta ? "Hacer visible" : "Ocultar publicación";

  const chipClass = useMemo(() => {
    if (item.estado_publicacion_id === 1) return "bg-green-50 text-green-700 border-green-200";
    if (item.estado_publicacion_id === 2) return "bg-amber-50 text-amber-700 border-amber-200";
    return "bg-slate-100 text-slate-700 border-slate-200";
  }, [item.estado_publicacion_id]);

  const ofertasLabel =
    typeof (item as any).ofertas_count_pendientes === "number"
      ? (item as any).ofertas_count_pendientes
      : typeof (item as any).ofertas_count_total === "number"
      ? (item as any).ofertas_count_total
      : null;

  return (
    <div className="bg-white rounded-2xl border shadow-sm overflow-hidden flex flex-col hover:shadow-lg hover:-translate-y-0.5 transition-all">
      <Link to={`/publicaciones/${item.id}`} className="block group focus:outline-none focus:ring-2 focus:ring-blue-400">
        <div className="relative bg-gray-50">
          <div className="aspect-[4/3] md:aspect-square overflow-hidden">
            <img
              src={img}
              alt={item.titulo}
              className="w-full h-full object-cover object-center select-none transition-transform duration-300 group-hover:scale-[1.02]"
              loading="lazy"
            />
          </div>

          <span
            className={[
              "absolute top-2 left-2 text-xs px-2 py-0.5 rounded-full border backdrop-blur-sm",
              chipClass,
            ].join(" ")}
            title={`Estado: ${estadoTxt}`}
            aria-label={`Estado: ${estadoTxt}`}
          >
            {estadoTxt}
          </span>

          {ofertasLabel !== null && (
            <span
              className="absolute top-2 right-2 text-xs px-2 py-0.5 rounded-full border bg-blue-50 text-blue-700 border-blue-200"
              title="Ofertas"
            >
              🔁 {ofertasLabel}
            </span>
          )}
        </div>

        <div className="p-3">
          <h3 className="font-semibold leading-snug line-clamp-2 min-h-[2.5rem]">
            <Highlight text={item.titulo} needle={highlight} />
          </h3>
          <div className="mt-1 text-xs text-gray-500">
            {new Date(item.creada_en).toLocaleDateString()}
          </div>
        </div>
      </Link>

      {showActions && (
        <div className="px-3 pb-3 mt-auto flex items-center gap-2">
          <button
            className="btn btn-outline px-3 py-1.5 rounded-lg border hover:bg-gray-50"
            onClick={() => onEdit && onEdit(item.id)}
          >
            Editar
          </button>

          <button
            className="btn btn-outline px-3 py-1.5 rounded-lg border hover:bg-gray-50"
            onClick={() => onToggleVisibility && onToggleVisibility(item)}
            title={toggleTitle}
          >
            {toggleLabel}
          </button>

          {/* Eliminar usa modal del padre */}
          <button
            className="btn px-3 py-1.5 rounded-lg bg-red-600 text-white hover:bg-red-700"
            onClick={() => onDelete && onDelete(item.id)}
            title="Eliminar publicación"
          >
            Eliminar
          </button>
        </div>
      )}
    </div>
  );
}
