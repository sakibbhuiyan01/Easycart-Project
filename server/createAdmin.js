// npm run admin -> checks for an admin, creates one if missing. Deletes nothing.
import bcrypt from "bcryptjs";
import { prisma } from "./lib/prisma.js";

const admin = await prisma.user.findFirst({ where: { role: "admin" } });
if (admin) {
  console.log("Admin already exists:", admin.email);
} else {
  const email = "admin@easycart.com";
  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    await prisma.user.update({ where: { email }, data: { role: "admin" } });
    console.log("Existing user promoted to admin:", email);
  } else {
    await prisma.user.create({ data: { name: "Admin", email, password: await bcrypt.hash("admin123", 10), role: "admin" } });
    console.log("Admin created: admin@easycart.com / admin123");
  }
}
await prisma.$disconnect();
