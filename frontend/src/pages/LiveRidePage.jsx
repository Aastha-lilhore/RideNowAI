import { useLocation } from 'react-router-dom'

/**
 * Placeholder for screen 6 (Live Ride) in docs/PROJECT_MEMORY.md's journey.
 * Confirms the confirmed ride's data flows through from Ride Details. The
 * real screen (live map, driver location, route anomaly detection,
 * SOS per REQUIREMENTS.md) is the next screen to build.
 */
function LiveRidePage() {
  const location = useLocation()
  const { ride, driver, destination } = location.state || {}

  return (
    <main className="mx-auto flex max-w-lg flex-col items-center gap-3 px-6 py-16 text-center">
      <span className="rounded-full border border-border-default bg-bg-card px-4 py-1 text-xs text-accent-amber-light">
        Ride confirmed
      </span>
      <h1 className="font-display text-2xl font-semibold text-text-primary">On the way</h1>
      {ride && driver ? (
        <p className="text-sm text-text-secondary">
          {driver.name} is on the way in a {driver.vehicle.model} ({driver.vehicle.vehicle_number}) —{' '}
          {ride.etaMin} min to {destination}.
        </p>
      ) : (
        <p className="text-sm text-text-secondary">Confirm a ride from Ride Details first.</p>
      )}
      <p className="max-w-sm text-sm text-text-secondary">
        Live map tracking, route anomaly detection and SOS are the next
        screen to build.
      </p>
    </main>
  )
}

export default LiveRidePage
