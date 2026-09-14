# RideNow AI — Frontend Collaboration Guide

## Before Editing
1. Pull/review the latest repository state.
2. Inspect existing frontend work.
3. Check whether teammates changed shared files.
4. Keep the change focused.

## During Editing
- Reuse existing components where appropriate.
- Avoid duplicate routes.
- Avoid unrelated refactors.
- Keep API calls out of presentational components.
- Keep demo data separate.
- Keep code concise.

## Branching
Work only inside your own scope (`frontend/`), on a feature branch per step — never commit directly to `main`:
```
git checkout -b frontend/step-01-setup
```
Name each branch `frontend/step-XX-<short-name>`. Open a pull request into `main` when a step (or a small group of related steps) is done, so ML/backend teammates pushing at the same time never collide with your work.

## After Every Completed Step
Commit and push before moving to the next step — don't batch multiple steps into one push:
```
git add .
git commit -m "<type>(frontend): <short description>"
git push
```
This is what keeps `docs/progress/STEP-XX.md` and the actual repo state in sync for teammates.

## Before Commit
Check:
- App builds/runs
- Routes work
- Buttons have real behavior
- Mobile layout works
- No obvious console errors
- No accidental duplicate feature
- Documentation is updated

## Commit Examples
feat(frontend): add landing page foundation
feat(frontend): add ride search flow
ui(frontend): establish design system
fix(frontend): correct responsive navigation
docs: update frontend progress

## Team Principle
Make changes that are easy for the next teammate to understand, test and extend.
