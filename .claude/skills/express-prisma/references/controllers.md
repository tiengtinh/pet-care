# Controller Patterns

## Standard Controller Shape

```typescript
import { Request, Response } from 'express';
import { prisma } from '../../../server';

export class FeatureController {
  async create(req: Request, res: Response) {
    try {
      const { field1, field2 } = req.body;
      const record = await prisma.feature.create({
        data: { field1, field2 }
      });
      res.status(201).json(record);
    } catch (error) {
      res.status(500).json({ error: 'Failed to create feature' });
    }
  }

  async getAll(req: Request, res: Response) {
    try {
      const records = await prisma.feature.findMany();
      res.json(records);
    } catch (error) {
      res.status(500).json({ error: 'Failed to fetch features' });
    }
  }
}
```

## Routes File

```typescript
import { Router } from 'express';
import { FeatureController } from './feature.controller';

export const featureRoutes = Router();
const controller = new FeatureController();

featureRoutes.post('/', controller.create.bind(controller));
featureRoutes.get('/', controller.getAll.bind(controller));
```

## Key Rules

- Always `.bind(controller)` in routes — Express loses `this` context otherwise
- Extract array params safely: `Array.isArray(req.params.id) ? req.params.id[0] : req.params.id`
- Status codes: 201 for creates, 200 for reads/updates, 404 for not found, 500 for errors
- Error response shape: `{ error: string }` (no ApiResponse wrapper in this project)
