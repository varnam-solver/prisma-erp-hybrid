// src/routes/purchase.routes.ts

import { Router } from 'express';
import { createNewPurchase } from '../controllers/purchase.controller';

const router = Router();

// Route to POST (create) a new purchase
router.post('/purchases', createNewPurchase);

export default router;