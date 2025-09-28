import { createContext, useContext, useMemo, useState } from "react";
import { AuthApi, type LoginResp, type JwtUser } from "../services/auth";

type AuthCtx = {
  user: JwtUser | null;
  access: string | null;
  login: (correo: string, password: string, codigo?: string) => Promise<void>;
  logout: () => void;
  loading: boolean;
  booted: boolean; // ya hidratado desde localStorage (sincrónico)
};

const Ctx = createContext<AuthCtx>({
  user: null,
  access: null,
  login: async () => {},
  logout: () => {},
  loading: false,
  booted: false,
});

// Init SINCRÓNICO desde localStorage para evitar parpadeos/redirect al recargar
function getInitialAuth() {
  const access = localStorage.getItem("tk_access");
  const refresh = localStorage.getItem("tk_refresh"); // por si lo usas en otro lado
  const rawUser = localStorage.getItem("tk_user");
  let user: JwtUser | null = null;
  if (rawUser) {
    try {
      user = JSON.parse(rawUser);
    } catch {
      user = null;
    }
  }
  return {
    access: access || null,
    refresh: refresh || null,
    user,
  };
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const init = getInitialAuth();

  // Estados iniciales vienen del init (sincrónico).
  const [user, setUser] = useState<JwtUser | null>(init.user);
  const [access, setAccess] = useState<string | null>(init.access);
  const [loading, setLoading] = useState(false);

  // Como ya hidratamos sincrónicamente:
  const booted = true;

  const login = async (correo: string, password: string, codigo?: string) => {
    setLoading(true);
    try {
      const res = await AuthApi.login(correo, password, codigo);
      const data = res.data as LoginResp;
      setAccess(data.access);
      setUser(data.user);
      localStorage.setItem("tk_access", data.access);
      localStorage.setItem("tk_refresh", data.refresh);
      localStorage.setItem("tk_user", JSON.stringify(data.user));
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    setUser(null);
    setAccess(null);
    localStorage.removeItem("tk_access");
    localStorage.removeItem("tk_refresh");
    localStorage.removeItem("tk_user");
  };

  const value = useMemo(
    () => ({ user, access, login, logout, loading, booted }),
    [user, access, loading, booted]
  );

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useAuth() {
  return useContext(Ctx);
}
