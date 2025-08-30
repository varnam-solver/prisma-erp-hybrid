import { Request, Response } from "express";
import prisma from "../config/db";

export const getDashboardData = async (req: Request, res: Response) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Sales today
    const salesToday = await prisma.sales.aggregate({
      _sum: { total_amount: true },
      where: { sale_date: { gte: today } },
    });

    // Total products
    const totalProducts = await prisma.medicines.count();

    // Active customers (with sales in last 30 days)
    const activeCustomers = await prisma.customers.count({
      where: {
        sales: {
          some: {
            sale_date: { gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) },
          },
        },
      },
    });

    // Recent sales
    const recentSales = await prisma.sales.findMany({
      orderBy: { sale_date: "desc" },
      take: 5,
      select: {
        id: true,
        customers: { select: { name: true } },
        total_amount: true,
        sale_date: true,
      },
    });

    // Low stock items: Find medicines with total stock < threshold
    // 1. Get all medicines with their batches
    const medicines = await prisma.medicines.findMany({
      select: {
        id: true,
        name: true,
        medicine_batches: {
          select: { id: true },
        },
      },
    });

    // 2. For each medicine, sum the stock from inventory_transactions
    const lowStockItems: Array<{ name: string; current: number; minimum: number; urgency: string }> = [];
    const minimum = 50; // You can adjust this threshold

    for (const med of medicines) {
      // Get all batch IDs for this medicine
      const batchIds = med.medicine_batches.map((b) => b.id);
      if (batchIds.length === 0) continue;

      // Sum all inventory_transactions for these batches
      const stockAgg = await prisma.inventory_transactions.aggregate({
        _sum: { unit_quantity_change: true },
        where: { batch_id: { in: batchIds } },
      });
      const current = stockAgg._sum.unit_quantity_change ?? 0;
      if (current < minimum) {
        lowStockItems.push({
          name: med.name,
          current,
          minimum,
          urgency: current < minimum / 2 ? "high" : "medium",
        });
      }
      if (lowStockItems.length >= 10) break; // Only top 10
    }

    res.json({
      statistics: {
        salesToday: salesToday._sum.total_amount || 0,
        totalProducts,
        activeCustomers,
      },
      lowStockItems,
      recentSales: recentSales.map((sale) => ({
        id: sale.id,
        customer: sale.customers?.name ?? "N/A",
        amount: sale.total_amount,
        status: "Completed", // Placeholder
        sale_date: sale.sale_date,
      })),
    });
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch dashboard data" });
  }
};