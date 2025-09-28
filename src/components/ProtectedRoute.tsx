import { Navigate, Outlet } from "react-router-dom";
import { ReactNode } from "react";
import { useAuth } from "../context/AuthContext";

type Props = {
  children?: ReactNode;
  roles?: number[]; // 1=Admin, 2=Mod, 3=Residente
};

export default function ProtectedRoute({ children, roles }: Props) {
  const { user, booted, loading } = useAuth();

  // Si en algún momento cambias a hidratación asíncrona, esto evita redirecciones tempranas
  if (!booted || loading) {
    return (
      <div className="min-h-screen grid place-items-center text-slate-600">
        Cargando…
      </div>
    );
  }

  if (!user) return <Navigate to="/login" replace />;

  if (roles && !roles.includes(user.rol_usuario_id)) {
    // Sin permiso -> al dashboard
    return <Navigate to="/dashboard" replace />;
  }

  // Si children, renderízalo; si no, Outlet (para rutas anidadas)
  return children ? <>{children}</> : <Outlet />;
}
