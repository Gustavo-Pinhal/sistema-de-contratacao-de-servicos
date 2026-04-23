import { Navigate, Outlet } from "react-router";
import { useUser } from "../context/UserContext";

interface ProtectedRouteProps {
  allowedRoles?: ('client' | 'provider' | 'business')[];
}

export function ProtectedRoute({ allowedRoles }: ProtectedRouteProps) {
  const { isLoggedIn, userRole } = useUser();

  // Se não estiver logado, manda para a home (ou login)
  if (!isLoggedIn) {
    return <Navigate to="/" replace />;
  }

  // Se o papel do usuário não estiver na lista de permitidos, manda para a home
  if (allowedRoles && userRole && !allowedRoles.includes(userRole as any)) {
    return <Navigate to="/" replace />;
  }

  return <Outlet />;
}
