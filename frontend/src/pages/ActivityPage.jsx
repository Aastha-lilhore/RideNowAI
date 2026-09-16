/**
 * Placeholder for the Activity tab — this is where Ride History
 * (docs/DESIGN_REFERENCE.md's "Trip history rows" pattern) will live.
 * Canonical home for past-trip data; nothing else should duplicate it.
 */
function ActivityPage() {
  return (
    <main className="mx-auto flex max-w-lg flex-col items-center gap-3 px-6 py-16 text-center">
      <span className="rounded-full border border-border-default bg-bg-card px-4 py-1 text-xs text-accent-amber-light">
        Coming next
      </span>
      <h1 className="font-display text-2xl font-semibold text-text-primary">Activity</h1>
      <p className="max-w-sm text-sm text-text-secondary">
        Your ride history — route, distance, safety score and fare for each
        past trip — will appear here.
      </p>
    </main>
  )
}

export default ActivityPage
