import { NextFunction, Request, Response, Router } from 'express';
import { TestingController } from './testing.controller';

export const testingRoutes = Router();
const controller = new TestingController();

const isLocalRequest = (req: Request) => {
  const address = req.socket.remoteAddress ?? req.ip;
  return (
    address === '127.0.0.1' ||
    address === '::1' ||
    address === '::ffff:127.0.0.1'
  );
};

testingRoutes.get('/health', (_req: Request, res: Response) => {
  res.json({ status: 'ok', testingApi: true });
});

testingRoutes.use((req: Request, res: Response, next: NextFunction) => {
  const expectedApiKey = process.env.TESTING_API_KEY;
  const providedApiKey = req.header('x-testing-api-key');

  if (!expectedApiKey || providedApiKey !== expectedApiKey || !isLocalRequest(req)) {
    return res.status(403).json({ error: 'Testing API is locked down' });
  }

  next();
});

testingRoutes.post('/reset', controller.reset.bind(controller));
testingRoutes.post('/seed/pet', controller.seedPet.bind(controller));
testingRoutes.post('/seed/inventory', controller.seedInventory.bind(controller));
testingRoutes.post('/seed/schedule', controller.seedSchedule.bind(controller));
