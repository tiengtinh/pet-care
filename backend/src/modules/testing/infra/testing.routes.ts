import { Router } from 'express';
import { TestingController } from './testing.controller';

export const testingRoutes = Router();
const controller = new TestingController();

testingRoutes.post('/reset', controller.reset.bind(controller));
testingRoutes.post('/seed/pet', controller.seedPet.bind(controller));
testingRoutes.post('/seed/inventory', controller.seedInventory.bind(controller));
testingRoutes.post('/seed/schedule', controller.seedSchedule.bind(controller));
