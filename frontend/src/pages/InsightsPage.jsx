/**
 * Placeholder for the Insights tab (docs/REQUIREMENTS.md -> Insights):
 * total spending, distance, ride count, average safety, eco stats.
 */
function InsightsPage() {
  return (
    <main className="mx-auto flex max-w-lg flex-col items-center gap-3 px-6 py-16 text-center">
      <span className="rounded-full border border-border-default bg-bg-card px-4 py-1 text-xs text-accent-amber-light">
        Coming next
      </span>
      <h1 className="font-display text-2xl font-semibold text-text-primary">Insights</h1>
      <p className="max-w-sm text-sm text-text-secondary">
        Total spending, distance, ride count, average safety score and
        sustainability stats will appear here.
      </p>
    </main>
  )
}

export default InsightsPage
