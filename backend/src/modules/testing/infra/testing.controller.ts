import { Request, Response } from 'express';
import { prisma } from '../../../server';

export class TestingController {
  async reset(_req: Request, res: Response) {
    try {
      await prisma.healthSchedule.deleteMany();
      await prisma.inventory.deleteMany();
      await prisma.pet.deleteMany();

      res.json({ ok: true });
    } catch (error) {
      res.status(500).json({ error: 'Failed to reset test data' });
    }
  }

  async seedPet(req: Request, res: Response) {
    try {
      const pet = await prisma.pet.create({
        data: {
          name: req.body.name,
          type: req.body.type,
          breed: req.body.breed,
          weight: req.body.weight,
          imageUrl: req.body.imageUrl,
          dob: req.body.dob ? new Date(req.body.dob) : undefined,
        },
      });

      res.status(201).json(pet);
    } catch (error) {
      res.status(500).json({ error: 'Failed to seed pet' });
    }
  }

  async seedInventory(req: Request, res: Response) {
    try {
      const inventory = await prisma.inventory.create({
        data: {
          petId: req.body.petId,
          foodName: req.body.foodName,
          totalWeightGrams: req.body.totalWeightGrams,
          dailyPortionGrams: req.body.dailyPortionGrams,
          lastUpdatedDate: req.body.lastUpdatedDate
            ? new Date(req.body.lastUpdatedDate)
            : new Date(),
        },
      });

      res.status(201).json(inventory);
    } catch (error) {
      res.status(500).json({ error: 'Failed to seed inventory' });
    }
  }

  async seedSchedule(req: Request, res: Response) {
    try {
      const schedule = await prisma.healthSchedule.create({
        data: {
          petId: req.body.petId,
          eventType: req.body.eventType,
          eventName: req.body.eventName,
          nextDueDate: new Date(req.body.nextDueDate),
          lastDate: req.body.lastDate ? new Date(req.body.lastDate) : null,
        },
      });

      res.status(201).json(schedule);
    } catch (error) {
      res.status(500).json({ error: 'Failed to seed schedule' });
    }
  }
}
