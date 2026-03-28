import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { PrismaClient } from '@prisma/client';

export const prisma = new PrismaClient();

import { petRoutes } from './modules/pet/infra/pet.routes';
import { inventoryRoutes } from './modules/inventory/infra/inventory.routes';
import { scheduleRoutes } from './modules/schedule/infra/schedule.routes';
import { testingRoutes } from './modules/testing/infra/testing.routes';

dotenv.config();

const app = express();
const port = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

app.use('/api/pets', petRoutes);
app.use('/api/inventory', inventoryRoutes);
app.use('/api/schedules', scheduleRoutes);

if (process.env.ENABLE_TESTING_API === 'true') {
  app.use('/api/testing', testingRoutes);
}

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok' });
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
