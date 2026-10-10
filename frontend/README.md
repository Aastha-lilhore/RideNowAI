# RideNow AI: frontend

React web app for RideNow AI. Every screen in `docs/REQUIREMENTS.md` is built.
It runs on **mock data** by default, so it works without the backend; flipping
one setting switches it to the real API (see below).

## Quick start

Requires Node.js 20.19+ (or 22.12+).

```bash
npm install
npm run dev        # http://localhost:5173
```

| Command | What it does |
| --- | --- |
| `npm run dev` | Start the dev server |
| `npm run build` | Production build into `dist/` |
| `npm run preview` | Serve the production build locally |
| `npm test` | Run the automated tests (about 30, a few seconds) |
| `npm run lint` | Lint with Oxlint |

Run `npm test` before you push, and add a test when you fix a bug.

## Stack

React 19, Vite, React Router 7, Tailwind CSS 4, Leaflet (maps), Recharts
(charts), Axios (API), Vitest + Testing Library (tests).

## Mock data vs. the real backend

Copy `.env.example` to `.env`:

```
VITE_API_BASE_URL=http://localhost:4000
VITE_USE_MOCKS=true      # set to false to call the real backend
```

With no `.env` file the app uses mocks. Three calls are already wired to real
endpoints and only need `VITE_USE_MOCKS=false`: sign-up, login and ride
search. The rest need an endpoint first or a small restructure; the exact list
is in [`../docs/BACKEND_INTEGRATION.md`](../docs/BACKEND_INTEGRATION.md).
Endpoint shapes are in [`../docs/API_CONTRACT.md`](../docs/API_CONTRACT.md).

All data access goes through `src/services/`, so wiring a call to the backend
changes only that file, not the pages that use it.

## Screens and routes

| Route | Screen | Needs login |
| --- | --- | --- |
| `/` | Landing | no |
| `/auth` | Log in / Sign up (incl. mocked Google sign-in) | no |
| `/dashboard` | Home: pickup, destination, quick actions | yes |
| `/search` | Route + priority (AI / cheapest / fastest / safest) | yes |
| `/results` | Ranked rides with scores and explanations | yes |
| `/ride-details` | Driver, vehicle, trip summary, confirm | yes |
| `/live-ride` | Live map, route-anomaly alert, share, SOS | yes |
| `/completion` | Trip recap and driver rating | yes |
| `/activity` | Ride history | yes |
| `/safety` | Women's Safety Mode, trusted contacts, SOS | yes |
| `/insights` | Spending, safety and eco stats with charts | yes |
| `/profile` | Profile, edit, log out | yes |

Routes marked "yes" redirect to login when signed out. This is a UX guard
only; the backend must enforce access on every API call.

## Folder structure

```
src/
  pages/        one file per screen
  components/   reusable UI (Button, TextField, Switch, StatusBadge, ...)
  layouts/      MarketingNav (public pages), AppShell (signed-in nav)
  routes/       route table + RequireAuth guard
  services/     apiClient + authService + rideService (mock or real)
  context/      AuthContext: the current user
  hooks/        usePersistedState
  data/         static content kept out of the JSX
  test/         shared test setup
```

Tests sit next to the code they cover (`*.test.js` / `*.test.jsx`).

## Notes for whoever picks this up

- **Theme:** "Midnight Amber". Colours and fonts are tokens at the top of
  `src/index.css` (`@theme`); use those instead of hard-coded colours.
- **The AI numbers are stand-ins.** `src/services/rideService.js` implements
  the formulas in `../docs/AI_FORMULAS.md` as mocks. When the ML models exist,
  they should return the same fields.
- **Safety Mode settings and trusted contacts** are saved in the browser only
  (localStorage, per user) until the backend has endpoints for them.
- **Profile edits** are local-only until a user-update endpoint exists.
