import { useState } from "react";
import Overview from "./Overview";
import ProductsAdmin from "./ProductsAdmin";
import CategoriesAdmin from "./CategoriesAdmin";
import OrdersAdmin from "./OrdersAdmin";

const TABS = [
  ["overview", "Overview", Overview],
  ["products", "Products & stock", ProductsAdmin],
  ["categories", "Categories", CategoriesAdmin],
  ["orders", "Orders", OrdersAdmin],
];

export default function Dashboard() {
  const [tab, setTab] = useState("overview");
  const Active = TABS.find((t) => t[0] === tab)[2];
  return (
    <div className="grid gap-6 md:grid-cols-[200px_1fr]">
      <nav className="flex gap-2 md:flex-col" aria-label="Admin sections">
        {TABS.map(([k, label]) => (
          <button key={k} onClick={() => setTab(k)}
            className={`rounded-md px-4 py-2.5 text-left text-sm font-semibold ${tab === k ? "bg-ink text-white" : "bg-white border border-line"}`}>
            {label}
          </button>
        ))}
      </nav>
      <div><Active /></div>
    </div>
  );
}
