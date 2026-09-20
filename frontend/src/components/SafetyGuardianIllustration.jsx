/**
 * Illustrated banner for the Safety tab: a simple flat-vector figure
 * inside a glowing protective ring, giving Women's Safety Mode a real
 * visual identity — matching the illustrated-banner pattern already used
 * on the Dashboard (RideBuddyBanner) and Landing (NightCityScene), rather
 * than a plain icon.
 */
function SafetyGuardianIllustration() {
  return (
    <div className="relative h-40 overflow-hidden rounded-2xl border border-border-default bg-bg-card-alt">
      <svg viewBox="0 0 400 160" className="h-full w-full" role="img" aria-label="Illustration of a protected rider inside a safety shield">
        <defs>
          <radialGradient id="guardianGlow" cx="50%" cy="55%" r="55%">
            <stop offset="0%" stopColor="#d9822b" stopOpacity="0.35" />
            <stop offset="100%" stopColor="#d9822b" stopOpacity="0" />
          </radialGradient>
          <linearGradient id="guardianCoat" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#f0a94e" />
            <stop offset="100%" stopColor="#b3661a" />
          </linearGradient>
        </defs>

        <circle cx="200" cy="90" r="70" fill="url(#guardianGlow)" />

        {/* protective shield ring, drawn behind the figure */}
        <path
          d="M200 26 C 232 40, 258 44, 258 44 C 258 92, 234 122, 200 138 C 166 122, 142 92, 142 44 C 142 44, 168 40, 200 26 Z"
          fill="none"
          stroke="#d9822b"
          strokeWidth="2"
          strokeOpacity="0.55"
        />

        {/* small orbiting accent dots — success (verified) and info (shared location) */}
        <circle cx="122" cy="60" r="4" fill="#4ade80" />
        <circle cx="280" cy="108" r="4" fill="#60a5fa" />

        {/* figure: simple, flat, non-literal silhouette */}
        <g transform="translate(200,98)">
          {/* hair */}
          <path d="M-20 -46 C -22 -60, 22 -60, 20 -46 C 22 -34, 14 -26, 0 -26 C -14 -26, -22 -34, -20 -46 Z" fill="#2e2924" />
          {/* head */}
          <circle cx="0" cy="-44" r="15" fill="#f4ede3" />
          {/* coat / body */}
          <path d="M-30 40 C -30 0, -20 -18, 0 -18 C 20 -18, 30 0, 30 40 Z" fill="url(#guardianCoat)" />
          {/* phone held at chest, representing the safety app */}
          <rect x="-7" y="-2" width="14" height="20" rx="2.5" fill="#141311" stroke="#f4ede3" strokeWidth="1" />
        </g>
      </svg>
    </div>
  )
}

export default SafetyGuardianIllustration
