// src/routes/supplier.routes.ts

import { Router } from 'express';
import { getAllSuppliers, createNewSupplier } from '../controllers/supplier.controller';
import { protect } from '../middleware/auth.middleware';

const router = Router();

router.get('/', protect, getAllSuppliers);
router.post('/', protect, createNewSupplier);

export default router;
