// src/controllers/customer.controller.ts

import { Response } from 'express';
import * as CustomerService from '../services/customer.service';
import { AuthenticatedRequest } from '../middleware/auth.middleware';

export const getAllCustomers = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const tenantId = req.user?.tenantId;
    if (!tenantId) return res.status(401).json({ error: 'Tenant ID missing.' });

    const customers = await CustomerService.getAllCustomersByTenant(tenantId);
    res.json(customers);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to fetch customers' });
  }
};

export const createNewCustomer = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const tenantId = req.user?.tenantId;
    if (!tenantId) return res.status(401).json({ error: 'Tenant ID missing.' });
    
    const newCustomer = await CustomerService.createCustomer(req.body, tenantId);
    res.status(201).json(newCustomer);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to create customer' });
  }
};
