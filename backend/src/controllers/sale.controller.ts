// src/controllers/sale.controller.ts

import { Response } from 'express';
import * as SaleService from '../services/sale.service';
import { AuthenticatedRequest } from '../middleware/auth.middleware';

export const createNewSale = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const tenantId = req.user?.tenantId;
    const staffId = req.user?.staffId;

    if (!tenantId || !staffId) {
      return res.status(401).json({ error: 'User authentication details missing.' });
    }

    const sale = await SaleService.createSale(req.body, tenantId, staffId);
    res.status(201).json(sale);
  } catch (error: any) {
    console.error(error);
    res.status(400).json({ error: error.message });
  }
};
