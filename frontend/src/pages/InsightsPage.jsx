import { getRideHistory } from '../services/rideService.js'

/**
 * Insights tab (docs/REQUIREMENTS.md -> Insights): total spending,
 * distance, ride count, average safety, AI insights, sustainability
 * stats. Layout follows docs/DESIGN_REFERENCE.md: a 2-column grid of
 * metric tiles plus one full-width eco panel with a progress bar.
 * All numbers are computed from the same mock ride history the Activity
 * tab uses — not separately invented.
 */
const CO2_GOAL_KG = 10 // arbitrary monthly demo goal, shown so the progress bar has meaning

function InsightsPage() {
  const trips = getRideHistory()

  const totalSpending = trips.reduce((sum, t) => sum + t.actual_fare, 0)
  const totalDistance = Math.round(trips.reduce((sum, t) => sum + t.distance, 0) * 10) / 10
  const rideCount = trips.length
  const avgSafety = Math.round(trips.reduce((sum, t) => sum + t.safety_score, 0) / rideCount)
  const totalCo2Saved = Math.round(trips.reduce((sum, t) => sum + t.co2_estimate, 0) * 10) / 10
  const totalTimeSaved = trips.reduce((sum, t) => sum + t.time_saved, 0)
  const co2Progress = Math.min(100, Math.round((totalCo2Saved / CO2_GOAL_KG) * 100))

  const tiles = [
    { label: 'Total spending', value: `₹${totalSpending}` },
    { label: 'Distance travelled', value: `${totalDistance} km` },
    { label: 'Ride count', value: rideCount },
    { label: 'Average safety', value: `${avgSafety}/100` },
  ]

  return (
    <div className="mx-auto max-w-lg px-6 py-10">
      <h1 className="font-display text-2xl font-semibold text-text-primary">Insights</h1>
      <p className="mt-1 text-sm text-text-secondary">Across your last {rideCount} rides.</p>

      <div className="mt-6 grid grid-cols-2 gap-3">
        {tiles.map((tile) => (
          <div key={tile.label} className="rounded-xl border border-border-default bg-bg-card p-4">
            <p className="text-xs text-text-secondary">{tile.label}</p>
            <p className="mt-1 font-display text-lg font-semibold text-text-primary">{tile.value}</p>
          </div>
        ))}
      </div>

      <div className="mt-4 rounded-2xl border border-border-default bg-bg-card p-5">
        <div className="flex items-center justify-between">
          <p className="text-sm font-medium text-text-primary">Sustainability</p>
          <p className="text-xs text-text-secondary">{totalCo2Saved} / {CO2_GOAL_KG} kg CO₂ saved</p>
        </div>
        <div className="mt-3 h-2 w-full overflow-hidden rounded-full bg-bg-card-alt">
          <div className="h-full rounded-full bg-accent-amber" style={{ width: `${co2Progress}%` }} />
        </div>
      </div>

      <div className="mt-4 rounded-2xl border border-border-default bg-bg-card-alt p-5">
        <p className="text-sm font-medium text-text-primary">AI insights</p>
        <p className="mt-1.5 text-xs leading-relaxed text-text-secondary">
          AI-recommended rides saved you about {totalTimeSaved} minutes in total across these trips, at an
          average safety score of {avgSafety}/100.
        </p>
      </div>
    </div>
  )
}

export default InsightsPage
