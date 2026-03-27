import { Request, Response } from 'express';
import { prisma } from '../../../server';

export class ScheduleController {
  async create(req: Request, res: Response) {
    try {
      const { petId, eventType, eventName, lastDate, nextDueDate } = req.body;
      const schedule = await prisma.healthSchedule.create({
        data: { 
          petId, 
          eventType, 
          eventName, 
          lastDate: lastDate ? new Date(lastDate) : null,
          nextDueDate: new Date(nextDueDate) 
        }
      });
      res.status(201).json(schedule);
    } catch (error) {
      res.status(500).json({ error: 'Failed to create schedule' });
    }
  }

  async getUpcoming(req: Request, res: Response) {
    try {
      const today = new Date();
      const nextWeek = new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000);
      const thirtyDaysAgo = new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000);

      const schedules = await prisma.healthSchedule.findMany({
        where: {
          nextDueDate: {
            gte: thirtyDaysAgo,
            lte: nextWeek
          }
        },
        orderBy: { nextDueDate: 'asc' },
        include: { pet: { select: { name: true, type: true } } }
      });
      res.json(schedules);
    } catch (error) {
       res.status(500).json({ error: 'Failed to fetch upcoming schedules' });
    }
  }

  async getByPet(req: Request, res: Response) {
    try {
      const petId = Array.isArray(req.params.petId)
        ? req.params.petId[0]
        : req.params.petId;

      const schedules = await prisma.healthSchedule.findMany({
        where: { petId },
        orderBy: { nextDueDate: 'asc' }
      });
      res.json(schedules);
    } catch (error) {
      res.status(500).json({ error: 'Failed to fetch schedules' });
    }
  }
}
