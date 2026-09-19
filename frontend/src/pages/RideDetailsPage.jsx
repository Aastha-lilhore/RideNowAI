import { useLocation, useNavigate } from 'react-router-dom'
import { Star, ShieldCheck, Leaf, Clock, MapPin, PhoneCall } from 'lucide-react'
import Button from '../components/Button.jsx'
import { getDriverForRide } from '../services/rideService.js'

/**
 * Ride Details (docs/REQUIREMENTS.md -> Ride Details): driver profile,
 * vehicle details, safety score, estimated fare, distance, ETA, eco
 * score, and Confirm Ride. Driver/vehicle data is mocked (see
 * getDriverForRide in rideService.js) but shaped like the real DB tables
 * in API_CONTRACT.md.
 */
function RideDetailsPage() {
  const location = useLocation()
  const navigate = useNavigate()
  const { ride, pickup, destination } = location.state || {}

  if (!ride) {
    return (
      <main className="mx-auto flex max-w-lg flex-col items-center gap-3 px-6 py-16 text-center">
        <h1 className="font-display text-2xl font-semibold text-text-primary">No ride selected</h1>
        <p className="text-sm text-text-secondary">Select a ride from AI Results first.</p>
        <Button to="/dashboard" className="mt-2">
          Back to Dashboard
        </Button>
      </main>
    )
  }

  const driver = getDriverForRide(ride)
  const initials = driver.name.split(' ').map((n) => n[0]).join('')

  return (
    <div className="mx-auto max-w-lg px-6 py-10">
      <h1 className="font-display text-2xl font-semibold text-text-primary">Confirm your ride</h1>
      <p className="mt-1 text-sm text-text-secondary">
        <span className="text-text-primary">{pickup}</span> →{' '}
        <span className="text-text-primary">{destination}</span>
      </p>

      {/* Driver profile */}
      <div className="mt-6 flex items-center gap-4 rounded-2xl border border-border-default bg-bg-card p-5">
        <span className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-bg-card-alt font-display text-lg font-semibold text-accent-amber-light">
          {initials}
        </span>
        <div className="min-w-0 flex-1">
          <p className="flex items-center gap-1.5 font-display text-base font-semibold text-text-primary">
            {driver.name}
            {driver.verification_status === 'verified' && (
              <ShieldCheck size={14} className="text-success-DEFAULT" aria-label="Verified driver" />
            )}
          </p>
          <p className="mt-0.5 flex items-center gap-1 text-xs text-text-secondary">
            <Star size={12} className="fill-accent-amber-light text-accent-amber-light" />
            {driver.rating.toFixed(1)} · {driver.total_rides.toLocaleString()} rides
          </p>
        </div>
        <a
          href={`tel:${driver.phone.replace(/\s+/g, '')}`}
          className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-border-default text-text-primary transition-colors hover:border-accent-amber/60"
          aria-label={`Call ${driver.name}`}
        >
          <PhoneCall size={15} />
        </a>
      </div>

      {/* Vehicle details */}
      <div className="mt-4 rounded-2xl border border-border-default bg-bg-card p-5">
        <p className="font-display text-sm font-semibold text-text-primary">{driver.vehicle.model}</p>
        <p className="mt-1 text-xs text-text-secondary">
          {driver.vehicle.vehicle_number} · {driver.vehicle.fuel_type} · {driver.vehicle.capacity} seats
        </p>
      </div>

      {/* Trip recap */}
      <div className="mt-4 grid grid-cols-2 gap-3">
        <div className="rounded-xl border border-border-default bg-bg-card p-4">
          <p className="flex items-center gap-1.5 text-xs text-text-secondary">
            <MapPin size={13} /> Distance
          </p>
          <p className="mt-1 font-display text-base font-semibold text-text-primary">{ride.distanceKm} km</p>
        </div>
        <div className="rounded-xl border border-border-default bg-bg-card p-4">
          <p className="flex items-center gap-1.5 text-xs text-text-secondary">
            <Clock size={13} /> ETA
          </p>
          <p className="mt-1 font-display text-base font-semibold text-text-primary">{ride.etaMin} min</p>
        </div>
        <div className="rounded-xl border border-border-default bg-bg-card p-4">
          <p className="flex items-center gap-1.5 text-xs text-text-secondary">
            <ShieldCheck size={13} /> Safety
          </p>
          <p className="mt-1 font-display text-base font-semibold text-text-primary">{ride.safetyScore}/100</p>
        </div>
        <div className="rounded-xl border border-border-default bg-bg-card p-4">
          <p className="flex items-center gap-1.5 text-xs text-text-secondary">
            <Leaf size={13} /> Eco
          </p>
          <p className="mt-1 font-display text-base font-semibold text-text-primary">{ride.ecoScore}/100</p>
        </div>
      </div>

      <div className="mt-6 flex items-center justify-between rounded-2xl border border-border-default bg-bg-card-alt p-5">
        <span className="text-sm text-text-secondary">Estimated fare</span>
        <span className="font-display text-2xl font-semibold text-text-primary">₹{ride.fare}</span>
      </div>

      <Button
        className="mt-6 w-full"
        onClick={() => navigate('/live-ride', { state: { ride, driver, pickup, destination } })}
      >
        Confirm Ride
      </Button>
    </div>
  )
}

export default RideDetailsPage
