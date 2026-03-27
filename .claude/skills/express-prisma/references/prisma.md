# Prisma Patterns

## Shared Client

Always import from server.ts — never instantiate a new PrismaClient:

```typescript
import { prisma } from '../../../server';
```

## Common Queries

```typescript
// Find all with ordering
await prisma.pet.findMany({ orderBy: { createdAt: 'desc' } });

// Find with relations
await prisma.pet.findUnique({
  where: { id },
  include: { inventory: true, healthSchedules: true }
});

// Create
await prisma.pet.create({ data: { name, type, breed } });

// Update
await prisma.inventory.update({
  where: { id },
  data: { foodName, totalWeightGrams, lastUpdatedDate: new Date() }
});
```

## Schema Changes

1. Edit `prisma/schema.prisma`
2. Run `npx prisma db push` (dev — applies schema to DB)
3. Run `npx prisma generate` (regenerates client types)

## Prisma Models

| Model | Key Fields |
|-------|-----------|
| `Pet` | id, name, type, breed, dob, weight, imageUrl |
| `Inventory` | id, petId, foodName, totalWeightGrams, dailyPortionGrams, lastUpdatedDate |
| `HealthSchedule` | id, petId, eventType, eventName, lastDate, nextDueDate |
