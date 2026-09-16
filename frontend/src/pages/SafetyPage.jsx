/**
 * Placeholder for the Safety tab — the canonical home for Women's Safety
 * Mode, trusted contacts, and SOS (docs/REQUIREMENTS.md). Kept separate
 * from the Dashboard so this feature has exactly one place it lives.
 */
function SafetyPage() {
  return (
    <main className="mx-auto flex max-w-lg flex-col items-center gap-3 px-6 py-16 text-center">
      <span className="rounded-full border border-border-default bg-bg-card px-4 py-1 text-xs text-accent-amber-light">
        Coming next
      </span>
      <h1 className="font-display text-2xl font-semibold text-text-primary">Safety</h1>
      <p className="max-w-sm text-sm text-text-secondary">
        Women's Safety Mode, trusted contacts, live-location sharing and SOS
        will live here.
      </p>
    </main>
  )
}

export default SafetyPage
