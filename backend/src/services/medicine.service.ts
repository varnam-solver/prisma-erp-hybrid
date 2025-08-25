// src/services/medicine.service.ts

import { PrismaClient } from '../../generated/prisma';
const prisma = new PrismaClient();

/**
 * Searches for medicines based on a generic drug name and returns a detailed
 * list of available batches with their current stock.
 * @param searchTerm The drug name to search for (e.g., "para").
 * @param tenantId The ID of the pharmacy performing the search.
 */
export const searchMedicinesByDrug = async (searchTerm: string, tenantId: string) => {
  // 1. Find all drugs that match the search term for this tenant.
  const matchingDrugs = await prisma.drugs.findMany({
    where: {
      tenant_id: tenantId,
      name: {
        contains: searchTerm,
        mode: 'insensitive', // Makes the search case-insensitive
      },
    },
    select: {
      id: true, // We only need the IDs of the matching drugs
    },
  });

  if (matchingDrugs.length === 0) {
    return []; // No drugs found, so no medicines to return
  }

  const drugIds = matchingDrugs.map(drug => drug.id);

  // 2. Find all medicines that contain any of the matching drugs.
  const medicines = await prisma.medicines.findMany({
    where: {
      tenant_id: tenantId,
      // Find medicines that have a composition entry linking to one of our drug IDs
      medicine_compositions: {
        some: {
          drug_id: {
            in: drugIds,
          },
        },
      },
    },
    include: {
      // 3. For each medicine, include all of its batches.
      medicine_batches: {
        include: {
          // 4. For each batch, include all its inventory transactions to calculate stock.
          inventory_transactions: {
            select: {
              unit_quantity_change: true,
            },
          },
        },
      },
      // Also include the full composition details for display
      medicine_compositions: {
        include: {
          drugs: true,
        },
      },
    },
  });

  // 5. Process the results to calculate stock and format the response.
  const results = medicines.map(medicine => {
    const availableBatches = medicine.medicine_batches
      .map(batch => {
        // Calculate current stock by summing up all transactions in the ledger
        const currentStock = batch.inventory_transactions.reduce(
          (sum, transaction) => sum + transaction.unit_quantity_change,
          0
        );

        return {
          batchId: batch.id,
          batchNumber: batch.batch_number,
          expiryDate: batch.expiry_date,
          pricePerUnit: batch.price_per_unit,
          stockInUnits: currentStock,
        };
      })
      .filter(batch => batch.stockInUnits > 0); // Only include batches that are in stock

    // Combine the composition into a readable string
    const composition = medicine.medicine_compositions
      .map(comp => `${comp.drugs.name} (${comp.strength})`)
      .join(', ');

    return {
      medicineId: medicine.id,
      brandName: medicine.name,
      manufacturer: medicine.manufacturer,
      form: medicine.form,
      composition: composition,
      gstRate: medicine.gst_rate,
      batches: availableBatches,
    };
  }).filter(medicine => medicine.batches.length > 0); // Only include medicines that have at least one batch in stock

  return results;
};