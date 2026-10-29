import { useEffect, useState } from "react";
import { useNavigate, useParams, Link } from "react-router-dom";
import { api, money } from "../api";
import { useCart } from "../context/CartContext";

export default function ProductDetails() {
  const { id } = useParams();
  const { add } = useCart();
  const nav = useNavigate();
  const [p, setP] = useState(null);
  const [qty, setQty] = useState(1);
  const [error, setError] = useState("");

  useEffect(() => { api(`/products/${id}`).then(setP).catch((e) => setError(e.message)); }, [id]);

  if (error) return <p className="py-20 text-center">{error}. <Link to="/" className="text-volt">Back to store</Link></p>;
  if (!p) return <p className="py-20 text-center text-slate-500">Loading...</p>;

  const out = p.stock === 0;
  return (
    <div className="panel grid gap-8 p-5 md:grid-cols-2 md:p-8">
      <img src={p.image} alt={p.name} className="w-full rounded-md bg-paper object-cover" />
      <div>
        <p className="text-sm font-semibold text-slate-500">{p.brand} · {p.category?.name}</p>
        <h1 className="mt-1 text-3xl font-extrabold leading-tight">{p.name}</h1>
        <p className="mt-4 text-3xl font-extrabold text-volt">{money(p.price)}</p>
        <p className={`mt-1 text-sm font-semibold ${out ? "text-red-600" : p.stock <= 5 ? "text-amber-600" : "text-emerald-600"}`}>
          {out ? "Out of stock" : `${p.stock} in stock`}
        </p>
        <p className="mt-5 text-slate-700">{p.description}</p>

        {p.specs?.length > 0 && (
          <ul className="mt-5 divide-y divide-line rounded-md border border-line text-sm">
            {p.specs.map((s, i) => <li key={i} className="px-4 py-2.5">{s}</li>)}
          </ul>
        )}

        <div className="mt-6 flex flex-wrap items-center gap-3">
          <div className="flex items-center rounded-md border border-line">
            <button className="px-3 py-2 font-bold" onClick={() => setQty(Math.max(1, qty - 1))} aria-label="Decrease quantity">−</button>
            <span className="w-8 text-center font-semibold">{qty}</span>
            <button className="px-3 py-2 font-bold" onClick={() => setQty(Math.min(p.stock, qty + 1))} aria-label="Increase quantity">+</button>
          </div>
          <button className="btn-ghost" disabled={out} onClick={() => add(p, qty)}>Add to cart</button>
          <button className="btn-primary" disabled={out} onClick={() => { add(p, qty); nav("/cart"); }}>Buy now</button>
        </div>
      </div>
    </div>
  );
}
