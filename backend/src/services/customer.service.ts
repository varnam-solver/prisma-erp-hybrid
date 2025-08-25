// src/services/customer.service.ts

import { PrismaClient } from '../../generated/prisma';
const prisma = new PrismaClient();

/**
 * Gets a list of all customers for a specific pharmacy.
 * @param tenantId The ID of the pharmacy.
 */
export const getAllCustomersByTenant = async (tenantId: string) => {
  return await prisma.customers.findMany({
    where: {
      tenant_id: tenantId,
    },
    orderBy: {
      name: 'asc',
    },
  });
};

/**
 * Creates a new customer for a specific pharmacy.
 * @param customerData The data for the new customer (name, phone, etc.).
 * @param tenantId The ID of the pharmacy.
 */
export const createCustomer = async (
  customerData: { name: string; phone?: string; address?: string },
  tenantId: string
) => {

  // Build the data object conditionally to satisfy 'exactOptionalPropertyTypes'
  const dataToCreate: {
    tenant_id: string;
    name: string;
    phone?: string;
    address?: string;
  } = {
    tenant_id: tenantId,
    name: customerData.name,
  };

  if (customerData.phone) {
    dataToCreate.phone = customerData.phone;
  }
  if (customerData.address) {
    dataToCreate.address = customerData.address;
  }

  return await prisma.customers.create({
    data: dataToCreate,
  });
};