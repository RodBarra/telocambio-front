// src/pages/publicaciones/PublicacionesList.tsx
import { useEffect, useMemo, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import Spinner from "../../components/Spinner";
import { AlertErr } from "../../components/Alert";
import PublicationCard from "../../components/PublicationCard";
import { getCategorias, listPublicaciones, patchEstado } from "../../services/publicaciones";
import type { Categoria, PublicacionListItem } from "../../types";

const PAGE_SIZE = 12;

// Normalizadores defensivos
function normalizeCats(input: any): Categoria[] {
  if (Array.isArray(input)) return input as Categoria[];
  if (input && Array.isArray(input.results)) return input.results as Categoria[];
  if (input && Array.isArray(input.items)) return input.items as Categoria[];
  if (input && Array.isArray(input.data)) return input.data as Categoria[];
  return [];
}
function normalizeList(input: any): { results: PublicacionListItem[]; total: number } {
  if (Array.isArray(input)) return { results: input as PublicacionListItem[], total: input.length };
  const results = Array.isArray(input?.results) ? input.results : [];
  const total =
    (input?.meta && typeof input.meta.total === "number" && input.meta.total) ||
    (typeof input?.total === "number" && input.total) ||
    results.length;
  return { results, total };
}

export default function PublicacionesList() {
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string | null>(null);
  const [items, setItems] = useState<PublicacionListItem[]>([]);
  const [categorias, setCategorias] = useState<Categoria[]>([]);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);

  const [q, setQ] = useState("");
  const [categoriaId, setCategoriaId] = useState<number | undefined>();
  const [orden, setOrden] = useState<"recientes" | "alfabetico">("recientes");
  const [mine, setMine] = useState(false);

  const pages = useMemo(() => Math.max(1, Math.ceil(total / PAGE_SIZE)), [total]);
  const nav = useNavigate();

  async function load() {
    try {
      setLoading(true);
      setErr(null);

      const [catsRaw, listRaw] = await Promise.all([
        getCategorias(),
        listPublicaciones({ q, categoria_id: categoriaId, orden, page, page_size: PAGE_SIZE, mine }),
      ]);

      setCategorias(normalizeCats(catsRaw));

      const { results, total } = normalizeList(listRaw);
      setItems(results);
      setTotal(total);
    } catch (e: any) {
      setErr(e?.message || "Error al cargar publicaciones");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, [page, orden, categoriaId, mine]);

  // Debounce de búsqueda
  useEffect(() => {
    const t = setTimeout(() => {
      setPage(1);
      load();
    }, 400);
    return () => clearTimeout(t);
    // eslint-disable-next-line
  }, [q]);

  const onEdit = (id: number) => nav(`/publicaciones/${id}/editar`);
  const onHide = async (id: number) => { await patchEstado(id, 2); load(); };
  const onDone = async (id: number) => { await patchEstado(id, 3); load(); };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-2xl font-bold">Publicaciones</h1>
        <Link to="/publicaciones/nueva" className="btn btn-primary">Crear publicación</Link>
      </div>

      {/* Filtros sobre fondo azul */}
      <div className="rounded-xl bg-blue-50 p-3 sm:p-4 mb-4 border border-blue-100">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
          <div>
            <label className="block text-sm text-gray-600 mb-1">Buscar</label>
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Título o descripción…"
              className="w-full rounded-lg border-gray-300 bg-white"
            />
          </div>
          <div>
            <label className="block text-sm text-gray-600 mb-1">Categoría</label>
            <select
              value={categoriaId ?? ""}
              onChange={(e) => setCategoriaId(e.target.value ? Number(e.target.value) : undefined)}
              className="w-full rounded-lg border-gray-300 bg-white"
            >
              <option value="">Todas</option>
              {categorias.map((c) => (
                <option key={c.id} value={c.id}>{c.nombre}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm text-gray-600 mb-1">Orden</label>
            <select
              value={orden}
              onChange={(e) => setOrden(e.target.value as any)}
              className="w-full rounded-lg border-gray-300 bg-white"
            >
              <option value="recientes">Más recientes</option>
              <option value="alfabetico">Alfabético</option>
            </select>
          </div>
          <div className="flex items-end">
            <label className="inline-flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={mine}
                onChange={(e) => { setMine(e.target.checked); setPage(1); }}
              />
              <span>Mis publicaciones</span>
            </label>
          </div>
        </div>
      </div>

      {err && <AlertErr>{err}</AlertErr>}

      {loading ? (
        <div className="py-16"><Spinner /></div>
      ) : items.length === 0 ? (
        <div className="py-20 text-center text-gray-500">
          No hay publicaciones.{" "}
          {mine && <Link className="text-blue-600 underline" to="/publicaciones/nueva">Crea la primera</Link>}
        </div>
      ) : (
        <>
          <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4">
            {items.map((it) => (
              <PublicationCard
                key={it.id}
                item={it}
                showActions={mine}
                onEdit={onEdit}
                onHide={onHide}
                onDone={onDone}
              />
            ))}
          </div>

          <div className="mt-6 flex items-center justify-center gap-2">
            <button
              className="btn btn-outline"
              disabled={page <= 1}
              onClick={() => setPage((p) => Math.max(1, p - 1))}
            >
              Anterior
            </button>
            <span className="text-sm text-gray-500">Página {page} de {pages}</span>
            <button
              className="btn btn-outline"
              disabled={page >= pages}
              onClick={() => setPage((p) => Math.min(pages, p + 1))}
            >
              Siguiente
            </button>
          </div>
        </>
      )}
    </div>
  );
}
