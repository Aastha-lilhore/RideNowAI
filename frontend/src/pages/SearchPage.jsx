import { useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { Sparkles, IndianRupee, Zap, ShieldCheck } from 'lucide-react'
import Button from '../components/Button.jsx'
import { PRIORITIES } from '../data/priorities.js'
import { searchRides } from '../services/rideService.js'

const ICONS = { Sparkles, IndianRupee, Zap, ShieldCheck }

/**
 * Ride Search (docs/REQUIREMENTS.md -> Ride Search): pickup, destination,
 * and priority selection (Cheapest / Fastest / Safest / AI Recommended).
 * Searching calls the real scoring service (see rideService.js, which
 * implements docs/AI_FORMULAS.md) and hands the ranked results to the
 * AI Results screen.
 */
function SearchPage() {
  const location = useLocation()
  const { pickup, destination } = location.state || {}
  const navigate = useNavigate()

  const [priority, setPriority] = useState('ai')
  const [loading, setLoading] = useState(false)

  async function handleSearch() {
    setLoading(true)
    const results = await searchRides({ pickup, destination, priority })
    navigate('/results', { state: { ...results, priority } })
  }

  if (!pickup || !destination) {
    return (
      <main className="mx-auto flex max-w-lg flex-col items-center gap-3 px-6 py-16 text-center">
        <h1 className="font-display text-2xl font-semibold text-text-primary">Ride Search</h1>
        <p className="text-sm text-text-secondary">
          Enter a pickup and destination on the Dashboard to search.
        </p>
        <Button to="/dashboard" className="mt-2">
          Back to Dashboard
        </Button>
      </main>
    )
  }

  return (
    <div className="mx-auto max-w-lg px-6 py-10">
      <h1 className="font-display text-2xl font-semibold text-text-primary">Choose your priority</h1>
      <p className="mt-1 text-sm text-text-secondary">
        <span className="text-text-primary">{pickup}</span> →{' '}
        <span className="text-text-primary">{destination}</span>
      </p>

      <div className="mt-6 grid grid-cols-2 gap-3">
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

      <Button className="mt-6 w-full" onClick={handleSearch} disabled={loading}>
        {loading ? 'Finding rides…' : 'Search Rides'}
      </Button>
    </div>
  )
}

export default SearchPage
