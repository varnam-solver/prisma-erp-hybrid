// src/routes/sale.routes.ts

import { Router } from 'express';
import { createNewSale } from '../controllers/sale.controller';
import { protect } from '../middleware/auth.middleware';

const router = Router();

router.post('/sales', protect, createNewSale);

export default router;
