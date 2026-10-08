import { lazy, Suspense } from 'react'
import { Routes, Route } from 'react-router-dom'
import LandingPage from '../pages/LandingPage.jsx'
import AuthPage from '../pages/AuthPage.jsx'
import AppShell from '../layouts/AppShell.jsx'
import NotFoundPage from '../pages/NotFoundPage.jsx'
import RequireAuth from './RequireAuth.jsx'

/**
 * Landing and Auth load eagerly (they're the first thing visitors see).
 * Every authenticated screen is lazy-loaded so its code — especially the
 * heavy ones, Leaflet on Live Ride and Recharts on Insights — only
 * downloads when that screen is opened, instead of everything shipping in
 * one 900KB+ bundle up front.
 */
const DashboardPage = lazy(() => import('../pages/DashboardPage.jsx'))
const SearchPage = lazy(() => import('../pages/SearchPage.jsx'))
const ResultsPage = lazy(() => import('../pages/ResultsPage.jsx'))
const RideDetailsPage = lazy(() => import('../pages/RideDetailsPage.jsx'))
const LiveRidePage = lazy(() => import('../pages/LiveRidePage.jsx'))
const CompletionPage = lazy(() => import('../pages/CompletionPage.jsx'))
const ActivityPage = lazy(() => import('../pages/ActivityPage.jsx'))
const SafetyPage = lazy(() => import('../pages/SafetyPage.jsx'))
const InsightsPage = lazy(() => import('../pages/InsightsPage.jsx'))
const ProfilePage = lazy(() => import('../pages/ProfilePage.jsx'))

function RouteFallback() {
  return (
    <div className="flex min-h-[40vh] items-center justify-center" role="status" aria-label="Loading">
      <span className="h-5 w-5 animate-spin rounded-full border-2 border-border-default border-t-accent-amber" />
    </div>
  )
}

/**
 * Central route table for RideNow AI.
 * One canonical route per feature (see FRONTEND_ARCHITECTURE.md).
 * Authenticated screens sit behind RequireAuth and inside AppShell, so
 * they all share one session check and the one persistent nav. Unknown
 * URLs fall through to NotFoundPage.
 */
function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />
      <Route path="/auth" element={<AuthPage />} />

      <Route element={<RequireAuth />}>
        <Route element={<AppShell />}>
          <Route path="/dashboard" element={<Suspense fallback={<RouteFallback />}><DashboardPage /></Suspense>} />
          <Route path="/search" element={<Suspense fallback={<RouteFallback />}><SearchPage /></Suspense>} />
          <Route path="/results" element={<Suspense fallback={<RouteFallback />}><ResultsPage /></Suspense>} />
          <Route path="/ride-details" element={<Suspense fallback={<RouteFallback />}><RideDetailsPage /></Suspense>} />
          <Route path="/live-ride" element={<Suspense fallback={<RouteFallback />}><LiveRidePage /></Suspense>} />
          <Route path="/completion" element={<Suspense fallback={<RouteFallback />}><CompletionPage /></Suspense>} />
          <Route path="/activity" element={<Suspense fallback={<RouteFallback />}><ActivityPage /></Suspense>} />
          <Route path="/safety" element={<Suspense fallback={<RouteFallback />}><SafetyPage /></Suspense>} />
          <Route path="/insights" element={<Suspense fallback={<RouteFallback />}><InsightsPage /></Suspense>} />
          <Route path="/profile" element={<Suspense fallback={<RouteFallback />}><ProfilePage /></Suspense>} />
        </Route>
      </Route>

      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  )
}

export default AppRoutes
