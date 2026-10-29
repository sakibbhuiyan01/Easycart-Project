import { Router } from "express";
import { prisma, fail } from "../lib/prisma.js";
import { protect, adminOnly } from "../middleware/auth.js";

const router = Router();

router.get("/stats", protect, adminOnly, async (req, res) => {
  try {
    const [users, products, orders, lowStock, revenue] = await Promise.all([
      prisma.user.count({ where: { role: "user" } }),
      prisma.product.count(),
      prisma.order.count(),
      prisma.product.findMany({ where: { stock: { lte: 5 } }, select: { id: true, name: true, stock: true }, orderBy: { stock: "asc" } }),
      prisma.order.aggregate({ _sum: { total: true }, where: { status: { not: "Cancelled" } } }),
    ]);
    res.json({ users, products, orders, lowStock, revenue: revenue._sum.total || 0 });
  } catch (e) { fail(res, e); }
});

export default router;
