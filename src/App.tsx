import { lazy, Suspense } from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { TooltipProvider } from '@/components/ui/tooltip'
import { AuthProvider } from './contexts/AuthContext'

const Dashboard    = lazy(() => import('./components/Dashboard'))
const PlayersPage  = lazy(() => import('./components/PlayersPage'))
const GamesPage    = lazy(() => import('./components/GamesPage'))
const NewGamePage  = lazy(() => import('./components/NewGamePage'))
const StatsPage    = lazy(() => import('./components/StatsPage'))
const SettingsPage = lazy(() => import('./components/SettingsPage'))
const LoginPage    = lazy(() => import('./components/LoginPage'))
const Layout       = lazy(() => import('./components/Layout'))

const queryClient = new QueryClient({
  defaultOptions: {
    queries: { staleTime: 30_000, retry: 1 },
  },
})

const fallback = (
  <div className="flex h-screen items-center justify-center text-white/60">
    Chargement…
  </div>
)

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <TooltipProvider>
          <BrowserRouter>
            <Suspense fallback={fallback}>
              <Routes>
                <Route path="/login" element={<LoginPage />} />
                <Route element={<Layout />}>
                  <Route index element={<Dashboard />} />
                  <Route path="players" element={<PlayersPage />} />
                  <Route path="games" element={<GamesPage />} />
                  <Route path="sessions/new" element={<NewGamePage />} />
                  <Route path="stats" element={<StatsPage />} />
                  <Route path="settings" element={<SettingsPage />} />
                </Route>
                <Route path="*" element={<Navigate to="/" replace />} />
              </Routes>
            </Suspense>
          </BrowserRouter>
        </TooltipProvider>
      </AuthProvider>
    </QueryClientProvider>
  )
}
