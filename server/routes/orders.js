import { Router } from "express";
import { prisma, httpError, fail } from "../lib/prisma.js";
import { protect, adminOnly } from "../middleware/auth.js";

const router = Router();
const STATUSES = ["Pending", "Processing", "Shipped", "Delivered", "Cancelled"];

// Place an order. Prices come from the database, and stock is reduced inside one
// transaction, so two buyers can never both take the last item.
router.post("/", protect, async (req, res) => {
  try {
    const { items, shipping, paymentMethod } = req.body;
    if (!Array.isArray(items) || !items.length) throw httpError(400, "Your cart is empty");
    if (!shipping?.name || !shipping?.phone || !shipping?.address)
      throw httpError(400, "Please fill in all shipping details");

    const order = await prisma.$transaction(async (tx) => {
      let total = 0;
      const orderItems = [];
      for (const it of items) {
        const qty = Math.floor(Number(it.qty));
        if (!(qty > 0)) throw httpError(400, "Invalid quantity");
        const p = await tx.product.findUnique({ where: { id: String(it.product) } });
        if (!p) throw httpError(400, "A product in your cart no longer exists");
        const r = await tx.product.updateMany({
          where: { id: p.id, stock: { gte: qty } },
          data: { stock: { decrement: qty } },
        });
        if (r.count === 0) throw httpError(400, `Only ${p.stock} left of ${p.name}`);
        orderItems.push({ productId: p.id, name: p.name, image: p.image, price: p.price, qty });
        total += p.price * qty;
      }
      const card = paymentMethod === "card";
      return tx.order.create({
        data: {
          userId: req.user.id,
          total,
          shipping: { name: shipping.name, phone: shipping.phone, address: shipping.address },
          paymentMethod: card ? "card" : "cod",
          isPaid: card, // demo payment, see README for Stripe
          items: { create: orderItems },
        },
        include: { items: true },
      });
    });
    res.status(201).json(order);
  } catch (e) { fail(res, e); }
});

router.get("/mine", protect, async (req, res) => {
  try {
    res.json(await prisma.order.findMany({ where: { userId: req.user.id }, include: { items: true }, orderBy: { createdAt: "desc" } }));
  } catch (e) { fail(res, e); }
});

router.get("/", protect, adminOnly, async (req, res) => {
  try {
    res.json(await prisma.order.findMany({
      include: { items: true, user: { select: { name: true, email: true } } },
      orderBy: { createdAt: "desc" },
    }));
  } catch (e) { fail(res, e); }
});

router.put("/:id/status", protect, adminOnly, async (req, res) => {
  try {
    const status = req.body.status;
    if (!STATUSES.includes(status)) throw httpError(400, "Invalid status");
    const updated = await prisma.$transaction(async (tx) => {
      const order = await tx.order.findUnique({ where: { id: req.params.id }, include: { items: true } });
      if (!order) throw httpError(404, "Order not found");
      if (status === "Cancelled" && order.status !== "Cancelled")
        for (const it of order.items)
          if (it.productId) await tx.product.update({ where: { id: it.productId }, data: { stock: { increment: it.qty } } });
      return tx.order.update({
        where: { id: order.id },
        data: { status, ...(status === "Delivered" && { isPaid: true }) },
        include: { items: true },
      });
    });
    res.json(updated);
  } catch (e) { fail(res, e); }
});

export default router;
