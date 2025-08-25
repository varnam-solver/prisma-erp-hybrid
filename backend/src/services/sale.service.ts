// src/services/sale.service.ts

import { PrismaClient, Prisma } from '../../generated/prisma';
const prisma = new PrismaClient();

// Define the structure for items in the sale request
interface SaleItemInput {
  medicine_id: string;
  quantity_in_units: number;
}

/**
 * Creates a new sale, including all line items and inventory transactions.
 * This is wrapped in a database transaction to ensure data integrity.
 * @param saleData The data for the new sale.
 * @param tenantId The ID of the pharmacy making the sale.
 * @param staffId The ID of the staff member making the sale.
 */
export const createSale = async (
  saleData: { customer_id: string; items: SaleItemInput[] },
  tenantId: string,
  staffId: string
) => {
  const { customer_id, items } = saleData;

  return prisma.$transaction(async (tx) => {
    let subTotal = new Prisma.Decimal(0.0);
    let totalGst = new Prisma.Decimal(0.0);
    const saleItemsToCreate = [];
    const inventoryTransactionsToCreate = [];

    for (const item of items) {
      const medicine = await tx.medicines.findUnique({
        where: { id: item.medicine_id },
      });
      if (!medicine) {
        throw new Error(`Medicine with ID ${item.medicine_id} not found.`);
      }

      const batches = await tx.medicine_batches.findMany({
        where: { medicine_id: item.medicine_id, tenant_id: tenantId },
        include: { inventory_transactions: true },
      });

      const batchesWithStock = batches
        .map(batch => ({
          ...batch,
          currentStock: batch.inventory_transactions.reduce((sum, t) => sum + t.unit_quantity_change, 0),
        }))
        .filter(batch => batch.currentStock >= item.quantity_in_units);

      // --- THIS IS THE FIX ---
      // 1. Sort the available batches first
      const sortedBatches = batchesWithStock.sort((a, b) => a.expiry_date.getTime() - b.expiry_date.getTime());
      
      // 2. Select the first batch from the sorted list
      const batchToSellFrom = sortedBatches[0];

      // 3. Now, explicitly check if that batch exists.
      if (!batchToSellFrom) {
        // If it doesn't, the array was empty. Throw the error.
        throw new Error(`Insufficient stock for medicine: ${medicine.name}.`);
      }
      // --- END OF FIX ---

      // From this point on, TypeScript knows `batchToSellFrom` is not undefined.
      const lineItemTotal = batchToSellFrom.price_per_unit.mul(item.quantity_in_units);
      const gstRate = medicine.gst_rate.div(100);
      const lineItemGst = lineItemTotal.mul(gstRate);
      const cgst = lineItemGst.div(2);
      const sgst = lineItemGst.div(2);

      subTotal = subTotal.add(lineItemTotal);
      totalGst = totalGst.add(lineItemGst);
      
      saleItemsToCreate.push({
        batch_id: batchToSellFrom.id,
        quantity_in_units: item.quantity_in_units,
        unit_price: batchToSellFrom.price_per_unit,
        gst_rate: medicine.gst_rate,
        cgst_amount: cgst,
        sgst_amount: sgst,
      });

      inventoryTransactionsToCreate.push({
        batch_id: batchToSellFrom.id,
        reference_id: null,
        transaction_type: 'SALE',
        unit_quantity_change: -item.quantity_in_units,
      });
    }

    const sale = await tx.sales.create({
      data: {
        tenant_id: tenantId,
        customer_id: customer_id,
        staff_id: staffId,
        sub_total: subTotal,
        total_gst_amount: totalGst,
        total_amount: subTotal.add(totalGst),
      },
    });

    await tx.sale_items.createMany({
      data: saleItemsToCreate.map(si => ({ ...si, sale_id: sale.id })),
    });
    
    await tx.inventory_transactions.createMany({
        data: inventoryTransactionsToCreate.map(it => ({
            ...it,
            tenant_id: tenantId,
            reference_id: sale.id
        }))
    });

    return sale;
  });
};