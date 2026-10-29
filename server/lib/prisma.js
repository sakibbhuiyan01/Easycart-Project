import "dotenv/config";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../generated/prisma/client.js";

// Prisma 7 needs a driver adapter. One client for the whole process.
const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL, max: process.env.VERCEL ? 1 : 10 });
export const prisma = new PrismaClient({ adapter });

export const httpError = (status, message) => Object.assign(new Error(message), { status });
export const fail = (res, e) => res.status(e.status || 500).json({ message: e.status ? e.message : "Server error: " + e.message });
