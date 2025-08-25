// src/controllers/medicine.controller.ts

import { Request, Response } from 'express';
import * as MedicineService from '../services/medicine.service';

// This will be replaced with real authentication later
const MOCK_TENANT_ID = '6531932a-804b-4f0a-9f68-ed851aa11178';

export const searchMedicines = async (req: Request, res: Response) => {
  try {
    // The search term will come from a URL query parameter (e.g., /api/medicines/search?q=para)
    const searchTerm = req.query.q as string;

    if (!searchTerm) {
      return res.status(400).json({ error: 'Search term (q) is required.' });
    }

    const results = await MedicineService.searchMedicinesByDrug(searchTerm, MOCK_TENANT_ID);
    res.json(results);

  } catch (error: any) {
    console.error('Search failed:', error);
    res.status(500).json({ error: 'An error occurred during the search.' });
  }
};