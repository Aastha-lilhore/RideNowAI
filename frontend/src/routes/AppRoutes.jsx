import { Routes, Route } from 'react-router-dom'
import LandingPage from '../pages/LandingPage.jsx'
import AuthPage from '../pages/AuthPage.jsx'
import AppShell from '../layouts/AppShell.jsx'
import DashboardPage from '../pages/DashboardPage.jsx'
import SearchPage from '../pages/SearchPage.jsx'
import ActivityPage from '../pages/ActivityPage.jsx'
import SafetyPage from '../pages/SafetyPage.jsx'
import InsightsPage from '../pages/InsightsPage.jsx'

/**
 * Central route table for RideNow AI.
 * One canonical route per feature (see FRONTEND_ARCHITECTURE.md).
 * Authenticated screens (Dashboard onward) are nested under AppShell so
 * they all share the one persistent Search/Activity/Safety/Insights nav.
 */
function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />
      <Route path="/auth" element={<AuthPage />} />

      <Route element={<AppShell />}>
        <Route path="/dashboard" element={<DashboardPage />} />
        <Route path="/search" element={<SearchPage />} />
        <Route path="/activity" element={<ActivityPage />} />
        <Route path="/safety" element={<SafetyPage />} />
        <Route path="/insights" element={<InsightsPage />} />
      </Route>
    </Routes>
  )
}

export default AppRoutes
