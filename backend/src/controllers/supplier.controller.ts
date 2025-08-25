// src/controllers/supplier.controller.ts

import { Request, Response } from 'express';
import * as SupplierService from '../services/supplier.service';

// This will be replaced with real authentication later
const MOCK_TENANT_ID = '6531932a-804b-4f0a-9f68-ed851aa11178';

// --- Controller to GET all suppliers ---
export const getAllSuppliers = async (req: Request, res: Response) => {
  try {
    const suppliers = await SupplierService.getAllSuppliersByTenant(MOCK_TENANT_ID);
    res.json(suppliers);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to fetch suppliers' });
  }
};

// --- Controller to POST (create) a new supplier ---
export const createNewSupplier = async (req: Request, res: Response) => {
  try {
    // The supplier data comes from the request body
    const newSupplier = await SupplierService.createSupplier(req.body, MOCK_TENANT_ID);
    res.status(201).json(newSupplier); // 201 status means "Created"
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to create supplier' });
  }
};