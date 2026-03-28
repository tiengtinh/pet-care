# Playwright E2E Product Requirements Document

## 1. Document Purpose

This PRD defines the product and engineering requirements for the Playwright end-to-end testing system in PetCare. It is intended to make E2E work explicit, testable, and maintainable across frontend and backend changes.

This document is based on the current repository state, not only on the earlier design proposal. It reflects:

- PetCare application structure and project conventions
- The documented E2E scenarios in `docs/test_plan/e2e_tests.md`
- The current E2E runtime contract in `.claude/project/e2e.md`
- The existing Playwright harness, backend testing API, support helpers, and specs already present in the repo

```text
+--------------------------------------------------------------+
| PRD NORTH STAR                                               |
+--------------------------------------------------------------+
| Goal                                                         |
|   Deterministic browser-first regression coverage for        |
|   PetCare using the real frontend + real backend.            |
|                                                              |
| Core rule                                                    |
|   Seed through /api/testing, assert through the UI.          |
|                                                              |
| Quality bar                                                  |
|   Stable runs, readable specs, useful failure artifacts.     |
+--------------------------------------------------------------+
```

## 2. Product Context

PetCare is a full-stack pet care management app for:

- managing pet profiles
- tracking food inventory
- forecasting remaining food quantity and remaining days
- managing health schedules such as vaccines, deworming, feeding, and water changes

The app’s most important behavior is not isolated to one screen. Value comes from flows that cross multiple pages:

- create a pet, then use it in inventory and schedules
- create or update inventory, then validate dashboard forecasting
- create schedules, then validate dashboard upcoming and overdue behavior

Because these are cross-page workflows, E2E coverage is the most direct way to validate real user outcomes.

```text
User value path

  [Create Pet]
        |
        +----> [Create Inventory] ----> [Forecasting visible]
        |
        +----> [Create Schedule] -----> [Upcoming / overdue visible]
                                         |
                                         v
                                  [Dashboard confidence]
```

## 3. Problem Statement

Without deterministic E2E coverage, PetCare has several delivery risks:

- manual regression testing is slow and inconsistent
- local seed data can hide or create false failures
- frontend and backend integrations can break while unit-level code still appears correct
- dashboard aggregation and ordering bugs can escape because they depend on multi-record state
- date-sensitive behavior is fragile without a controlled test harness

The project therefore needs an E2E system that validates real browser behavior against a real backend while remaining stable, isolated, and readable.

## 4. Objective

Provide a deterministic Playwright E2E suite for PetCare that validates critical user flows and known regressions through the browser against the real frontend and backend, using a controlled test runtime and a guarded backend testing API.

```text
+-------------------+     +----------------------+     +------------------+
| Browser automation| --> | Real frontend :4173  | --> | Real backend :3300|
+-------------------+     +----------------------+     +------------------+
                                                              |
                                                              v
                                                     +------------------+
                                                     | PostgreSQL e2e   |
                                                     | schema           |
                                                     +------------------+

Privileged setup path only:

  Playwright support layer --> /api/testing --> reset / seed --> deterministic state
```

## 5. Stakeholders

- Developers modifying frontend, backend, or shared behavior
- QA or reviewers verifying merge readiness
- Future agents or contributors extending the E2E suite

## 6. Users And Usage Model

Primary users of the E2E system:

- Developers running `npm run test:e2e` locally before or during implementation
- Reviewers diagnosing regressions using traces, screenshots, and HTML reports
- Contributors adding new browser-level coverage using the existing support layer

The E2E system is not an end-user feature. It is an internal product for engineering confidence.

## 7. Goals

### 7.1 Primary Goals

- Run browser tests from the repository root with one clear command
- Use an isolated frontend and backend runtime that does not depend on normal dev servers
- Keep test data deterministic and resettable for every scenario
- Validate critical user-facing workflows across Pets, Inventory, Schedules, Dashboard, and app shell behavior
- Preserve user-facing assertions instead of validating internal implementation details
- Produce actionable failure artifacts for debugging

### 7.2 Secondary Goals

- Keep E2E setup readable for future contributors
- Reduce direct storage coupling in test specs
- Make regressions reproducible through shared fixtures and helpers

## 8. Non-Goals

The E2E system does not aim to provide:

- visual snapshot testing
- exhaustive cross-browser parity testing
- performance benchmarking
- low-level API contract testing unrelated to UI behavior
- direct Prisma or PostgreSQL access from Playwright specs
- replacement for unit or integration tests in lower layers

## 9. Success Criteria

The E2E initiative is successful when:

