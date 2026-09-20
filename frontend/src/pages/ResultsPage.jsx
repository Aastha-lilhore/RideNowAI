import { useLocation, useNavigate } from 'react-router-dom'
import { Star, Leaf, Sparkles } from 'lucide-react'
import Button from '../components/Button.jsx'

/**
 * AI Results (docs/REQUIREMENTS.md -> AI Results). Follows
 * docs/DESIGN_REFERENCE.md's patterns (colors updated to the Midnight
 * Amber palette, which postdates that doc):
 * - AI-recommended card: amber border + "AI TOP PICK" badge, on whichever
 *   ride actually has the highest recommendationScore — not just
 *   whichever sorts first, since Cheapest/Fastest/Safest re-sort the list.
 * - Metric chips: tinted pill backgrounds for safety/eco instead of plain text.
 * - Explainability box: italic reasoning text in its own inset panel.
 */
const SAFETY_TONE = {
  'Very Safe': 'text-success-DEFAULT bg-success-DEFAULT/10',
  Safe: 'text-success-DEFAULT bg-success-DEFAULT/10',
  Moderate: 'text-warning-DEFAULT bg-warning-DEFAULT/10',
  'High Risk': 'text-danger-DEFAULT bg-danger-DEFAULT/10',
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

  const aiTopId = rides.reduce((best, r) => (r.recommendationScore > best.recommendationScore ? r : best), rides[0]).id

  return (
    <div className="mx-auto max-w-lg px-6 py-10">
      <h1 className="font-display text-2xl font-semibold text-text-primary">Ride options</h1>
      <p className="mt-1 text-sm text-text-secondary">
        <span className="text-text-primary">{pickup}</span> →{' '}
        <span className="text-text-primary">{destination}</span> · {distanceKm} km
      </p>

      <div className="mt-6 flex flex-col gap-4">
        {rides.map((ride, index) => {
          const isTopPick = ride.id === aiTopId
          return (
            <div
              key={ride.id}
              className={`animate-fade-in-up rounded-2xl border bg-bg-card p-5 ${
                isTopPick
                  ? 'border-accent-amber shadow-[0_0_0_1px_rgba(217,130,43,0.3)]'
                  : 'border-border-default'
              }`}
              style={{ animationDelay: `${index * 60}ms` }}
            >
              {isTopPick && (
                <span className="mb-3 inline-flex items-center gap-1 rounded-full bg-accent-amber/15 px-2.5 py-1 text-[11px] font-medium tracking-wide text-accent-amber-light">
                  <Sparkles size={11} /> AI TOP PICK
                </span>
              )}

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

              <div className="mt-3 flex flex-wrap gap-2">
                <span className={`rounded-full px-2.5 py-1 text-xs ${SAFETY_TONE[ride.safetyLabel]}`}>
                  {ride.safetyScore}/100 · {ride.safetyLabel}
                </span>
                <span className="flex items-center gap-1 rounded-full bg-success-DEFAULT/10 px-2.5 py-1 text-xs text-success-DEFAULT">
                  <Leaf size={11} /> Eco {ride.ecoScore}/100
                </span>
              </div>

              <p className="mt-3 rounded-lg bg-bg-card-alt px-3 py-2 text-xs italic leading-relaxed text-text-secondary">
                {ride.reason}
              </p>

              <Button
                className="mt-3 w-full"
                onClick={() => navigate('/ride-details', { state: { ride, pickup, destination } })}
              >
                Select
              </Button>
            </div>
          )
        })}
      </div>
    </div>
  )
}

export default ResultsPage
