// src/routes/supplier.routes.ts

import { Router } from 'express';
import {
  getAllSuppliers,
  createNewSupplier,
} from '../controllers/supplier.controller';

const router = Router();

// Route to GET all suppliers for a tenant
router.get('/suppliers', getAllSuppliers);

// Route to POST (create) a new supplier
router.post('/suppliers', createNewSupplier);

export default router;