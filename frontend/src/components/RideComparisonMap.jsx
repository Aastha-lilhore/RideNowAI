import { useState } from 'react'

/**
 * Ride-comparison visualization, Midnight Amber palette. The recommended
 * route uses a single-hue amber depth gradient (light -> dark copper) for
 * dimensionality without turning into a multi-color "AI gradient" cliché.
 * Selection is real: clicking a route updates the Ride Score panel.
 */
const ROUTES = [
  { id: 'r1', d: 'M64 320 C 120 300, 150 220, 210 200 S 320 140, 380 70', fare: 184, time: 18, score: 92, recommended: true },
  { id: 'r2', d: 'M64 320 C 140 330, 200 260, 240 230 S 340 180, 380 70', fare: 156, time: 24, score: 78, recommended: false },
  { id: 'r3', d: 'M64 320 C 100 260, 260 260, 280 190 S 350 110, 380 70', fare: 210, time: 15, score: 84, recommended: false },
]

function RideComparisonMap() {
  const [selectedId, setSelectedId] = useState('r1')
  const selected = ROUTES.find((r) => r.id === selectedId)

  return (
    <div className="w-full max-w-md rounded-2xl border border-border-default bg-bg-card p-5">
      <svg
        viewBox="0 0 440 380"
        className="h-auto w-full"
        role="img"
        aria-label="Map comparing ride routes by fare, time and safety score"
      >
        <defs>
          <linearGradient id="routeGradient" x1="64" y1="320" x2="380" y2="70" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#f0a94e" />
            <stop offset="100%" stopColor="#b3661a" />
          </linearGradient>
        </defs>

        {/* subtle street grid, not a literal map */}
        <g stroke="#221f1b" strokeWidth="1">
          <path d="M0 90 H440" />
          <path d="M0 190 H440" />
          <path d="M0 290 H440" />
          <path d="M110 0 V380" />
          <path d="M220 0 V380" />
          <path d="M330 0 V380" />
        </g>

        {/* alternative, unselected routes */}
        {ROUTES.filter((r) => r.id !== selectedId).map((route) => (
          <path
            key={route.id}
            d={route.d}
            fill="none"
            stroke="#4a443c"
            strokeWidth="2"
            strokeLinecap="round"
            className="cursor-pointer transition-colors hover:stroke-text-secondary"
            onClick={() => setSelectedId(route.id)}
          />
        ))}

        {/* selected / recommended route, drawn last so it sits on top */}
        <path
          d={selected.d}
          fill="none"
          stroke="url(#routeGradient)"
          strokeWidth="3.5"
          strokeLinecap="round"
          className="cursor-pointer drop-shadow-[0_0_7px_rgba(217,130,43,0.5)]"
          onClick={() => setSelectedId(selected.id)}
        />

        {/* pickup marker */}
        <circle cx="64" cy="320" r="6" fill="#0a0a0b" stroke="#a39a8f" strokeWidth="2" />
        {/* destination marker */}
        <circle cx="380" cy="70" r="6" fill="#f0a94e" />
        <circle cx="380" cy="70" r="11" fill="#d9822b" opacity="0.2" />
      </svg>

      <div className="mt-1 flex items-center justify-between border-t border-border-default pt-4">
        <div>
          <p className="text-xs text-text-secondary">
            {selected.recommended ? 'Recommended route' : 'Selected route'}
          </p>
          <p className="mt-1 font-display text-2xl font-semibold">
            <span className="text-accent-amber-light">{selected.score}</span>
            <span className="text-sm font-normal text-text-secondary"> Ride Score</span>
          </p>
        </div>
        <div className="text-right text-sm text-text-secondary">
          <p className="text-text-primary">₹{selected.fare}</p>
          <p>{selected.time} min</p>
        </div>
      </div>
    </div>
  )
}

export default RideComparisonMap
