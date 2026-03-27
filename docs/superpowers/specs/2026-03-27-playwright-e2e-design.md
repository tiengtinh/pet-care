# Playwright E2E Test Design

**Date:** 2026-03-27
**Scope:** PetCare frontend and backend local environment
**Source inputs:** `.gstack/qa-reports/qa-report-localhost-2026-03-27.md`, `docs/test_plan/e2e_tests.md`, `.claude/project/architecture.md`, `.claude/project/conventions.md`

## Goal

Add a maintainable Playwright end-to-end suite for the PetCare app that covers the documented user flows and the QA regressions on Dashboard, Pets, Inventory, and Schedules.

## Constraints

- Tests must validate user-visible behavior through the browser.
- Test setup must be deterministic and must not depend on whatever local data already exists.
- The suite should avoid direct database coupling from the test code where possible.
- Existing app behavior and structure should be preserved unless testability requires a minimal change.

## Recommended Approach

Use a hybrid e2e architecture:

- Playwright drives the real frontend application from the browser.
- Test-only backend endpoints provide deterministic reset and seed operations for fixtures.
- UI assertions remain fully user-facing.
- Direct database mutation is hidden behind the backend test-only surface and used only for states that the normal API does not model cleanly, such as aged inventory timestamps.

This keeps tests readable and stable while avoiding schema-level coupling in the Playwright layer.

## Architecture

### Playwright test harness

Create a root-level Playwright setup so the suite can coordinate frontend and backend together from the repository root.

Responsibilities:

- Start or connect to the frontend at `http://localhost:5173`.
- Start or connect to the backend at `http://localhost:3000`.
- Configure retries, traces, screenshots, and HTML reporting for local debugging.
- Expose shared helpers for navigation, fixture setup, and common assertions.

### Test-only backend surface

Add guarded backend routes that are only enabled in test mode.

Required capabilities:

- Reset all test data to a clean state.
- Seed pets, inventories, and schedules with explicit values.
- Support overdue schedules for dashboard regression coverage.
- Support aged inventory records by allowing a custom `lastUpdatedDate`.

Guardrails:

- Routes must be unavailable unless a dedicated test flag is enabled.
- The public application behavior must remain unchanged in non-test modes.
- Playwright tests should never talk to Prisma or PostgreSQL directly.

### Fixture model

Provide small named fixture builders rather than one giant seed payload.

Useful fixture patterns:

- empty app
- one pet only
- pet with healthy inventory
- pet with low-stock inventory
- pet with overdue schedule
- pet with upcoming schedule tomorrow
- mixed dashboard dataset combining pets, inventory, and schedules

This keeps individual tests focused and avoids excessive setup duplication.

## Coverage Plan

### 1. Pets flows

Cover:

- empty state when no pets exist
- create pet through the modal form
- persisted card data for name, type, breed, weight, and created date presence
- stats section updates after creation

### 2. Inventory flows

Cover:

- empty state when no inventory exists
- create inventory for an existing pet
- forecast display for grams remaining and days remaining
- edit inventory and verify forecast resets to the new total
- low-stock ordering behavior in the overview table and dashboard

### 3. Schedule flows

Cover:

- empty state when no schedules exist
- create schedule for an existing pet
- schedule card content and due-date label
- ordering by nearest `nextDueDate`
- dashboard visibility for upcoming work

### 4. Dashboard coverage

Cover:

- headline counters for pets, inventory records, and upcoming schedules
- featured low-stock card
- featured upcoming schedule card
- low-stock list rendering
- upcoming schedule list rendering
- regression for overdue schedules being visible instead of silently omitted

### 5. Resilience and integration states

Cover only the stable cases that can be asserted without adding flakiness:

- backend unavailable message on page load
- no-data empty states across pages

Do not overfit the suite to transient loading flashes unless the product explicitly requires them.

## Test Organization

Recommended spec layout:

- `tests/e2e/pets.spec.ts`
- `tests/e2e/inventory.spec.ts`
- `tests/e2e/schedules.spec.ts`
- `tests/e2e/dashboard.spec.ts`
- `tests/e2e/resilience.spec.ts`
- `tests/e2e/support/seed.ts`
- `tests/e2e/support/fixtures.ts`
- `tests/e2e/support/page-helpers.ts`

Organization principles:

- Each spec owns one page or one cross-page behavior area.
- Cross-page setup utilities live in support files.
- Tests should seed only the minimum state they need.

## Test Data Strategy

Use stable, human-readable names in tests so failures are easy to diagnose, for example:

- `E2E Corgi`
- `E2E Neon Fish`
- `Royal Canin E2E`
- `Thay nước`

Reset data before each test or before each describe block depending on runtime cost. Default to `beforeEach` for isolation unless the suite becomes too slow.

## Backend Design Notes

Test-only backend routes should live in a clearly isolated module, for example a `testing` route group.

The minimal contract should support:

- `POST /api/testing/reset`
- `POST /api/testing/seed/pet`
- `POST /api/testing/seed/inventory`
- `POST /api/testing/seed/schedule`

If a more compact contract is cleaner, a single `POST /api/testing/seed` endpoint that accepts a structured payload is also acceptable, as long as the payload remains readable and explicit.

## Risks And Tradeoffs

### Test-only endpoints

Pros:

- clear and stable setup contract
- less coupling to Prisma schema from Playwright
- easier to read and maintain

Cons:

- requires small backend changes for test support
- needs proper guarding to avoid accidental exposure outside test mode

### Direct DB seeding

Pros:

- maximum control over hard-to-reach states

Cons:

- couples tests to storage internals
- more fragile under schema refactors
- harder to understand at the test level

For this project, direct DB seeding should remain an implementation detail behind the test-only route layer, not a primary test strategy.

## Testing Strategy During Implementation

Follow test-driven development at the integration level:

1. Add the first Playwright spec for a documented flow.
2. Run it and confirm the expected failure.
3. Add the minimal Playwright config and backend test hooks needed to support that flow.
4. Re-run until green.
5. Expand coverage one scenario at a time.

## Success Criteria

The work is complete when:

- Playwright is installed and runnable from the repository root.
- Tests can create deterministic state without relying on manual local setup data.
- The suite covers the critical flows from `docs/test_plan/e2e_tests.md`.
- The suite covers the overdue schedule regression from the QA report.
- The suite produces actionable artifacts for failures such as traces or screenshots.

## Out Of Scope

- visual snapshot testing
- cross-browser matrix beyond a practical default local browser unless later requested
- performance benchmarking
- broad API contract testing unrelated to UI workflows
