import { Router } from "express";
import { prisma, httpError, fail } from "../lib/prisma.js";
import { protect, adminOnly } from "../middleware/auth.js";

const router = Router();
const withCategory = { category: { select: { id: true, name: true } } };

// Only these fields can be written by the admin form
const fromBody = (b) => {
  const d = {};
  for (const k of ["name", "brand", "image", "description"]) if (b[k] !== undefined) d[k] = String(b[k]);
  if (b.price !== undefined) d.price = Math.round(Number(b.price));
  if (b.stock !== undefined) d.stock = Math.round(Number(b.stock));
  if (b.category !== undefined) d.categoryId = b.category;
  if (Array.isArray(b.specs)) d.specs = b.specs.map(String);
  if ((d.price !== undefined && !(d.price >= 0)) || (d.stock !== undefined && !(d.stock >= 0)))
    throw httpError(400, "Price and stock must be 0 or more");
  return d;
};
const dbError = (e) => (e.code === "P2003" ? httpError(400, "Please choose a valid category") : e);

// GET /api/products?search=&category=&sort=&minPrice=&maxPrice=
router.get("/", async (req, res) => {
  try {
    const { search, category, sort, minPrice, maxPrice } = req.query;
    const where = {};
    if (search)
      where.OR = [
        { name: { contains: search, mode: "insensitive" } },
        { brand: { contains: search, mode: "insensitive" } },
      ];
    if (category) where.categoryId = category;
    if (minPrice || maxPrice) where.price = { ...(minPrice && { gte: +minPrice }), ...(maxPrice && { lte: +maxPrice }) };
    const orderBy = { priceAsc: { price: "asc" }, priceDesc: { price: "desc" } }[sort] || { createdAt: "desc" };
    res.json(await prisma.product.findMany({ where, orderBy, include: withCategory }));
  } catch (e) { fail(res, e); }
});

router.get("/:id", async (req, res) => {
  try {
    const p = await prisma.product.findUnique({ where: { id: req.params.id }, include: withCategory });
    if (!p) throw httpError(404, "Product not found");
    res.json(p);
  } catch (e) { fail(res, e); }
});

router.post("/", protect, adminOnly, async (req, res) => {
  try {
    const d = fromBody(req.body);
    if (!d.name || d.price === undefined || !d.categoryId) throw httpError(400, "Name, price and category are required");
    res.status(201).json(await prisma.product.create({ data: d, include: withCategory }));
  } catch (e) { fail(res, dbError(e)); }
});

router.put("/:id", protect, adminOnly, async (req, res) => {
  try {
    res.json(await prisma.product.update({ where: { id: req.params.id }, data: fromBody(req.body), include: withCategory }));
  } catch (e) { fail(res, e.code === "P2025" ? httpError(404, "Product not found") : dbError(e)); }
});

router.delete("/:id", protect, adminOnly, async (req, res) => {
  try {
    await prisma.product.delete({ where: { id: req.params.id } });
    res.json({ message: "Product deleted" });
  } catch (e) { fail(res, e.code === "P2025" ? httpError(404, "Product not found") : e); }
});

export default router;
