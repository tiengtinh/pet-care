import { Router } from 'express';
import { InventoryController } from './inventory.controller';

export const inventoryRoutes = Router();
const controller = new InventoryController();

inventoryRoutes.post('/', controller.create.bind(controller));
inventoryRoutes.get('/pet/:petId', controller.getByPet.bind(controller));
inventoryRoutes.put('/:id', controller.update.bind(controller));
