// src/lib/http.ts
import axios, {
  type AxiosError,
  type AxiosRequestConfig,
  type AxiosResponse,
} from "axios";

const baseURL = import.meta.env.VITE_API_URL || "http://127.0.0.1:8000";

/**
 * === MODO LEGADO (lo que ya te funcionaba) ===
 * Exportamos un axios instance llamado `http`, igual que antes.
 * Todo lo viejo (comunidades/usuarios/padrón/login) sigue funcionando.
 */
export const http = axios.create({ baseURL });

// ---- Helpers de refresh (idéntico a tu versión estable) ----
let isRefreshing = false;
let refreshQueue: Array<(token: string | null) => void> = [];

function enqueue(cb: (token: string | null) => void) {
  refreshQueue.push(cb);
}
function resolveQueue(token: string | null) {
  refreshQueue.forEach((cb) => cb(token));
  refreshQueue = [];
}

async function refreshAccessToken(): Promise<string | null> {
  const refresh = localStorage.getItem("tk_refresh");
  if (!refresh) return null;
  try {
    // Mantengo la ruta SIN slash final, como tenías cuando todo funcionaba
    const resp = await axios.post<{ access: string }>(`${baseURL}/auth/refresh`, { refresh });
    const newAccess = resp.data?.access;
    if (newAccess) {
      localStorage.setItem("tk_access", newAccess);
      return newAccess;
    }
    return null;
  } catch {
    return null;
  }
}

// ---- Request: agrega Authorization salvo endpoints públicos (igual que antes) ----
http.interceptors.request.use((config) => {
  const url = config.url || "";
  const isPublicAuth = /^\/auth\/(login|register|verify-access|refresh)/.test(url);
  if (!isPublicAuth) {
    const token = localStorage.getItem("tk_access");
    if (token) {
      config.headers = config.headers ?? {};
      (config.headers as any).Authorization = `Bearer ${token}`;
    }
  }
  return config;
});

// ---- Response: intenta refresh ante 401 / token inválido (igual que antes) ----
http.interceptors.response.use(
  (r: AxiosResponse) => r,
  async (error: AxiosError<any>) => {
    const original = error.config as (AxiosRequestConfig & { _retry?: boolean }) | undefined;
    const status = error.response?.status;
    const msg = (error.response?.data as any)?.detail || (error.response?.data as any)?.message || "";

    const shouldTryRefresh =
      status === 401 || /token/i.test(String(msg)) || /not valid/i.test(String(msg));

    if (original && shouldTryRefresh && !original._retry) {
      original._retry = true;

      if (isRefreshing) {
        return new Promise((resolve) => {
          enqueue((token) => {
            if (token && original) {
              original.headers = { ...(original.headers || {}), Authorization: `Bearer ${token}` };
              resolve(http(original));
            } else {
              resolve(Promise.reject(error));
            }
          });
        });
      }

      isRefreshing = true;
      const newToken = await refreshAccessToken();
      isRefreshing = false;
      resolveQueue(newToken);

      if (newToken && original) {
        original.headers = { ...(original.headers || {}), Authorization: `Bearer ${newToken}` };
        return http(original);
      } else {
        // limpiar sesión si el refresh también falló
        localStorage.removeItem("tk_access");
        localStorage.removeItem("tk_refresh");
        localStorage.removeItem("tk_user");
      }
    }

    return Promise.reject(error);
  }
);

/**
 * === MODO NUEVO (para servicios estilo “fetch”) ===
 * `request<T>(url, { method, body })` usa el instance anterior internamente,
 * pero te devuelve `data` directo (como ya vienes haciendo en publicaciones).
 * - NO rompe nada viejo porque `http` sigue siendo el axios instance.
 * - En módulos nuevos, importa y usa `request` en vez de `http`.
 */
export async function request<T = any>(
  url: string,
  options: { method?: string; body?: any } = {}
): Promise<T> {
  const method = (options.method || "GET").toUpperCase();
  const data =
    options.body && typeof options.body === "string"
      ? JSON.parse(options.body)
      : options.body ?? undefined;

  const res = await http.request<T>({ url, method, data });
  return res.data as T;
}

// (Opcional) helper para setear o limpiar Authorization globalmente si lo necesitas
export function setAuthHeader(token: string | null) {
  if (token) http.defaults.headers.common.Authorization = `Bearer ${token}`;
  else delete http.defaults.headers.common.Authorization;
}
