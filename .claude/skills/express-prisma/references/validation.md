# Validation with Zod

## At Controller Boundaries

Validate `req.body` before using it:

```typescript
import { z } from 'zod';

const createPetSchema = z.object({
  name: z.string().min(1),
  type: z.string().min(1),
  breed: z.string().optional(),
  weight: z.number().positive().optional(),
  dob: z.string().datetime().optional(),
});

async create(req: Request, res: Response) {
  const result = createPetSchema.safeParse(req.body);
  if (!result.success) {
    return res.status(400).json({ error: result.error.message });
  }
  const { name, type, breed, weight, dob } = result.data;
  // ... proceed with validated data
}
```

## Error Responses

- Validation failure: `400` + `{ error: string }`
- Not found: `404` + `{ error: 'X not found' }`
- Server error: `500` + `{ error: 'Failed to ...' }`
