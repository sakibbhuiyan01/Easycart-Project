# EasyCart: Electronics E-Commerce

React + Tailwind (client), Node + Express (server), PostgreSQL + Prisma ORM 7 (database).

## 1. Requirements
- Node.js 20.19 or newer
- PostgreSQL running locally (or a free hosted one such as Neon or Supabase)

Create an empty database first:
```sql
CREATE DATABASE easycart;
```
(pgAdmin: right click Databases > Create > Database > name it `easycart`.)

## 2. Backend
```bash
cd server
npm install
# open .env and put your real password in DATABASE_URL
npm run db:setup     # prisma generate + create tables (first time only)
npm run seed         # admin, demo user, categories, sample products
npm run dev          # http://localhost:5000
```

## 3. Frontend (new terminal)
```bash
cd client
npm install
npm run dev          # http://localhost:5173
```

Logins after seeding:
- Admin: admin@easycart.com / admin123
- Customer: user@easycart.com / user123

## Useful commands (server)
| Command | What it does |
|---|---|
| `npm run admin` | Checks for an admin, creates one if missing. Deletes nothing |
| `npm run seed` | Resets everything and loads sample data |
| `npm run studio` | Opens Prisma Studio to browse the tables |
| `npm run db:migrate` | After you edit `prisma/schema.prisma`, create a new migration |
| `npm run db:generate` | Regenerate the Prisma client (needed after pulling schema changes) |

## Prisma 7 notes
- Database URL is in `prisma.config.ts` (not in the schema file).
- The client is generated into `server/generated/prisma` and uses the `pg` driver adapter (`lib/prisma.js`).
- Prisma 7 no longer runs `generate` automatically after `migrate`, so run `npm run db:generate` yourself when needed.
- The server runs through `tsx` because the generated client is TypeScript.

## Features
Customer: register/login (JWT), categories, search + sort, product details, cart,
checkout (cash on delivery or demo card), profile and order history.

Admin (/admin): dashboard stats, product add/edit/delete, category management,
order status, stock control (quick +/- and low-stock list). Stock is reduced inside a
database transaction when an order is placed and restored if the order is cancelled.

## Payment note
"Pay now by card" is a demo: no card data is sent and no money moves.
For real payments add Stripe in `server/routes/orders.js` and on the Checkout page.

## Before deploying
Change JWT_SECRET, restrict CORS to your domain, add rate limiting on /api/auth.

## Deploy on Vercel

Three parts: database (Neon), backend (Vercel project 1), frontend (Vercel project 2).

1. **Database:** create a free Postgres on Neon (or Vercel Storage > Neon). Copy the *pooled* connection string.
2. **Create tables + data on that database (from your PC):** put the Neon URL in `server/.env` as `DATABASE_URL`, then
   `cd server && npm run db:deploy && npm run seed`. Put your local URL back afterwards.
3. **Push the project to GitHub** (`.env` and `generated/` are git-ignored).
4. **Backend:** Vercel > Add New Project > import the repo > Root Directory `server`.
   Environment variables: `DATABASE_URL` (Neon pooled), `JWT_SECRET` (long random string), `CLIENT_URL` (add after step 5).
5. **Frontend:** Add New Project > same repo > Root Directory `client` > Framework Vite.
   Environment variable: `VITE_API_URL` = `https://YOUR-BACKEND.vercel.app/api`
6. Go back to the backend project, set `CLIENT_URL` to the frontend URL, then Redeploy.
7. Change the seeded admin password after your first login.
