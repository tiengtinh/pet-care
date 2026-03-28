# CLAUDE.md

This file provides guidance to Claude Code when working with this repository.

## Project Overview

PetCare is a full-stack pet care management app for tracking pets, food inventory (with automatic remaining-days forecast), and health schedules (vaccines, deworming, water changes).

## Project References

| File | Content |
|------|---------|
| [architecture.md](.claude/project/architecture.md) | Stack, repo structure, API endpoints, env vars |
| [conventions.md](.claude/project/conventions.md) | Naming, component patterns, API layer rules |
| [e2e.md](.claude/project/e2e.md) | Playwright runtime, testing API, and E2E reference paths |

## Repository Structure

```
vibe/
├── frontend/               # React 18 + Vite SPA
│   └── src/
│       ├── components/     # Shared UI components
│       ├── pages/          # One component per route
│       └── lib/            # api.ts, types.ts, formatting.ts
├── backend/                # Express 5 + TypeScript API
│   ├── prisma/             # schema.prisma
│   └── src/
│       ├── server.ts       # Entry point + PrismaClient export
│       └── modules/        # pet/ inventory/ schedule/
├── docker-compose.yml
└── docs/test_plan/
```

## Quick Reference

| Resource | Location |
|----------|----------|
| API base | `http://localhost:3000/api` |
| DB schema | `backend/prisma/schema.prisma` |
| API functions | `frontend/src/lib/api.ts` |
| Shared types | `frontend/src/lib/types.ts` |

## Critical Rules

**IMPORTANT:** Always check `.claude/project/` for project-specific context before implementation.

**IMPORTANT:** For E2E or Playwright work, read `.claude/project/e2e.md` before changing tests or test runtime.

**IMPORTANT:** Activate `frontend-development` skill for frontend work, `express-prisma` for backend work, `docker` for container work.

**IMPORTANT:** Project rules (`.claude/rules/`) take precedence over skill guidelines.

## E2E / Playwright

- Canonical config: [playwright.config.ts](playwright.config.ts)
- Current isolated runtime: frontend `4173`, backend `3300`
- Backend test entrypoint: `npm run dev:test:backend --prefix backend`
- Canonical test API surface: [backend/src/modules/testing/infra/testing.controller.ts](backend/src/modules/testing/infra/testing.controller.ts) and [backend/src/modules/testing/infra/testing.routes.ts](backend/src/modules/testing/infra/testing.routes.ts)
- Primary command: `npm run test:e2e`
- When adding new specs or helpers, extend `tests/e2e/` and reuse `tests/e2e/support/` instead of duplicating setup logic
