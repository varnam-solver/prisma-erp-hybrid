// src/routes/medicine.routes.ts

import { Router } from 'express';
import { searchMedicines } from '../controllers/medicine.controller';

const router = Router();

// Defines the endpoint: GET /api/medicines/search?q=...
router.get('/medicines/search', searchMedicines);

export default router;