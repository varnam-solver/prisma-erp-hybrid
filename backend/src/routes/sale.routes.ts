// src/routes/sale.routes.ts

import { Router } from 'express';
import { createNewSale } from '../controllers/sale.controller';

const router = Router();

// Route to POST (create) a new sale
router.post('/sales', createNewSale);

export default router;