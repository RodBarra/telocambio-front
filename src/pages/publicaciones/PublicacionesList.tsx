// src/pages/publicaciones/PublicacionesList.tsx
import { useEffect, useMemo, useState, useCallback, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import Spinner from "../../components/Spinner";
import { AlertErr } from "../../components/Alert";
import ConfirmModal from "../../components/ConfirmModal";
import PublicationCard from "../../components/PublicationCard";
import {
  getCategorias,
  listPublicaciones,
  patchEstado,
  toggleEstado,
  deletePublicacion,
} from "../../services/publicaciones";
import type { Categoria, PublicacionListItem } from "../../types";

// ==============================
// CONFIGURACIÓN GLOBAL
// ==============================
const PAGE_SIZE = 12;
const CACHE_KEY = "publicaciones_filtros_v1";

type Orden = "recientes" | "alfabetico";

// ==============================
// HELPERS
// ==============================
function normalizeCats(input: any): Categoria[] {
  if (Array.isArray(input)) return input;
  if (input?.results) return input.results;
  if (input?.items) return input.items;
  if (input?.data) return input.data;
  return [];
}

function normalizeList(input: any): { results: PublicacionListItem[]; total: number } {
  if (Array.isArray(input)) return { results: input, total: input.length };
  const results = Array.isArray(input?.results) ? input.results : [];
  const total =
    (typeof input?.meta?.total === "number" && input.meta.total) ||
    (typeof input?.total === "number" && input.total) ||
    results.length;
  return { results, total };
}

function CardSkeleton() {
  return (
    <div className="bg-white rounded-2xl border shadow-sm overflow-hidden animate-pulse">
      <div className="aspect-[4/3] md:aspect-square bg-gray-200" />
      <div className="p-3 space-y-2">
        <div className="h-4 w-3/4 bg-gray-200 rounded" />
        <div className="h-3 w-1/3 bg-gray-200 rounded" />
        <div className="h-8 w-full bg-gray-200 rounded-lg" />
      </div>
    </div>
  );
}

// ==============================
// COMPONENTE PRINCIPAL
// ==============================
export default function PublicacionesList() {
  const nav = useNavigate();

  // --- Estado principal ---
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string | null>(null);
  const [items, setItems] = useState<PublicacionListItem[]>([]);
  const [categorias, setCategorias] = useState<Categoria[]>([]);
  const [total, setTotal] = useState(0);

  // --- Filtros persistentes ---
  const [q, setQ] = useState("");
  const [categoriaId, setCategoriaId] = useState<number | undefined>();
  const [orden, setOrden] = useState<Orden>("recientes");
  const [mine, setMine] = useState(false);
  const [page, setPage] = useState(1);

  // --- Selección múltiple ---
  const [selectMode, setSelectMode] = useState(false);
  const [selected, setSelected] = useState<Set<number>>(new Set());

  // --- Modal de confirmación de borrado ---
  const [confirm, setConfirm] = useState<{
    open: boolean;
    ids: number[];
    title: string;
    description: string;
    loading: boolean;
  }>({
    open: false,
    ids: [],
    title: "",
    description: "",
    loading: false,
  });

  const searchRef = useRef<HTMLInputElement>(null);
  const totalPaginas = useMemo(() => Math.max(1, Math.ceil(total / PAGE_SIZE)), [total]);

  // ==============================
  // CARGA INICIAL + PERSISTENCIA
  // ==============================
  useEffect(() => {
    const saved = localStorage.getItem(CACHE_KEY);
    if (saved) {
      try {
        const s = JSON.parse(saved);
        setQ(s.q ?? "");
        setCategoriaId(s.categoriaId ?? undefined);
        setOrden(s.orden ?? "recientes");
        setMine(!!s.mine);
      } catch {
        /* ignore */
      }
    }
  }, []);

  useEffect(() => {
    localStorage.setItem(CACHE_KEY, JSON.stringify({ q, categoriaId, orden, mine }));
  }, [q, categoriaId, orden, mine]);

  // ==============================
  // CARGA DE DATOS
  // ==============================
  const load = useCallback(async () => {
    try {
      setLoading(true);
      setErr(null);

      const [catsRaw, listRaw] = await Promise.all([
        getCategorias(),
        listPublicaciones({
          q,
          categoria_id: categoriaId,
          orden,
          page,
          page_size: PAGE_SIZE,
          mine,
        }),
      ]);

      setCategorias(normalizeCats(catsRaw));
      const { results, total } = normalizeList(listRaw);
      setItems(results);
      setTotal(total);
      setSelected(new Set());
    } catch (e: any) {
      setErr(e?.message || "Error al cargar publicaciones.");
    } finally {
      setLoading(false);
    }
  }, [q, categoriaId, orden, page, mine]);

  useEffect(() => {
    load();
  }, [load]);

  // ==============================
  // BÚSQUEDA (DEBOUNCED)
  // ==============================
  useEffect(() => {
    const t = setTimeout(() => {
      setPage(1);
      load();
    }, 450);
    return () => clearTimeout(t);
  }, [q, load]);

  // ==============================
  // EVENTOS
  // ==============================
  const onEdit = (id: number) => nav(`/publicaciones/${id}/editar`);

  const onToggleVisibility = async (item: PublicacionListItem) => {
    await toggleEstado(item);
    await load();
  };

  // ——— abrir modal para eliminar 1
  const onDelete = (id: number) => {
    const it = items.find((x) => x.id === id);
    const titulo = it?.titulo?.trim();
    setConfirm({
      open: true,
      ids: [id],
      title: "Eliminar publicación",
      description: `Esta acción es definitiva. Se eliminará la publicación${
        titulo ? `: “${titulo}”` : ` #${id}`
      } y sus imágenes asociadas.`,
      loading: false,
    });
  };

  // ——— abrir modal para eliminar varias
  const bulkDeleteAsk = () => {
    if (selected.size === 0) return;
    setConfirm({
      open: true,
      ids: Array.from(selected),
      title: "Eliminar publicaciones",
      description: `Esta acción es definitiva. Se eliminarán ${selected.size} publicaciones y sus imágenes asociadas.`,
      loading: false,
    });
  };

  // ——— confirmar (individual o masivo)
  const confirmDelete = async () => {
    try {
      setConfirm((c) => ({ ...c, loading: true }));
      await Promise.all(confirm.ids.map((id) => deletePublicacion(id)));
      setConfirm({ open: false, ids: [], title: "", description: "", loading: false });
      setSelected(new Set());
      setSelectMode(false);
      await load();
    } catch (e: any) {
      setErr(e?.message || "No se pudo eliminar.");
      setConfirm((c) => ({ ...c, loading: false }));
    }
  };

  // --- Selección múltiple (activar/ocultar) ---
  const toggleSelect = (id: number) => {
    setSelected((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  const bulkChange = async (estado: 1 | 2) => {
    if (selected.size === 0) return;
    const ids = Array.from(selected);
    await Promise.all(ids.map((id) => patchEstado(id, estado)));
    setSelected(new Set());
    setSelectMode(false);
    load();
  };

  const clearFilters = () => {
    setQ("");
    setCategoriaId(undefined);
    setOrden("recientes");
    setMine(false);
    setPage(1);
    load();
    searchRef.current?.focus();
  };

  // ==============================
  // RENDER
  // ==============================
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      {/* ======= HEADER ======= */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4 gap-3">
        <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
          📦 Publicaciones
          {mine && (
            <span className="text-xs text-blue-600 bg-blue-100 px-2 py-0.5 rounded-md">
              Modo mis publicaciones
            </span>
          )}
        </h1>

        <div className="flex items-center gap-3">
          {mine && (
            <button
              className={`btn btn-outline ${selectMode ? "ring-2 ring-blue-400" : ""}`}
              onClick={() => {
                setSelectMode((v) => !v);
                setSelected(new Set());
              }}
              title="Seleccionar varias para acciones en lote"
            >
              {selectMode ? "Cancelar selección" : "Seleccionar"}
            </button>
          )}
          <Link
            to="/publicaciones/nueva"
            className="btn btn-primary inline-flex items-center px-4 py-2 rounded-xl bg-blue-600 text-white hover:bg-blue-700 shadow-sm"
          >
            Nueva publicación
          </Link>
        </div>
      </div>

      {/* ======= FILTROS ======= */}
      <div className="rounded-2xl bg-blue-50 p-4 sm:p-5 mb-5 border border-blue-100">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
          <div className="col-span-1 sm:col-span-2">
            <label className="block text-sm text-gray-600 mb-1">Buscar</label>
            <input
              ref={searchRef}
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Título o descripción…"
              className="w-full rounded-xl border-gray-300 bg-white focus:outline-none focus:ring-2 focus:ring-blue-400"
            />
          </div>

          <div>
            <label className="block text-sm text-gray-600 mb-1">Categoría</label>
            <select
              value={categoriaId ?? ""}
              onChange={(e) => setCategoriaId(e.target.value ? Number(e.target.value) : undefined)}
              className="w-full rounded-xl border-gray-300 bg-white focus:outline-none focus:ring-2 focus:ring-blue-400"
            >
              <option value="">Todas</option>
              {categorias.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.nombre}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm text-gray-600 mb-1">Orden</label>
            <select
              value={orden}
              onChange={(e) => setOrden(e.target.value as Orden)}
              className="w-full rounded-xl border-gray-300 bg-white focus:outline-none focus:ring-2 focus:ring-blue-400"
            >
              <option value="recientes">Más recientes</option>
              <option value="alfabetico">Alfabético</option>
            </select>
          </div>

          <div className="flex flex-col justify-end">
            <label className="inline-flex items-center gap-2 text-sm select-none">
              <input
                type="checkbox"
                className="rounded border-gray-300"
                checked={mine}
                onChange={(e) => {
                  setMine(e.target.checked);
                  setPage(1);
                }}
              />
              <span>Mis publicaciones</span>
            </label>
            <button
              type="button"
              onClick={clearFilters}
              className="text-xs text-blue-600 mt-1 hover:underline self-start"
            >
              Limpiar filtros
            </button>
          </div>
        </div>
      </div>

      {/* ======= ERRORES ======= */}
      {err && <AlertErr>{err}</AlertErr>}

      {/* ======= ACCIONES MASIVAS ======= */}
      {mine && selectMode && selected.size > 0 && (
        <div className="sticky top-2 z-10 mb-3 rounded-xl border bg-white shadow flex flex-wrap items-center gap-3 p-3">
          <span className="text-sm text-slate-600">
            Seleccionadas: <b>{selected.size}</b>
          </span>
          <div className="flex items-center gap-2 ml-auto">
            <button
              className="px-3 py-1.5 rounded-lg bg-emerald-600 text-white hover:bg-emerald-700"
              onClick={() => bulkChange(1)}
            >
              Activar
            </button>
            <button
              className="px-3 py-1.5 rounded-lg bg-amber-500 text-white hover:bg-amber-600"
              onClick={() => bulkChange(2)}
            >
              Ocultar
            </button>
            <button
              className="px-3 py-1.5 rounded-lg bg-red-600 text-white hover:bg-red-700"
              onClick={bulkDeleteAsk}
            >
              Eliminar
            </button>
            <button
              className="btn btn-outline btn-sm"
              onClick={() => {
                setSelected(new Set());
                setSelectMode(false);
              }}
            >
              Cancelar
            </button>
          </div>
        </div>
      )}

      {/* ======= LISTADO ======= */}
      {loading ? (
        <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-5">
          {Array.from({ length: 8 }).map((_, i) => (
            <CardSkeleton key={i} />
          ))}
        </div>
      ) : items.length === 0 ? (
        <div className="py-20 text-center">
          <div className="mx-auto w-24 h-24 rounded-full bg-blue-50 flex items-center justify-center mb-4">
            <span className="text-3xl">🕊️</span>
          </div>
          <h2 className="text-lg font-semibold mb-1">No se encontraron publicaciones</h2>
          <p className="text-gray-500 mb-4">Intenta ajustar los filtros o crea una nueva publicación.</p>
          <Link className="btn btn-primary" to="/publicaciones/nueva">
            Crear publicación
          </Link>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-5">
            {items.map((it) => (
              <div key={it.id} className="relative transition-all">
                {mine && selectMode && (
                  <label className="absolute top-2 right-2 z-10">
                    <input
                      type="checkbox"
                      className="h-5 w-5 accent-blue-600"
                      checked={selected.has(it.id)}
                      onChange={() => toggleSelect(it.id)}
                    />
                  </label>
                )}
                <PublicationCard
                  item={{
                    ...it,
                    primera_imagen: it.primera_imagen ? `${it.primera_imagen}?t=${Date.now()}` : null,
                  }}
                  showActions={mine && !selectMode}
                  onEdit={onEdit}
                  onToggleVisibility={onToggleVisibility}
                  onDelete={onDelete}
                  highlight={q.trim() || undefined}
                />
              </div>
            ))}
          </div>

          {/* ======= PAGINACIÓN ======= */}
          {totalPaginas > 1 && (
            <div className="mt-8 flex items-center justify-center gap-3 flex-wrap">
              <button
                className="btn btn-outline px-3 py-1.5 rounded-lg border hover:bg-gray-50 disabled:opacity-50"
                disabled={page <= 1}
                onClick={() => setPage((p) => Math.max(1, p - 1))}
              >
                ⬅️ Anterior
              </button>

              <span className="text-sm text-gray-600">
                Página <span className="font-semibold">{page}</span> de {totalPaginas}
              </span>

              <button
                className="btn btn-outline px-3 py-1.5 rounded-lg border hover:bg-gray-50 disabled:opacity-50"
                disabled={page >= totalPaginas}
                onClick={() => setPage((p) => Math.min(totalPaginas, p + 1))}
              >
                Siguiente ➡️
              </button>
            </div>
          )}
        </>
      )}

      {/* ======= MODAL DE CONFIRMACIÓN ======= */}
      <ConfirmModal
        open={confirm.open}
        title={confirm.title}
        tone="danger"
        confirmText={confirm.ids.length > 1 ? "Eliminar publicaciones" : "Eliminar publicación"}
        cancelText="Cancelar"
        disabled={confirm.loading}
        onCancel={() =>
          setConfirm({ open: false, ids: [], title: "", description: "", loading: false })
        }
        onConfirm={confirmDelete}
      >
        <p className="text-sm">{confirm.description}</p>
      </ConfirmModal>
    </div>
  );
}
