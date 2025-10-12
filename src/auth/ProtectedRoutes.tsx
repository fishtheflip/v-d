// src/router/ProtectedRoute.tsx
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from './AuthProvider';

export default function ProtectedRoute() {
  const { user, loading } = useAuth();
  const loc = useLocation();

  if (loading) return null; // можно поставить спиннер

  return user
    ? <Outlet />
    : <Navigate to="/landing" replace state={{ from: loc.pathname }} />;
}
