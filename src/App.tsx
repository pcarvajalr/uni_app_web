import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ThemeProvider } from '@/components/theme-provider';
import { AuthProvider } from '@/lib/auth';

// Pages
import HomePage from '@/pages/HomePage';
import AuthPage from '@/pages/AuthPage';
import DashboardPage from '@/pages/DashboardPage';
import MarketplacePage from '@/pages/MarketplacePage';
import MySalesPage from '@/pages/MySalesPage';
import TutoringPage from '@/pages/TutoringPage';
import MySessionsPage from '@/pages/MySessionsPage';
import ReportsPage from '@/pages/ReportsPage';
import MapsPage from '@/pages/MapsPage';
import NotificationsPage from '@/pages/NotificationsPage';
import CouponsPage from '@/pages/CouponsPage';
import SettingsPage from '@/pages/SettingsPage';
import HelpPage from '@/pages/HelpPage';

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
          <BrowserRouter>
            <Routes>
              <Route path="/" element={<HomePage />} />
              <Route path="/auth" element={<AuthPage />} />
              <Route path="/dashboard" element={<DashboardPage />} />
              <Route path="/marketplace" element={<MarketplacePage />} />
              <Route path="/marketplace/my-sales" element={<MySalesPage />} />
              <Route path="/tutoring" element={<TutoringPage />} />
              <Route path="/tutoring/my-sessions" element={<MySessionsPage />} />
              <Route path="/reports" element={<ReportsPage />} />
              <Route path="/maps" element={<MapsPage />} />
              <Route path="/notifications" element={<NotificationsPage />} />
              <Route path="/coupons" element={<CouponsPage />} />
              <Route path="/settings" element={<SettingsPage />} />
              <Route path="/help" element={<HelpPage />} />
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </BrowserRouter>
        </AuthProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default App;
