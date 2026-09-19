import { useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { Star, ShieldCheck, Leaf } from 'lucide-react'
import Button from '../components/Button.jsx'

/**
 * Completion — the last stop in the ride journey (Landing -> ... -> Live
 * Ride -> Completion, per the journey in AI_FRONTEND_MASTER_PROMPT.md),
 * closing the loop after Live Ride's "arrived" state. Trip recap + a
 * driver rating; submitting is mocked (no ratings backend/table yet) but
 * the interaction is real, not decorative.
 */
function CompletionPage() {
  const location = useLocation()
  const { ride, driver, pickup, destination } = location.state || {}

  const [rating, setRating] = useState(0)
  const [hoverRating, setHoverRating] = useState(0)
  const [feedback, setFeedback] = useState('')
  const [submitted, setSubmitted] = useState(false)

  if (!ride || !driver) {
    return (
      <main className="mx-auto flex max-w-lg flex-col items-center gap-3 px-6 py-16 text-center">
        <h1 className="font-display text-2xl font-semibold text-text-primary">No trip to rate</h1>
        <p className="text-sm text-text-secondary">Complete a ride first.</p>
        <Button to="/dashboard" className="mt-2">
          Back to Dashboard
        </Button>
      </main>
    )
  }

  if (submitted) {
    return (
      <main className="mx-auto flex max-w-lg flex-col items-center gap-3 px-6 py-16 text-center">
        <span className="rounded-full border border-border-default bg-bg-card px-4 py-1 text-xs text-accent-amber-light">
          Thanks!
        </span>
        <h1 className="font-display text-2xl font-semibold text-text-primary">Rating submitted</h1>
        <p className="text-sm text-text-secondary">Hope you enjoyed your ride with {driver.name}.</p>
        <Button to="/dashboard" className="mt-2">
          Back to Dashboard
        </Button>
      </main>
    )
  }

  return (
    <div className="mx-auto max-w-lg px-6 py-10">
      <h1 className="font-display text-2xl font-semibold text-text-primary">Trip complete</h1>
      <p className="mt-1 text-sm text-text-secondary">
        <span className="text-text-primary">{pickup}</span> →{' '}
        <span className="text-text-primary">{destination}</span>
      </p>

      <div className="mt-6 grid grid-cols-2 gap-3">
        <div className="rounded-xl border border-border-default bg-bg-card p-4">
          <p className="text-xs text-text-secondary">Fare</p>
          <p className="mt-1 font-display text-lg font-semibold text-text-primary">₹{ride.fare}</p>
        </div>
        <div className="rounded-xl border border-border-default bg-bg-card p-4">
          <p className="text-xs text-text-secondary">Distance</p>
          <p className="mt-1 font-display text-lg font-semibold text-text-primary">{ride.distanceKm} km</p>
        </div>
        <div className="rounded-xl border border-border-default bg-bg-card p-4">
          <p className="flex items-center gap-1.5 text-xs text-text-secondary">
            <ShieldCheck size={13} /> Safety
          </p>
          <p className="mt-1 font-display text-lg font-semibold text-text-primary">{ride.safetyScore}/100</p>
        </div>
        <div className="rounded-xl border border-border-default bg-bg-card p-4">
          <p className="flex items-center gap-1.5 text-xs text-text-secondary">
            <Leaf size={13} /> Eco
          </p>
          <p className="mt-1 font-display text-lg font-semibold text-text-primary">{ride.ecoScore}/100</p>
        </div>
      </div>

      <div className="mt-4 rounded-2xl border border-border-default bg-bg-card p-6 text-center">
        <p className="text-sm font-medium text-text-primary">Rate your ride with {driver.name}</p>

        <div className="mt-4 flex justify-center gap-1.5">
          {[1, 2, 3, 4, 5].map((value) => (
            <button
              key={value}
              type="button"
              aria-label={`${value} star${value > 1 ? 's' : ''}`}
              onClick={() => setRating(value)}
              onMouseEnter={() => setHoverRating(value)}
              onMouseLeave={() => setHoverRating(0)}
              className="p-1"
            >
              <Star
                size={28}
                className={
                  value <= (hoverRating || rating)
                    ? 'fill-accent-amber-light text-accent-amber-light'
                    : 'text-border-default'
                }
              />
            </button>
          ))}
        </div>

        <textarea
          value={feedback}
          onChange={(e) => setFeedback(e.target.value)}
          placeholder="Anything you'd like to add? (optional)"
          rows={3}
          className="mt-4 w-full resize-none rounded-md border border-border-default bg-bg-card-alt px-3.5 py-2.5 text-sm text-text-primary placeholder:text-text-secondary/60 focus:border-accent-amber focus:outline-none"
        />

        <Button className="mt-4 w-full" disabled={rating === 0} onClick={() => setSubmitted(true)}>
          Submit rating
        </Button>
      </div>
    </div>
  )
}

export default CompletionPage
