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

These three needed no call-site changes — every page that calls them
already treats the result as a Promise.

## Still mock-only — needs a small restructure first, not just a flag flip

- **`rideService.getDriverForRide(ride)`** (used by Ride Details): in the
  real API there's no standalone "get driver for an unbooked ride"
  endpoint — the driver comes back from `POST /api/rides/book` once the
  rider actually confirms. Wiring this means moving driver assignment
  from Ride Details' render (synchronous today) into the "Confirm Ride"
  button's click handler (an async call), then passing the booked ride's
  driver forward to Live Ride instead of looking it up again.

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

- **SOS / Share Ride** (Live Ride, Safety): `POST /api/safety/sos` and
  `POST /api/safety/alert-contact` exist in the contract but aren't
  called yet — the buttons currently just show a local "sent" state.

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
