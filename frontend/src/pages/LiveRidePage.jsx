import { useEffect, useMemo, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { MapContainer, TileLayer, Marker, Polyline } from 'react-leaflet'
import L from 'leaflet'
import { ShieldCheck, ShieldAlert, Share2, TriangleAlert, Star, PhoneCall } from 'lucide-react'
import Button from '../components/Button.jsx'
import { getRouteCoordinates, getAnomalyPlan } from '../services/rideService.js'

/**
 * Live Ride (docs/REQUIREMENTS.md -> Live Ride): interactive map,
 * vehicle/driver marker, driver information, ride status, safety score,
 * Share Ride, and an SOS prototype action. No live GPS/routing backend
 * yet, so the vehicle marker's movement is a linear simulation between
 * mocked pickup/destination coordinates (see getRouteCoordinates) rather
 * than a real route — the interaction pattern is real, the geodata isn't.
 */
const SIM_DURATION_MS = 20000 // whole trip simulated over 20s for demo purposes

const pickupIcon = L.divIcon({ className: 'map-pin map-pin-start', iconSize: [14, 14] })
const destinationIcon = L.divIcon({ className: 'map-pin map-pin-end', iconSize: [14, 14] })
const vehicleIcon = L.divIcon({ className: 'map-pin map-pin-vehicle', iconSize: [16, 16] })

function lerp(a, b, t) {
  return a + (b - a) * t
}

function LiveRidePage() {
  const location = useLocation()
  const navigate = useNavigate()
  const { ride, driver, pickup, destination } = location.state || {}

  const coords = useMemo(
    () => (pickup && destination ? getRouteCoordinates(pickup, destination) : null),
    [pickup, destination],
  )

  const [progress, setProgress] = useState(0)
  const [sosStage, setSosStage] = useState('idle') // idle | confirming | sent
  const [shareStatus, setShareStatus] = useState('')
  const [anomalyDismissed, setAnomalyDismissed] = useState(false)

  const anomalyPlan = useMemo(() => (ride ? getAnomalyPlan(ride) : { hasAnomaly: false }), [ride])

  useEffect(() => {
    if (!coords) return undefined
    const start = Date.now()
    const id = setInterval(() => {
      setProgress(Math.min(1, (Date.now() - start) / SIM_DURATION_MS))
    }, 200)
    return () => clearInterval(id)
  }, [coords])

  if (!ride || !driver || !coords) {
    return (
      <main className="mx-auto flex max-w-lg flex-col items-center gap-3 px-6 py-16 text-center">
        <h1 className="font-display text-2xl font-semibold text-text-primary">No active ride</h1>
        <p className="text-sm text-text-secondary">Confirm a ride from Ride Details first.</p>
        <Button to="/dashboard" className="mt-2">
          Back to Dashboard
        </Button>
      </main>
    )
  }

  const vehiclePos = [lerp(coords.pickup.lat, coords.destination.lat, progress), lerp(coords.pickup.lng, coords.destination.lng, progress)]
  const remainingMin = Math.max(0, Math.round(ride.etaMin * (1 - progress)))
  const arrived = progress >= 1
  const anomalyActive =
    anomalyPlan.hasAnomaly &&
    !anomalyDismissed &&
    progress >= anomalyPlan.startProgress &&
    progress <= anomalyPlan.endProgress

  async function handleShare() {
    const shareText = `Tracking my RideNow AI trip with ${driver.name} (${driver.vehicle.vehicle_number}), arriving in ${remainingMin} min.`
    if (navigator.share) {
      try {
        await navigator.share({ title: 'RideNow AI — Live Ride', text: shareText })
      } catch {
        // user cancelled the native share sheet — no error state needed
      }
      return
    }
    try {
      await navigator.clipboard.writeText(shareText)
      setShareStatus('Trip details copied to clipboard')
      setTimeout(() => setShareStatus(''), 3000)
    } catch {
      setShareStatus('Could not copy — try again')
    }
  }

  function confirmSos() {
    setSosStage('sent')
  }

  return (
    <div className="mx-auto max-w-lg px-6 py-8">
      <h1 className="font-display text-2xl font-semibold text-text-primary">
        {arrived ? 'Driver has arrived' : 'On the way'}
      </h1>
      <p className="mt-1 text-sm text-text-secondary">
        {arrived ? `${driver.name} is waiting at your pickup point.` : `Arriving in ${remainingMin} min`}
      </p>

      <div className="mt-4 h-72 overflow-hidden rounded-2xl border border-border-default">
        <MapContainer
          center={[coords.pickup.lat, coords.pickup.lng]}
          zoom={14}
          scrollWheelZoom={false}
          style={{ height: '100%', width: '100%' }}
          attributionControl={false}
        >
          <TileLayer
            url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
            attribution="&copy; OpenStreetMap contributors &copy; CARTO"
          />
          <Polyline
            positions={[
              [coords.pickup.lat, coords.pickup.lng],
              [coords.destination.lat, coords.destination.lng],
            ]}
            pathOptions={{ color: '#d9822b', weight: 3, opacity: 0.8 }}
          />
          <Marker position={[coords.pickup.lat, coords.pickup.lng]} icon={pickupIcon} />
          <Marker position={[coords.destination.lat, coords.destination.lng]} icon={destinationIcon} />
          <Marker position={vehiclePos} icon={vehicleIcon} />
        </MapContainer>
      </div>

      {/* Route Anomaly: normal monitoring state vs. alert state (docs/REQUIREMENTS.md -> Route Anomaly) */}
      {anomalyActive ? (
        <div className="mt-4 rounded-2xl border border-danger-DEFAULT/50 bg-danger-DEFAULT/10 p-5">
          <p className="flex items-center gap-2 font-display text-sm font-semibold text-danger-DEFAULT">
            <ShieldAlert size={16} /> Route anomaly detected
          </p>
          <p className="mt-1.5 text-xs leading-relaxed text-text-secondary">
            The vehicle has deviated about {anomalyPlan.deviationMeters}m from the planned route for over{' '}
            {anomalyPlan.deviationMinutes} minutes.
          </p>
          <div className="mt-3 flex flex-wrap gap-2">
            <Button variant="secondary" onClick={() => setAnomalyDismissed(true)} className="text-xs">
              I'm safe, continue
            </Button>
            <a
              href={`tel:${driver.phone.replace(/\s+/g, '')}`}
              className="inline-flex items-center gap-1.5 rounded-md border border-border-default px-3.5 py-2 text-xs text-text-primary transition-colors hover:border-accent-amber/60"
            >
              <PhoneCall size={14} /> Call driver
            </a>
            <Button variant="danger" onClick={() => setSosStage('confirming')} className="text-xs">
              Trigger SOS
            </Button>
          </div>
        </div>
      ) : (
        <div className="mt-4 flex items-center gap-2 rounded-xl border border-border-default bg-bg-card px-4 py-2.5 text-xs text-text-secondary">
          <ShieldCheck size={14} className="text-success-DEFAULT" /> Monitoring route — no anomalies detected
        </div>
      )}

      {/* Driver + ride status */}
      <div className="mt-4 flex items-center gap-4 rounded-2xl border border-border-default bg-bg-card p-5">
        <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-bg-card-alt font-display text-base font-semibold text-accent-amber-light">
          {driver.name.split(' ').map((n) => n[0]).join('')}
        </span>
        <div className="min-w-0 flex-1">
          <p className="font-display text-sm font-semibold text-text-primary">{driver.name}</p>
          <p className="mt-0.5 flex items-center gap-1 text-xs text-text-secondary">
            <Star size={12} className="fill-accent-amber-light text-accent-amber-light" />
            {driver.rating.toFixed(1)} · {driver.vehicle.model} · {driver.vehicle.vehicle_number}
          </p>
        </div>
        <span className="flex items-center gap-1 rounded-full bg-bg-card-alt px-2.5 py-1 text-xs text-success-DEFAULT">
          <ShieldCheck size={12} /> {ride.safetyScore}
        </span>
      </div>

      {/* Share + SOS */}
      <div className="mt-4 grid grid-cols-2 gap-3">
        <Button variant="secondary" onClick={handleShare} className="w-full">
          <Share2 size={16} className="mr-2" /> Share Ride
        </Button>

        {sosStage === 'idle' && (
          <Button variant="outlineDanger" onClick={() => setSosStage('confirming')} className="w-full">
            <TriangleAlert size={16} className="mr-2" /> SOS
          </Button>
        )}
        {sosStage === 'confirming' && (
          <div className="col-span-2 rounded-xl border border-danger-DEFAULT/50 bg-danger-DEFAULT/10 p-4">
            <p className="text-sm text-text-primary">Send an SOS alert to your trusted contacts?</p>
            <div className="mt-3 flex gap-2">
              <Button variant="danger" onClick={confirmSos} className="flex-1">
                Confirm SOS
              </Button>
              <Button variant="secondary" onClick={() => setSosStage('idle')} className="flex-1">
                Cancel
              </Button>
            </div>
          </div>
        )}
        {sosStage === 'sent' && (
          <div className="col-span-2 rounded-xl border border-danger-DEFAULT/50 bg-danger-DEFAULT/10 p-4 text-center text-sm text-text-primary">
            SOS alert sent to your trusted contacts (prototype).
          </div>
        )}
      </div>

      {shareStatus && <p className="mt-2 text-center text-xs text-text-secondary">{shareStatus}</p>}

      {arrived && (
        <Button
          className="mt-6 w-full"
          onClick={() => navigate('/completion', { state: { ride, driver, pickup, destination } })}
        >
          Trip complete
        </Button>
      )}
    </div>
  )
}

export default LiveRidePage
