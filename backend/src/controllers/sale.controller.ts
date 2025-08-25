// src/controllers/sale.controller.ts

import { Request, Response } from 'express';
import * as SaleService from '../services/sale.service';

// These will be replaced with real authentication later
const MOCK_TENANT_ID = '6531932a-804b-4f0a-9f68-ed851aa11178';
const MOCK_STAFF_ID = '44901b31-9068-48d9-bcdb-09af01b9649e';

export const createNewSale = async (req: Request, res: Response) => {
  try {
    // The request body should contain customer_id and the list of items
    const sale = await SaleService.createSale(req.body, MOCK_TENANT_ID, MOCK_STAFF_ID);
    res.status(201).json(sale);
  } catch (error: any) {
    console.error(error);
    // Send back the specific error message (e.g., "Insufficient stock")
    res.status(400).json({ error: error.message });
  }
};