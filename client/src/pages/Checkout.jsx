import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { api, money } from "../api";
import { useAuth } from "../context/AuthContext";
import { useCart } from "../context/CartContext";

export default function Checkout() {
  const { user } = useAuth();
  const { items, total, clear } = useCart();
  const nav = useNavigate();
  const [ship, setShip] = useState({ name: user.name || "", phone: user.phone || "", address: user.address || "" });
  const [method, setMethod] = useState("cod");
  const [card, setCard] = useState({ number: "", exp: "", cvc: "" });
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  if (items.length === 0) return <p className="py-20 text-center">Your cart is empty.</p>;

  const submit = async (e) => {
    e.preventDefault();
    setError("");
    if (method === "card" && (card.number.replace(/\s/g, "").length < 16 || !card.exp || card.cvc.length < 3))
      return setError("Enter a valid card number, expiry and CVC");
    setBusy(true);
    try {
      await api("/orders", {
        method: "POST",
        body: { items: items.map((i) => ({ product: i.product, qty: i.qty })), shipping: ship, paymentMethod: method },
      });
      clear();
      nav("/profile", { state: { placed: true } });
    } catch (err) {
      setError(err.message);
    } finally { setBusy(false); }
  };

  return (
    <form onSubmit={submit} className="grid gap-6 lg:grid-cols-[1fr_320px]">
      <div className="space-y-6">
        <section className="panel p-5">
          <h2 className="mb-4 text-lg font-extrabold">Delivery details</h2>
          <div className="grid gap-4 md:grid-cols-2">
            <div><label className="label">Full name</label><input className="input" required value={ship.name} onChange={(e) => setShip({ ...ship, name: e.target.value })} /></div>
            <div><label className="label">Phone</label><input className="input" required value={ship.phone} onChange={(e) => setShip({ ...ship, phone: e.target.value })} /></div>
            <div className="md:col-span-2"><label className="label">Address</label><textarea className="input" rows="3" required value={ship.address} onChange={(e) => setShip({ ...ship, address: e.target.value })} /></div>
          </div>
        </section>

        <section className="panel p-5">
          <h2 className="mb-4 text-lg font-extrabold">Payment</h2>
          <div className="space-y-2">
            {[["cod", "Cash on delivery"], ["card", "Pay now by card"]].map(([v, l]) => (
              <label key={v} className={`flex cursor-pointer items-center gap-3 rounded-md border p-3 ${method === v ? "border-volt bg-volt-soft" : "border-line"}`}>
                <input type="radio" name="pay" checked={method === v} onChange={() => setMethod(v)} /> <span className="font-semibold">{l}</span>
              </label>
            ))}
          </div>
          {method === "card" && (
            <div className="mt-4 grid gap-4 md:grid-cols-3">
              <div className="md:col-span-3"><label className="label">Card number</label><input className="input" inputMode="numeric" placeholder="4242 4242 4242 4242" value={card.number} onChange={(e) => setCard({ ...card, number: e.target.value })} /></div>
              <div><label className="label">Expiry</label><input className="input" placeholder="MM/YY" value={card.exp} onChange={(e) => setCard({ ...card, exp: e.target.value })} /></div>
              <div><label className="label">CVC</label><input className="input" inputMode="numeric" maxLength="4" value={card.cvc} onChange={(e) => setCard({ ...card, cvc: e.target.value })} /></div>
              <p className="text-xs text-slate-500 md:col-span-3">Demo mode: no real charge is made. Card details are not sent or stored. Connect Stripe for live payments (see README).</p>
            </div>
          )}
        </section>
      </div>

      <aside className="panel h-fit p-5">
        <h2 className="text-lg font-extrabold">Your order</h2>
        <ul className="mt-3 space-y-2 text-sm">
          {items.map((i) => <li key={i.product} className="flex justify-between gap-2"><span>{i.name} × {i.qty}</span><span>{money(i.price * i.qty)}</span></li>)}
        </ul>
        <div className="mt-4 flex justify-between border-t border-line pt-4 text-lg font-extrabold"><span>Total</span><span>{money(total)}</span></div>
        {error && <p className="mt-3 rounded-md bg-red-50 p-3 text-sm text-red-700" role="alert">{error}</p>}
        <button className="btn-primary mt-4 w-full" disabled={busy}>{busy ? "Placing order..." : "Place order"}</button>
      </aside>
    </form>
  );
}
