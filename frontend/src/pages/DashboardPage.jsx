import { useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { MapPin, Navigation } from 'lucide-react'
import TextField from '../components/TextField.jsx'
import Button from '../components/Button.jsx'
import RideBuddyBanner from '../components/RideBuddyBanner.jsx'
import { QUICK_ACTIONS } from '../data/quickActions.js'

/**
 * Home Dashboard (docs/REQUIREMENTS.md -> Dashboard): greeting, pickup +
 * destination, quick actions, and the AI recommendation entry point.
 * This is an entry point into the canonical Ride Search screen, not a
 * second search feature (docs/DECISIONS.md #007) — submitting here just
 * carries pickup/destination forward to /search.
 */
function DashboardPage() {
  const location = useLocation()
  const name = location.state?.name
  const navigate = useNavigate()

  const [pickup, setPickup] = useState('')
  const [destination, setDestination] = useState('')

  const canSearch = pickup.trim() !== '' && destination.trim() !== ''

  function handleFindRide(e) {
    e.preventDefault()
    if (!canSearch) return
    navigate('/search', { state: { pickup, destination } })
  }

  return (
    <div className="mx-auto max-w-lg px-6 py-8">
      <RideBuddyBanner
        greeting={name ? `Good to see you, ${name}` : 'Where to today?'}
        subtitle="Enter your pickup and destination to get an AI-ranked set of rides."
      />

      <form
        onSubmit={handleFindRide}
        className="animate-fade-in-up flex flex-col gap-4 rounded-2xl border border-border-default bg-bg-card p-6"
        style={{ animationDelay: '80ms' }}
      >
        <TextField
          id="pickup"
          label="Pickup location"
          type="text"
          icon={MapPin}
          placeholder="e.g. MG Road"
          value={pickup}
          onChange={(e) => setPickup(e.target.value)}
        />
        <TextField
          id="destination"
          label="Destination"
          type="text"
          icon={Navigation}
          placeholder="e.g. Central Station"
          value={destination}
          onChange={(e) => setDestination(e.target.value)}
        />

        <div className="flex flex-wrap gap-2">
          {QUICK_ACTIONS.map((action) => (
            <button
              key={action.label}
              type="button"
              onClick={() => setDestination(action.destination)}
              className="rounded-full border border-border-default px-3.5 py-1.5 text-xs text-text-secondary transition-all hover:-translate-y-0.5 hover:border-accent-amber/60 hover:text-text-primary"
            >
              {action.label}
            </button>
          ))}
        </div>

        <Button type="submit" className="mt-2 w-full" disabled={!canSearch}>
          Find a Ride
        </Button>
      </form>
    </div>
  )
}

export default DashboardPage
