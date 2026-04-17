import { lazy, Suspense } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { TooltipProvider } from '@/shared/components/ui/tooltip';
import { AuthProvider, useAuth } from './contexts/AuthContext';

const Dashboard    = lazy(() => import('./components/Dashboard'));
const PlayersPage  = lazy(() => import('./components/PlayersPage'));
const GamesPage    = lazy(() => import('./components/GamesPage'));
const NewGamePage  = lazy(() => import('./components/NewGamePage'));
const StatsPage    = lazy(() => import('./components/StatsPage'));
const SettingsPage   = lazy(() => import('./components/SettingsPage'));
const LoginPage      = lazy(() => import('./components/LoginPage'));
const Layout         = lazy(() => import('./shared/components/Layout'));
const GamePageRoute  = lazy(() => import('./components/GamePageRoute'));

const queryClient = new QueryClient({
  defaultOptions: {
    queries: { staleTime: 30_000, retry: 1 },
  },
});

const fallback = (
  <div className="flex h-screen items-center justify-center text-white/60">
    Chargement…
  </div>
);

function ProtectedRoutes() {
  const { role, isChecking } = useAuth();
  if (isChecking) return fallback;
  if (!role) return <Navigate to="/login" replace />;
  return <Layout />;
}

function AppRoutes() {
  const { role, isChecking } = useAuth();

  return (
    <Suspense fallback={fallback}>
      <Routes>
        <Route
          path="/login"
          element={isChecking ? fallback : role ? <Navigate to="/" replace /> : <LoginPage />}
        />
        <Route element={<ProtectedRoutes />}>
          <Route index element={<Dashboard />} />
          <Route path="players" element={<PlayersPage />} />
          <Route path="games" element={<GamesPage />} />
          <Route path="sessions/new" element={<NewGamePage />} />
          <Route path="games/:id" element={<GamePageRoute subRoute="detail" />} />
          <Route path="games/:id/expansions" element={<GamePageRoute subRoute="expansions" />} />
          <Route path="games/:id/characters" element={<GamePageRoute subRoute="characters" />} />
          <Route path="stats" element={<StatsPage />} />
          <Route path="settings" element={<SettingsPage />} />
        </Route>
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Suspense>
  );
}

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <TooltipProvider>
          <BrowserRouter>
            <AppRoutes />
          </BrowserRouter>
        </TooltipProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}
