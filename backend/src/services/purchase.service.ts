// src/services/purchase.service.ts

import { PrismaClient, Prisma } from '../../generated/prisma';
const prisma = new PrismaClient();

// Define the structure for items in the purchase request
interface PurchaseItemInput {
  batch_id: string;
  quantity_in_packs: number;
  unit_purchase_price: number; // The price per single unit (e.g., per tablet)
}

/**
 * Creates a new purchase, including all line items and inventory transactions.
 * @param purchaseData The data for the new purchase.
 * @param tenantId The ID of the pharmacy making the purchase.
 */
export const createPurchase = async (
  purchaseData: { supplier_id: string; items: PurchaseItemInput[] },
  tenantId: string
) => {
  const { supplier_id, items } = purchaseData;

  return prisma.$transaction(async (tx) => {
    let totalAmount = new Prisma.Decimal(0.0);
    const purchaseItemsToCreate = [];
    const inventoryTransactionsToCreate = [];

    for (const item of items) {
      // 1. Get the batch details to find out units_per_pack
      const batch = await tx.medicine_batches.findUnique({
        where: { id: item.batch_id, tenant_id: tenantId },
      });

      if (!batch) {
        throw new Error(`Batch with ID ${item.batch_id} not found for this tenant.`);
      }

      const quantityInUnits = item.quantity_in_packs * batch.units_per_pack;
      const lineItemTotal = new Prisma.Decimal(item.unit_purchase_price).mul(quantityInUnits);
      totalAmount = totalAmount.add(lineItemTotal);

      // 2. Prepare the purchase_item record for creation
      purchaseItemsToCreate.push({
        batch_id: item.batch_id,
        quantity_in_packs: item.quantity_in_packs,
        quantity_in_units: quantityInUnits,
        unit_purchase_price: item.unit_purchase_price,
      });

      // 3. Prepare the inventory transaction to add stock to the ledger
      inventoryTransactionsToCreate.push({
        batch_id: item.batch_id,
        transaction_type: 'PURCHASE',
        unit_quantity_change: quantityInUnits, // Positive number to add stock
      });
    }

    // 4. Create the main 'purchases' record
    const purchase = await tx.purchases.create({
      data: {
        tenant_id: tenantId,
        supplier_id: supplier_id,
        total_amount: totalAmount,
      },
    });

    // 5. Create the related 'purchase_items' and 'inventory_transactions'
    await tx.purchase_items.createMany({
      data: purchaseItemsToCreate.map(pi => ({ ...pi, purchase_id: purchase.id })),
    });
    
    await tx.inventory_transactions.createMany({
        data: inventoryTransactionsToCreate.map(it => ({
            ...it,
            tenant_id: tenantId,
            reference_id: purchase.id
        }))
    });

    return purchase;
  });
};