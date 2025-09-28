// src/services/usuarios.ts
import { http } from "../lib/http";

export type UsuarioLite = {
  id: number;
  comunidad_id: number | null;
  comunidad_nombre?: string | null;
  correo: string;
  nombre: string;
  apellidos: string;
  telefono?: string | null;
  rol_usuario_id: 1 | 2 | 3;     // 1=Admin,2=Moderador,3=Residente
  estado_usuario_id: number;      // 1=Activo, 2=Susp
  registrado_en?: string | null;  // ISO
  actualizado_en?: string | null; // ISO
};

export type UsuarioListResponse = {
  items: UsuarioLite[];
  total: number;
  page: number;
  page_size: number;
};

export type UsuarioListParams = {
  comunidad_id?: number;
  q?: string;
  rol?: 1 | 2 | 3;
  estado?: number;
  ordering?: string;
  page?: number;
  page_size?: number;
};

export const UsuariosApi = {
  list: (params?: UsuarioListParams) =>
    http.get<UsuarioListResponse>("/usuarios/", { params }),

  update: (id: number, patch: Partial<UsuarioLite>) =>
    http.put(`/usuarios/${id}`, patch),

  delete: (id: number) =>
    http.delete(`/usuarios/${id}`),

  createModerador: (payload: {
    comunidad_id: number;
    correo: string;
    password: string;
    nombre: string;
    apellidos: string;
    telefono?: string;
  }) => http.post("/usuarios/moderador", payload),
};
