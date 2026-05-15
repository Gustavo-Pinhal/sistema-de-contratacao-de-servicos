import { Navigate, Outlet } from "react-router";
import { useUser, UserRole } from "../../context/UserContext";

interface ProtectedRouteProps {
  allowedRoles?: UserRole[];
}

export function ProtectedRoute({ allowedRoles }: ProtectedRouteProps) {
  const { isLoggedIn, user } = useUser();

  // Se não estiver logado, manda para a home (ou login)
  if (!isLoggedIn) {
    return <Navigate to="/" replace />;
  }

  const userRole = user?.role;

  // Se o papel do usuário não estiver na lista de permitidos, manda para a home
  if (allowedRoles && userRole && !allowedRoles.includes(userRole)) {
    return <Navigate to="/" replace />;
  }

  return <Outlet />;
}
