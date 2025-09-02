// src/routes/medicine.routes.ts

import { Router } from 'express';
import { searchMedicines, createNewMedicine } from '../controllers/medicine.controller';
import { protect } from '../middleware/auth.middleware';

const router = Router();

router.get('/medicines/search', protect, searchMedicines);

// Add this POST route for creating new medicine:
router.post('/medicines', protect, createNewMedicine);

export default router;
