// src/routes/purchase.routes.ts

import { Router } from 'express';
import { createNewPurchase } from '../controllers/purchase.controller';
import { protect } from '../middleware/auth.middleware';

const router = Router();

router.post('/purchases', protect, createNewPurchase);

export default router;
