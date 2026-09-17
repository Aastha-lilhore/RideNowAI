/**
 * Dashboard header banner: a compact version of the landing page's
 * night-city visual language (same skyline/road/amber-glow motif, so the
 * app feels like one product), plus "RideBuddy" — a small illustrated car
 * character that patrols back and forth along the road. It's the one
 * character in the app: a friendly stand-in for "your AI ride assistant
 * is watching the road," not decoration for its own sake.
 */
const BUILDINGS = [
  { x: 0, width: 46, height: 40 },
  { x: 50, width: 34, height: 60 },
  { x: 90, width: 52, height: 32 },
  { x: 150, width: 40, height: 56 },
  { x: 590, width: 44, height: 46 },
  { x: 640, width: 36, height: 62 },
  { x: 680, width: 56, height: 34 },
  { x: 742, width: 38, height: 52 },
]

function RideBuddyBanner({ greeting, subtitle }) {
  return (
    <div className="relative isolate mb-6 overflow-hidden rounded-2xl border border-border-default bg-bg-card">
      <svg
        viewBox="0 0 800 140"
        preserveAspectRatio="xMidYMax slice"
        className="absolute inset-0 h-full w-full"
        aria-hidden="true"
      >
        <defs>
          <linearGradient id="dashSky" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#141311" />
            <stop offset="100%" stopColor="#241a10" />
          </linearGradient>
        </defs>
        <rect x="0" y="0" width="800" height="140" fill="url(#dashSky)" />

        {BUILDINGS.map((b) => (
          <rect key={b.x} x={b.x} y={140 - 8 - b.height} width={b.width} height={b.height} fill="#0f0d0b" />
        ))}

        {/* road */}
        <rect x="0" y="118" width="800" height="22" fill="#0a0a0b" />
        <g stroke="#3a332a" strokeWidth="2" strokeDasharray="14 10">
          <line x1="0" y1="129" x2="800" y2="129" />
        </g>
      </svg>

      {/* RideBuddy: patrols left-right across the road on a loop */}
      <div className="ridebuddy-patrol absolute" style={{ bottom: '10px' }}>
        <svg width="46" height="26" viewBox="0 0 46 26" aria-hidden="true">
          <rect x="4" y="10" width="38" height="10" rx="4" fill="#d9822b" />
          <path d="M12 10 L17 3 H31 L36 10 Z" fill="#f0a94e" />
          <rect x="18" y="4.5" width="10" height="6" rx="1.5" fill="#0a0a0b" opacity="0.5" />
          <circle cx="13" cy="21" r="4" fill="#141311" stroke="#3a332a" strokeWidth="1.5" />
          <circle cx="33" cy="21" r="4" fill="#141311" stroke="#3a332a" strokeWidth="1.5" />
          {/* headlight "eyes" glow */}
          <circle cx="41" cy="13" r="2.4" fill="#ffe3b8" className="twinkle" />
        </svg>
      </div>

      <div className="relative bg-gradient-to-t from-bg-card via-bg-card/70 to-transparent px-6 pb-5 pt-14">
        <h1 className="font-display text-2xl font-semibold text-text-primary">{greeting}</h1>
        <p className="mt-1 text-sm text-text-secondary">{subtitle}</p>
      </div>
    </div>
  )
}

export default RideBuddyBanner
