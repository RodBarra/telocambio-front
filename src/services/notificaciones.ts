// src/services/notificaciones.ts
import { http } from "../lib/http";

export type NotificationType =
  | "OFERTA_RECIBIDA"
  | "OFERTA_ACEPTADA"
  | "INTERCAMBIO_MARCADO_REALIZADO"
  | "INTERCAMBIO_FINALIZADO_PENDIENTE_VALORACION";

export type Notification = {
  id: number;
  tipo: NotificationType;
  titulo: string;
  mensaje: string;
  intercambio_id?: number | null;
  publicacion_id?: number | null;
  link_url?: string | null;
  payload?: Record<string, any>;
  creada_en: string;
  leida_en?: string | null;
};

type ListParams = {
  soloNoLeidas?: boolean;
  page?: number;
  page_size?: number;
};

export async function getBadge(): Promise<{ no_leidas: number }> {
  return await http.get("/notificaciones/badge/");
}

export async function listNotificaciones(params: ListParams = {}): Promise<Notification[]> {
  const q = new URLSearchParams();
  if (params.soloNoLeidas) q.set("soloNoLeidas", "true");
  if (params.page) q.set("page", String(params.page));
  if (params.page_size) q.set("page_size", String(params.page_size));
  const qs = q.toString();
  const url = `/notificaciones/${qs ? `?${qs}` : ""}`;
  const data = await http.get(url);
  if (Array.isArray(data)) return data;
  if (Array.isArray((data as any)?.results)) return (data as any).results;
  return [];
}

export async function marcarLeida(id: number): Promise<void> {
  await http.patch(`/notificaciones/${id}/leer/`, {});
}

export async function marcarTodasLeidas(): Promise<{ marcadas: number }> {
  return await http.patch(`/notificaciones/leer-todas/`, {});
}

export async function eliminarNotif(id: number): Promise<void> {
  await http.delete(`/notificaciones/${id}/`);
}
