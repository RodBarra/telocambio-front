export type JwtUser = {
  id: number;
  correo: string;
  rol_usuario_id: number;   // 1=Admin, 2=Moderador, 3=Residente (ajusta a tu catálogo)
  comunidad_id: number | null;
};

export type LoginResponse = {
  access: string;
  refresh: string;
  user: JwtUser;
};

export type PadronItem = {
  id: number;
  comunidad_id: number;
  correo: string;
  habilitado: boolean;
  usado: boolean;
  torre?: string | null;
  direccion_texto?: string | null;
  numero?: string | null;
};
