// src/controllers/purchase.controller.ts

import { Request, Response } from 'express';
import * as PurchaseService from '../services/purchase.service';

// This will be replaced with real authentication later
const MOCK_TENANT_ID = '6531932a-804b-4f0a-9f68-ed851aa11178';

// --- Controller to POST (create) a new purchase ---
export const createNewPurchase = async (req: Request, res: Response) => {
  try {
    // The purchase data (supplier_id, items) comes from the request body
    const newPurchase = await PurchaseService.createPurchase(req.body, MOCK_TENANT_ID);
    res.status(201).json(newPurchase); // 201 status means "Created"
  } catch (error: any) {
    console.error(error);
    res.status(400).json({ error: error.message });
  }
};