import { useLocation } from 'react-router-dom'

/**
 * Placeholder for screen 5 (Ride Details) in docs/PROJECT_MEMORY.md's
 * journey. Confirms the selected ride's real data flows through from AI
 * Results. The full screen (driver profile, vehicle details, Confirm Ride
 * per docs/REQUIREMENTS.md) is the next screen to build.
 */
function RideDetailsPage() {
  const location = useLocation()
  const { ride, pickup, destination } = location.state || {}

  return (
    <main className="mx-auto flex max-w-lg flex-col items-center gap-3 px-6 py-16 text-center">
      <span className="rounded-full border border-border-default bg-bg-card px-4 py-1 text-xs text-accent-amber-light">
        Results flow OK
      </span>
      <h1 className="font-display text-2xl font-semibold text-text-primary">Ride Details</h1>
      {ride ? (
        <p className="text-sm text-text-secondary">
          {ride.vehicleLabel} selected for {pickup} → {destination}: ₹{ride.fare}, {ride.etaMin} min,{' '}
          {ride.safetyScore}/100 safety.
        </p>
      ) : (
        <p className="text-sm text-text-secondary">Select a ride from AI Results first.</p>
      )}
      <p className="max-w-sm text-sm text-text-secondary">
        Driver profile, vehicle details and Confirm Ride are the next
        screen to build.
      </p>
    </main>
  )
}

export default RideDetailsPage
