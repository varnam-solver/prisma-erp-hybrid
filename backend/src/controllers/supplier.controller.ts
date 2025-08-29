// src/controllers/supplier.controller.ts

import { Response } from 'express';
import * as SupplierService from '../services/supplier.service';
import { AuthenticatedRequest } from '../middleware/auth.middleware';

export const getAllSuppliers = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const tenantId = req.user?.tenantId;
    if (!tenantId) return res.status(401).json({ error: 'Tenant ID missing.' });

    const suppliers = await SupplierService.getAllSuppliersByTenant(tenantId);
    res.json(suppliers);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to fetch suppliers' });
  }
};

export const createNewSupplier = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const tenantId = req.user?.tenantId;
    if (!tenantId) return res.status(401).json({ error: 'Tenant ID missing.' });

    const newSupplier = await SupplierService.createSupplier(req.body, tenantId);
    res.status(201).json(newSupplier);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to create supplier' });
  }
};
