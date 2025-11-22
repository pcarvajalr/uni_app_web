import { useEffect, type ReactNode } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/lib/auth';
import { Loader2 } from 'lucide-react';

interface ProtectedRouteProps {
  children: ReactNode;
}

/**
 * Componente para proteger rutas privadas
 * Redirige a /auth si el usuario no está autenticado
 * Redirige a /auth si el email no está verificado
 */
export function ProtectedRoute({ children }: ProtectedRouteProps) {
  const { isAuthenticated, isLoading, session } = useAuth();
  const location = useLocation();

  // Mostrar loader mientras se verifica la autenticación
  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="text-center">
          <Loader2 className="mx-auto h-8 w-8 animate-spin text-primary" />
          <p className="mt-2 text-sm text-muted-foreground">Verificando autenticación...</p>
        </div>
      </div>
    );
  }

  // Si no está autenticado, redirigir a /auth
  if (!isAuthenticated) {
    return <Navigate to="/auth" state={{ from: location }} replace />;
  }

  // Si está autenticado pero el email no está verificado, redirigir a /auth con mensaje
  if (session?.user && !session.user.email_confirmed_at) {
    return <Navigate to="/auth" state={{ emailNotVerified: true, from: location }} replace />;
  }

  // Si está autenticado y el email está verificado, mostrar contenido
  return <>{children}</>;
}
