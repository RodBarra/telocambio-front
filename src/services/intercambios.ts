// src/services/intercambios.ts
import { request } from "../lib/http";
import type { Intercambio, IntercambioListResponse } from "../types";

type ListParams = {
  box?: "inbox" | "outbox";
  estado?: 1 | 2 | 3;
  publicacion_solicitada_id?: number;
  publicacion_ofrecida_id?: number;
  page?: number;
  page_size?: number;
};

function normalizeList(data: any): IntercambioListResponse {
  if (Array.isArray(data)) {
    return { results: data as Intercambio[] };
  }
  if (Array.isArray(data?.results)) {
    return { results: data.results as Intercambio[], meta: data.meta };
  }
  return { results: [] };
}

export async function listIntercambios(params: ListParams = {}): Promise<IntercambioListResponse> {
  const qs = new URLSearchParams();
  if (params.box) qs.set("box", params.box);
  if (params.estado) qs.set("estado", String(params.estado));
  if (params.publicacion_solicitada_id)
    qs.set("publicacion_solicitada_id", String(params.publicacion_solicitada_id));
  if (params.publicacion_ofrecida_id)
    qs.set("publicacion_ofrecida_id", String(params.publicacion_ofrecida_id));
  if (params.page) qs.set("page", String(params.page));
  if (params.page_size) qs.set("page_size", String(params.page_size));

  const query = qs.toString() ? `?${qs.toString()}` : "";
  const raw = await request<any>(`/intercambios/intercambios/${query}`);
  return normalizeList(raw);
}

type CreatePayload = {
  publicacion_solicitada_id: number;
  publicacion_ofrecida_id: number;
};

export async function createIntercambio(body: CreatePayload): Promise<{ success: boolean; data?: Intercambio }> {
  try {
    const resp = await request<{ success: boolean; data: Intercambio }>(
      `/intercambios/intercambios/`,
      { method: "POST", body }
    );
    return resp;
  } catch (e: any) {
    // surfear mensajes típicos del backend
    const msg =
      e?.response?.data?.detail ||
      (Array.isArray(e?.response?.data?.non_field_errors) ? e.response.data.non_field_errors[0] : null) ||
      e?.message ||
      "Error al crear el intercambio.";
    throw new Error(msg);
  }
}
