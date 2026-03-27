# Backend Module Structure

## Directory Layout

```
backend/src/
├── server.ts                    # Express app, PrismaClient export, route registration
├── config/                      # App configuration
├── core/                        # Shared abstractions (base classes, interfaces)
├── shared/                      # Shared utilities
└── modules/
    └── {feature}/
        ├── domain/              # Entities, value objects, domain logic
        ├── infra/
        │   ├── {feature}.controller.ts   # HTTP handler class
        │   └── {feature}.routes.ts       # Express Router
        └── useCases/            # Application use cases (orchestration)
```

## Adding a New Feature

1. Create `src/modules/{feature}/infra/{feature}.controller.ts`
2. Create `src/modules/{feature}/infra/{feature}.routes.ts`
3. Register in `server.ts`: `app.use('/api/{feature}', {feature}Routes)`
4. Add Prisma model in `prisma/schema.prisma`
5. Run: `npx prisma db push && npx prisma generate`

## Existing Modules

| Module | Routes prefix | Prisma model |
|--------|--------------|--------------|
| `pet` | `/api/pets` | `Pet` |
| `inventory` | `/api/inventory` | `Inventory` |
| `schedule` | `/api/schedules` | `HealthSchedule` |
