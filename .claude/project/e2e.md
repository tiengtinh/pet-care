# E2E / Playwright

Use this file as the reference point for Playwright and E2E work.

## Canonical Files

- Config: `playwright.config.ts`
- Current pets spec: `tests/e2e/pets.spec.ts`
- Backend testing routes: `backend/src/modules/testing/infra/testing.routes.ts`
- Backend testing controller: `backend/src/modules/testing/infra/testing.controller.ts`

## Runtime

- Playwright starts its own isolated runtime.
- Frontend port: `4173`
- Backend port: `3300`
- Backend test schema: `e2e`
- Do not assume the normal dev servers on `3000` and `5173` are part of the E2E harness.

## Commands

- Run suite: `npm run test:e2e`
- Backend test server only: `npm run dev:test:backend --prefix backend`
- Install browsers if needed: `npx playwright install chromium`

## Testing API

- Base URL during Playwright runs: `http://127.0.0.1:3300/api/testing`
- Mounted only in test mode
- Protected by `x-testing-api-key`
- Readiness probe for backend reuse/startup: `GET /api/testing/health`

## Agent Guidance

- Read `playwright.config.ts` before changing ports, server startup, or reuse behavior.
- Reuse `tests/e2e/support/` helpers when adding new specs.
- Keep destructive setup logic behind the backend testing API; do not seed by reaching into the database directly from Playwright tests.
- If E2E runtime assumptions change, update this file and `CLAUDE.md` together.
