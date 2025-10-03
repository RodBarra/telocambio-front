import { useEffect, useMemo, useState } from "react";
import { useAuth } from "../../context/AuthContext";
import { UsuariosApi, type UsuarioLite, type UsuarioListParams } from "../../services/usuarios";
import { ComunidadesApi } from "../../services/comunidades";
import type { Comunidad } from "../../services/comunidades";
import ConfirmModal from "../../components/ConfirmModal";

type Sort = { key: string; dir: "asc" | "desc" };

function fmtDate(s?: string | null) {
  if (!s) return "-";
  const d = new Date(s);
  if (isNaN(d.getTime())) return s;
  return d.toLocaleString();
}

export default function ModUsuarios() {
  const { user } = useAuth();
  const isAdmin = user?.rol_usuario_id === 1;
  const isMod = user?.rol_usuario_id === 2;

  // datos
  const [rows, setRows] = useState<UsuarioLite[]>([]);
  const [total, setTotal] = useState(0);

  // filtros / estado UI
  const [q, setQ] = useState("");
  const [rol, setRol] = useState<"" | 1 | 2 | 3>("");
  const [estado, setEstado] = useState<"" | number>("");
  const [comunidadId, setComunidadId] = useState<number | "">("");
  const [sort, setSort] = useState<Sort>({ key: "id", dir: "desc" });
  const [page, setPage] = useState(1);
  const [pageSize] = useState(10);
  const [err, setErr] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  // comunidades para Admin (filtro)
  const [comunidades, setComunidades] = useState<Comunidad[]>([]);

  // modal eliminar
  const [toDelete, setToDelete] = useState<UsuarioLite | null>(null);
  const openDelete = (u: UsuarioLite) => setToDelete(u);
  const closeDelete = () => setToDelete(null);

  useEffect(() => {
    if (!isAdmin) return;
    ComunidadesApi.list({})
      .then(({ data }) => setComunidades(data.items || []))
      .catch(() => {});
  }, [isAdmin]);

  const params: UsuarioListParams = useMemo(() => {
    const p: UsuarioListParams = {
      q: q || undefined,
      ordering: `${sort.dir === "desc" ? "-" : ""}${sort.key}`,
      page,
      page_size: pageSize,
    };
    if (isAdmin) {
      if (rol) p.rol = rol as 1 | 2 | 3;
      if (estado) p.estado = estado as number;
      if (comunidadId) p.comunidad_id = Number(comunidadId);
    } else {
      if (estado) p.estado = estado as number;
    }
    return p;
  }, [q, rol, estado, sort, page, pageSize, comunidadId, isAdmin]);

  const load = async () => {
    setErr(null);
    setLoading(true);
    try {
      const { data } = await UsuariosApi.list(params);
      setRows(data.items || []);
      setTotal(data.total || 0);
    } catch (e: any) {
      setErr(e?.response?.data?.detail || "No se pudieron cargar los usuarios.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [params]);

  const onSort = (key: string) => {
    setSort((s) => (s.key === key ? { key, dir: s.dir === "asc" ? "desc" : "asc" } : { key, dir: "asc" }));
    setPage(1);
  };

  const totalPages = Math.max(1, Math.ceil(total / pageSize));

  const update = async (id: number, patch: Partial<UsuarioLite>) => {
    await UsuariosApi.update(id, patch);
    await load();
  };

  const remove = async (u: UsuarioLite) => {
    const canModEdit = isMod && user?.comunidad_id === u.comunidad_id && u.rol_usuario_id !== 1;
    const canAdminEdit = isAdmin;
    const allowed = canAdminEdit || canModEdit;
    if (!allowed) {
      alert("No autorizado para eliminar este usuario.");
      return;
    }
    openDelete(u);
  };

  // columnas
  const headers = [
    { key: "id", label: "ID", cls: "w-16 lg:w-auto" },
    { key: "correo", label: "Usuario", cls: "min-w-[16rem] lg:w-auto" },
    { key: "nombre", label: "Nombre", cls: "min-w-[12rem] lg:w-auto" },
    { key: "apellidos", label: "Apellidos", cls: "min-w-[14rem] lg:w-auto" },
    { key: "telefono", label: "Teléfono", nosort: true, cls: "w-32 lg:w-auto hidden lg:table-cell" },
    { key: "comunidad", label: "Comunidad", nosort: true, cls: "min-w-[16rem] lg:w-auto hidden md:table-cell" },
    { key: "registrado_en", label: "Registrado", cls: "w-44 lg:w-auto hidden xl:table-cell" },
    { key: "actualizado_en", label: "Actualizado", cls: "w-44 lg:w-auto hidden xl:table-cell" },
    { key: "rol_usuario_id", label: "Rol", cls: "w-40 lg:w-auto" },
    { key: "estado_usuario_id", label: "Estado", cls: "w-40 lg:w-auto" },
    { key: "acciones", label: "", cls: "w-16 lg:w-auto" },
  ] as const;

  const roleLabel = (r: 1 | 2 | 3) => (r === 1 ? "Admin" : r === 2 ? "Moderador" : "Residente");

  // —— Rail sólido por estado (sin degradado/stripe) ——
  const rowAccent = (estadoId?: number | null) => {
    return {
      rail: estadoId === 2 ? "bg-rose-500" : "bg-emerald-500",
    };
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-2xl font-bold">Usuarios</h1>
        {loading && <span className="text-sm text-slate-500">Cargando…</span>}
      </div>

      {/* Filtros (header azul) */}
      <div className="mb-4 rounded-2xl border border-slate-800/50 shadow-sm bg-[linear-gradient(135deg,#273a9b,#111a34)] text-white">
        <div className="grid gap-3 md:grid-cols-5 p-4">
          <label className="text-xs uppercase tracking-wider text-white/90">
            Buscar
            <input
              className="input mt-1 bg-white text-slate-900 placeholder-slate-400 shadow-sm"
              placeholder="Nombre o correo…"
              value={q}
              onChange={(e) => {
                setQ(e.target.value);
                setPage(1);
              }}
            />
          </label>

          <label className="text-xs uppercase tracking-wider text-white/90">
            Rol
            {isAdmin ? (
              <select
                className="input mt-1 bg-white text-slate-900"
                value={rol as any}
                onChange={(e) => {
                  setRol((e.target.value ? Number(e.target.value) : "") as any);
                  setPage(1);
                }}
              >
                <option value="">(todos)</option>
                <option value={3}>Residente</option>
                <option value={2}>Moderador</option>
                <option value={1}>Admin</option>
              </select>
            ) : (
              <select className="input mt-1 bg-white text-slate-900" value={3} disabled>
                <option value={3}>Residente</option>
              </select>
            )}
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
              <option value="">(todos)</option>
              <option value={1}>Activo</option>
              <option value={2}>Suspendido</option>
            </select>
          </label>

          {isAdmin && (
            <label className="text-xs uppercase tracking-wider text-white/90 md:col-span-2">
              Comunidad
              <select
                className="input mt-1 bg-white text-slate-900"
                value={comunidadId as any}
                onChange={(e) => {
                  setComunidadId(e.target.value ? Number(e.target.value) : "");
                  setPage(1);
                }}
              >
                <option value="">(todas)</option>
                {comunidades.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.nombre} — {c.codigo}
                  </option>
                ))}
              </select>
            </label>
          )}
        </div>
      </div>

      {err && (
        <div className="mb-4 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
          {err}
        </div>
      )}

      {/* Tabla */}
      <div className="overflow-x-auto rounded-2xl border border-slate-200 bg-white shadow-sm">
        <table className="min-w-[1024px] w-full text-sm table-fixed lg:table-auto">
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
                  {"nosort" in h && h.nosort ? (
                    <span>{h.label}</span>
                  ) : h.key !== "acciones" ? (
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

          <tbody>
            {rows.map((u) => {
              const canModEdit = isMod && user?.comunidad_id === u.comunidad_id && u.rol_usuario_id !== 1;
              const canAdminEdit = isAdmin;
              const canEdit = canAdminEdit || canModEdit;

              const accent = rowAccent(u.estado_usuario_id);

              return (
                <tr
                  key={u.id}
                  className="border-t align-top hover:bg-slate-50/40 transition-colors"
                >
                  {/* Rail sólido alineado al borde izquierdo */}
                  <td className="px-4 py-3 whitespace-nowrap relative">
                    <span className={`absolute left-0 top-0 bottom-0 w-2 ${accent.rail}`} />
                    {u.id}
                  </td>

                  {/* Usuario: evita superposición en móvil con truncado + word-break */}
                  <td className="px-4 py-3">
                    <div className="font-medium text-slate-900 truncate lg:whitespace-normal lg:break-words">
                      {u.correo}
                    </div>
                  </td>

                  <td className="px-4 py-3">
                    <span
                      className="block truncate lg:whitespace-normal lg:break-words"
                      title={u.nombre || ""}
                    >
                      {u.nombre || "-"}
                    </span>
                  </td>

                  <td className="px-4 py-3">
                    <span
                      className="block truncate lg:whitespace-normal lg:break-words"
                      title={u.apellidos || ""}
                    >
                      {u.apellidos || "-"}
                    </span>
                  </td>

                  <td className="px-4 py-3 hidden lg:table-cell">{u.telefono || "-"}</td>

                  <td className="px-4 py-3 hidden md:table-cell">
                    <span
                      className="block truncate lg:whitespace-normal lg:break-words"
                      title={u.comunidad_nombre || String(u.comunidad_id ?? "-")}
                    >
                      {u.comunidad_nombre || (u.comunidad_id ?? "-")}
                    </span>
                  </td>

                  <td className="px-4 py-3 hidden xl:table-cell whitespace-nowrap">{fmtDate(u.registrado_en)}</td>
                  <td className="px-4 py-3 hidden xl:table-cell whitespace-nowrap">{fmtDate(u.actualizado_en)}</td>

                  {/* Rol */}
                  <td className="px-4 py-3">
                    {isAdmin ? (
                      <select
                        className="input h-10 min-w-[7rem]"
                        value={u.rol_usuario_id}
                        onChange={(e) => update(u.id, { rol_usuario_id: Number(e.target.value) as 1 | 2 | 3 })}
                      >
                        <option value={3}>Residente</option>
                        <option value={2}>Moderador</option>
                        <option value={1}>Admin</option>
                      </select>
                    ) : (
                      <span className="inline-flex items-center rounded-full border border-slate-200 px-2 py-0.5 text-xs text-slate-700 bg-slate-50 whitespace-nowrap">
                        {roleLabel(u.rol_usuario_id)}
                      </span>
                    )}
                  </td>

                  {/* Estado */}
                  <td className="px-4 py-3">
                    <select
                      className="input h-10 min-w-[7rem]"
                      value={u.estado_usuario_id}
                      onChange={(e) => update(u.id, { estado_usuario_id: Number(e.target.value) })}
                      disabled={!canEdit}
                    >
                      <option value={1}>Activo</option>
                      <option value={2}>Suspendido</option>
                    </select>
                  </td>

                  <td className="px-4 py-3 text-right">
                    <button
                      className="btn btn-outline px-2 py-1"
                      onClick={() => remove(u)}
                      disabled={!canEdit}
                      title={!canEdit ? "No autorizado" : "Eliminar usuario"}
                    >
                      🗑️
                    </button>
                  </td>
                </tr>
              );
            })}

            {rows.length === 0 && (
              <tr>
                <td colSpan={headers.length} className="px-4 py-10 text-center text-slate-500">
                  Sin usuarios
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
          <span className="text-slate-600">Página {page} / {totalPages}</span>
          <button
            className="rounded-md border border-indigo-600 bg-transparent px-3 py-1 text-sm font-semibold text-indigo-600 transition-colors duration-200 hover:bg-indigo-600 hover:text-white disabled:cursor-not-allowed disabled:opacity-50"
            disabled={page >= totalPages}
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
          >
            Siguiente
          </button>
        </div>
      </div>

      {/* MODAL eliminar */}
      <ConfirmModal
        open={!!toDelete}
        title="Eliminar usuario"
        message={
          <>
            Esta acción es <strong>definitiva</strong>. Se eliminará el usuario:{" "}
            <span className="font-mono">{toDelete?.correo}</span>
          </>
        }
        confirmText="Eliminar usuario"
        cancelText="Cancelar"
        onConfirm={async () => {
          if (!toDelete) return;
          try {
            await UsuariosApi.delete(toDelete.id);
            closeDelete();
            await load();
          } catch (e: any) {
            setErr(e?.response?.data?.detail || "No se pudo eliminar el usuario.");
            closeDelete();
          }
        }}
        onCancel={closeDelete}
      />
    </div>
  );
}
