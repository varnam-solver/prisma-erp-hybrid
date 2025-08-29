// src/routes/customer.routes.ts

import { Router } from 'express';
import {
  getAllCustomers,
  createNewCustomer,
} from '../controllers/customer.controller';
import { protect } from '../middleware/auth.middleware';

const router = Router();

router.get('/customers', protect, getAllCustomers);
router.post('/customers', protect, createNewCustomer);

export default router;
