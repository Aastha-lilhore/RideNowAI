import { Navigate, Outlet, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext.jsx'

/**
 * Guards every authenticated screen. Without it, anyone could open
 * /dashboard, /live-ride, etc. directly with no session and see app
 * screens with no user behind them. Remembers where they were headed so
 * the Auth screen could send them back after login (kept in route state).
 *
 * Note: this is a UX guard only — real access control has to be enforced
 * by the backend on every API call, not by the frontend.
 */
function RequireAuth() {
  const { user } = useAuth()
  const location = useLocation()

  if (!user) {
    return <Navigate to="/auth?tab=login" replace state={{ from: location.pathname }} />
  }

  return <Outlet />
}

export default RequireAuth
