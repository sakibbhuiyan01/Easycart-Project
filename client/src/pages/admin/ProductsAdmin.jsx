import { useEffect, useState } from "react";
import { api, money } from "../../api";

const empty = { name: "", brand: "", price: "", stock: "", category: "", image: "", description: "", specs: "" };

export default function ProductsAdmin() {
  const [list, setList] = useState([]);
  const [cats, setCats] = useState([]);
  const [form, setForm] = useState(empty);
  const [editing, setEditing] = useState(null);
  const [error, setError] = useState("");

  const load = () => api("/products").then(setList);
  useEffect(() => { load(); api("/categories").then(setCats); }, []);

  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value });

  const submit = async (e) => {
    e.preventDefault();
    setError("");
    const body = {
      ...form, price: Number(form.price), stock: Number(form.stock),
      specs: form.specs.split("\n").map((s) => s.trim()).filter(Boolean),
    };
    try {
      editing ? await api(`/products/${editing}`, { method: "PUT", body }) : await api("/products", { method: "POST", body });
      setForm(empty); setEditing(null); load();
    } catch (err) { setError(err.message); }
  };

  const edit = (p) => {
    setEditing(p.id);
    setForm({ name: p.name, brand: p.brand, price: p.price, stock: p.stock, category: p.category?.id || "", image: p.image, description: p.description, specs: (p.specs || []).join("\n") });
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const del = async (p) => {
    if (!confirm(`Delete "${p.name}"?`)) return;
    await api(`/products/${p.id}`, { method: "DELETE" }); load();
  };

  const quickStock = async (p, stock) => {
    if (stock < 0) return;
    await api(`/products/${p.id}`, { method: "PUT", body: { stock } }); load();
  };

  return (
    <>
      <form onSubmit={submit} className="panel mb-6 grid gap-4 p-5 md:grid-cols-2">
        <h2 className="text-lg font-extrabold md:col-span-2">{editing ? "Edit product" : "Add product"}</h2>
        <div><label className="label">Name</label><input className="input" required value={form.name} onChange={set("name")} /></div>
        <div><label className="label">Brand</label><input className="input" value={form.brand} onChange={set("brand")} /></div>
        <div><label className="label">Price (৳)</label><input className="input" type="number" min="0" required value={form.price} onChange={set("price")} /></div>
        <div><label className="label">Stock</label><input className="input" type="number" min="0" required value={form.stock} onChange={set("stock")} /></div>
        <div><label className="label">Category</label>
          <select className="input" required value={form.category} onChange={set("category")}>
            <option value="">Select category</option>
            {cats.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select></div>
        <div><label className="label">Image URL</label><input className="input" placeholder="https://..." value={form.image} onChange={set("image")} /></div>
        <div className="md:col-span-2"><label className="label">Description</label><textarea className="input" rows="2" value={form.description} onChange={set("description")} /></div>
        <div className="md:col-span-2"><label className="label">Specs (one per line)</label><textarea className="input" rows="3" value={form.specs} onChange={set("specs")} /></div>
        {error && <p className="rounded-md bg-red-50 p-3 text-sm text-red-700 md:col-span-2" role="alert">{error}</p>}
        <div className="flex gap-2 md:col-span-2">
          <button className="btn-primary">{editing ? "Save changes" : "Add product"}</button>
          {editing && <button type="button" className="btn-ghost" onClick={() => { setEditing(null); setForm(empty); }}>Cancel</button>}
        </div>
      </form>

      <div className="panel overflow-x-auto">
        <table className="w-full min-w-[640px] text-left text-sm">
          <thead className="border-b border-line bg-paper"><tr><th className="p-3">Product</th><th className="p-3">Price</th><th className="p-3">Stock</th><th className="p-3"></th></tr></thead>
          <tbody className="divide-y divide-line">
            {list.map((p) => (
              <tr key={p.id}>
                <td className="p-3"><span className="font-semibold">{p.name}</span><br /><span className="text-xs text-slate-500">{p.category?.name}</span></td>
                <td className="p-3">{money(p.price)}</td>
                <td className="p-3">
                  <div className="flex items-center gap-2">
                    <button className="btn-ghost !px-2 !py-0.5" onClick={() => quickStock(p, p.stock - 1)} aria-label="Reduce stock">−</button>
                    <span className={`w-8 text-center font-bold ${p.stock <= 5 ? "text-amber-600" : ""}`}>{p.stock}</span>
                    <button className="btn-ghost !px-2 !py-0.5" onClick={() => quickStock(p, p.stock + 1)} aria-label="Increase stock">+</button>
                  </div>
                </td>
                <td className="space-x-2 p-3 text-right">
                  <button className="btn-ghost !py-1" onClick={() => edit(p)}>Edit</button>
                  <button className="btn-danger !py-1" onClick={() => del(p)}>Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}
