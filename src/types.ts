// src/types.ts

/** ====== AUTH / USER ====== */
export type JwtUser = {
  id: number;                 // id en tu tabla usuario
  correo: string;
  rol_usuario_id: 1 | 2 | 3;  // 1=Admin, 2=Moderador, 3=Residente
  comunidad_id: number | null;
  nombre?: string;
  apellidos?: string;
};

export type LoginResp = {
  access: string;
  refresh: string;
  user: JwtUser;
};
export type LoginResponse = LoginResp;

/** ====== COMUNIDADES ====== */
export type Comunidad = {
  id: number;
  nombre: string;
  tipo_id: 1 | 2;
  direccion?: string | null;
  correo_contacto_admin: string;
  estado_comunidad_id?: number | null;
  codigo: string;
};

/** ====== PADRÓN ====== */
export type PadronItem = {
  id: number;
  comunidad_id: number;
  correo: string;
  habilitado: boolean;
  usado: boolean;
  torre?: string | null;
  direccion_texto?: string | null;
  numero?: string | null;
  estado_padron_id?: number;
};

export type PadronListResponse = {
  total?: number;
  items: PadronItem[];
};

/** ====== USUARIOS (módulo moderador) ====== */
export type UsuarioLite = {
  id: number;
  comunidad_id: number | null;
  comunidad_nombre?: string | null;
  correo: string;
  nombre: string;
  apellidos: string;
  telefono?: string | null;
  rol_usuario_id: 1 | 2 | 3;
  estado_usuario_id: number;    // 1=Activo, 2=Suspendido (ajusta)
  registrado_en?: string | null;
  actualizado_en?: string | null;
};
