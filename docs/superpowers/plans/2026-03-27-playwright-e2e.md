# Playwright E2E Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a deterministic Playwright end-to-end suite for PetCare that covers the documented create flows, dashboard regressions, and stable empty/error states.

**Architecture:** Add a root-level Playwright harness that runs against the real frontend and backend, and add a guarded backend `testing` route group for reset/seed operations. Keep assertions user-facing in the browser, and hide any Prisma-specific timestamp manipulation behind the backend testing surface.

**Tech Stack:** Playwright, TypeScript, React 18 + Vite, Express 5, Prisma, PostgreSQL

---

### Task 1: Bootstrap Root Playwright Tooling

**Files:**
- Create: `package.json`
- Create: `playwright.config.ts`
- Create: `tests/e2e/pets.spec.ts`
- Modify: `.gitignore`
- Test: `tests/e2e/pets.spec.ts`

- [ ] **Step 1: Create the root package manifest for Playwright tooling**

```json
{
  "name": "petcare-e2e",
  "private": true,
  "scripts": {
    "test:e2e": "playwright test",
    "test:e2e:ui": "playwright test --ui"
  },
  "devDependencies": {
    "@playwright/test": "^1.54.0"
  }
}
```

- [ ] **Step 2: Install the root dependency and browser runtime**

Run: `npm install`
Expected: root `package-lock.json` is created and `@playwright/test` is installed.

Run: `npx playwright install chromium`
Expected: Chromium is installed for local Playwright runs.

- [ ] **Step 3: Write the first failing Playwright spec**

```ts
import { expect, test } from '@playwright/test';

test('shows the pets empty state when no pets exist', async ({ page }) => {
  await page.goto('/pets');
  await expect(page.getByText('Chưa có thú cưng nào.')).toBeVisible();
});
```

- [ ] **Step 4: Run the first spec to verify it fails**

Run: `npx playwright test tests/e2e/pets.spec.ts -g "shows the pets empty state when no pets exist"`
Expected: FAIL because there is no Playwright config or web server wiring yet.

- [ ] **Step 5: Add the minimal Playwright config**

```ts
import { defineConfig } from '@playwright/test';

export default defineConfig({
  testDir: './tests/e2e',
  retries: process.env.CI ? 2 : 0,
  reporter: [['html', { open: 'never' }]],
  use: {
    baseURL: 'http://127.0.0.1:5173',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
  },
  webServer: [
    {
      command: 'npm run dev:test --prefix backend',
      url: 'http://127.0.0.1:3000/api/health',
      reuseExistingServer: !process.env.CI,
      timeout: 120_000,
    },
    {
      command: 'npm run dev --prefix frontend',
      url: 'http://127.0.0.1:5173',
      reuseExistingServer: !process.env.CI,
      timeout: 120_000,
    },
  ],
});
```

- [ ] **Step 6: Update `.gitignore` for Playwright artifacts without disturbing unrelated user changes**

Add only the missing entries if needed:

```gitignore
node_modules/
playwright-report/
test-results/
```

- [ ] **Step 7: Run the spec again to verify the next failure is meaningful**

Run: `npx playwright test tests/e2e/pets.spec.ts -g "shows the pets empty state when no pets exist"`
Expected: FAIL because the backend testing reset/seed contract does not exist yet and local DB state is not deterministic.

- [ ] **Step 8: Commit the bootstrap step**

```bash
git add package.json package-lock.json playwright.config.ts tests/e2e/pets.spec.ts .gitignore
git commit -m "test(e2e): bootstrap Playwright harness"
```

### Task 2: Add Guarded Backend Testing Routes

**Files:**
- Modify: `backend/package.json`
- Modify: `backend/src/server.ts`
- Create: `backend/src/modules/testing/infra/testing.controller.ts`
- Create: `backend/src/modules/testing/infra/testing.routes.ts`
- Test: `tests/e2e/pets.spec.ts`

- [ ] **Step 1: Extend the backend script surface for Playwright**

Add a dedicated backend script:

