import { Router } from "express";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import { prisma, httpError, fail } from "../lib/prisma.js";
import { protect } from "../middleware/auth.js";

const router = Router();

const send = (res, u, code = 200) =>
  res.status(code).json({
    id: u.id, name: u.name, email: u.email, phone: u.phone, address: u.address, role: u.role,
    token: jwt.sign({ id: u.id }, process.env.JWT_SECRET, { expiresIn: "7d" }),
  });

router.post("/register", async (req, res) => {
  try {
    const { name, email, password } = req.body;
    if (!name || !email || !password) throw httpError(400, "All fields are required");
    if (password.length < 6) throw httpError(400, "Password must be at least 6 characters");
    const clean = email.trim().toLowerCase();
    if (await prisma.user.findUnique({ where: { email: clean } }))
      throw httpError(400, "This email is already registered");
    const user = await prisma.user.create({
      data: { name: name.trim(), email: clean, password: await bcrypt.hash(password, 10) },
    });
    send(res, user, 201);
  } catch (e) { fail(res, e); }
});

router.post("/login", async (req, res) => {
  try {
    const user = await prisma.user.findUnique({ where: { email: (req.body.email || "").trim().toLowerCase() } });
    if (!user || !(await bcrypt.compare(req.body.password || "", user.password)))
      throw httpError(401, "Wrong email or password");
    send(res, user);
  } catch (e) { fail(res, e); }
});

router.get("/profile", protect, (req, res) => res.json(req.user));

router.put("/profile", protect, async (req, res) => {
  try {
    const data = {};
    for (const k of ["name", "phone", "address"]) if (req.body[k] !== undefined) data[k] = req.body[k];
    if (req.body.password) {
      if (req.body.password.length < 6) throw httpError(400, "Password must be at least 6 characters");
      data.password = await bcrypt.hash(req.body.password, 10);
    }
    send(res, await prisma.user.update({ where: { id: req.user.id }, data }));
  } catch (e) { fail(res, e); }
});

export default router;
