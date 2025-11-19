// src/pages/notificaciones/NotificationsPage.tsx
import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  type Notification,
  listNotificaciones,
  marcarLeida,
  marcarTodasLeidas,
  eliminarNotif,
} from "../../services/notificaciones";

type Filter = "all" | "unread";

function tipoMeta(tipo: Notification["tipo"]) {
  switch (tipo) {
    case "OFERTA_RECIBIDA":
      return {
        label: "Oferta recibida",
        emoji: "📩",
        pillClass:
          "bg-emerald-50 text-emerald-700 border border-emerald-100",
      };
    case "OFERTA_ACEPTADA":
      return {
        label: "Oferta aceptada",
        emoji: "✅",
        pillClass: "bg-blue-50 text-blue-700 border border-blue-100",
      };
    case "INTERCAMBIO_MARCADO_REALIZADO":
      return {
        label: "Marcado realizado",
        emoji: "🔁",
        pillClass:
          "bg-amber-50 text-amber-700 border border-amber-100",
      };
    case "INTERCAMBIO_FINALIZADO_PENDIENTE_VALORACION":
      return {
        label: "Pendiente de valoración",
        emoji: "⭐",
        pillClass:
          "bg-purple-50 text-purple-700 border border-purple-100",
      };
    default:
      return {
        label: tipo,
        emoji: "🔔",
        pillClass: "bg-slate-50 text-slate-700 border border-slate-100",
      };
  }
}

