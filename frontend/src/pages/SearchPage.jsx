import { useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { Sparkles, IndianRupee, Zap, ShieldCheck } from 'lucide-react'
import Button from '../components/Button.jsx'
import TextField from '../components/TextField.jsx'
import { PRIORITIES } from '../data/priorities.js'
import { searchRides } from '../services/rideService.js'

const ICONS = { Sparkles, IndianRupee, Zap, ShieldCheck }

/**
 * Ride Search (docs/REQUIREMENTS.md -> Ride Search): pickup, destination,
 * and priority selection (Cheapest / Fastest / Safest / AI Recommended).
 * Editable here directly — not just a hand-off from the Dashboard —
 * since Search is also its own tab in the persistent nav and needs to
 * work as a standalone entry point, not a dead end.
 */
function SearchPage() {
  const location = useLocation()
  const navigate = useNavigate()

  const [pickup, setPickup] = useState(location.state?.pickup || '')
  const [destination, setDestination] = useState(location.state?.destination || '')
  const [priority, setPriority] = useState('ai')
  const [loading, setLoading] = useState(false)

  const canSearch = pickup.trim() !== '' && destination.trim() !== ''

  async function handleSearch() {
    if (!canSearch) return
    setLoading(true)
    const results = await searchRides({ pickup, destination, priority })
    navigate('/results', { state: { ...results, priority } })
  }

  return (
    <div className="mx-auto max-w-lg px-6 py-10">
      <h1 className="font-display text-2xl font-semibold text-text-primary">Find a ride</h1>
      <p className="mt-1 text-sm text-text-secondary">Set your route and priority.</p>

      <div className="mt-6 flex flex-col gap-4">
        <TextField
          id="search-pickup"
          label="Pickup location"
          type="text"
          placeholder="e.g. MG Road"
          value={pickup}
          onChange={(e) => setPickup(e.target.value)}
        />
        <TextField
          id="search-destination"
          label="Destination"
          type="text"
          placeholder="e.g. Central Station"
          value={destination}
          onChange={(e) => setDestination(e.target.value)}
        />
      </div>

      <p className="mt-6 text-xs font-medium text-text-secondary">Priority</p>
      <div className="mt-2 grid grid-cols-2 gap-3">
        {PRIORITIES.map((option) => {
          const Icon = ICONS[option.icon]
          const isSelected = priority === option.id
          return (
            <button
              key={option.id}
              type="button"
              onClick={() => setPriority(option.id)}
              className={`flex flex-col items-start gap-2 rounded-xl border p-4 text-left transition-all ${
                isSelected
                  ? 'border-accent-amber bg-bg-card-alt'
                  : 'border-border-default bg-bg-card hover:border-text-secondary'
              }`}
            >
              <Icon
                size={20}
                strokeWidth={2}
                className={isSelected ? 'text-accent-amber-light' : 'text-text-secondary'}
              />
              <span className={`text-sm font-medium ${isSelected ? 'text-text-primary' : 'text-text-secondary'}`}>
                {option.label}
              </span>
            </button>
          )
        })}
      </div>

      <Button className="mt-6 w-full" onClick={handleSearch} disabled={loading || !canSearch}>
        {loading ? 'Finding rides…' : 'Search Rides'}
      </Button>
    </div>
  )
}

export default SearchPage
