// src/components/OfferModal.tsx
import { useEffect, useMemo, useState } from "react";
import { listPublicaciones } from "../services/publicaciones";
import type { PublicacionListItem } from "../types";

type Props = {
  open: boolean;
  onClose: () => void;
  onPick: (pubId: number) => void;
  disableIds?: number[]; // publicaciones mías ya ofrecidas (pendientes)
};

export default function OfferModal({ open, onClose, onPick, disableIds = [] }: Props) {
  const [loading, setLoading] = useState(false);
  const [items, setItems] = useState<PublicacionListItem[]>([]);
  const [q, setQ] = useState("");

  const disabled = useMemo(() => new Set(disableIds), [disableIds]);

  useEffect(() => {
    if (!open) return;
    (async () => {
      setLoading(true);
      try {
        // ⚠️ Traemos solo mine=true; normalizamos si backend devuelve array o {results:[]}
        const res: any = await listPublicaciones({
          mine: true,
          page: 1,
          page_size: 50,
          q,
        });

        const all: PublicacionListItem[] = Array.isArray(res)
          ? res
          : Array.isArray(res?.results)
          ? res.results
          : [];

        const onlyActive = all.filter((it) => it.estado_publicacion_id === 1);
        setItems(onlyActive);
      } finally {
        setLoading(false);
      }
    })();
  }, [open, q]);

  if (!open) return null;

  return (
    <>
      <div className="fixed inset-0 bg-black/40 z-40" onClick={onClose} />
      <div className="fixed inset-0 z-50 grid place-items-center p-4">
        <div className="w-full max-w-2xl bg-white rounded-2xl border shadow-xl overflow-hidden">
          {/* Header */}
          <div className="px-5 py-4 border-b flex items-center gap-3">
            <h3 className="font-semibold text-lg">Elegir publicación para ofrecer</h3>
            <input
              placeholder="Buscar en mis publicación…"
              className="ml-auto rounded-lg border-gray-300 focus:ring-2 focus:ring-blue-500"
              value={q}
              onChange={(e) => setQ(e.target.value)}
            />
            <button className="btn btn-outline" onClick={onClose}>
              Cerrar
            </button>
          </div>

          {/* Body */}
          <div className="p-4 max-h-[60vh] overflow-y-auto">
            {loading ? (
              <ul className="grid sm:grid-cols-2 gap-3">
                {Array.from({ length: 4 }).map((_, i) => (
                  <li key={i} className="rounded-xl border p-3 flex gap-3 animate-pulse">
                    <div className="w-20 h-20 rounded-lg bg-gray-200" />
                    <div className="flex-1 space-y-2">
                      <div className="h-4 bg-gray-200 rounded w-3/4" />
                      <div className="h-8 bg-gray-200 rounded w-24" />
                    </div>
                  </li>
                ))}
              </ul>
            ) : items.length === 0 ? (
              <div className="flex items-center justify-between border rounded-xl p-4">
                <p className="text-sm text-gray-500">No tienes publicaciones activas para ofrecer.</p>
                <a href="/publicaciones/nueva" className="btn btn-primary">
                  Crear publicación
                </a>
              </div>
            ) : (
              <ul className="grid sm:grid-cols-2 gap-3">
                {items.map((it) => {
                  const isDisabled = disabled.has(it.id);
                  return (
                    <li
                      key={it.id}
                      className={`rounded-xl border p-3 flex gap-3 ${isDisabled ? "opacity-60" : ""}`}
                    >
                      <img
                        src={it.primera_imagen || "/img/no-image.png"}
                        alt={it.titulo}
                        className="w-20 h-20 object-cover rounded-lg border"
                      />
                      <div className="flex-1">
                        <div className="text-sm font-medium line-clamp-2">{it.titulo}</div>
                        <div className="mt-1 text-xs text-gray-500">Activa</div>
                        <button
                          className="btn btn-primary btn-sm mt-2"
                          disabled={isDisabled}
                          onClick={() => onPick(it.id)}
                          title={isDisabled ? "Ya ofrecida y pendiente" : "Ofrecer esta publicación"}
                        >
                          Ofrecer
                        </button>
                      </div>
                    </li>
                  );
                })}
              </ul>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
