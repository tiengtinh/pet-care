import { Router } from 'express';
import { ScheduleController } from './schedule.controller';

export const scheduleRoutes = Router();
const controller = new ScheduleController();

scheduleRoutes.post('/', controller.create.bind(controller));
scheduleRoutes.get('/upcoming', controller.getUpcoming.bind(controller));
scheduleRoutes.get('/pet/:petId', controller.getByPet.bind(controller));
