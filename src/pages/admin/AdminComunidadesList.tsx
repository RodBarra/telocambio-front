import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  ComunidadesApi,
  type Comunidad,
  type ComunidadListParams,
} from "../../services/comunidades";

type Sort = { key: string; dir: "asc" | "desc" };

function Badge({ children }: { children: any }) {
  return (
    <span className="inline-flex items-center rounded-full border border-slate-200 px-2 py-0.5 text-xs text-slate-700 bg-slate-50 whitespace-nowrap">
      {children}
    </span>
  );
}

function EstadoSelect({
  value,
  onChange,
  disabled,
}: {
  value?: number | null;
  onChange: (v: number) => void;
  disabled?: boolean;
}) {
  return (
    <select
      className="input h-9 min-w-[7rem]"
      value={value ?? ""}
      onChange={(e) => onChange(Number(e.target.value))}
      disabled={disabled}
    >
      <option value="">—</option>
      <option value={1}>Activa</option>
      <option value={2}>Suspendida</option>
    </select>
  );
}

// —— Estética por estado (rail sólido) ——
const rowAccent = (estadoId?: number | null) => {
  if (estadoId === 2) return { rail: "bg-rose-500" };      // suspendida
  if (estadoId === 1) return { rail: "bg-emerald-500" };   // activa
  return { rail: "bg-slate-300" };                         // desconocido
};

