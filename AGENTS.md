# AGENTS.md

This is the canonical repository instruction file for Codex and Claude-compatible tooling. Keep `CLAUDE.md` as a symlink to this file.

## Project Overview

PetCare is a full-stack pet care management app for tracking pets, food inventory (with automatic remaining-days forecast), and health schedules (vaccines, deworming, water changes).

## Project References

Read these before implementation when relevant:

| File | Content |
|------|---------|
| [architecture.md](.claude/project/architecture.md) | Stack, repo structure, API endpoints, env vars |
| [conventions.md](.claude/project/conventions.md) | Naming, component patterns, API layer rules |
| [e2e.md](.claude/project/e2e.md) | Playwright runtime, testing API, and E2E reference paths |
| [api-conventions.md](.claude/rules/backend/api-conventions.md) | Backend response shape and Prisma import rules |
| [tailwind-tokens.md](.claude/rules/frontend/tailwind-tokens.md) | Frontend brand color tokens and UI constraints |

## Repository Structure

```text
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
├── .agents/skills/         # Codex repo skills; symlinked to .claude/skills/
├── .codex/                 # Codex-native config, hooks, agents, rules
└── .claude/project/        # Project-specific reference docs
```

## Quick Reference

| Resource | Location |
|----------|----------|
| API base | `http://localhost:3000/api` |
| DB schema | `backend/prisma/schema.prisma` |
| API functions | `frontend/src/lib/api.ts` |
| Shared types | `frontend/src/lib/types.ts` |

## Critical Rules

- Always check `.claude/project/` for project-specific context before implementation.
- For E2E or Playwright work, read `.claude/project/e2e.md` before changing tests or test runtime.
- Do not run dev servers, build commands, or start the project without explicit user approval.
- Prefer existing packages and established project patterns over custom reinvention.
- Verify facts from the codebase, docs, or tools before acting.
- Keep code comments sparse; only add them for non-obvious logic.
- Solve root causes, not one-off symptoms.
- Use the repo skills in `.agents/skills/` when a task clearly matches them.
- If the user explicitly asks for delegation or parallel agent work, use the custom Codex agent `the-mechanic`.

## Backend Rules

- API responses are plain JSON. Do not wrap responses in `{ success, data, error }`.
- Import the shared Prisma client from `backend/src/server.ts`; do not instantiate `PrismaClient()` in controllers.
- Keep controller success responses as direct data and errors as `{ error: "message" }`.

## Frontend Rules

- Use the custom Tailwind tokens from `.claude/rules/frontend/tailwind-tokens.md` instead of generic palette choices.
- Keep all HTTP calls in `frontend/src/lib/api.ts`; do not call Axios directly in pages or components.
- Put shared types in `frontend/src/lib/types.ts`.

## E2E / Playwright

- Canonical config: [playwright.config.ts](playwright.config.ts)
- Current isolated runtime: frontend `4173`, backend `3300`
- Backend test entrypoint: `npm run dev:test:backend --prefix backend`
- Canonical test API surface: [backend/src/modules/testing/infra/testing.controller.ts](backend/src/modules/testing/infra/testing.controller.ts) and [backend/src/modules/testing/infra/testing.routes.ts](backend/src/modules/testing/infra/testing.routes.ts)
- Primary command: `npm run test:e2e`
- When adding new specs or helpers, extend `tests/e2e/` and reuse `tests/e2e/support/` instead of duplicating setup logic
