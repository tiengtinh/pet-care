# Playwright E2E Implementation Plan

## 1. Purpose

This plan describes how to bring the Playwright E2E system to a fully documented, maintainable, and extensible state from the current repository baseline.

This is not a greenfield build plan. The harness, testing API, fixtures, helpers, and core specs already exist. The implementation effort now is about consolidation, gap-closing, and operational hardening.

```text
+--------------------------------------------------------------+
| IMPLEMENTATION INTENT                                        |
+--------------------------------------------------------------+
| Do not rebuild the harness.                                  |
| Do align docs, audit coverage, close gaps, and harden it.    |
+--------------------------------------------------------------+
```

## 2. Current Baseline

The repository already includes:

- root Playwright tooling in `package.json`
- Playwright runtime orchestration in `playwright.config.ts`
- dedicated E2E backend startup in `backend/package.json`
- guarded testing routes in `backend/src/modules/testing/infra/`
- shared fixture and helper utilities in `tests/e2e/support/`
- six spec files covering app shell, pets, inventory, schedules, dashboard, and resilience

This means the plan should avoid rebuilding what already works.

```text
Baseline stack

  docs
    |
    +--> PRD
    +--> implementation plan
    +--> .claude/project/e2e.md

  runtime
    |
    +--> playwright.config.ts
    +--> frontend :4173
    +--> backend  :3300
    +--> /api/testing

  suite
    |
    +--> spec files
    +--> support helpers
    +--> seed fixtures
```

## 3. Implementation Goal

Make the E2E system complete as a working product by ensuring:

- requirements are clearly documented
- current coverage is inventoried and traceable
- remaining gaps are explicit
- the runtime contract is stable
- future additions follow one consistent pattern

```text
Target end state

  requirements clear
          +
  coverage traceable
          +
  setup deterministic
          +
  extension path consistent
          =
  maintainable E2E system
```

## 4. Constraints

- Do not introduce direct DB access from Playwright specs
- Keep destructive setup behind the backend testing API
- Preserve the isolated runtime on frontend `4173` and backend `3300` unless intentionally changed everywhere
- Reuse existing support helpers before adding new abstractions
- Keep tests readable and user-facing
- Keep runtime assumptions aligned across docs and code

## 5. Workstreams

```text
Workstream dependency view

  documentation alignment
            |
            v
      coverage audit
            |
            v
      stability review
            |
            v
      targeted gap work
            |
            v
      operationalization
```

### 5.1 Documentation Alignment

Objective:

- eliminate drift between design docs, current implementation, and agent guidance

Tasks:

- align `docs/PRD.md` with the actual implemented harness
- align `docs/IMPLEMENTATION_PLAN.md` with current repo state
- keep `.claude/project/e2e.md` as the runtime source of truth for operational details
- ensure `AGENTS.md` and `.claude/project/e2e.md` agree on command names, ports, and testing API behavior

Completion criteria:

- a contributor can read the docs and understand how the current E2E system works without inspecting every spec

```text
Files to reconcile

  AGENTS.md
      |
      +-- .claude/project/e2e.md
      |        |
      |        +-- commands
      |        +-- ports
      |        +-- testing API contract
      |
      +-- docs/PRD.md
      |
      `-- docs/IMPLEMENTATION_PLAN.md
```

### 5.2 Coverage Audit

Objective:

- map documented product flows to concrete specs

Tasks:

- map each scenario from `docs/test_plan/e2e_tests.md` to existing tests
- map named regressions to existing tests
- identify uncovered but important behaviors
- separate real gaps from already-covered behavior

Current known coverage baseline:

- app shell navigation and layout: covered
- pets core flow and summaries: covered
- inventory create/update/summary flow: covered
- schedules create/ordering/overdue flow: covered
- dashboard aggregate and regression coverage: covered
- dashboard resilience failure state: covered

Potential follow-up gap candidates:

- page-level resilience behavior outside dashboard
- more negative-path form validation coverage
- stronger testing API health and lock-down coverage
- CI integration and stability monitoring

Completion criteria:

- every critical requirement in the PRD has a clear status: covered, partially covered, or missing

```text
Coverage audit output format

  requirement ----> spec file ----> status ----> action

  covered     -> leave as-is
  partial     -> tighten assertions
  missing     -> add focused test
  obsolete    -> remove or rewrite
```

### 5.3 Runtime Stability

Objective:

- keep the E2E harness deterministic and predictable

Tasks:

- retain the current isolated runtime contract in `playwright.config.ts`
- preserve backend startup through `npm run dev:test:backend --prefix backend`
- preserve frontend startup using the explicit test API base URL on port `4173`
- keep `workers: 1` until independence and runtime safety are proven
- keep trace and screenshot capture enabled
- keep readiness checks pointed at `/api/testing/health`

Risks addressed:

- accidental use of normal dev servers
- port mismatches
- suite flakiness from shared mutable state

Completion criteria:

- a local run starts the correct services and points tests at the correct isolated environment

```text
Startup contract

  npm run test:e2e
        |
        +--> backend ready?  /api/testing/health
        |
        +--> frontend ready? http://127.0.0.1:4173
        |
        `--> execute specs serially
```

