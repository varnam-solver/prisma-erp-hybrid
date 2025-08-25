// src/routes/customer.routes.ts

import { Router } from 'express';
import {
  getAllCustomers,
  createNewCustomer,
} from '../controllers/customer.controller';

const router = Router();

// Route to GET all customers for a tenant
router.get('/customers', getAllCustomers);

// Route to POST (create) a new customer
router.post('/customers', createNewCustomer);

export default router;