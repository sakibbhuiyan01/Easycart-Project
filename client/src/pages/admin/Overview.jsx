import { useEffect, useState } from "react";
import { api, money } from "../../api";

export default function Overview() {
  const [s, setS] = useState(null);
  useEffect(() => { api("/admin/stats").then(setS).catch(() => {}); }, []);
  if (!s) return <p className="text-slate-500">Loading...</p>;

  const cards = [["Revenue", money(s.revenue)], ["Orders", s.orders], ["Products", s.products], ["Customers", s.users]];
  return (
    <>
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {cards.map(([l, v]) => (
          <div key={l} className="panel p-5"><p className="text-sm text-slate-500">{l}</p><p className="mt-1 text-2xl font-extrabold">{v}</p></div>
        ))}
      </div>
      <section className="panel mt-6 p-5">
        <h2 className="font-extrabold">Low stock (5 or fewer)</h2>
        {s.lowStock.length === 0 ? <p className="mt-2 text-sm text-slate-500">All products are well stocked.</p> : (
          <ul className="mt-3 divide-y divide-line text-sm">
            {s.lowStock.map((p) => (
              <li key={p.id} className="flex justify-between py-2"><span>{p.name}</span>
                <span className={`font-bold ${p.stock === 0 ? "text-red-600" : "text-amber-600"}`}>{p.stock === 0 ? "Out of stock" : `${p.stock} left`}</span></li>
            ))}
          </ul>
        )}
      </section>
    </>
  );
}
