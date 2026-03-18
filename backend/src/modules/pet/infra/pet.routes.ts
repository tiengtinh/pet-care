import { Router } from 'express';
import { PetController } from './pet.controller';

export const petRoutes = Router();
const controller = new PetController();

petRoutes.post('/', controller.create.bind(controller));
petRoutes.get('/', controller.getAll.bind(controller));
petRoutes.get('/:id', controller.getById.bind(controller));