- tests do not depend on pre-existing local application data
- critical scenarios from `docs/test_plan/e2e_tests.md` are covered by deterministic specs
- previously identified regressions remain codified as named tests
- failure runs retain traces and screenshots
- new tests can be added through `tests/e2e/support/` without introducing DB-level coupling in spec files
- runtime assumptions are documented consistently across the repo

```text
Success looks like this:

  same command
      +
  same ports
      +
  same seed contract
      +
  same visible assertions
      =
  trustworthy regressions
```

## 10. Scope

### 10.1 In Scope

- root-level Playwright execution
- isolated frontend runtime on port `4173`
- isolated backend runtime on port `3300`
- guarded backend testing API under `/api/testing`
- deterministic reset and seed operations
- shared E2E fixtures and page helpers
- app shell coverage
- pets page coverage
- inventory page coverage
- schedules page coverage
- dashboard coverage
- resilience coverage for stable backend-failure behavior

### 10.2 Out Of Scope

- visual diff baselines
- Safari / Firefox matrix unless explicitly requested later
- load or stress testing
- generalized test data platform beyond the current E2E needs
- non-browser automation outside Playwright

```text
Scope boundary

  IN
    - browser flows
    - deterministic state setup
    - dashboard aggregation checks
    - empty / error / regression states

  OUT
    - screenshot diff baselines
    - perf tests
    - direct DB scripting in specs
    - broad browser matrix
```

## 11. Product Requirements

### 11.1 Entry Point

The primary suite command must remain:

- `npm run test:e2e`

The suite should run from repository root without requiring manual app startup.

### 11.2 Runtime Isolation

The E2E harness must run against its own runtime and not rely on the standard local dev servers.

Current required runtime:

- frontend base URL: `http://127.0.0.1:4173`
- backend base URL: `http://127.0.0.1:3300`
- backend testing base URL: `http://127.0.0.1:3300/api/testing`
- backend schema: `e2e`

```text
Runtime map

  npm run test:e2e
        |
        +--> Playwright runner
              |
              +--> frontend webServer
              |      command: npm run dev --prefix frontend -- --port 4173 --strictPort
              |      url:     http://127.0.0.1:4173
              |
              +--> backend webServer
                     command: npm run dev:test:backend --prefix backend
                     url:     http://127.0.0.1:3300/api/testing/health
```

### 11.3 Data Determinism

Each test must be able to establish a known state before interacting with the UI.

Required properties:

- resettable state
- explicit seed inputs
- no reliance on leftover records from prior runs
- no need for manual database setup inside a spec

### 11.4 Security And Guardrails

The backend testing API must be locked down.

Required guardrails:

- mounted only when test mode is enabled
- protected by `x-testing-api-key`
- restricted to local requests
- unavailable to normal product runtime paths

```text
Testing API guard model

  request to /api/testing/*
          |
          +--> ENABLE_TESTING_API === true ? ---- no ---> reject
          |
          yes
          |
          +--> request from localhost ? ------- no ---> 403
          |
          yes
          |
          +--> x-testing-api-key matches ? ---- no ---> 403
          |
          yes
          |
          +--> allow reset / seed
```

### 11.5 Assertion Strategy

Tests must assert user-visible behavior whenever possible.

Preferred assertions:

- visible headings, cards, labels, copy, and ordering
- enabled or disabled controls
- route navigation and app-shell state
- visible error or empty-state messaging

Avoid asserting:

- private implementation details
- direct database contents from the spec layer
- internal component state

### 11.6 Failure Diagnostics

The suite must keep useful artifacts on failure.

Required diagnostics:

- Playwright HTML report
- trace on first retry
- screenshots on failure

## 12. Functional Coverage Requirements

```text
Coverage shape

  app shell
      |
      +--> navigation
      +--> layout stability
      +--> placeholder regression

  pets
      |
      +--> empty
      +--> create
      +--> summaries

  inventory
      |
      +--> empty
      +--> create
      +--> update + forecast
      +--> summaries

  schedules
      |
      +--> empty
      +--> create
      +--> ordering
      +--> overdue

  dashboard
      |
      +--> counters
      +--> featured cards
      +--> ordering
      +--> empty states
      +--> time-sensitive greeting

  resilience
      |
      +--> backend failure
```

### 12.1 App Shell

The suite must validate:

- dashboard loads by default
- sidebar navigation works across main pages
- active navigation state is visible
- unknown routes keep the app shell stable
- dashboard hero content renders
- sidebar branding renders
- mobile layout keeps key dashboard summary cards stacked in a sensible order
- development placeholder copy is not visible in user-facing pages

### 12.2 Pets

The suite must validate:

- empty state when no pets exist
- pet creation through the modal
- visible registry details after creation
- summary behavior for total count
- summary behavior for most common pet type
- no-trend fallback when no single pet type dominates

