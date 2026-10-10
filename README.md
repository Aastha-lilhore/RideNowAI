# RideNow AI

An intelligent, safety-aware ride recommendation system. Instead of just
listing rides, it ranks them on **fare, time, safety and sustainability**,
explains why, and keeps the rider protected during the trip.

Core features:

- **AI ride recommendation:** ranks every option and explains the pick
- **AI fare prediction:** estimates a fair fare before booking
- **AI safety score:** a 0-100 score per ride (driver, route, time of day, area)
- **Route anomaly detection:** flags unexpected detours during a trip
- **Women's Safety Mode:** trusted contacts, live sharing, SOS

## Repository layout

| Folder | What lives there |
| --- | --- |
| `frontend/` | The React web app (all screens are built; runs on mock data until the backend is ready) |
| `backend/` | API server (see `docs/API_CONTRACT.md` for the endpoints to build) |
| `ml/` | Models behind the AI features (formulas to match are in `docs/AI_FORMULAS.md`) |
| `docs/` | Requirements, API contract, AI formulas, design and architecture notes |

## Getting started (frontend)

You need Node.js 20.19+ (or 22.12+).

```bash
cd frontend
npm install
npm run dev      # http://localhost:5173
```

With no configuration the app runs entirely on mock data, so you don't need
the backend running to use or develop it. Full details are in
[`frontend/README.md`](frontend/README.md).

## Working across the team

Frontend, backend and ML all build against one shared contract:

- [`docs/API_CONTRACT.md`](docs/API_CONTRACT.md): database tables and endpoints. Don't change it without telling the other two sides.
- [`docs/AI_FORMULAS.md`](docs/AI_FORMULAS.md): the scoring formulas the ML side should implement and the frontend mocks already follow.
- [`docs/BACKEND_INTEGRATION.md`](docs/BACKEND_INTEGRATION.md): **backend teammates start here.** It lists which frontend calls are already wired to real endpoints, which still need one, and how to switch the frontend from mocks to your API.
- [`docs/CONTRIBUTING.md`](docs/CONTRIBUTING.md): how we work, commit message style, how to run the tests.

## Status

Frontend: every screen in `docs/REQUIREMENTS.md` is built and covered by
automated tests. Backend and ML: in progress. See
[`docs/PROJECT_MEMORY.md`](docs/PROJECT_MEMORY.md) for the running log of what
has been done and what's next.
