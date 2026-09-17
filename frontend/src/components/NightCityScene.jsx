/**
 * Original illustrated night-city scene for the hero background. Chose an
 * illustration over a hotlinked stock photo deliberately: no copyright
 * ambiguity, no broken-link risk, and it can carry the exact Midnight
 * Amber mood (warm moon glow, amber-lit windows, a passing headlight)
 * instead of a generic stock photo that happens to be dark and moody.
 */
const BUILDINGS = [
  { x: 0, width: 90, height: 130 },
  { x: 85, width: 60, height: 190 },
  { x: 140, width: 100, height: 110 },
  { x: 235, width: 70, height: 220 },
  { x: 300, width: 110, height: 150 },
  { x: 405, width: 55, height: 260 },
  { x: 455, width: 95, height: 120 },
  { x: 545, width: 75, height: 200 },
  { x: 615, width: 120, height: 160 },
  { x: 730, width: 60, height: 240 },
  { x: 785, width: 100, height: 130 },
  { x: 880, width: 80, height: 190 },
  { x: 955, width: 130, height: 150 },
  { x: 1080, width: 65, height: 220 },
  { x: 1140, width: 60, height: 140 },
]

const STARS = [
  { cx: 90, cy: 40, r: 1.4, delay: '0s' },
  { cx: 220, cy: 70, r: 1, delay: '0.6s' },
  { cx: 340, cy: 35, r: 1.6, delay: '1.2s' },
  { cx: 470, cy: 60, r: 1, delay: '0.3s' },
  { cx: 600, cy: 30, r: 1.3, delay: '1.6s' },
  { cx: 760, cy: 55, r: 1, delay: '0.9s' },
  { cx: 900, cy: 40, r: 1.5, delay: '0.2s' },
  { cx: 1020, cy: 65, r: 1, delay: '1.4s' },
  { cx: 1140, cy: 35, r: 1.3, delay: '0.5s' },
]

const SCENE_HEIGHT = 300
const BASELINE = SCENE_HEIGHT - 6

function windowsFor(building, index) {
  const cols = Math.max(2, Math.floor(building.width / 22))
  const rows = Math.max(2, Math.floor(building.height / 26))
  const windows = []
  for (let r = 0; r < rows; r += 1) {
    for (let c = 0; c < cols; c += 1) {
      // deterministic pseudo-randomness so lit/unlit windows look organic
      // but the render is stable across re-renders
      const seed = (index * 31 + r * 7 + c * 13) % 5
      if (seed === 0) continue // some windows dark
      windows.push({
        key: `${index}-${r}-${c}`,
        x: building.x + 8 + c * 20,
        y: BASELINE - building.height + 14 + r * 24,
        flicker: seed === 1,
        delay: `${((index + r + c) % 6) * 0.7}s`,
      })
    }
  }
  return windows
}

function NightCityScene() {
  return (
    <div className="scene-zoom pointer-events-none absolute inset-0 -z-10 overflow-hidden">
      <svg
        viewBox={`0 0 1200 ${SCENE_HEIGHT}`}
        preserveAspectRatio="xMidYMax slice"
        className="h-full w-full"
        aria-hidden="true"
      >
        <defs>
          <linearGradient id="sky" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#0a0a0b" />
            <stop offset="55%" stopColor="#181109" />
            <stop offset="100%" stopColor="#2b1a0c" />
          </linearGradient>
          <radialGradient id="moonGlow" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#f0a94e" stopOpacity="0.55" />
            <stop offset="100%" stopColor="#f0a94e" stopOpacity="0" />
          </radialGradient>
          <linearGradient id="headlight" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor="#f0a94e" stopOpacity="0" />
            <stop offset="100%" stopColor="#ffcf8a" stopOpacity="0.9" />
          </linearGradient>
        </defs>

        <rect x="0" y="0" width="1200" height={SCENE_HEIGHT} fill="url(#sky)" />

        {STARS.map((star) => (
          <circle
            key={`${star.cx}-${star.cy}`}
            cx={star.cx}
            cy={star.cy}
            r={star.r}
            fill="#f4ede3"
            className="twinkle"
            style={{ animationDelay: star.delay }}
          />
        ))}

        <circle cx="1010" cy="55" r="70" fill="url(#moonGlow)" />
        <circle cx="1010" cy="55" r="22" fill="#f7c988" opacity="0.9" />

        {BUILDINGS.map((b, i) => (
          <g key={b.x}>
            <rect
              x={b.x}
              y={BASELINE - b.height}
              width={b.width}
              height={b.height}
              fill="#141311"
            />
            {windowsFor(b, i).map((w) => (
              <rect
                key={w.key}
                x={w.x}
                y={w.y}
                width="6"
                height="9"
                rx="1"
                fill="#f0a94e"
                opacity={w.flicker ? undefined : 0.55}
                className={w.flicker ? 'twinkle' : undefined}
                style={w.flicker ? { animationDelay: w.delay } : undefined}
              />
            ))}
          </g>
        ))}

        <rect x="0" y={BASELINE} width="1200" height={SCENE_HEIGHT - BASELINE} fill="#0a0a0b" />

        {/* passing headlight trail along the road */}
        <g className="headlight-pass">
          <rect x="-260" y={BASELINE - 2} width="260" height="3" fill="url(#headlight)" />
        </g>
      </svg>

      {/* legibility scrim so hero text stays readable over the scene */}
      <div
        className="absolute inset-0"
        style={{
          background:
            'linear-gradient(to right, var(--color-bg-page) 38%, rgba(10,10,11,0.55) 68%, transparent 100%)',
        }}
      />
      <div
        className="absolute inset-0"
        style={{
          background: 'linear-gradient(to bottom, transparent 55%, var(--color-bg-page) 100%)',
        }}
      />
    </div>
  )
}

export default NightCityScene
