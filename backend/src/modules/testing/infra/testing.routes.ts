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

testingRoutes.use((req: Request, res: Response, next: NextFunction) => {
  if (!isLocalRequest(req)) {
    return res.status(403).json({ error: 'Testing API is local-only' });
  }

  next();
});

testingRoutes.post('/reset', controller.reset.bind(controller));
testingRoutes.post('/seed/pet', controller.seedPet.bind(controller));
testingRoutes.post('/seed/inventory', controller.seedInventory.bind(controller));
testingRoutes.post('/seed/schedule', controller.seedSchedule.bind(controller));
