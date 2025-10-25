// src/services/publicaciones.ts
import { http, request } from "../lib/http";
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

type UploadImgsResponse = {
  success: boolean;
  msg?: string;
  info?: string;
  data: Array<{ id: number; url: string; posicion: number; creada_en: string }>;
};

// --- Catálogo ---
export async function getCategorias(): Promise<Categoria[]> {
  try {
    const data = await request<any>("/catalogos/categoria/");
    if (Array.isArray(data)) return data as Categoria[];
    if (data?.results) return data.results as Categoria[];
    if (data?.data) return data.data as Categoria[];
    return [];
  } catch {
    const data = await request<any>("/publicaciones/categorias/");
    if (Array.isArray(data)) return data as Categoria[];
    if (data?.results) return data.results as Categoria[];
    if (data?.data) return data.data as Categoria[];
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
  return request<ListResponse>(`/publicaciones/publicaciones/${query}`);
}

export async function getPublicacion(id: number): Promise<Publicacion> {
  return request<Publicacion>(`/publicaciones/publicaciones/${id}/`);
}

type UpsertPayload = {
  categoria_id: number;
  tipo_publicacion_id: number;
  titulo: string;
  descripcion?: string;
  condicion_publicacion_id: number;
};

export async function createPublicacion(
  body: UpsertPayload
): Promise<{ success: boolean; data: Publicacion }> {
  return request(`/publicaciones/publicaciones/`, {
    method: "POST",
    body,
  });
}

export async function updatePublicacion(
  id: number,
  body: UpsertPayload
): Promise<{ success: boolean; data: Publicacion }> {
  return request(`/publicaciones/publicaciones/${id}/`, {
    method: "PUT",
    body,
  });
}

export async function deletePublicacion(id: number): Promise<void> {
  await request(`/publicaciones/publicaciones/${id}/`, { method: "DELETE" });
}

export async function patchEstado(id: number, estado_publicacion_id: number) {
  return request(`/publicaciones/publicaciones/${id}/estado/`, {
    method: "PATCH",
    body: { estado_publicacion_id },
  });
}

/** Alterna Activa (1) <-> Oculta (2) */
export async function toggleEstado(item: PublicacionListItem) {
  const next = item.estado_publicacion_id === 2 ? 1 : 2;
  return patchEstado(item.id, next);
}

export async function setImagenes(
  id: number,
  imagenes: Pick<ImagenPublicacion, "url" | "posicion">[]
) {
  return request(`/publicaciones/publicaciones/${id}/imagenes/`, {
    method: "POST",
    body: imagenes,
  });
}

/** Subida por archivos con multipart */
export async function uploadImagenesArchivo(pubId: number, files: File[]): Promise<UploadImgsResponse> {
  const form = new FormData();
  files.slice(0, 4).forEach((f) => form.append("files", f));

  const res = await http.post(
    `/publicaciones/publicaciones/${pubId}/imagenes/upload/`,
    form,
    {
      headers: { "Content-Type": "multipart/form-data" },
      transformRequest: [(data) => data],
    }
  );
  return res.data as UploadImgsResponse;
}
