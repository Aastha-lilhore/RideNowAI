import { getRideHistory } from '../services/rideService.js'
import TripHistoryRow from '../components/TripHistoryRow.jsx'

/**
 * Activity tab — the canonical home for ride history
 * (docs/REQUIREMENTS.md; row pattern from docs/DESIGN_REFERENCE.md).
 */
function ActivityPage() {
  const trips = getRideHistory()

  return (
    <div className="mx-auto max-w-lg px-6 py-10">
      <h1 className="font-display text-2xl font-semibold text-text-primary">Activity</h1>
      <p className="mt-1 text-sm text-text-secondary">Your recent rides.</p>

      <div className="mt-6 flex flex-col gap-3">
        {trips.map((trip) => (
          <TripHistoryRow key={trip.id} trip={trip} />
        ))}
      </div>
    </div>
  )
}

export default ActivityPage