### 5.4 Testing API Maintenance

Objective:

- keep test state setup secure, explicit, and extensible

Tasks:

- preserve mount guard behind `ENABLE_TESTING_API === 'true'`
- preserve API-key enforcement through `x-testing-api-key`
- preserve localhost restriction
- keep reset behavior deleting schedules, inventory, and pets in a deterministic order
- extend the testing API only when the UI cannot model a required state cleanly

Extension rule:

- if a scenario needs special data state, add a focused testing endpoint or seed capability rather than reaching into Prisma from Playwright

Completion criteria:

- all destructive or privileged setup needed by E2E tests flows through `/api/testing`

```text
Permitted setup pattern

  spec
   |
   +--> support/seed.ts
          |
          +--> POST /api/testing/reset
          +--> POST /api/testing/seed/pet
          +--> POST /api/testing/seed/inventory
          `--> POST /api/testing/seed/schedule

Forbidden shortcut

  spec --> Prisma / SQL / direct DB mutation
```

### 5.5 Support Layer Consolidation

Objective:

- make new tests faster to write and easier to keep consistent

Tasks:

- keep fixture builders in `tests/e2e/support/fixtures.ts`
- keep seed operations in `tests/e2e/support/seed.ts`
- keep reusable navigation and form helpers in `tests/e2e/support/page-helpers.ts`
- add support helpers only when at least two tests benefit from reuse
- keep helpers small and behavior-oriented

Current reusable capabilities already present:

- page opening and heading verification
- sidebar navigation assertions
- create-pet, create-inventory, and create-schedule modal flows
- inventory row lookup
- dashboard section lookup
- browser time mocking
- placeholder-copy checks

Completion criteria:

- new specs can be added mostly by composing existing helpers and a small amount of scenario-specific logic

```text
Support layer shape

  fixtures.ts      -> what data should exist
  seed.ts          -> how data gets into the system
  page-helpers.ts  -> how the user moves through the UI

Rule:
  keep helpers generic enough for reuse
  but specific enough to stay readable
```

### 5.6 Coverage Expansion

Objective:

- fill any remaining product-relevant gaps without bloating the suite

Prioritization order:

1. missing critical user flows
2. named regressions with business impact
3. deterministic empty/error-state behavior
4. useful negative paths
5. lower-value cosmetic checks

Likely next additions if needed:

- form validation scenarios for invalid or missing required fields
- error handling on non-dashboard pages
- testing API authorization checks beyond `/reset`
- additional mobile layout or navigation sanity checks if UI complexity grows

Completion criteria:

- no critical product flow depends solely on manual verification

```text
Expansion priority ladder

  [1] missing critical flows
  [2] high-value regressions
  [3] deterministic empty/error states
  [4] validation negatives
  [5] lower-value polish checks
```

### 5.7 Operational Readiness

Objective:

- make failures easier to understand and suite behavior easier to trust

Tasks:

- keep HTML reports available after runs
- keep screenshots and traces attached to failed tests
- decide whether CI execution should be required on pull requests
- document any CI-specific differences if introduced later
- keep suite serial unless concurrency is intentionally engineered

Completion criteria:

- when a test fails, a contributor has enough artifact data to diagnose the failure without rerunning blindly

```text
Failure analysis path

  failing spec
      |
      +--> screenshot
      +--> trace
      +--> html report
      |
      `--> root-cause analysis
```

## 6. Phased Execution

```text
Phase map

  Phase 1  docs cleanup
      |
      v
  Phase 2  coverage traceability
      |
      v
  Phase 3  stability + safety review
      |
      v
  Phase 4  targeted gap work
      |
      v
  Phase 5  operationalization
```

### Phase 1: Documentation And Source-Of-Truth Cleanup

Deliverables:

- complete `docs/PRD.md`
- complete `docs/IMPLEMENTATION_PLAN.md`
- validated consistency with `.claude/project/e2e.md`

Exit criteria:

- the E2E system’s runtime and scope are described accurately in one coherent set of docs

### Phase 2: Coverage Traceability

Deliverables:

- mapping from documented test plan scenarios to spec files
- list of covered regressions
- list of uncovered high-priority scenarios

Exit criteria:

- coverage status is explicit rather than inferred

### Phase 3: Stability And Safety Review

Deliverables:

- confirmed startup contract
- confirmed testing API protections
- confirmed support-layer ownership and reuse rules

Exit criteria:

- the harness is stable enough that failures are more likely product regressions than setup noise

### Phase 4: Targeted Gap Work

Deliverables:

- only the missing tests or helper additions that materially improve confidence

Exit criteria:

- critical PRD scope is either covered or intentionally deferred with documented reasoning

### Phase 5: Operationalization

Deliverables:

- clear guidance for local runs
- optional CI policy if the team chooses to enforce suite execution before merge

Exit criteria:

- the suite is easy to run and maintain as part of normal development

## 7. Detailed Task Breakdown

