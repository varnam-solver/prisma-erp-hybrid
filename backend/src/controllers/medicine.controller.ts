// src/controllers/medicine.controller.ts

import { Request, Response } from "express";
import * as MedicineService from "../services/medicine.service";
import { AuthenticatedRequest } from '../middleware/auth.middleware';

export const searchMedicines = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const searchTerm = req.query.q as string;
    const tenantId = req.user?.tenantId; // Get tenantId from the logged-in user's token

    if (!tenantId) {
      return res.status(401).json({ error: 'Not authorized, tenant ID missing.' });
    }
    if (!searchTerm) {
      return res.status(400).json({ error: 'Search term (q) is required.' });
    }

    const results = await MedicineService.searchMedicinesByDrug(searchTerm, tenantId);
    res.json(results);

  } catch (error: any) {
    console.error('Search failed:', error);
    res.status(500).json({ error: 'An error occurred during the search.' });
  }
};

export const createNewMedicine = async (req: Request, res: Response) => {
  try {
    const tenantId = req.user?.tenantId;
    if (!tenantId) return res.status(401).json({ error: "Unauthorized" });
    const medicine = await MedicineService.createMedicine(req.body, tenantId);
    res.status(201).json(medicine);
  } catch (error: any) {
    res.status(400).json({ error: error.message || "Failed to create medicine" });
  }
};
