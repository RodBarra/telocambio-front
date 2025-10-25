// src/services/users.ts
import { request } from "../lib/http";

export type UsuarioLiteResp = {
  id: number;
  comunidad_id: number | null;
  correo: string;
  nombre?: string;
  apellidos?: string;
};

export async function getUsuarioLiteSafe(id: number): Promise<UsuarioLiteResp | null> {
  // Intenta rutas conocidas; ajusta aquí si tu backend expone otra.
  const candidates = [
    `/moderador/usuarios/${id}/`,
    `/usuarios/${id}/`,
    `/api/usuarios/${id}/`,
  ];

  for (const path of candidates) {
    try {
      const data = await request<any>(path);
      if (data && typeof data.id === "number") {
        return {
          id: data.id,
          comunidad_id: data.comunidad_id ?? null,
          correo: data.correo ?? "",
          nombre: data.nombre ?? "",
          apellidos: data.apellidos ?? "",
        };
      }
    } catch {
      // probar siguiente
    }
  }
  return null;
}