export default function AdminComunidadesList() {
  const navigate = useNavigate();

  const [rows, setRows] = useState<Comunidad[]>([]);
  const [total, setTotal] = useState(0);

  const [q, setQ] = useState("");
  const [tipo, setTipo] = useState<"" | 1 | 2>("");
  const [estado, setEstado] = useState<"" | number>("");
  const [sort, setSort] = useState<Sort>({ key: "creado_en", dir: "desc" });
  const [page, setPage] = useState(1);
  const [pageSize] = useState(10);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  type EditBuffer = Record<number, { nombre?: string; estado_comunidad_id?: number | null }>;
  const [edit, setEdit] = useState<EditBuffer>({});

  const params: ComunidadListParams = useMemo(() => {
    const ordering = `${sort.dir === "desc" ? "-" : ""}${sort.key}`;
    return {
      q: q || undefined,
      tipo_id: (tipo as any) || undefined,
      estado: (estado as any) || undefined,
      ordering,
      page,
      page_size: pageSize,
    };
  }, [q, tipo, estado, sort, page, pageSize]);

  const load = async () => {
    setErr(null);
    setLoading(true);
    try {
      const { data } = await ComunidadesApi.list(params);
      setRows(data.items || []);
      setTotal(data.total || 0);
    } catch (e: any) {
      setErr(e?.response?.data?.detail || "No se pudo obtener comunidades");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [params]);

  const onSort = (key: string) => {
    if (key === "acciones" || key === "moderador_correo") return;
    setSort((s) =>
      s.key === key ? { key, dir: s.dir === "asc" ? "desc" : "asc" } : { key, dir: "asc" }
    );
    setPage(1);
  };

  const totalPages = Math.max(1, Math.ceil(total / pageSize));

  const setEditField = (id: number, patch: Partial<Comunidad>) => {
    setEdit((e) => ({ ...e, [id]: { ...e[id], ...patch } }));
  };

  const hasChanges = (r: Comunidad) => {
    const e = edit[r.id];
    if (!e) return false;
    const nameChanged = e.nombre !== undefined && e.nombre !== r.nombre;
    const estChanged =
      e.estado_comunidad_id !== undefined && e.estado_comunidad_id !== r.estado_comunidad_id;
    return nameChanged || estChanged;
  };

  const save = async (r: Comunidad) => {
    const e = edit[r.id];
    if (!e) return;
    const patch: { nombre?: string; estado_comunidad_id?: number } = {};
    if (e.nombre !== undefined && e.nombre !== r.nombre) patch.nombre = e.nombre!;
    if (e.estado_comunidad_id !== undefined && e.estado_comunidad_id !== r.estado_comunidad_id)
      patch.estado_comunidad_id = e.estado_comunidad_id ?? undefined;

    if (Object.keys(patch).length === 0) return;

    await ComunidadesApi.update(r.id, patch);
    setEdit((buf) => {
      const { [r.id]: _, ...rest } = buf;
      return rest;
    });
    await load();
  };

  const headers = [
    { key: "id", label: "ID", cls: "w-16 lg:w-auto" },
    { key: "nombre", label: "Nombre", cls: "min-w-[16rem] lg:w-auto" },
    { key: "tipo_id", label: "Tipo", cls: "w-36 lg:w-auto whitespace-nowrap" },
    { key: "codigo", label: "Código", cls: "w-40 lg:w-auto" },
    { key: "moderador_correo", label: "Moderador", cls: "w-64 lg:w-auto hidden lg:table-cell" },
    { key: "estado_comunidad_id", label: "Estado", cls: "w-40 lg:w-auto" },
    { key: "creado_en", label: "Creada", cls: "w-44 lg:w-auto hidden md:table-cell" },
    { key: "acciones", label: "", cls: "w-40 lg:w-auto" },
  ] as const;

  return (
    <div className="mx-auto max-w-7xl px-4 py-8">
      {/* header */}
      <div className="mb-6 flex items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Comunidades</h1>
          <p className="text-sm text-slate-600">
            Gestión centralizada de comunidades (solo administradores).
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Link
            to="/admin/moderador/nuevo"
            className="inline-flex items-center rounded-lg border border-indigo-600 px-4 py-2 text-sm font-semibold text-indigo-600 hover:bg-indigo-50 transition-colors"
            title="Crear moderador"
          >
            Crear moderador
          </Link>
          <button
            className="inline-flex items-center rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white shadow hover:bg-indigo-700 transition-colors"
            onClick={() => navigate("/admin/comunidades/nueva")}
            title="Crear una nueva comunidad"
          >
            Crear comunidad
          </button>
        </div>
      </div>

      {/* filtros — azul oscuro, labels blancas, inputs blancos */}
      <div className="mb-4 rounded-2xl border border-slate-800/50 shadow-sm bg-[linear-gradient(135deg,#273a9b,#111a34)] text-white">
        <div className="grid gap-3 md:grid-cols-5 p-4">
          <label className="text-xs uppercase tracking-wider text-white/90 md:col-span-2">
            Nombre o código
            <div className="mt-1 flex gap-2">
              <input
                className="input w-full bg-white text-slate-900 placeholder-slate-400"
                placeholder="Ej: Los Robles…"
                value={q}
                onChange={(e) => {
                  setQ(e.target.value);
                  setPage(1);
                }}
              />
              <button
                className="inline-flex items-center rounded-lg border border-white/70 px-3 py-2 text-sm font-medium text-white hover:bg-white hover:text-slate-900 transition"
                onClick={() => setPage(1)}
              >
                Buscar
              </button>
            </div>
          </label>

          <label className="text-xs uppercase tracking-wider text-white/90">
            Tipo
            <select
              className="input mt-1 bg-white text-slate-900"
              value={tipo as any}
              onChange={(e) => {
                setTipo((e.target.value ? Number(e.target.value) : "") as any);
                setPage(1);
              }}
            >
              <option value="">Todos</option>
              <option value={1}>Departamento</option>
              <option value={2}>Condominio</option>
            </select>
          </label>

          <label className="text-xs uppercase tracking-wider text-white/90">
            Estado
            <select
              className="input mt-1 bg-white text-slate-900"
              value={estado as any}
              onChange={(e) => {
                setEstado((e.target.value ? Number(e.target.value) : "") as any);
                setPage(1);
              }}
            >
              <option value="">Todos</option>
              <option value={1}>Activa</option>
              <option value={2}>Suspendida</option>
            </select>
          </label>

          <label className="text-xs uppercase tracking-wider text-white/90">
            Orden
            <select
              className="input mt-1 bg-white text-slate-900"
              value={`${sort.dir === "desc" ? "-" : ""}${sort.key}`}
              onChange={(e) => {
                const val = e.target.value;
                setSort({
                  key: val.replace("-", ""),
                  dir: val.startsWith("-") ? "desc" : "asc",
                });
                setPage(1);
              }}
            >
              <option value="-creado_en">Recientes primero</option>
              <option value="creado_en">Antiguas primero</option>
              <option value="nombre">Nombre (A–Z)</option>
              <option value="-nombre">Nombre (Z–A)</option>
              <option value="tipo_id">Tipo (asc)</option>
              <option value="-tipo_id">Tipo (desc)</option>
              <option value="estado_comunidad_id">Estado (asc)</option>
              <option value="-estado_comunidad_id">Estado (desc)</option>
            </select>
          </label>
        </div>
      </div>

      {err && (
        <div className="mb-4 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
          {err}
        </div>
      )}

      {/* tabla — header azul y rail sólido por estado */}
      <div className="overflow-x-auto overflow-y-visible rounded-2xl border border-slate-200 bg-white shadow-sm">
        <table className="min-w-[960px] w-full text-sm table-fixed lg:table-auto">
          <thead>
            <tr className="text-left text-white bg-[linear-gradient(180deg,#273a9b,#1b2554)]">
              {headers.map((h, i) => (
                <th
                  key={h.key}
                  className={[
                    "px-4 py-3 font-semibold",
                    i === 0 ? "rounded-tl-2xl" : "",
                    i === headers.length - 1 ? "rounded-tr-2xl" : "",
                    h.cls || "",
                  ].join(" ")}
                >
                  {h.key !== "acciones" && h.key !== "moderador_correo" ? (
                    <button
                      className="inline-flex items-center gap-1 hover:opacity-90"
                      onClick={() => onSort(h.key)}
                    >
                      {h.label}
                      {sort.key === h.key && (
                        <span className="text-white/70">{sort.dir === "asc" ? "▲" : "▼"}</span>
                      )}
                    </button>
                  ) : (
                    <span>{h.label}</span>
                  )}
                </th>
              ))}
            </tr>
          </thead>

          <tbody className="divide-y divide-slate-100">
            {!loading && rows.length === 0 && (
              <tr>
                <td colSpan={headers.length} className="px-4 py-6 text-center text-slate-500">
                  Sin resultados
                </td>
              </tr>
            )}

            {rows.map((r) => {
              const buffer = edit[r.id] || {};
              const nombre = buffer.nombre ?? r.nombre;
              const estadoVal = buffer.estado_comunidad_id ?? r.estado_comunidad_id ?? undefined;
              const changed = hasChanges(r);
              const hasMod = !!r.moderador_correo;
              const accent = rowAccent(estadoVal);

              return (
                <tr key={r.id} className="align-middle hover:bg-slate-50/40 transition-colors">
                  {/* rail sólido, alineado al borde izquierdo */}
                  <td className="px-4 py-3 relative whitespace-nowrap">
                    <span className={`absolute left-0 top-0 bottom-0 w-2 ${accent.rail}`} />
                    {r.id}
                  </td>

                  {/* nombre editable */}
                  <td className="px-4 py-3">
                    <input
                      className="input h-9 w-full truncate lg:whitespace-normal lg:break-words lg:overflow-visible"
                      value={nombre}
                      title={nombre}
                      onChange={(e) => setEditField(r.id, { nombre: e.target.value })}
                    />
                  </td>

                  {/* tipo */}
                  <td className="px-4 py-3">
                    <Badge>{r.tipo_id === 1 ? "Departamento" : "Condominio"}</Badge>
                  </td>

                  {/* código */}
                  <td className="px-4 py-3">
                    <code className="rounded bg-slate-100 px-2 py-0.5 text-[11px] whitespace-nowrap">
                      {r.codigo}
                    </code>
                  </td>

                  {/* moderador (oculto en <lg) */}
                  <td className="px-4 py-3 hidden lg:table-cell">
                    {hasMod ? (
                      <span
                        className="block truncate lg:whitespace-normal lg:break-words lg:overflow-visible"
                        title={r.moderador_correo || ""}
                      >
                        {r.moderador_correo}
                      </span>
                    ) : (
                      <span className="text-slate-400">—</span>
                    )}
                  </td>

                  {/* estado */}
                  <td className="px-4 py-3">
                    <EstadoSelect
                      value={estadoVal as number | null | undefined}
                      onChange={(v) => setEditField(r.id, { estado_comunidad_id: v })}
                    />
                  </td>

                  {/* creada (oculto en <md) */}
                  <td className="px-4 py-3 hidden md:table-cell whitespace-nowrap">
                    {r.creado_en ? new Date(r.creado_en).toLocaleString() : "—"}
                  </td>

                  {/* acciones */}
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <button
                        className={`inline-flex items-center rounded-lg px-3 py-1.5 text-sm font-semibold transition-colors ${changed ? "bg-indigo-600 text-white hover:bg-indigo-700" : "border border-slate-200 bg-slate-50 text-slate-400 cursor-not-allowed"}`}
                        disabled={!changed}
                        onClick={() => save(r)}
                        title={changed ? "Guardar cambios" : "Sin cambios"}
                      >
                        Guardar
                      </button>

                      {!hasMod && (
                        <Link
                          to={`/admin/moderador/nuevo?comunidad_id=${r.id}`}
                          className="inline-flex items-center rounded-lg border border-slate-300 px-3 py-1.5 text-sm font-semibold text-slate-700 hover:bg-slate-50 whitespace-nowrap"
                          title="Asignar moderador"
                        >
                          Asignar
                        </Link>
                      )}
                    </div>
                  </td>
                </tr>
              );
            })}

            {loading && (
              <tr>
                <td colSpan={headers.length} className="px-4 py-6 text-center text-slate-500">
                  Cargando…
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* paginación */}
      <div className="mt-4 flex items-center justify-between text-sm">
        <div className="text-slate-600">
          Mostrando {rows.length ? (page - 1) * pageSize + 1 : 0}–
          {(page - 1) * pageSize + rows.length} de {total}
        </div>
        <div className="flex items-center gap-2">
          <button
            className="rounded-md border border-indigo-600 bg-transparent px-3 py-1 text-sm font-semibold text-indigo-600 transition-colors duration-200 hover:bg-indigo-600 hover:text-white disabled:cursor-not-allowed disabled:opacity-50"
            disabled={page <= 1}
            onClick={() => setPage((p) => Math.max(1, p - 1))}
          >
            Anterior
          </button>
          <span className="text-slate-600">
            Página {page} / {Math.max(1, totalPages)}
          </span>
          <button
            className="rounded-md border border-indigo-600 bg-transparent px-3 py-1 text-sm font-semibold text-indigo-600 transition-colors duration-200 hover:bg-indigo-600 hover:text-white disabled:cursor-not-allowed disabled:opacity-50"
            disabled={page >= totalPages}
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
          >
            Siguiente
          </button>
        </div>
      </div>
    </div>
  );
}
