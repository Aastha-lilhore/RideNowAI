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
All REQUIREMENTS.md screens are now built with real logic: Landing, Auth,
Home Dashboard, Ride Search, AI Results, Ride Details, Live Ride (+ Route
Anomaly alert state), Safety (Women's Safety Mode), Activity (ride
history), and Insights (spending/distance/safety/eco stats). Everything
runs on mocked services shaped exactly like API_CONTRACT.md so a real
backend can be wired in without touching the pages themselves.

## Next Step
Nothing left in REQUIREMENTS.md's functional list is unbuilt. Candidates
for what comes next: docs/DESIGN_REFERENCE.md's Phase 7 (a final visual
consistency pass across all 10 pages), or backend/API wiring once the
backend teammate's endpoints exist, or something else — ask before
picking one.
## Next Step
Build Route Anomaly (normal monitoring + alert state) and Women's Safety
Mode (the real Safety tab) per REQUIREMENTS.md.
