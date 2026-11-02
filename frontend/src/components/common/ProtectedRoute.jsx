
import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

export default function ProtectedRoute({ roles }) {
  const { user, loading } = useAuth();

  if (loading) return <div className="p-10 text-center">Checking login...</div>;
  if (!user) return <Navigate to="/login" replace />;

  if (roles && !roles.some((role) => user.roles?.includes(role))) {
    return <Navigate to="/dashboard" replace />;
  }

  return <Outlet />;
}
