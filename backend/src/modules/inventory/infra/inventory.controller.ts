import { Request, Response } from 'express';
import { prisma } from '../../../server';

export class InventoryController {
  async create(req: Request, res: Response) {
    try {
      const { petId, foodName, totalWeightGrams, dailyPortionGrams } = req.body;
      const inventory = await prisma.inventory.create({
        data: { petId, foodName, totalWeightGrams, dailyPortionGrams }
      });
      res.status(201).json(inventory);
    } catch (error) {
      res.status(500).json({ error: 'Failed to create inventory' });
    }
  }

  async getByPet(req: Request, res: Response) {
    try {
      const petId = Array.isArray(req.params.petId)
        ? req.params.petId[0]
        : req.params.petId;

      const inventories = await prisma.inventory.findMany({
        where: { petId },
      });
      
      const enrichedInventories = inventories.map(inv => {
        const daysPassed = Math.floor((new Date().getTime() - inv.lastUpdatedDate.getTime()) / (1000 * 3600 * 24));
        const foodConsumed = daysPassed * inv.dailyPortionGrams;
        const remainingFood = Math.max(0, inv.totalWeightGrams - foodConsumed);
        const remainingDays = inv.dailyPortionGrams > 0 ? Math.floor(remainingFood / inv.dailyPortionGrams) : 0;
        
        return {
          ...inv,
          remainingWeightGrams: remainingFood,
          remainingDays: remainingDays
        };
      });
      
      res.json(enrichedInventories);
    } catch (error) {
      res.status(500).json({ error: 'Failed to fetch inventory' });
    }
  }

  async update(req: Request, res: Response) {
    try {
      const inventoryId = Array.isArray(req.params.id)
        ? req.params.id[0]
        : req.params.id;
      const { foodName, totalWeightGrams, dailyPortionGrams } = req.body;
      const updated = await prisma.inventory.update({
        where: { id: inventoryId },
        data: {
          foodName, 
          totalWeightGrams, 
          dailyPortionGrams,
          lastUpdatedDate: new Date()
        }
      });
      res.json(updated);
    } catch (error) {
       res.status(500).json({ error: 'Failed to update inventory' });
    }
  }
}
