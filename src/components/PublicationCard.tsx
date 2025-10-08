// src/components/PublicationCard.tsx
import type { PublicacionListItem } from "../types";

type Props = {
  item: PublicacionListItem;
  onEdit?: (id: number) => void;
  onHide?: (id: number) => void;        // Ocultar (2)
  onDone?: (id: number) => void;        // Realizada (3)
  showActions?: boolean;                // true cuando es "mine"
};

const estadoLabel: Record<number, string> = {
  1: "Activa",
  2: "Oculta",
  3: "Realizada",
};

export default function PublicationCard({ item, onEdit, onHide, onDone, showActions }: Props) {
  return (
    <div className="group rounded-2xl shadow-sm border border-gray-200 overflow-hidden bg-white hover:shadow-md transition">
      <div className="aspect-[4/3] w-full overflow-hidden bg-gray-100">
        {item.primera_imagen ? (
          <img
            src={item.primera_imagen}
            alt={item.titulo}
            className="h-full w-full object-cover group-hover:scale-105 transition"
            loading="lazy"
          />
        ) : (
          <div className="h-full w-full grid place-items-center text-gray-400 text-sm">
            Sin imagen
          </div>
        )}
      </div>

      <div className="p-3 sm:p-4">
        <div className="text-sm text-gray-500">{new Date(item.creada_en).toLocaleDateString()}</div>
        <h3 className="mt-1 font-semibold text-gray-900 line-clamp-2">{item.titulo}</h3>

        <div className="mt-2 flex items-center justify-between">
          <span className="inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium bg-blue-50 text-blue-700">
            {estadoLabel[item.estado_publicacion_id] ?? "—"}
          </span>

          {showActions && (
            <div className="flex gap-2">
              <button className="btn btn-outline text-xs" onClick={() => onEdit?.(item.id)}>Editar</button>
              <button className="btn btn-outline text-xs" onClick={() => onHide?.(item.id)}>Ocultar</button>
              <button className="btn btn-primary text-xs" onClick={() => onDone?.(item.id)}>Realizada</button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