```json
"dev:test": "sh -c 'ENABLE_TESTING_API=true npx prisma db push && ENABLE_TESTING_API=true npx prisma generate && ENABLE_TESTING_API=true ts-node-dev --respawn --transpile-only src/server.ts'"
```

- [ ] **Step 2: Expand the first Playwright spec to use deterministic reset**

```ts
import { expect, request, test } from '@playwright/test';

test.beforeEach(async () => {
  const api = await request.newContext({ baseURL: 'http://127.0.0.1:3000/api' });
  await api.post('/testing/reset');
  await api.dispose();
});
```

- [ ] **Step 3: Run the pets spec to verify it fails on the missing testing route**

Run: `npx playwright test tests/e2e/pets.spec.ts -g "shows the pets empty state when no pets exist"`
Expected: FAIL with a `404` or connection-level failure for `/api/testing/reset`.

- [ ] **Step 4: Implement the testing controller with the minimal contract**

Controller methods should include:

```ts
await prisma.healthSchedule.deleteMany();
await prisma.inventory.deleteMany();
await prisma.pet.deleteMany();
```

And create helpers for:

```ts
prisma.pet.create({ data: ... });
prisma.inventory.create({ data: { ..., lastUpdatedDate } });
prisma.healthSchedule.create({ data: ... });
```

Use an explicit route contract so `tests/e2e/support/seed.ts` knows exactly what to call:

- `POST /api/testing/reset`
- `POST /api/testing/seed/pet`
- `POST /api/testing/seed/inventory`
- `POST /api/testing/seed/schedule`

Example payload shapes:

```json
{ "name": "E2E Corgi", "type": "dog", "breed": "Pembroke Welsh Corgi", "weight": 12 }
```

```json
{ "petId": "<pet-id>", "foodName": "Royal Canin E2E", "totalWeightGrams": 3000, "dailyPortionGrams": 150, "lastUpdatedDate": "2026-03-17T00:00:00.000Z" }
```

```json
{ "petId": "<pet-id>", "eventType": "water_change", "eventName": "Thay nước", "nextDueDate": "2026-03-28" }
```

- [ ] **Step 5: Add guarded routing in the server**

Use a dedicated guard:

```ts
if (process.env.ENABLE_TESTING_API === 'true') {
  app.use('/api/testing', testingRoutes);
}
```

- [ ] **Step 6: Re-run the pets empty-state spec to verify it passes**

Run: `npx playwright test tests/e2e/pets.spec.ts -g "shows the pets empty state when no pets exist"`
Expected: PASS.

- [ ] **Step 7: Commit the backend testing surface**

```bash
git add backend/package.json backend/package-lock.json backend/src/server.ts backend/src/modules/testing/infra/testing.controller.ts backend/src/modules/testing/infra/testing.routes.ts tests/e2e/pets.spec.ts
git commit -m "test(api): add guarded e2e seed routes"
```

### Task 3: Add Shared E2E Support And Pets Coverage

**Files:**
- Create: `tests/e2e/support/seed.ts`
- Create: `tests/e2e/support/fixtures.ts`
- Create: `tests/e2e/support/page-helpers.ts`
- Modify: `tests/e2e/pets.spec.ts`
- Test: `tests/e2e/pets.spec.ts`

- [ ] **Step 1: Add a second failing pets test for the create flow**

```ts
test('creates a pet from the modal and shows it in the registry', async ({ page }) => {
  await page.goto('/pets');
  await page.getByRole('button', { name: 'Thêm Thú Cưng' }).click();
  await page.getByLabel('Tên thú cưng').fill('E2E Corgi');
  await page.getByLabel('Loại').selectOption('dog');
  await page.getByLabel('Giống loài').fill('Pembroke Welsh Corgi');
  await page.getByLabel('Cân nặng (kg)').fill('12');
  await page.getByRole('button', { name: 'Lưu' }).click();
  await expect(page.getByText('E2E Corgi')).toBeVisible();
});
```

- [ ] **Step 2: Run the pets spec to verify the new test fails for the expected reason**

