// src/routes/medicine.routes.ts

import { Router } from 'express';
import { searchMedicines } from '../controllers/medicine.controller';
import { protect } from '../middleware/auth.middleware'; // 1. Import protect

const router = Router();

// 2. Add 'protect' before the controller.
// This ensures only logged-in users can access this route.
router.get('/medicines/search', protect, searchMedicines);

export default router;
