import { useLocation, useNavigate } from 'react-router-dom'
import { Star, Leaf } from 'lucide-react'
import Button from '../components/Button.jsx'

/**
 * AI Results (docs/REQUIREMENTS.md -> AI Results): each ride option shows
 * fare, ETA, safety score, driver rating, eco score and the plain-English
 * recommendation explanation generated in rideService.js. Ordered by
 * whichever priority the user picked on the Search screen.
 */
const SAFETY_TONE = {
  'Very Safe': 'text-success-DEFAULT',
  Safe: 'text-success-DEFAULT',
  Moderate: 'text-warning-DEFAULT',
  'High Risk': 'text-danger-DEFAULT',
}

function ResultsPage() {
  const location = useLocation()
  const navigate = useNavigate()
  const { rides, pickup, destination, distanceKm } = location.state || {}

  if (!rides) {
    return (
      <main className="mx-auto flex max-w-lg flex-col items-center gap-3 px-6 py-16 text-center">
        <h1 className="font-display text-2xl font-semibold text-text-primary">No search yet</h1>
        <p className="text-sm text-text-secondary">Start a search from the Dashboard first.</p>
        <Button to="/dashboard" className="mt-2">
          Back to Dashboard
        </Button>
      </main>
    )
  }

  return (
    <div className="mx-auto max-w-lg px-6 py-10">
      <h1 className="font-display text-2xl font-semibold text-text-primary">Ride options</h1>
      <p className="mt-1 text-sm text-text-secondary">
        <span className="text-text-primary">{pickup}</span> →{' '}
        <span className="text-text-primary">{destination}</span> · {distanceKm} km
      </p>

      <div className="mt-6 flex flex-col gap-4">
        {rides.map((ride, index) => (
          <div
            key={ride.id}
            className="animate-fade-in-up rounded-2xl border border-border-default bg-bg-card p-5"
            style={{ animationDelay: `${index * 60}ms` }}
          >
            <div className="flex items-start justify-between">
              <div>
                <p className="font-display text-base font-semibold text-text-primary">{ride.vehicleLabel}</p>
                <p className="mt-0.5 flex items-center gap-1 text-xs text-text-secondary">
                  <Star size={12} className="fill-accent-amber-light text-accent-amber-light" />
                  {ride.driverRating.toFixed(1)} · {ride.capacity} seats
                </p>
              </div>
              <div className="text-right">
                <p className="font-display text-lg font-semibold text-text-primary">₹{ride.fare}</p>
                <p className="text-xs text-text-secondary">{ride.etaMin} min</p>
              </div>
            </div>

            <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs">
              <span className={SAFETY_TONE[ride.safetyLabel]}>
                {ride.safetyScore}/100 · {ride.safetyLabel}
              </span>
              <span className="flex items-center gap-1 text-text-secondary">
                <Leaf size={12} /> Eco {ride.ecoScore}/100
              </span>
            </div>

            <p className="mt-3 rounded-lg bg-bg-card-alt px-3 py-2 text-xs leading-relaxed text-text-secondary">
              {ride.reason}
            </p>

            <Button
              className="mt-3 w-full"
              onClick={() => navigate('/ride-details', { state: { ride, pickup, destination } })}
            >
              Select
            </Button>
          </div>
        ))}
      </div>
    </div>
  )
}

export default ResultsPage