### 12.3 Inventory

The suite must validate:

- empty state with a pet but no inventory
- inventory creation for an existing pet
- forecast display for grams remaining and days remaining
- inventory update resets forecasting from the new total
- summary cards reflect total, watch-state, and source count
- no-pet alert disables inventory creation when there are no pets

### 12.4 Schedules

The suite must validate:

- empty state with a pet but no schedules
- schedule creation through the modal
- schedule visibility on both schedules page and dashboard
- ordering by nearest due date
- add-schedule button remains usable during pets-loading regression case
- summary cards reflect total, nearest event, and pet-count state
- overdue schedules show overdue status in the schedules list

### 12.5 Dashboard

The suite must validate:

- aggregated counts for pets, inventory records, and upcoming schedules
- featured low-stock inventory content
- featured upcoming schedule content
- overdue schedules appear in the upcoming card
- low-stock items are ordered correctly
- upcoming schedules are ordered correctly
- greeting changes with current time
- inventory section empty state
- upcoming schedule section empty state

### 12.6 Resilience

The suite must validate stable failure behavior for at least:

- dashboard initial load when backend requests fail

## 13. Test Data Requirements

The suite must use small, reusable fixture builders instead of one large opaque seed blob.

Required fixture patterns include:

- default pet
- inventory with healthy remaining days
- inventory aged by a number of days
- low-stock inventory
- schedule due tomorrow
- schedule due in N days
- overdue schedule

Test data should stay:

- explicit
- human-readable
- scenario-focused

Examples already used in the repo:

- `Chó Corgi`
- `Cá Neon`
- `Royal Canin`
- `Thay nước`

## 14. Current Implementation Baseline

The repository already contains a substantial part of the E2E product.

```text
Current repository state

  root/
  +-- package.json
  +-- playwright.config.ts
  +-- tests/e2e/
  |   +-- app-shell.spec.ts
  |   +-- pets.spec.ts
  |   +-- inventory.spec.ts
  |   +-- schedules.spec.ts
  |   +-- dashboard.spec.ts
  |   +-- resilience.spec.ts
  |   `-- support/
  |       +-- fixtures.ts
  |       +-- seed.ts
  |       `-- page-helpers.ts
  `-- backend/src/modules/testing/infra/
      +-- testing.routes.ts
      `-- testing.controller.ts
```

### 14.1 Root Harness

Present:

- root `package.json`
- `playwright.config.ts`

Current Playwright behavior:

- test directory: `tests/e2e`
- workers: `1`
- retries: `2` in CI, `0` locally
- reporter: HTML
- base URL: `http://127.0.0.1:4173`
- trace: `on-first-retry`
- screenshot: `only-on-failure`

### 14.2 Runtime Startup

Current harness starts:

- backend via `npm run dev:test:backend --prefix backend`
- frontend via `VITE_API_BASE_URL=http://127.0.0.1:3300/api npm run dev --prefix frontend -- --port 4173 --strictPort`

### 14.3 Backend Testing API

Present under:

- `backend/src/modules/testing/infra/testing.routes.ts`
- `backend/src/modules/testing/infra/testing.controller.ts`

Current endpoints:

- `GET /api/testing/health`
- `POST /api/testing/reset`
- `POST /api/testing/seed/pet`
- `POST /api/testing/seed/inventory`
- `POST /api/testing/seed/schedule`

Current protections:

- route mounted only when `ENABLE_TESTING_API === 'true'`
- request must come from localhost
- request must include the expected `x-testing-api-key`

### 14.4 Support Layer

Present under:

- `tests/e2e/support/fixtures.ts`
- `tests/e2e/support/seed.ts`
- `tests/e2e/support/page-helpers.ts`

Current support responsibilities:

- build seed payloads
- reset and seed test state through the testing API
- navigate pages consistently
- open and submit modals
- locate inventory rows and dashboard sections
- mock browser time for greeting assertions
- protect against placeholder-copy regressions

### 14.5 Current Spec Inventory

Current spec files:

- `tests/e2e/app-shell.spec.ts`
- `tests/e2e/pets.spec.ts`
- `tests/e2e/inventory.spec.ts`
- `tests/e2e/schedules.spec.ts`
- `tests/e2e/dashboard.spec.ts`
- `tests/e2e/resilience.spec.ts`

## 15. Coverage Mapping To Current Specs

