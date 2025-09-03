import { Request, Response } from "express";
import prisma from "../config/db";
import NodeCache from "node-cache";

const dashboardCache = new NodeCache({ stdTTL: 30 }); // 30 seconds

export const getDashboardData = async (req: Request, res: Response) => {
  console.log("req.user in dashboard:", (req as any).user); // <-- Add this line

  const tenantId = (req as any).user?.tenantId;
  if (!tenantId) {
    return res.status(401).json({ error: "Unauthorized: tenantId missing" });
  }

  const pharmacy = await prisma.tenants.findUnique({
    where: { id: tenantId },
    select: { name: true },
  });
  if (!pharmacy) {
    return res.status(404).json({ error: "Pharmacy not found for this tenant." });
  }

  // Use tenant-specific cache key
  const cacheKey = `dashboard_${tenantId}`;
  const cached = dashboardCache.get(cacheKey);
  if (cached) return res.json(cached);

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

    // 2. Get stock for all batches in one query
    const batchIds = medicines.flatMap((med) => med.medicine_batches.map((b) => b.id));
    const batchStocks = await prisma.inventory_transactions.groupBy({
      by: ["batch_id"],
      where: { batch_id: { in: batchIds } },
      _sum: { unit_quantity_change: true },
    });

    // 3. Map batch stock to medicine
    const batchStockMap = new Map();
    batchStocks.forEach((bs) => {
      batchStockMap.set(bs.batch_id, bs._sum.unit_quantity_change ?? 0);
    });

    const minimum = 50;
    const lowStockItems: Array<{ name: string; current: number; minimum: number; urgency: string }> = [];

    for (const med of medicines) {
      const totalStock = med.medicine_batches.reduce(
        (sum, b) => sum + (batchStockMap.get(b.id) || 0),
        0
      );
      if (totalStock < minimum) {
        lowStockItems.push({
          name: med.name,
          current: totalStock,
          minimum,
          urgency: totalStock < minimum / 2 ? "high" : "medium",
        });
      }
      if (lowStockItems.length >= 10) break; // Only top 10
    }

    const dashboard = {
      pharmacyName: pharmacy?.name ?? "Your Pharmacy",
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
    };

    dashboardCache.set(cacheKey, dashboard);
    res.json(dashboard);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch dashboard data" });
  }
};