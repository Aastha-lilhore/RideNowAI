# RideNow AI — Design Reference (from shared mockups)

Captured from the reference screens you shared (AI Ride Results, Ride Insights & Analytics, Live Tracking + Route Anomaly + Women's Safety Mode + SOS). This is the visual language Phase 7 will apply — saved now so it isn't lost before then.

## Platform note
This is a **responsive website**, not a native app — it needs to work in a normal mobile browser (Chrome/Safari on a phone) as well as desktop. That means:
- Mobile-first Tailwind breakpoints (`sm:`, `md:`, `lg:`), not a fixed phone-frame layout.
- A real `<meta name="viewport" content="width=device-width, initial-scale=1">` tag.
- Tap targets ≥ 40px tall on mobile (buttons, list rows).
- The reference SVGs show a phone-shell frame for illustration only — don't build an actual phone-frame wrapper in the real site.

## Color palette (dark theme)
| Role | Color | Used for |
|---|---|---|
| Page background | `#0b1329` | App background |
| Card / phone shell | `#0f172a` / `#1e293b` | Cards, list rows |
| Border | `#334155` | Card borders, dividers |
| Primary accent (teal) | `#0d9488` / `#2dd4bf` / `#14b8a6` | AI badges, confirm buttons, top recommendation border |
| Success / eco (green) | `#4ade80` / `#34d399` / `#059669` | Safety score, eco score, sustainability panel |
| Info (blue) | `#38bdf8` | Secondary metrics (e.g. alternate ride safety) |
| Warning (amber) | `#f59e0b` | Lower-tier safety/eco values |
| Danger (red) | `#ef4444` / `#dc2626` / `#991b1b` | Route anomaly alert, SOS button |
| Text primary | `#ffffff` / `#f8fafc` | Headings, key values |
| Text secondary | `#94a3b8` | Labels, metadata |

## Recurring UI patterns
- **AI-recommended card**: distinguished with a colored (teal) border + a small "AI TOP RECOMMENDATION" badge + a numeric score (e.g. "Score: 92/100") — matches the "single clear entry point, no duplicate styling" rule already in the ground rules.
- **Explainability box**: a distinct inset panel with italic reasoning text below the metrics ("14% cheaper... arrives 7 min sooner...") — this is the `reason` string from `recommendationService`, rendered as its own visual block, not just inline text.
- **Metric chips**: small pill/rounded-rect groups (Safety, Eco, ETA) with tinted backgrounds matching their semantic color (green for safety/eco, blue for neutral info).
- **Alert banner**: full-width rounded card, red-tinted background, bold heading line + supporting detail line — used for the Route Anomaly state.
- **Status badges**: small pill showing state (e.g. "Women's Safety Mode Active", "RIDE IN PROGRESS") with a colored dot indicator.
- **Bottom action bar**: persistent bottom navigation (Search / Activity / Safety / Insights) — confirms the app should have a fixed bottom nav on mobile.
- **Metric tiles** (Insights page): 2-column grid of stat tiles (value + label + small trend note), plus a full-width highlighted panel for the eco/sustainability stat with a progress bar.
- **Trip history rows**: route (A → B), distance/duration line, safety + CO2 saved line, fare on the right — consistent 3-line row pattern reused for each trip.

## What this changes vs. the current build order
Nothing structural — Phases 0–6 (logic, data, pages, safety features, backend wiring) proceed exactly as planned. This file is what Phase 7 (visual pass) will implement across all 10 pages once confirmed as final.