```text
+----------------+-----------------------------+--------------------------+
| Area           | Main spec files             | Current status           |
+----------------+-----------------------------+--------------------------+
| App shell      | app-shell.spec.ts           | Covered                  |
| Pets           | pets.spec.ts                | Covered                  |
| Inventory      | inventory.spec.ts           | Covered                  |
| Schedules      | schedules.spec.ts           | Covered                  |
| Dashboard      | dashboard.spec.ts           | Covered                  |
| Resilience     | resilience.spec.ts          | Covered                  |
| Testing lock   | pets.spec.ts                | Partial but present      |
+----------------+-----------------------------+--------------------------+
```

```text
Traceability model

  docs/test_plan/e2e_tests.md
            |
            +--> TC-E2E-001  ---> pets + inventory + dashboard specs
            +--> TC-E2E-002  ---> pets + schedules + dashboard specs
            +--> TC-E2E-003  ---> inventory spec
            |
            +--> ISSUE-001..006 ---> named regression tests in specs
```

### 15.1 App Shell

Currently covered:

- default dashboard load
- sidebar navigation across pages
- stable app shell on unknown route
- banner image and copy
- warning-card labels
- sidebar branding and care image
- mobile vertical stacking
- placeholder-copy regression across pages

### 15.2 Pets

Currently covered:

- pets empty state
- create pet flow
- total registry summary
- most common pet type summary
- no-dominant-type summary fallback
- testing API lock-down check on reset without API key

### 15.3 Inventory

Currently covered:

- inventory empty state
- create inventory flow
- forecasting output after creation
- aged inventory scenario
- update flow resets forecast from new total
- summary cards
- disabled create path when no pets exist

### 15.4 Schedules

Currently covered:

- schedules empty state
- create schedule flow
- dashboard visibility after schedule creation
- due-date ordering
- loading-state regression for add-schedule button
- summary cards
- overdue status on schedules list

### 15.5 Dashboard

Currently covered:

- overdue schedule visibility regression
- aggregate counters
- featured sections with seeded data
- low-stock ordering
- time-of-day greeting
- upcoming ordering
- inventory empty state
- upcoming schedule empty state

### 15.6 Resilience

Currently covered:

- dashboard error state when backend requests fail on initial load

## 16. Requirements For Future Additions

Any new E2E scenario should:

- reuse the existing support layer first
- seed state through the testing API, not direct DB access
- remain focused on user-visible behavior
- avoid brittle selectors where role or label queries are available
- document new runtime assumptions when they are introduced

If a new scenario cannot be modeled through the existing testing API, the preferred approach is:

1. extend the backend testing surface carefully
2. keep the contract explicit
3. keep direct data-store coupling hidden behind that surface

## 17. Risks

### 17.1 Runtime Drift

If runtime ports, API keys, or startup commands change without documentation updates, contributors will run the suite incorrectly.

### 17.2 Selector Fragility

If tests rely too heavily on incidental copy or weak structure, UI refactors will create noisy failures.

### 17.3 Date Sensitivity

Forecasting and schedule labeling depend on time. Uncontrolled clock assumptions can make tests flaky.

### 17.4 Test API Exposure

If guardrails weaken, the testing surface could be exposed outside the intended local environment.

### 17.5 Documentation Drift

There is already a gap between older design docs and the current implemented runtime. This PRD exists partly to reduce that drift.

```text
Risk summary

  drift          -> wrong ports / wrong commands / stale docs
  fragility      -> noisy failures after harmless UI changes
  time coupling  -> flaky overdue / greeting / forecast tests
  API exposure   -> privileged routes available too broadly
  doc mismatch   -> contributors follow obsolete plans
```

## 18. Open Questions

These are not blockers for the current system, but they should be answered before major expansion:

- Should the suite run in CI by default or remain local-first until runtime cost is acceptable?
- Should `reuseExistingServer` remain `false`, or should local reuse be allowed later for speed?
- Does the testing API need richer bulk-seed contracts, or is the current endpoint granularity sufficient?
- Is resilience coverage needed on Pets, Inventory, and Schedules pages in addition to Dashboard?
- Should mobile coverage expand beyond one layout sanity test?

## 19. Acceptance Criteria

This PRD is satisfied when:

- the documented runtime remains executable as defined
- the testing API remains guarded and usable for deterministic setup
- the current critical scenarios remain covered in specs
- contributors can understand where to extend coverage
- docs, harness, and support-layer behavior stay aligned

```text
Acceptance gate

  [runtime aligned] AND
  [testing API guarded] AND
  [critical flows covered] AND
  [extension path documented]

  => PRD satisfied
```

## 20. Summary

The PetCare E2E system is already beyond the bootstrap phase. The product requirement is now to maintain and evolve a deterministic, browser-first test platform with a guarded backend setup surface, strong coverage of high-value flows, and documentation that matches the real implementation.