function formatFecha(dt: string) {
  try {
    const d = new Date(dt);
    return d.toLocaleString("es-CL", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return dt;
  }
}

export default function NotificationsPage() {
  const nav = useNavigate();

  const [items, setItems] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<Filter>("all");
  const [actionLoading, setActionLoading] = useState(false);
  const [actionId, setActionId] = useState<number | null>(null);

  const unreadCount = useMemo(
    () => items.filter((n) => !n.leida_en).length,
    [items]
  );

  const hasNotifications = items.length > 0;

  const fetchData = async (currentFilter: Filter) => {
    setLoading(true);
    setError(null);
    try {
      const notifs = await listNotificaciones({
        soloNoLeidas: currentFilter === "unread",
      });
      setItems(notifs);
    } catch (err) {
      console.error(err);
      setError(
        "No pudimos cargar tus notificaciones. Intenta nuevamente."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData(filter);
     
  }, [filter]);

  const handleMarkOne = async (id: number) => {
    setActionLoading(true);
    setActionId(id);
    try {
      await marcarLeida(id);
      setItems((prev) =>
        prev.map((n) =>
          n.id === id
            ? { ...n, leida_en: n.leida_en ?? new Date().toISOString() }
            : n
        )
      );
    } catch (err) {
      console.error(err);
      alert("No se pudo marcar como leída.");
    } finally {
      setActionLoading(false);
      setActionId(null);
    }
  };

  const handleMarkAll = async () => {
    if (!unreadCount) return;
    setActionLoading(true);
    try {
      await marcarTodasLeidas();
      setItems((prev) =>
        prev.map((n) =>
          !n.leida_en ? { ...n, leida_en: new Date().toISOString() } : n
        )
      );
    } catch (err) {
      console.error(err);
      alert("No se pudieron marcar todas como leídas.");
    } finally {
      setActionLoading(false);
    }
  };

  const handleDelete = async (id: number) => {
    const ok = window.confirm(
      "¿Seguro que quieres eliminar esta notificación?"
    );
    if (!ok) return;

    setActionLoading(true);
    setActionId(id);
    try {
      await eliminarNotif(id);
      setItems((prev) => prev.filter((n) => n.id !== id));
    } catch (err) {
      console.error(err);
      alert("No se pudo eliminar la notificación.");
    } finally {
      setActionLoading(false);
      setActionId(null);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900">
            Notificaciones
          </h1>
          <p className="text-xs sm:text-sm text-slate-500">
            Mantente al día con los movimientos de tus intercambios.
          </p>
        </div>

        {/* Filtros + acción global */}
        <div className="flex flex-col sm:flex-row gap-2 sm:items-center sm:justify-end">
          <div className="inline-flex rounded-full bg-slate-100 p-1 text-xs sm:text-sm">
            <button
              type="button"
              onClick={() => setFilter("all")}
              className={[
                "px-3 py-1 rounded-full transition",
                filter === "all"
                  ? "bg-white shadow text-slate-900"
                  : "text-slate-500 hover:text-slate-800",
              ].join(" ")}
            >
              Todas
            </button>
            <button
              type="button"
              onClick={() => setFilter("unread")}
              className={[
                "px-3 py-1 rounded-full transition",
                filter === "unread"
                  ? "bg-white shadow text-slate-900"
                  : "text-slate-500 hover:text-slate-800",
              ].join(" ")}
            >
              No leídas
              {unreadCount > 0 && (
                <span className="ml-1 inline-flex h-4 min-w-[1rem] items-center justify-center rounded-full bg-rose-500 text-[10px] font-semibold text-white">
                  {unreadCount}
                </span>
              )}
            </button>
          </div>

          <button
            type="button"
            onClick={handleMarkAll}
            disabled={!unreadCount || actionLoading}
            className={[
              "inline-flex items-center justify-center rounded-xl px-3 py-1.5 text-xs sm:text-sm font-medium border transition",
              unreadCount
                ? "bg-slate-900 text-white border-slate-900 hover:bg-slate-800"
                : "bg-slate-50 text-slate-400 border-slate-200 cursor-default",
            ].join(" ")}
          >
            {actionLoading ? "Aplicando..." : "Marcar todas como leídas"}
          </button>
        </div>
      </div>

      {/* Contenedor principal */}
      <div className="bg-white/80 backdrop-blur rounded-2xl border border-slate-200 shadow-sm">
        {loading ? (
          <div className="p-6 text-center text-sm text-slate-500">
            Cargando notificaciones…
          </div>
        ) : error ? (
          <div className="p-6 text-center text-sm text-rose-600">
            {error}
          </div>
        ) : !hasNotifications ? (
          <div className="p-8 flex flex-col items-center justify-center text-center gap-3">
            <div className="h-12 w-12 rounded-full bg-slate-100 flex items-center justify-center text-2xl">
              🔕
            </div>
            <div>
              <p className="text-sm font-semibold text-slate-900">
                No tienes notificaciones por ahora
              </p>
              <p className="text-xs sm:text-sm text-slate-500 mt-1">
                Cuando recibas ofertas, cambios de estado o valoraciones,
                aparecerán aquí.
              </p>
            </div>
            <button
              type="button"
              onClick={() => nav("/publicaciones")}
              className="mt-2 inline-flex items-center justify-center rounded-xl bg-blue-600 text-white text-xs sm:text-sm font-semibold px-4 py-2 hover:bg-blue-700"
            >
              Ir a publicaciones
            </button>
          </div>
        ) : (
          <ul className="divide-y divide-slate-100">
            {items.map((n) => {
              const meta = tipoMeta(n.tipo);
              const isUnread = !n.leida_en;
              return (
                <li
                  key={n.id}
                  className={[
                    "px-4 sm:px-5 py-3 sm:py-4 flex flex-col gap-2 sm:flex-row sm:items-start sm:gap-4",
                    isUnread ? "bg-slate-50" : "bg-white",
                  ].join(" ")}
                >
                  {/* Indicador + icono */}
                  <div className="flex flex-row sm:flex-col items-center gap-2 sm:w-12">
                    <div
                      className={[
                        "h-2 w-2 rounded-full",
                        isUnread ? "bg-emerald-500" : "bg-slate-300",
                      ].join(" ")}
                    />
                    <div className="hidden sm:flex h-8 w-8 items-center justify-center rounded-xl bg-slate-100 text-lg">
                      {meta.emoji}
                    </div>
                  </div>

                  {/* Contenido */}
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <h2 className="text-sm sm:text-base font-semibold text-slate-900 truncate">
                        {n.titulo}
                      </h2>
                      <span
                        className={[
                          "inline-flex items-center rounded-full px-2 py-0.5 text-[10px] sm:text-xs",
                          meta.pillClass,
                        ].join(" ")}
                      >
                        {meta.emoji}
                        <span className="ml-1">{meta.label}</span>
                      </span>
                    </div>
                    <p className="mt-1 text-xs sm:text-sm text-slate-600">
                      {n.mensaje}
                    </p>
                    <p className="mt-1 text-[11px] text-slate-400">
                      {formatFecha(n.creada_en)}
                    </p>
                  </div>

                  {/* Acciones */}
                  <div className="flex flex-row sm:flex-col gap-2 pt-1 sm:pt-0 sm:items-end">
                    {n.link_url && (
                      <Link
                        to={n.link_url}
                        className="inline-flex items-center justify-center rounded-xl bg-blue-600 text-white text-[11px] sm:text-xs font-semibold px-3 py-1.5 hover:bg-blue-700"
                      >
                        Ver detalle
                      </Link>
                    )}

                    {isUnread && (
                      <button
                        type="button"
                        onClick={() => handleMarkOne(n.id)}
                        disabled={actionLoading && actionId === n.id}
                        className="inline-flex items-center justify-center rounded-xl border border-emerald-300 bg-emerald-50 text-emerald-700 text-[11px] sm:text-xs font-medium px-3 py-1.5 hover:bg-emerald-100"
                      >
                        Marcar como leída
                      </button>
                    )}

                    <button
                      onClick={() => handleDeleteClick(n.id)}
                      className="inline-flex items-center rounded-xl border border-rose-200 px-2.5 py-1 text-[11px] 
                                text-rose-600 bg-rose-50 hover:bg-rose-600 hover:text-white hover:border-rose-600 
                                transition-colors"
                    >
                      Eliminar
                    </button>
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </div>
  );
}
