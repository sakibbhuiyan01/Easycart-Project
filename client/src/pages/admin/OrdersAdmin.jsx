import { useEffect, useState } from "react";
import { api, money } from "../../api";

const STATUSES = ["Pending", "Processing", "Shipped", "Delivered", "Cancelled"];

export default function OrdersAdmin() {
  const [orders, setOrders] = useState([]);
  const load = () => api("/orders").then(setOrders);
  useEffect(() => { load(); }, []);

  const setStatus = async (id, status) => {
    await api(`/orders/${id}/status`, { method: "PUT", body: { status } });
    load();
  };

  if (orders.length === 0) return <p className="text-slate-500">No orders yet.</p>;
  return (
    <div className="space-y-3">
      {orders.map((o) => (
        <div key={o.id} className="panel p-4">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div>
              <p className="font-extrabold">#{o.id.slice(-6).toUpperCase()} · {o.user?.name}</p>
              <p className="text-xs text-slate-500">{new Date(o.createdAt).toLocaleString()} · {o.user?.email}</p>
            </div>
            <select className="input !w-auto" value={o.status} onChange={(e) => setStatus(o.id, e.target.value)} aria-label="Order status">
              {STATUSES.map((s) => <option key={s}>{s}</option>)}
            </select>
          </div>
          <ul className="mt-3 text-sm">{o.items.map((i, k) => <li key={k}>{i.name} × {i.qty}</li>)}</ul>
          <p className="mt-2 text-sm text-slate-600">{o.shipping.name}, {o.shipping.phone}<br />{o.shipping.address}</p>
          <p className="mt-2 font-extrabold">{money(o.total)} <span className="text-sm font-normal text-slate-500">· {o.paymentMethod === "cod" ? "Cash on delivery" : "Card"} · {o.isPaid ? "Paid" : "Unpaid"}</span></p>
        </div>
      ))}
    </div>
  );
}
