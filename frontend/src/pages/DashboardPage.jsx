import { useLocation } from 'react-router-dom'

/**
 * Placeholder for screen 3 (Home Dashboard) in docs/PROJECT_MEMORY.md's
 * journey. Confirms the Landing -> Auth -> Dashboard flow works end to end;
 * the real dashboard (ride search entry, recent rides, safety mode toggle)
 * is the next build step.
 */
function DashboardPage() {
  const location = useLocation()
  const name = location.state?.name

  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-3 px-6 text-center">
      <span className="rounded-full border border-border-default bg-bg-card px-4 py-1 text-xs text-accent-amber-light">
        Auth flow OK
      </span>
      <h1 className="font-display text-2xl font-semibold text-text-primary">
        {name ? `Welcome, ${name}` : 'Welcome'}
      </h1>
      <p className="max-w-sm text-sm text-text-secondary">
        You're signed in. The real Home Dashboard (ride search, recent rides,
        safety mode) is the next screen to build.
      </p>
    </main>
  )
}

export default DashboardPage
