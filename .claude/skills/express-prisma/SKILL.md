---
name: express-prisma
description: "Express 5 + Prisma + TypeScript backend patterns. Use this skill when creating controllers, routes, middleware, Prisma queries, or any backend code in the backend/ directory. Covers module structure, request handling, database access, error handling, and Zod validation."
---

# Express + Prisma Backend

Patterns for building REST APIs with Express 5, Prisma ORM, and TypeScript.

## Core Principles

### 1. Feature-Based Modules
Each domain lives in `src/modules/{feature}/` with three layers:
- `infra/` — HTTP layer (controller, routes)
- `domain/` — Business entities and logic
- `useCases/` — Application use cases (orchestration)

### 2. Controller Pattern
Controllers are classes with async methods bound to routes. Each method: validates input → calls Prisma → returns JSON. Always return `{ error: string }` on failure.

### 3. Prisma as Data Layer
Import the shared `prisma` instance from `server.ts`. Never create multiple PrismaClient instances.

### 4. Zod for Validation
Use Zod at controller boundaries to validate `req.body` before touching Prisma.

## Quick Start

1. **New feature** → create `src/modules/{feature}/infra/{feature}.controller.ts` + `{feature}.routes.ts`
2. **Register routes** → add `app.use('/api/{feature}', {feature}Routes)` in `server.ts`
3. **Schema change** → edit `prisma/schema.prisma`, run `npx prisma db push && npx prisma generate`
4. **Match existing patterns** → read an existing controller before writing a new one

## References

| Topic | Entry Point |
|-------|-------------|
| **Module Structure** | [structure.md](./references/structure.md) |
| **Controller Patterns** | [controllers.md](./references/controllers.md) |
| **Prisma Patterns** | [prisma.md](./references/prisma.md) |
| **Validation** | [validation.md](./references/validation.md) |

## Official Resources

| Library | Documentation |
|---------|--------------|
| Express 5 | https://expressjs.com/en/5x/api.html |
| Prisma | https://www.prisma.io/docs |
| Zod | https://zod.dev |
