# RideNow AI — Frontend Decisions

## Decision 001 — Frontend Boundary
The user's assigned responsibility is frontend. Backend, database and ML logic remain outside the frontend implementation.

## Decision 002 — Step-by-Step Development
The project will be built incrementally rather than generating the whole application at once.

## Decision 003 — Design Quality
The UI must look intentionally designed, polished and product-like rather than generic or AI/vibe-coded.

## Decision 004 — Data-Driven UI
Repeated content and dynamic UI should be driven by data/configuration rather than duplicated JSX.

## Decision 005 — API Separation
API calls should live in services/hooks rather than directly inside visual components.

## Decision 006 — Mock Data
Mock/demo data is allowed while backend work is unavailable, but must be isolated and easy to replace.

## Decision 007 — Canonical Feature Locations
Each feature should have one clear place where it lives. Avoid duplicate pages and competing navigation paths.

## Decision 008 — Responsive by Design
Mobile is treated as a first-class layout, not simply a compressed desktop layout.

## Decision 009 — Real Imagery
Images should be selected because they are relevant to the content and product story, not merely because they fill space.

## Decision 010 — Documentation
Project memory, requirements, architecture, decisions and progress are maintained in docs/ so teammates can understand the frontend state.
