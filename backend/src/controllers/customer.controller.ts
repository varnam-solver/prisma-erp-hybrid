// src/controllers/customer.controller.ts

import { Request, Response } from 'express';
import * as CustomerService from '../services/customer.service';

// This will be replaced with real authentication later
const MOCK_TENANT_ID = '6531932a-804b-4f0a-9f68-ed851aa11178';

/**
 * Handles the request to get all customers for a tenant.
 */
export const getAllCustomers = async (req: Request, res: Response) => {
  try {
    const customers = await CustomerService.getAllCustomersByTenant(MOCK_TENANT_ID);
    res.json(customers);
  } catch (error) {
    console.error('Failed to get customers:', error);
    res.status(500).json({ error: 'An error occurred while fetching customers.' });
  }
};

/**
 * Handles the request to create a new customer.
 */
export const createNewCustomer = async (req: Request, res: Response) => {
  try {
    // The customer data (name, phone, etc.) comes from the request body
    const newCustomer = await CustomerService.createCustomer(req.body, MOCK_TENANT_ID);
    res.status(201).json(newCustomer); // 201 status means "Created"
  } catch (error) {
    console.error('Failed to create customer:', error);
    res.status(500).json({ error: 'An error occurred while creating the customer.' });
  }
};