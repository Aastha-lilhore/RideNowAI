# RideNow AI — Frontend Architecture

## Goal
Keep the frontend modular, understandable and easy for teammates to integrate with backend services.

## Suggested Structure

src/
  assets/
  components/
  data/
  hooks/
  layouts/
  pages/
  routes/
  services/
  utils/
  styles/

## Responsibilities

### components/
Reusable visual building blocks.

### pages/
Route-level screens and page composition.

### layouts/
Shared application shells.

### routes/
Central route definitions.

### services/
REST/WebSocket/API integration.

### hooks/
Reusable stateful logic.

### data/
Demo/mock data only. Keep it replaceable.

### utils/
Small reusable helpers.

### assets/
Images, icons and local visual assets.

### styles/
Global theme and Tailwind-related styling.

## API Boundary
Components should not contain scattered fetch calls.

Prefer:
component → hook/service → API

For demo mode:
component → hook/service → mock data

The mock response shape should resemble the expected backend response.

## Reuse
Reuse components when the UI or behavior is genuinely repeated.

Do not over-componentize tiny elements.

## Routing Principle
One canonical route/screen per feature.

Secondary navigation may deep-link to the canonical route, but must not create alternate duplicate implementations.

## Team Safety
Avoid unrelated refactoring.
Keep commits focused.
Document architectural decisions.
