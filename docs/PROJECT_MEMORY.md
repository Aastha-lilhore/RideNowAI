# RideNow AI — Project Memory

## Project
RideNow AI — Intelligent and Safety-Aware Ride Recommendation System

## User's Responsibility
Frontend only.

## Collaboration
This is a group project. The project already has a GitHub repository. Frontend changes must remain organized so teammates can continue backend, database and AI/ML work.

## Core Product
RideNow AI combines cost, time, safety and sustainability to help users make better ride decisions and monitor trips.

## MVP
1. AI Ride Recommendation
2. AI Fare Prediction
3. AI Safety Score
4. Route Anomaly Detection
5. Women's Safety Mode

## Additional Modules
- Authentication
- Home Dashboard
- Ride Search and Booking
- Smart Pickup
- Smart Routes
- Live Ride Tracking
- Trusted Contacts and Safety Alerts
- Eco Score
- Ride History
- Ride Insights

## Frontend Stack
- React.js
- Tailwind CSS
- Leaflet + OpenStreetMap
- Recharts
- REST API integration
- WebSocket-ready architecture
- Git/GitHub

## Non-Negotiable UI Rules
- Modern and polished
- Real/content-appropriate imagery
- Not generic
- Not vibe-coded
- Not unnecessarily hardcoded
- Fully interactive
- Responsive on mobile and laptop/desktop
- Clear visual hierarchy
- One canonical place per feature
- Distinctive modern navigation
- Functional loading/error/empty/success states
- Concise, maintainable code

## Development Rules
- Work one step at a time.
- Inspect repository before changing code.
- Avoid giant code blocks.
- Reuse existing working code.
- Keep mock/demo data isolated from API services.
- Update progress and memory documentation after every meaningful step.
- Keep changes teammate-friendly.

## Product Journey
Landing → Auth → Dashboard → Search → AI Results → Ride Details → Booking → Live Tracking → Safety/Anomaly → Completion → Insights

## Important Ride Statuses
REQUESTED
SEARCHING
DRIVER_ASSIGNED
DRIVER_ARRIVING
STARTED
COMPLETED
CANCELLED

## AI UX Principle
AI recommendations should be explainable, not merely labeled "AI".

## Current Phase
All REQUIREMENTS.md screens are built, reported bugs fixed, and a first
visual-consistency pass applied per DESIGN_REFERENCE.md's structural
patterns (colors kept as Midnight Amber, which postdates that doc): the
AI-recommended card gets an amber border + "AI TOP PICK" badge on AI
Results, safety/eco are tinted metric-chip pills, Live Ride/Safety show
colored-dot status badges, and Insights' safety tile has a real trend
note. A vehicle-type color system, a Safety illustration, and Insights'
vehicle breakdown + highlight cards were added after that. Backend-wiring
infrastructure is now in place: services/apiClient.js (axios + env-based
mock/real switch), frontend/.env.example, and register/login/searchRides
are already wired to real endpoints behind VITE_USE_MOCKS=false. See
docs/BACKEND_INTEGRATION.md for exactly what's wired vs. what still needs
a small restructure (driver assignment, anomaly polling, live tracking,
ride history — no endpoint for that last one yet).

An account area now exists: context/AuthContext.jsx holds the current
user (persisted to localStorage; replaces the old one-off route-state
passing), pages/ProfilePage.jsx shows/edits the profile and has the
app's only Log out button, and a profile avatar in AppShell (top bar on
desktop, a new minimal top strip on mobile) is the one entry point to
it. Profile edits are local-only until a user-update endpoint exists in
API_CONTRACT.md.

Authenticated screens now sit behind routes/RequireAuth.jsx (signed-out
visitors are sent to login, then back to where they were headed) and
unknown URLs show pages/NotFoundPage.jsx. The guard is UX only — the
backend must enforce access on every API call.

Authenticated screens are lazy-loaded (routes/AppRoutes.jsx), which cut
the entry bundle from ~920KB to ~340KB; Recharts (Insights) and Leaflet
(Live Ride) now only download when those screens open.

## Next Step
Not yet decided — candidates are working through BACKEND_INTEGRATION.md's
remaining items once the backend is up, or further visual polish. Ask
before picking one.
