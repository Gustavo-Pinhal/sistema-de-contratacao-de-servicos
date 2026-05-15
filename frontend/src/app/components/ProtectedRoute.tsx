import { Navigate, Outlet } from "react-router";
import { useUser, type UserRole } from "../../context/UserContext";

interface ProtectedRouteProps {
  allowedRoles?: Exclude<UserRole, null>[];
}

export function ProtectedRoute({ allowedRoles }: ProtectedRouteProps) {
  const { isLoggedIn, user } = useUser();
  const userRole = user?.role ? String(user.role).toUpperCase() : null;
  const normalizedAllowedRoles = allowedRoles?.map((role) =>
    String(role).toUpperCase(),
  );

  // Se não estiver logado, manda para a home (ou login)
  if (!isLoggedIn) {
    return <Navigate to="/" replace />;
  }

  // Se o papel do usuário não estiver na lista de permitidos, manda para a home
  if (
    normalizedAllowedRoles &&
    (!userRole || !normalizedAllowedRoles.includes(userRole))
  ) {
    return <Navigate to="/" replace />;
  }

  return <Outlet />;
}
