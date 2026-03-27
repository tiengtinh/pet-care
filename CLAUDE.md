# CLAUDE.md

This file provides guidance to Claude Code when working with this repository.

## Project Overview

PetCare is a full-stack pet care management app for tracking pets, food inventory (with automatic remaining-days forecast), and health schedules (vaccines, deworming, water changes).

## Project References

| File | Content |
|------|---------|
| [architecture.md](.claude/project/architecture.md) | Stack, repo structure, API endpoints, env vars |
| [conventions.md](.claude/project/conventions.md) | Naming, component patterns, API layer rules |

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

**IMPORTANT:** Activate `frontend-development` skill for frontend work, `express-prisma` for backend work, `docker` for container work.

**IMPORTANT:** Project rules (`.claude/rules/`) take precedence over skill guidelines.
