# Backend Integration Guide

How to switch the frontend from mocks to the real backend, and what's
left to do for each service. See docs/API_CONTRACT.md for exact request/
response shapes — this file tracks wiring status, not the contract itself.

## Turning on the real backend

1. `cd frontend`, copy `.env.example` to `.env`.
2. Set `VITE_API_BASE_URL` to wherever the backend runs.
3. Set `VITE_USE_MOCKS=false`.
4. Restart `npm run dev`.

With no `.env` file, the app defaults to mocks — nothing breaks for
teammates who don't have the backend running yet.

## Error handling

`apiClient.js` normalizes every real-backend failure (4xx/5xx, network
errors) to the same `{ error: '...' }` shape the mocks already reject
with, so existing `catch` blocks on every page work unchanged either way.

## Empty states

Activity, Safety, and Insights now handle zero ride history explicitly
(a real new user will have none) instead of showing `NaN` or broken
charts — see the `trips.length === 0` branches in those pages.

## Already wired (just flip the env var above)

- `authService.register()` → `POST /api/auth/register`
- `authService.login()` → `POST /api/auth/login`
- `rideService.searchRides()` → `POST /api/rides/search`
- `rideService.bookRide()` → `POST /api/rides/book` (Confirm Ride on Ride
  Details; the driver it returns is what Live Ride shows and tracks)

The first three needed no call-site changes. `bookRide` did: Ride Details'
Confirm button is now async (shows "Booking your ride…", disables itself,
and shows the backend's error with a retry if booking fails).

## What the frontend assumes the backend returns (please confirm)

API_CONTRACT.md is loose on these response bodies, so the frontend was
written against the shapes below. If the backend differs, change this
section and the one service function — nothing else.

- `POST /api/rides/search` — `{ rides: [...], distanceKm, pickup, destination }`.
  Each ride: `id`, `vehicleLabel` (e.g. "Sedan"), `capacity`, `driverRating`,
  `fare`, `etaMin`, `distanceKm`, `safetyScore`, `safetyLabel`, `ecoScore`,
  `recommendationScore`, `reason`. `vehicleLabel` drives the vehicle color;
  an unknown/missing one just shows a neutral dot (it won't crash).
- `POST /api/rides/book` — request `{ ride_id }` (the `id` of the chosen
  search result). Response `{ ride, driver }`:
  - `ride`: any fields to update on the searched ride (e.g. a new `id`,
    `status`); omitted fields keep their searched values.
  - `driver` (required — without it the UI says no driver was assigned):
    `name`, `rating`, `total_rides`, `verification_status`, `phone`, and
    `vehicle: { model, vehicle_number, fuel_type, capacity }`.
  - Before booking there is no driver, so Ride Details shows "Your driver
    and vehicle are assigned as soon as you confirm" unless the search
    results themselves include a `driver`.

## Still mock-only — needs a small restructure first, not just a flag flip

- **`rideService.getAnomalyPlan(ride)`** (used by Live Ride): the real
  flow is `POST /api/ai/anomaly-detect` polled periodically during the
  ride with the vehicle's current location, not a single plan computed
  up front. Needs a polling loop (setInterval, cleared on unmount)
  replacing the current one-shot scheduled window.

- **Live location** (the simulated marker movement in Live Ride): real
  version is `POST /api/rides/{ride_id}/location` (driver app logs GPS)
  and `GET /api/rides/{ride_id}/tracking` (rider app polls it) — needs
  the same kind of polling loop as anomaly detection.

- **`rideService.getRideHistory()`** (Activity, Insights): there's no
  ride-history-list endpoint in API_CONTRACT.md yet. Needs one added
  there first (e.g. `GET /api/rides?user_id=`) before this can be wired.

- **Trusted contacts and Safety Mode settings** (Safety tab): saved in
  the browser only (localStorage, per user, via `hooks/usePersistedState`)
  so they survive a refresh but not a device change. Needs endpoints in
  API_CONTRACT.md (a `trusted_contacts` table already exists in the
  schema) before they can sync to the backend.

- **SOS / Share Ride** (Live Ride, Safety): `POST /api/safety/sos` and
  `POST /api/safety/alert-contact` exist in the contract but aren't
  called yet — the buttons currently just show a local "sent" state.

- **Profile edits** (Profile screen): editing name/phone/gender only
  updates the in-browser session (`AuthContext.updateProfile`) — there's
  no `PUT /api/users` (or similar) endpoint in API_CONTRACT.md yet. Add
  one there first, then call it from `ProfilePage`'s save handler.

- **Google sign-in**: needs the real Google Identity Services SDK
  integrated client-side, plus a backend endpoint to exchange the Google
  token — neither exists yet.

## Pattern to follow for each one

Every service function should keep the shape used in `authService.js`:

```js
export function someAction(payload) {
  if (!USE_MOCKS) {
    return apiClient.post('/api/...', payload).then((res) => res.data)
  }
  return new Promise((resolve) => { /* existing mock */ })
}
```

So call sites never need to change — only the function body does.
