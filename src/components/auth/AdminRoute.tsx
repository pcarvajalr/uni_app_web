import type { ReactNode } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '@/lib/auth';
import { ProtectedRoute } from './ProtectedRoute';

/**
 * Ruta protegida solo para administradores. Requiere auth + email verificado
 * (vía ProtectedRoute) y rol 'admin'; en caso contrario redirige a /settings.
 */
export function AdminRoute({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  return (
    <ProtectedRoute>
      {user?.role === 'admin' ? <>{children}</> : <Navigate to="/settings" replace />}
    </ProtectedRoute>
  );
}
