---
name: frontend-development
description: "Frontend implementation patterns, conventions, and tooling. Use this skill when creating components, building pages, implementing forms, fetching data, styling UI, organizing frontend code, or configuring frontend tooling (ESLint, Prettier, linting, formatting). Covers file structure, component patterns, state management, data fetching, and code quality tools."
---

# Frontend Development

Active workflow knowledge for building frontend applications with React, TypeScript, Vite, Tailwind, Zustand, React Hook Form, Zod, and Axios.

## Core Principles

### 1. Colocation Over Centralization
Keep code close to where it's used. Types, hooks, and utilities that serve one feature live in that feature's directory. Only truly shared code goes in global directories.

### 2. Searchable, Specific Naming
Every file should be findable with a single grep. Use `pet-form.tsx` not `form.tsx`. Use `pet-types.ts` not `types.ts`. Generic names create needle-in-haystack problems at scale.

### 3. Composition Over Customization
Prefer composing existing components over adding props/variants. Build up from primitives rather than configuring monoliths.

### 4. Data Flows Down, Events Flow Up
Fetch data at the page level and pass as props. Components handle interactions and call API functions. Keep pages as data-fetching orchestrators, components as rendering units.

## Quick Start

1. **Check file structure first** — This project is plain React (Vite), no Next.js
2. **Identify the feature boundary** — Which page/feature does this work belong to?
3. **Name files specifically** — Would grep find this file uniquely?
4. **Match existing patterns** — Look at 2-3 similar files before creating new ones

## References

| Topic | Entry Point |
|-------|-------------|
| **Conventions** | [conventions.md](./references/conventions.md) |
| **React** | [overview.md](./references/react/overview.md) |
| **TypeScript** | [typescript.md](./references/typescript.md) |
| **Tailwind** | [tailwind.md](./references/tailwind.md) |
| **Data Fetching (Axios)** | [axios.md](./references/data-fetching/axios.md) |
| **Browser Testing** | Use browser skill to verify frontend work in a real browser |

## Official Resources

For framework knowledge beyond project-specific patterns, use `/docs-seeker` or consult:

| Framework | Documentation |
|-----------|--------------|
| React | https://react.dev |
| TypeScript | https://www.typescriptlang.org/docs |
| Tailwind CSS | https://tailwindcss.com/docs |
| Vite | https://vitejs.dev/guide |
| React Router | https://reactrouter.com/en/main |
| Zustand | https://zustand.docs.pmnd.rs |
| React Hook Form | https://react-hook-form.com |
| Zod | https://zod.dev |
| Recharts | https://recharts.org/en-US/api |
