import { Router } from "express";
import { prisma, httpError, fail } from "../lib/prisma.js";
import { protect, adminOnly } from "../middleware/auth.js";

const router = Router();

router.get("/", async (req, res) => {
  try { res.json(await prisma.category.findMany({ orderBy: { name: "asc" } })); }
  catch (e) { fail(res, e); }
});

const saveName = (req) => {
  const name = (req.body.name || "").trim();
  if (!name) throw httpError(400, "Category name is required");
  return name;
};
const dupe = (e) => (e.code === "P2002" ? httpError(400, "A category with this name already exists") : e);

router.post("/", protect, adminOnly, async (req, res) => {
  try { res.status(201).json(await prisma.category.create({ data: { name: saveName(req) } })); }
  catch (e) { fail(res, dupe(e)); }
});

router.put("/:id", protect, adminOnly, async (req, res) => {
  try { res.json(await prisma.category.update({ where: { id: req.params.id }, data: { name: saveName(req) } })); }
  catch (e) { fail(res, dupe(e)); }
});

router.delete("/:id", protect, adminOnly, async (req, res) => {
  try {
    if (await prisma.product.count({ where: { categoryId: req.params.id } }))
      throw httpError(400, "Move or delete the products in this category first");
    await prisma.category.delete({ where: { id: req.params.id } });
    res.json({ message: "Category deleted" });
  } catch (e) { fail(res, e); }
});

export default router;
