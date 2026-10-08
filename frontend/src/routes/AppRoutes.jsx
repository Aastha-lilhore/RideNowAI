import { Routes, Route } from 'react-router-dom'
import LandingPage from '../pages/LandingPage.jsx'
import AuthPage from '../pages/AuthPage.jsx'
import AppShell from '../layouts/AppShell.jsx'
import DashboardPage from '../pages/DashboardPage.jsx'
import SearchPage from '../pages/SearchPage.jsx'
import ResultsPage from '../pages/ResultsPage.jsx'
import RideDetailsPage from '../pages/RideDetailsPage.jsx'
import LiveRidePage from '../pages/LiveRidePage.jsx'
import CompletionPage from '../pages/CompletionPage.jsx'
import ActivityPage from '../pages/ActivityPage.jsx'
import SafetyPage from '../pages/SafetyPage.jsx'
import InsightsPage from '../pages/InsightsPage.jsx'
import ProfilePage from '../pages/ProfilePage.jsx'
import NotFoundPage from '../pages/NotFoundPage.jsx'
import RequireAuth from './RequireAuth.jsx'

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
          <Route path="/dashboard" element={<DashboardPage />} />
          <Route path="/search" element={<SearchPage />} />
          <Route path="/results" element={<ResultsPage />} />
          <Route path="/ride-details" element={<RideDetailsPage />} />
          <Route path="/live-ride" element={<LiveRidePage />} />
          <Route path="/completion" element={<CompletionPage />} />
          <Route path="/activity" element={<ActivityPage />} />
          <Route path="/safety" element={<SafetyPage />} />
          <Route path="/insights" element={<InsightsPage />} />
          <Route path="/profile" element={<ProfilePage />} />
        </Route>
      </Route>

      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  )
}

export default AppRoutes
