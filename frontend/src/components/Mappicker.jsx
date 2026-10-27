
import { useEffect, useState } from 'react'
import {
  MapContainer,
  TileLayer,
  CircleMarker,
  Polyline,
  Popup,
  useMapEvents,
  useMap,
} from 'react-leaflet'
import 'leaflet/dist/leaflet.css'

const DEFAULT_CENTER = [22.7196, 75.8577] // Indore

function ClickHandler({ onSelect }) {
  useMapEvents({
    click(event) {
      onSelect([event.latlng.lat, event.latlng.lng])
    },
  })
  return null
}

function FitRoute({ pickup, destination, route }) {
  const map = useMap()

  useEffect(() => {
    if (route.length > 0) {
      map.fitBounds(route, { padding: [35, 35] })
    } else if (pickup && destination) {
      map.fitBounds([pickup, destination], { padding: [35, 35] })
    }
  }, [map, pickup, destination, route])

  return null
}

async function getAddress([lat, lon]) {
  try {
    const response = await fetch(
      `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${lat}&lon=${lon}`
    )
    if (!response.ok) throw new Error('Address unavailable')
    const data = await response.json()
    return data.display_name || `${lat.toFixed(5)}, ${lon.toFixed(5)}`
  } catch {
    return `${lat.toFixed(5)}, ${lon.toFixed(5)}`
  }
}

export default function MapPicker({
  onPickupChange,
  onDestinationChange,
}) {
  const [pickupPoint, setPickupPoint] = useState(null)
  const [destinationPoint, setDestinationPoint] = useState(null)
  const [route, setRoute] = useState([])
  const [distance, setDistance] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  async function selectLocation(point) {
    setError('')
    setRoute([])
    setDistance(null)

    // First click selects pickup; second selects destination.
    // The next click starts a new route.
    if (!pickupPoint || destinationPoint) {
      setPickupPoint(point)
      setDestinationPoint(null)
      onDestinationChange('')
      onPickupChange('Loading address...')

      const address = await getAddress(point)
      setPickupPoint(current =>
        current === point ? point : current
      )
      onPickupChange(address)
    } else {
      setDestinationPoint(point)
      onDestinationChange('Loading address...')

      const address = await getAddress(point)
      onDestinationChange(address)
    }
  }

  useEffect(() => {
    if (!pickupPoint || !destinationPoint) return

    const controller = new AbortController()

    async function loadRoute() {
      setLoading(true)
      setError('')

      try {
        const url =
          `https://router.project-osrm.org/route/v1/driving/` +
          `${pickupPoint[1]},${pickupPoint[0]};` +
          `${destinationPoint[1]},${destinationPoint[0]}` +
          '?overview=full&geometries=geojson'

        const response = await fetch(url, {
          signal: controller.signal,
        })
        if (!response.ok) throw new Error('Route request failed')

        const data = await response.json()
        if (data.code !== 'Ok' || !data.routes?.length) {
          throw new Error('No route found')
        }

        const result = data.routes[0]
        setRoute(
          result.geometry.coordinates.map(([lon, lat]) => [lat, lon])
        )
        setDistance((result.distance / 1000).toFixed(1))
      } catch (err) {
        if (err.name !== 'AbortError') {
          setError('Road route unavailable. Please try selecting nearby points.')
        }
      } finally {
        if (!controller.signal.aborted) setLoading(false)
      }
    }

    loadRoute()
    return () => controller.abort()
  }, [pickupPoint, destinationPoint])

  function resetMap() {
    setPickupPoint(null)
    setDestinationPoint(null)
    setRoute([])
    setDistance(null)
    setError('')
    onPickupChange('')
    onDestinationChange('')
  }

  return (
    <section className="mt-6">
      <div className="mb-3 flex items-center justify-between gap-3">
        <div>
          <h2 className="text-sm font-semibold text-text-primary">
            Choose locations on map
          </h2>
          <p className="mt-1 text-xs text-text-secondary">
            Click once for pickup, then again for destination.
          </p>
        </div>

        <button
          type="button"
          onClick={resetMap}
          className="text-xs font-medium text-text-secondary underline"
        >
          Reset map
        </button>
      </div>

      <div className="overflow-hidden rounded-xl border border-border-default">
        <MapContainer
          center={DEFAULT_CENTER}
          zoom={13}
          scrollWheelZoom
          style={{ height: '350px', width: '100%' }}
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />

          <ClickHandler onSelect={selectLocation} />

          {pickupPoint && (
            <CircleMarker
              center={pickupPoint}
              radius={8}
              pathOptions={{
                color: '#15803d',
                fillColor: '#22c55e',
                fillOpacity: 1,
              }}
            >
              <Popup>Pickup location</Popup>
            </CircleMarker>
          )}

          {destinationPoint && (
            <CircleMarker
              center={destinationPoint}
              radius={8}
              pathOptions={{
                color: '#b91c1c',
                fillColor: '#ef4444',
                fillOpacity: 1,
              }}
            >
              <Popup>Destination</Popup>
            </CircleMarker>
          )}

          {route.length > 0 && (
            <Polyline
              positions={route}
              pathOptions={{ color: '#2563eb', weight: 5 }}
            />
          )}

          <FitRoute
            pickup={pickupPoint}
            destination={destinationPoint}
            route={route}
          />
        </MapContainer>
      </div>

      {loading && (
        <p className="mt-3 text-xs text-text-secondary">
          Calculating road route...
        </p>
      )}

      {distance !== null && (
        <p className="mt-3 text-sm font-medium text-text-primary">
          Road distance: {distance} km
        </p>
      )}

      {error && (
        <p role="alert" className="mt-3 text-xs text-danger-DEFAULT">
          {error}
        </p>
      )}
    </section>
  )
}
