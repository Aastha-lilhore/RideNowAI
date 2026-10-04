import { Clock } from 'lucide-react'
import { getRideHistory } from '../services/rideService.js'
import TripHistoryRow from '../components/TripHistoryRow.jsx'

/**
 * Activity tab — the canonical home for ride history
 * (docs/REQUIREMENTS.md; row pattern from docs/DESIGN_REFERENCE.md).
 * Handles the empty state explicitly — a brand-new user (or the real
 * backend returning no rides yet) shouldn't see a blank page.
 */
function ActivityPage() {
  const trips = getRideHistory()

  return (
    <div className="mx-auto max-w-lg px-6 py-10">
      <h1 className="font-display text-2xl font-semibold text-text-primary">Activity</h1>
      <p className="mt-1 text-sm text-text-secondary">Your recent rides.</p>

      {trips.length === 0 ? (
        <div className="mt-10 flex flex-col items-center gap-2 text-center">
          <Clock size={28} className="text-text-secondary" strokeWidth={1.5} />
          <p className="text-sm text-text-secondary">No rides yet — your trips will show up here.</p>
        </div>
      ) : (
        <div className="mt-6 flex flex-col gap-3">
          {trips.map((trip) => (
            <TripHistoryRow key={trip.id} trip={trip} />
          ))}
        </div>
      )}
    </div>
  )
}

export default ActivityPage
