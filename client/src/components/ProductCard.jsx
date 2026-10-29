import { Link } from "react-router-dom";
import { money } from "../api";
import { useCart } from "../context/CartContext";

export default function ProductCard({ p }) {
  const { add } = useCart();
  const out = p.stock === 0;
  return (
    <article className="panel flex flex-col overflow-hidden">
      <Link to={`/product/${p.id}`} className="block bg-paper">
        <img src={p.image} alt={p.name} className="aspect-square w-full object-cover" loading="lazy" />
      </Link>
      <div className="flex flex-1 flex-col p-4">
        <p className="text-xs font-semibold text-slate-500">{p.brand} · {p.category?.name}</p>
        <Link to={`/product/${p.id}`} className="mt-1 font-bold leading-snug hover:text-volt">{p.name}</Link>
        <div className="mt-auto pt-3">
          <p className="text-lg font-extrabold">{money(p.price)}</p>
          <p className={`mb-3 text-xs font-semibold ${out ? "text-red-600" : p.stock <= 5 ? "text-amber-600" : "text-emerald-600"}`}>
            {out ? "Out of stock" : p.stock <= 5 ? `Only ${p.stock} left` : "In stock"}
          </p>
          <button className="btn-primary w-full" disabled={out} onClick={() => add(p)}>Add to cart</button>
        </div>
      </div>
    </article>
  );
}
