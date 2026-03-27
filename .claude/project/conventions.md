# Conventions

## Frontend

### File Naming
- Pages: `PascalCase` with `Page` suffix — `PetsPage.tsx`, `InventoryPage.tsx`
- Components: `PascalCase` — `ModalPanel.tsx`
- Utilities: `camelCase` — `api.ts`, `formatting.ts`, `types.ts`

### Component Patterns
- Pages are responsible for data fetching via `useEffect` + axios functions from `lib/api.ts`
- State for lists/loading/errors lives in pages, passed to child components as props
- Shared modal pattern: use `ModalPanel` component wrapper
- Forms use React Hook Form with Zod resolvers via `@hookform/resolvers/zod`

### Types
- All shared types live in `frontend/src/lib/types.ts`
- API payload types are named `{Entity}Payload` (e.g., `PetPayload`, `InventoryPayload`)
- API response types reflect what the backend returns (may include computed fields like `remainingDays`)

### API Calls
- All axios calls are functions exported from `frontend/src/lib/api.ts`
- Never call axios directly in pages/components — always use the `lib/api.ts` layer

## Backend

### Module Structure
- Each feature: `src/modules/{feature}/infra/{feature}.controller.ts` + `{feature}.routes.ts`
- Controllers are classes; methods bound in routes with `.bind(controller)`
- `domain/` and `useCases/` directories exist for future use — currently logic lives in controllers

### Prisma
- Single shared `prisma` instance exported from `src/server.ts`
- Import path from controller: `import { prisma } from '../../../server'`

### Error Handling
- All controller methods use try/catch
- Success: return data directly (`res.json(data)`)
- Error: `res.status(5xx).json({ error: 'descriptive message' })`

### Business Logic: Inventory Forecast
- `remainingWeightGrams` = `totalWeightGrams - (daysPassed * dailyPortionGrams)`
- `remainingDays` = `remainingWeightGrams / dailyPortionGrams`
- This is computed in `InventoryController.getByPet()`, not stored in DB
