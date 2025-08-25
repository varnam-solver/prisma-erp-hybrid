// src/services/supplier.service.ts

import { PrismaClient } from '../../generated/prisma';
const prisma = new PrismaClient();

/**
 * Gets a list of all suppliers for a specific pharmacy.
 * @param tenantId The ID of the pharmacy.
 */
export const getAllSuppliersByTenant = async (tenantId: string) => {
  return await prisma.suppliers.findMany({
    where: {
      tenant_id: tenantId,
    },
    orderBy: {
      name: 'asc',
    },
  });
};

/**
 * Creates a new supplier for a specific pharmacy.
 * @param supplierData The data for the new supplier.
 * @param tenantId The ID of the pharmacy.
 */
export const createSupplier = async (
  supplierData: {
    name: string;
    contact_person?: string;
    phone?: string;
    address?: string;
  },
  tenantId: string
) => {
  // Build the data object conditionally to handle optional fields
  const dataToCreate: {
    tenant_id: string;
    name: string;
    contact_person?: string;
    phone?: string;
    address?: string;
  } = {
    tenant_id: tenantId,
    name: supplierData.name,
  };

  if (supplierData.contact_person) {
    dataToCreate.contact_person = supplierData.contact_person;
  }
  if (supplierData.phone) {
    dataToCreate.phone = supplierData.phone;
  }
  if (supplierData.address) {
    dataToCreate.address = supplierData.address;
  }

  return await prisma.suppliers.create({
    data: dataToCreate,
  });
};