Run: `npx playwright test tests/e2e/pets.spec.ts`
Expected: FAIL because helper seeding and form helpers are not extracted yet, or because selectors need hardening.

- [ ] **Step 3: Create the shared support files**

Add:

- `seed.ts` for `resetTestData()`, `seedPet()`, `seedInventory()`, `seedSchedule()`
- `fixtures.ts` for named builders such as `buildPet`, `buildInventory`, `buildSchedule`
- `page-helpers.ts` for reusable UI actions such as `openPetsPage()` and `createPetFromModal()`

- [ ] **Step 4: Refactor the pets spec to use the shared helpers and add full assertions**

Cover:

- empty state text
- successful create flow
- rendered type label `Chó`
- rendered breed `Pembroke Welsh Corgi`
- rendered weight `12 kg`
- rendered created-date text such as `Tạo ngày`
- stats update from `0` to `1`

- [ ] **Step 5: Re-run the pets spec to verify it passes cleanly**

Run: `npx playwright test tests/e2e/pets.spec.ts`
Expected: PASS with both the empty-state and create-flow scenarios green.

- [ ] **Step 6: Commit the pets coverage**

```bash
git add tests/e2e/support/seed.ts tests/e2e/support/fixtures.ts tests/e2e/support/page-helpers.ts tests/e2e/pets.spec.ts
git commit -m "test(e2e): cover pets flows"
```

### Task 4: Add Inventory And Schedule Flow Coverage

**Files:**
- Create: `tests/e2e/inventory.spec.ts`
- Create: `tests/e2e/schedules.spec.ts`
- Modify: `tests/e2e/support/fixtures.ts`
- Modify: `tests/e2e/support/seed.ts`
- Test: `tests/e2e/inventory.spec.ts`
- Test: `tests/e2e/schedules.spec.ts`

- [ ] **Step 1: Write the failing inventory empty-state and create-flow tests**

Include:

```ts
test('shows the inventory empty state with a seeded pet and no inventory', async ({ page }) => { ... });
test('creates inventory and shows forecast values', async ({ page }) => { ... });
test('updates inventory and resets forecasting from the new total', async ({ page }) => { ... });
```

- [ ] **Step 2: Write the failing schedules empty-state and create-flow tests**

Include:

```ts
test('shows the schedules empty state with a seeded pet and no schedules', async ({ page }) => { ... });
test('creates a schedule and shows it in the schedules page and dashboard', async ({ page }) => { ... });
test('orders schedule cards by the nearest due date', async ({ page }) => { ... });
```

- [ ] **Step 3: Run both specs to verify they fail before helper completion**

Run: `npx playwright test tests/e2e/inventory.spec.ts tests/e2e/schedules.spec.ts`
Expected: FAIL because the scenario helpers and seed coverage are incomplete.

- [ ] **Step 4: Expand fixture builders and seed helpers for deterministic time-based states**

Add support for:

- low-stock inventory
- aged inventory using explicit `lastUpdatedDate`
- schedule due tomorrow
- schedule overdue by 8 days
- multiple schedules with controlled ordering

- [ ] **Step 5: Implement the inventory assertions**

Verify:

- `Royal Canin E2E`
- `3000g`
- `Còn 20 ngày`
- after edit to `5000`, the forecast becomes `Còn 33 ngày`

- [ ] **Step 6: Implement the schedule assertions**

Verify:

- created event label such as `Thay nước`
- due-date label such as `Ngày mai`
- dashboard shows the created event in `Sắp tới hạn`
- nearest due date appears first

- [ ] **Step 7: Re-run the inventory and schedules specs**

Run: `npx playwright test tests/e2e/inventory.spec.ts tests/e2e/schedules.spec.ts`
Expected: PASS.

- [ ] **Step 8: Commit the inventory and schedule coverage**

```bash
git add tests/e2e/inventory.spec.ts tests/e2e/schedules.spec.ts tests/e2e/support/fixtures.ts tests/e2e/support/seed.ts
git commit -m "test(e2e): cover inventory and schedules flows"
```

