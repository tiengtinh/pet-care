import { Request, Response } from 'express';
import { prisma } from '../../../server';

export class PetController {
  async create(req: Request, res: Response) {
    try {
      const { name, type, breed, weight, imageUrl } = req.body;
      const dob = req.body.dob ? new Date(req.body.dob) : undefined;
      
      const pet = await prisma.pet.create({
        data: { name, type, breed, weight, imageUrl, dob }
      });
      res.status(201).json(pet);
    } catch (error) {
      console.error("Create Pet Error", error);
      res.status(500).json({ error: 'Failed to create pet' });
    }
  }

  async getAll(req: Request, res: Response) {
    try {
      const pets = await prisma.pet.findMany({
        orderBy: { createdAt: 'desc' }
      });
      res.json(pets);
    } catch (error) {
      res.status(500).json({ error: 'Failed to fetch pets' });
    }
  }

  async getById(req: Request, res: Response) {
    try {
      const petId = Array.isArray(req.params.id)
        ? req.params.id[0]
        : req.params.id;

      const pet = await prisma.pet.findUnique({
        where: { id: petId },
        include: { inventory: true, healthSchedules: true }
      });
      if (!pet) return res.status(404).json({ error: 'Pet not found' });
      res.json(pet);
    } catch (error) {
      res.status(500).json({ error: 'Failed to fetch pet' });
    }
  }
}
