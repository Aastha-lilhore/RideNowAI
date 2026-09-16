import { useLocation } from 'react-router-dom'

/**
 * Placeholder for screen 4 (Ride Search) in docs/PROJECT_MEMORY.md's
 * journey. Shows the pickup/destination actually passed from the
 * Dashboard, confirming that connection works end to end. The real
 * priority selection (Cheapest/Fastest/Safest/AI Recommended per
 * docs/REQUIREMENTS.md) is the next screen to build.
 */
function SearchPage() {
  const location = useLocation()
  const { pickup, destination } = location.state || {}

  return (
    <main className="mx-auto flex max-w-lg flex-col items-center gap-3 px-6 py-16 text-center">
      <span className="rounded-full border border-border-default bg-bg-card px-4 py-1 text-xs text-accent-amber-light">
        Dashboard flow OK
      </span>
      <h1 className="font-display text-2xl font-semibold text-text-primary">Ride Search</h1>
      {pickup && destination ? (
        <p className="text-sm text-text-secondary">
          Searching rides from <span className="text-text-primary">{pickup}</span> to{' '}
          <span className="text-text-primary">{destination}</span>.
        </p>
      ) : (
        <p className="text-sm text-text-secondary">
          Enter a pickup and destination on the Dashboard to search.
        </p>
      )}
      <p className="max-w-sm text-sm text-text-secondary">
        Priority selection (Cheapest / Fastest / Safest / AI Recommended)
        and the AI ride results are the next screens to build.
      </p>
    </main>
  )
}

export default SearchPage