```text
Task groups

  A  runtime contract
  B  testing API contract
  C  coverage inventory
  D  extension rules

  A -> B -> C -> D
  where:
    A/B define safe execution
    C/D define safe growth
```

### Task Group A: Confirm Canonical Runtime Contract

Files to keep aligned:

- `playwright.config.ts`
- `backend/package.json`
- `.claude/project/e2e.md`
- `AGENTS.md`

Checks:

- frontend port is `4173`
- backend port is `3300`
- frontend uses `VITE_API_BASE_URL=http://127.0.0.1:3300/api`
- readiness probe is `GET /api/testing/health`
- suite command is `npm run test:e2e`

### Task Group B: Confirm Testing API Contract

Files:

- `backend/src/server.ts`
- `backend/src/modules/testing/infra/testing.routes.ts`
- `backend/src/modules/testing/infra/testing.controller.ts`
- `tests/e2e/support/seed.ts`

Checks:

- mount occurs only in test mode
- localhost guard remains in place
- API key remains required
- seed payloads match helper expectations
- reset clears dependent entities safely

### Task Group C: Confirm Coverage Inventory

Files:

- `tests/e2e/app-shell.spec.ts`
- `tests/e2e/pets.spec.ts`
- `tests/e2e/inventory.spec.ts`
- `tests/e2e/schedules.spec.ts`
- `tests/e2e/dashboard.spec.ts`
- `tests/e2e/resilience.spec.ts`

Checks:

- each critical product area has at least one deterministic spec
- known issue regressions remain named and discoverable
- test names remain meaningful and traceable to documented scenarios

### Task Group D: Enforce Extension Rules

Rules:

- new test setup goes through support helpers first
- new privileged state goes through testing API changes first
- no direct Prisma use in Playwright specs
- runtime changes must update docs in the same change

```text
New test decision tree

  need new scenario?
        |
        +--> can existing fixtures model it?
        |       |
        |       yes --> write spec
        |       |
        |       no
        |       |
        |       +--> can support helper reuse improve clarity?
        |       |       |
        |       |       yes --> add helper
        |       |       no  --> inline logic
        |       |
        |       `--> does state require privileged setup?
        |               |
        |               yes --> extend /api/testing
        |               no  --> model through normal UI/API path
```

## 8. Risks And Mitigations

### Risk: Documentation Drift

Impact:

- contributors follow stale ports or old startup assumptions

Mitigation:

- keep `.claude/project/e2e.md` as runtime reference
- update docs in the same PR as runtime changes

### Risk: Test Flakiness From Time-Sensitive UI

Impact:

- intermittent failures in greeting, overdue, and forecast-related tests

Mitigation:

- continue using seeded dates and browser time mocking where appropriate

### Risk: Shared-State Contention

Impact:

- tests influence each other or fail nondeterministically

Mitigation:

- keep reset in `beforeEach`
- keep workers at `1` unless isolation strategy changes

### Risk: Over-Abstracted Helpers

Impact:

- tests become hard to read and harder to debug

Mitigation:

- only extract helpers with repeated value
- keep helper APIs narrow and scenario-oriented

### Risk: Testing API Scope Creep

Impact:

- privileged backend surface grows beyond test needs

Mitigation:

- only add explicit capabilities required for deterministic UI scenarios
- keep the API local-only and test-mode-only

```text
Risk -> mitigation map

  doc drift        -> update docs in same change
  time flakiness   -> fixed-time helpers + seeded dates
  shared state     -> reset before each + workers: 1
  helper bloat     -> extract only repeated value
  API creep        -> explicit, minimal test endpoints
```

## 9. Verification Strategy

When implementation work resumes, verification should include:

- static review of docs and code alignment
- targeted Playwright execution for changed specs
- full `npm run test:e2e` before claiming suite-level completion

Verification expectations:

- if runtime files change, verify startup assumptions
- if testing API changes, verify both positive and lock-down behavior
- if support helpers change, verify at least one spec that uses them

```text
Verification order

  docs aligned?
      |
      +--> targeted spec runs pass?
              |
              +--> full suite pass?
                      |
                      `--> claim completion
```

## 10. Definition Of Done

The E2E implementation plan is complete when:

- the PRD accurately describes the system
- the runtime contract is documented and aligned with code
- the current coverage inventory is explicit
- important remaining gaps are identified clearly
- contributors have one clear path for adding new E2E scenarios
- the suite remains deterministic, guarded, and maintainable

```text
Done means:

  docs true
  runtime true
  coverage known
  gaps explicit
  extension rules clear
```

## 11. Recommended Next Actions

If work continues beyond documentation, the recommended order is:

1. audit PRD coverage against each existing spec
2. fix any runtime or docs drift
3. add only high-value missing scenarios
4. decide whether CI enforcement is worth the runtime cost

## 12. Summary

The implementation problem is no longer “set up Playwright.” That work is already largely done. The real implementation goal now is to keep the current harness coherent, documented, deterministic, and easy to extend without introducing test fragility or bypassing the backend testing contract.