### Task 5: Add Dashboard Regression And Resilience Coverage

**Files:**
- Create: `tests/e2e/dashboard.spec.ts`
- Create: `tests/e2e/resilience.spec.ts`
- Modify: `tests/e2e/support/fixtures.ts`
- Modify: `playwright.config.ts`
- Test: `tests/e2e/dashboard.spec.ts`
- Test: `tests/e2e/resilience.spec.ts`

- [ ] **Step 1: Write the failing dashboard regression tests**

Include:

```ts
test('shows overdue schedules on the dashboard upcoming card', async ({ page }) => { ... });
test('renders aggregated dashboard counts and featured sections from seeded data', async ({ page }) => { ... });
test('shows the lowest-stock inventory first in the dashboard attention list', async ({ page }) => { ... });
```

- [ ] **Step 2: Write the failing resilience test**

Target the spec’s page-load failure case on the dashboard and use Playwright routing to simulate the backend being unavailable from first render:

```ts
test('shows the dashboard error message when backend requests fail on initial load', async ({ page }) => { ... });
```

- [ ] **Step 3: Run the dashboard and resilience specs to verify they fail first**

Run: `npx playwright test tests/e2e/dashboard.spec.ts tests/e2e/resilience.spec.ts`
Expected: FAIL until fixture composition and error interception are correct.

- [ ] **Step 4: Implement the dashboard seed scenarios and assertions**

Verify:

- overdue schedule copy such as `Quá hạn 8 ngày`
- dashboard counters match seeded pets, inventories, and schedules
- featured cards show the expected pet and event
- low-stock ordering matches the lowest `remainingDays`

- [ ] **Step 5: Implement the resilience strategy without making the suite flaky**

Prefer `page.route()` to abort `/api/**` requests for the resilience spec rather than stopping the real backend process.

- [ ] **Step 6: Tune Playwright reporting**

Ensure the config keeps:

- `retries: process.env.CI ? 2 : 0`
- `trace: 'on-first-retry'`
- `screenshot: 'only-on-failure'`
- a local HTML report output

- [ ] **Step 7: Run the full e2e suite**

Run: `npx playwright test`
Expected: PASS across pets, inventory, schedules, dashboard, and resilience specs.

- [ ] **Step 8: Commit the final e2e coverage**

```bash
git add tests/e2e/dashboard.spec.ts tests/e2e/resilience.spec.ts tests/e2e/support/fixtures.ts playwright.config.ts
git commit -m "test(e2e): cover dashboard regressions"
```

### Task 6: Final Verification And Documentation Sync

**Files:**
- Modify: `docs/test_plan/e2e_tests.md`
- Modify: `docs/test_reports/e2e_testing_report.md`
- Test: `tests/e2e/pets.spec.ts`
- Test: `tests/e2e/inventory.spec.ts`
- Test: `tests/e2e/schedules.spec.ts`
- Test: `tests/e2e/dashboard.spec.ts`
- Test: `tests/e2e/resilience.spec.ts`

- [ ] **Step 1: Update the existing test plan doc to reference the Playwright suite as the execution path**

Add a short note pointing from the manual scenarios to the automated specs.

- [ ] **Step 2: Update the old test report so it no longer describes the current frontend as placeholder-only**

Record the historical context briefly and point to the new automated suite instead of leaving stale guidance.

- [ ] **Step 3: Run the focused spec files one more time**

Run: `npx playwright test tests/e2e/pets.spec.ts tests/e2e/inventory.spec.ts tests/e2e/schedules.spec.ts tests/e2e/dashboard.spec.ts tests/e2e/resilience.spec.ts`
Expected: PASS.

- [ ] **Step 4: Run the full suite one final time**

Run: `npx playwright test`
Expected: PASS with clean output and generated artifacts only on failure or retry.

- [ ] **Step 5: Capture the final implementation commit**

```bash
git add docs/test_plan/e2e_tests.md docs/test_reports/e2e_testing_report.md
git commit -m "docs: align e2e plan with Playwright suite"
```
