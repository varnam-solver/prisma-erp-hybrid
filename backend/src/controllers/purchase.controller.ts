// src/controllers/purchase.controller.ts

import { Response } from 'express';
import * as PurchaseService from '../services/purchase.service';
import { AuthenticatedRequest } from '../middleware/auth.middleware';

export const createNewPurchase = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const tenantId = req.user?.tenantId;
    if (!tenantId) return res.status(401).json({ error: 'Tenant ID missing.' });

    const newPurchase = await PurchaseService.createPurchase(req.body, tenantId);
    res.status(201).json(newPurchase);
  } catch (error: any) {
    console.error(error);
    res.status(400).json({ error: error.message });
  }
};
