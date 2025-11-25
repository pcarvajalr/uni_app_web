import { lazy, Suspense } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ThemeProvider } from '@/components/theme-provider';
import { AuthProvider } from '@/lib/auth';
import { FavoritesProvider } from '@/contexts/favorites-context';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import { Toaster } from '@/components/ui/toaster';
import { Loader2 } from 'lucide-react';

// Pages - Static imports for critical path
import HomePage from '@/pages/HomePage';
import AuthPage from '@/pages/AuthPage';
import ResetPasswordPage from '@/pages/ResetPasswordPage';
import DashboardPage from '@/pages/DashboardPage';
import MarketplacePage from '@/pages/MarketplacePage';
import MySalesPage from '@/pages/MySalesPage';
import TutoringPage from '@/pages/TutoringPage';
import MySessionsPage from '@/pages/MySessionsPage';
import ReportsPage from '@/pages/ReportsPage';
import NotificationsPage from '@/pages/NotificationsPage';
import CouponsPage from '@/pages/CouponsPage';
import ProfilePage from '@/pages/ProfilePage';

// Lazy-loaded pages for bundle size optimization
const HelpPage = lazy(() => import('@/pages/HelpPage'));
const MapsPage = lazy(() => import('@/pages/MapsPage'));
const SettingsPage = lazy(() => import('@/pages/SettingsPage'));

// Create a client
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
    },
  },
});

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider defaultTheme="light" storageKey="uni-app-theme">
        <AuthProvider>
          <FavoritesProvider>
            <BrowserRouter>
              <Suspense fallback={
                <div className="flex items-center justify-center h-screen">
                  <Loader2 className="h-8 w-8 animate-spin text-primary" />
                </div>
              }>
                <Routes>
                {/* Rutas públicas */}
                <Route path="/" element={<HomePage />} />
                <Route path="/auth" element={<AuthPage />} />
                <Route path="/auth/reset-password" element={<ResetPasswordPage />} />

                {/* Rutas privadas - requieren autenticación y email verificado */}
                <Route path="/dashboard" element={<ProtectedRoute><DashboardPage /></ProtectedRoute>} />
                <Route path="/marketplace" element={<ProtectedRoute><MarketplacePage /></ProtectedRoute>} />
                <Route path="/marketplace/my-sales" element={<ProtectedRoute><MySalesPage /></ProtectedRoute>} />
                <Route path="/tutoring" element={<ProtectedRoute><TutoringPage /></ProtectedRoute>} />
                <Route path="/tutoring/my-sessions" element={<ProtectedRoute><MySessionsPage /></ProtectedRoute>} />
                <Route path="/reports" element={<ProtectedRoute><ReportsPage /></ProtectedRoute>} />
                <Route path="/maps" element={<ProtectedRoute><MapsPage /></ProtectedRoute>} />
                <Route path="/notifications" element={<ProtectedRoute><NotificationsPage /></ProtectedRoute>} />
                <Route path="/coupons" element={<ProtectedRoute><CouponsPage /></ProtectedRoute>} />
                <Route path="/profile" element={<ProtectedRoute><ProfilePage /></ProtectedRoute>} />
                <Route path="/settings" element={<ProtectedRoute><SettingsPage /></ProtectedRoute>} />
                <Route path="/help" element={<ProtectedRoute><HelpPage /></ProtectedRoute>} />

                {/* Redirección por defecto */}
                <Route path="*" element={<Navigate to="/" replace />} />
              </Routes>
              </Suspense>
            </BrowserRouter>
          </FavoritesProvider>
        </AuthProvider>
      </ThemeProvider>
      <Toaster />
    </QueryClientProvider>
  );
}

export default App;
