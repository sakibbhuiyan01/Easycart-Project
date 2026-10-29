// npm run seed -> clears data, then creates admin, demo user, categories and sample products
import bcrypt from "bcryptjs";
import { prisma } from "../lib/prisma.js";

const img = (t) => `https://placehold.co/600x600/e8ecf4/14181f?text=${encodeURIComponent(t)}`;

await prisma.orderItem.deleteMany();
await prisma.order.deleteMany();
await prisma.product.deleteMany();
await prisma.category.deleteMany();
await prisma.user.deleteMany();

await prisma.user.create({ data: { name: "Admin", email: "admin@easycart.com", password: await bcrypt.hash("admin123", 10), role: "admin" } });
await prisma.user.create({ data: { name: "Demo Customer", email: "user@easycart.com", password: await bcrypt.hash("user123", 10) } });

const cats = {};
for (const name of ["Smartphones", "Laptops", "Headphones", "Smartwatches", "Computer Components"])
  cats[name] = (await prisma.category.create({ data: { name } })).id;

const items = [
  ["Nova X12 Smartphone", "Smartphones", 54999, "Nova", 25, ['6.7" AMOLED 120Hz', "8GB RAM / 256GB", "5000mAh battery"]],
  ["Pixelite 9 5G", "Smartphones", 42999, "Pixelite", 18, ['6.4" OLED', "12GB RAM / 256GB", "50MP camera"]],
  ["AeroBook 14 Laptop", "Laptops", 89999, "Aero", 10, ["Core i5 13th Gen", "16GB RAM / 512GB SSD", '14" FHD IPS']],
  ["Forge G5 Gaming Laptop", "Laptops", 139999, "Forge", 6, ["Ryzen 7", "RTX 4060 8GB", "165Hz display"]],
  ["Pulse ANC Headphones", "Headphones", 8999, "Pulse", 40, ["Active noise cancelling", "40h battery", "Bluetooth 5.3"]],
  ["Buds Mini Wireless", "Headphones", 2999, "Pulse", 60, ["Touch controls", "24h with case", "IPX4"]],
  ["Tempo Watch S2", "Smartwatches", 7499, "Tempo", 30, ['1.8" AMOLED', "GPS + heart rate", "7 day battery"]],
  ["Tempo Fit Band", "Smartwatches", 2499, "Tempo", 4, ["SpO2 tracking", "14 day battery", "Water resistant"]],
  ["Ryzen 5 5600 Processor", "Computer Components", 14999, "AMD", 15, ["6 cores / 12 threads", "AM4 socket", "Up to 4.4GHz"]],
  ["Nitro 16GB DDR4 RAM", "Computer Components", 4299, "Nitro", 50, ["3200MHz", "CL16", "Heat spreader"]],
  ["Vault 1TB NVMe SSD", "Computer Components", 6499, "Vault", 35, ["PCIe 4.0", "7000MB/s read", "5 year warranty"]],
];
for (const [name, c, price, brand, stock, specs] of items)
  await prisma.product.create({
    data: {
      name, price, brand, stock, specs, categoryId: cats[c], image: img(name),
      description: `${name} from ${brand}. Genuine product with official warranty and fast delivery.`,
    },
  });

console.log("Seeded. Admin: admin@easycart.com / admin123   User: user@easycart.com / user123");
await prisma.$disconnect();
