import { ShieldCheck, Leaf } from 'lucide-react'

/**
 * The one trip-history row pattern (docs/DESIGN_REFERENCE.md -> Trip
 * history rows): route, distance/duration line, safety + CO2 line, fare
 * on the right. Reused wherever a past trip needs to be shown.
 */
function TripHistoryRow({ trip }) {
  return (
    <div className="rounded-xl border border-border-default bg-bg-card p-4">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="truncate text-sm font-medium text-text-primary">
            {trip.pickup} → {trip.destination}
          </p>
          <p className="mt-0.5 text-xs text-text-secondary">
            {trip.vehicleLabel} · {trip.distance} km · {trip.actual_duration} min
          </p>
          <p className="mt-1 flex items-center gap-3 text-xs">
            <span className="flex items-center gap-1 text-success-DEFAULT">
              <ShieldCheck size={12} /> {trip.safety_score}/100
            </span>
            <span className="flex items-center gap-1 text-text-secondary">
              <Leaf size={12} /> {trip.co2_estimate} kg CO₂ saved
            </span>
          </p>
        </div>
        <span className="shrink-0 font-display text-sm font-semibold text-text-primary">₹{trip.actual_fare}</span>
      </div>
    </div>
  )
}

export default TripHistoryRow
