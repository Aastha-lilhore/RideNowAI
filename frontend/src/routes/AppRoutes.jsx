import { Routes, Route } from 'react-router-dom'
import LandingPage from '../pages/LandingPage.jsx'
import AuthPage from '../pages/AuthPage.jsx'
import DashboardPage from '../pages/DashboardPage.jsx'

/**
 * Central route table for RideNow AI.
 * One canonical route per feature (see FRONTEND_ARCHITECTURE.md).
 * More routes are added here as each screen is built —
 * do not duplicate a feature's screen under a second route.
 */
function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />
      <Route path="/auth" element={<AuthPage />} />
      <Route path="/dashboard" element={<DashboardPage />} />
    </Routes>
  )
}

export default AppRoutes
