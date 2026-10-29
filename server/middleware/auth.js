import jwt from "jsonwebtoken";
import { prisma } from "../lib/prisma.js";

export const protect = async (req, res, next) => {
  const h = req.headers.authorization;
  if (!h || !h.startsWith("Bearer ")) return res.status(401).json({ message: "Please log in" });
  try {
    const { id } = jwt.verify(h.split(" ")[1], process.env.JWT_SECRET);
    const user = await prisma.user.findUnique({
      where: { id },
      select: { id: true, name: true, email: true, phone: true, address: true, role: true },
    });
    if (!user) return res.status(401).json({ message: "User not found" });
    req.user = user;
    next();
  } catch {
    res.status(401).json({ message: "Session expired, please log in again" });
  }
};

export const adminOnly = (req, res, next) =>
  req.user?.role === "admin" ? next() : res.status(403).json({ message: "Admin access only" });
