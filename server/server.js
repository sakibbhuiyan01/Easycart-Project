import "dotenv/config";
import express from "express";
import cors from "cors";
import { prisma } from "./lib/prisma.js";
import authRoutes from "./routes/auth.js";
import categoryRoutes from "./routes/categories.js";
import productRoutes from "./routes/products.js";
import orderRoutes from "./routes/orders.js";
import adminRoutes from "./routes/admin.js";

const app = express();
app.use(cors({ origin: process.env.CLIENT_URL ? process.env.CLIENT_URL.split(",") : true }));
app.use(express.json());

app.get("/", (req, res) => res.send("EasyCart API running (PostgreSQL + Prisma 7)"));
app.use("/api/auth", authRoutes);
app.use("/api/categories", categoryRoutes);
app.use("/api/products", productRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/admin", adminRoutes);
app.use((req, res) => res.status(404).json({ message: "Route not found" }));

// On Vercel the platform runs the app itself; locally we start a normal server
if (!process.env.VERCEL) {
  const PORT = process.env.PORT || 5000;
  try {
    await prisma.$connect();
    console.log("PostgreSQL connected");
  } catch (e) {
    console.error("Database connection failed:", e.message);
    console.error("Check DATABASE_URL in server/.env and that PostgreSQL is running.");
    process.exit(1);
  }
  app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));
}

export default app;
