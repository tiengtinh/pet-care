---
description: Backend API response conventions — plain JSON, no ApiResponse wrapper
paths:
  - "backend/src/**/*.ts"
---

## API Response Format

This project uses **plain JSON responses** — do NOT wrap in `{ success, data, error }`:

```typescript
// CORRECT — plain data
res.json(records);
res.status(201).json(newRecord);
res.status(404).json({ error: 'Pet not found' });
res.status(500).json({ error: 'Failed to create pet' });

// WRONG — do not use ApiResponse wrapper
res.json({ success: true, data: records });
```

## Prisma Import

Always import shared client from server.ts:
```typescript
import { prisma } from '../../../server';
```
Never create a new `PrismaClient()` in a controller or use case.
