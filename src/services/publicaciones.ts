// src/services/publicaciones.ts
import { http } from "../lib/http";
import type {
  Categoria,
  Publicacion,
  PublicacionListItem,
  ImagenPublicacion,
  PageMeta,
} from "../types";

type ListParams = {
  q?: string;
  categoria_id?: number;
  estado_publicacion_id?: number;
  orden?: "recientes" | "alfabetico";
  page?: number;
  page_size?: number;
  mine?: boolean;
};

type ListResponse = {
  results: PublicacionListItem[];
  meta: PageMeta;
};

// --- Catálogo ---
// 1) intenta catálogo nuevo /catalogos/categoria/
// 2) fallback a alias antiguo /publicaciones/categorias/
export async function getCategorias(): Promise<Categoria[]> {
  try {
    const res = await http<any>("/catalogos/categoria/");
    if (Array.isArray(res)) return res as Categoria[];
    if (res?.results) return res.results as Categoria[];
    if (res?.data) return res.data as Categoria[];
    return [];
  } catch {
    const res = await http<any>("/publicaciones/categorias/");
    if (Array.isArray(res)) return res as Categoria[];
    if (res?.results) return res.results as Categoria[];
    if (res?.data) return res.data as Categoria[];
    return [];
  }
}

// --- Publicaciones ---
export async function listPublicaciones(params: ListParams = {}): Promise<ListResponse> {
  const qs = new URLSearchParams();
  if (params.q) qs.set("q", params.q);
  if (params.categoria_id) qs.set("categoria_id", String(params.categoria_id));
  if (params.estado_publicacion_id) qs.set("estado_publicacion_id", String(params.estado_publicacion_id));
  if (params.orden) qs.set("orden", params.orden);
  if (params.page) qs.set("page", String(params.page));
  if (params.page_size) qs.set("page_size", String(params.page_size));
  if (params.mine) qs.set("mine", "true");
  const query = qs.toString() ? `?${qs.toString()}` : "";
  return http<ListResponse>(`/publicaciones/publicaciones/${query}`);
}

export async function getPublicacion(id: number): Promise<Publicacion> {
  return http<Publicacion>(`/publicaciones/publicaciones/${id}/`);
}

// Creación/edición SIN estado (backend lo deja en Activa=1 al crear)
type UpsertPayload = {
  categoria_id: number;
  tipo_publicacion_id: number; // 1=Servicio, 2=Producto, 3=Regalo
  titulo: string;
  descripcion?: string;
  condicion_publicacion_id: number;   // alias → backend lo mapea a condicion_producto_id
};

export async function createPublicacion(body: UpsertPayload): Promise<{ success: boolean; data: Publicacion }> {
  return http(`/publicaciones/publicaciones/`, {
    method: "POST",
    body: JSON.stringify(body),
  });
}

export async function updatePublicacion(id: number, body: UpsertPayload): Promise<{ success: boolean; data: Publicacion }> {
  return http(`/publicaciones/publicaciones/${id}/`, {
    method: "PUT",
    body: JSON.stringify(body),
  });
}

export async function deletePublicacion(id: number): Promise<void> {
  await http(`/publicaciones/publicaciones/${id}/`, { method: "DELETE" });
}

export async function patchEstado(id: number, estado_publicacion_id: number) {
  return http(`/publicaciones/publicaciones/${id}/estado/`, {
    method: "PATCH",
    body: JSON.stringify({ estado_publicacion_id }),
  });
}

export async function setImagenes(id: number, imagenes: Pick<ImagenPublicacion, "url" | "posicion">[]) {
  return http(`/publicaciones/publicaciones/${id}/imagenes/`, {
    method: "POST",
    body: JSON.stringify(imagenes),
  });
}
