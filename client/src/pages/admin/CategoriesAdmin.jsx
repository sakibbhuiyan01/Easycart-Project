import { useEffect, useState } from "react";
import { api } from "../../api";

export default function CategoriesAdmin() {
  const [cats, setCats] = useState([]);
  const [name, setName] = useState("");
  const [error, setError] = useState("");
  const load = () => api("/categories").then(setCats);
  useEffect(() => { load(); }, []);

  const add = async (e) => {
    e.preventDefault(); setError("");
    try { await api("/categories", { method: "POST", body: { name } }); setName(""); load(); }
    catch (err) { setError(err.message); }
  };
  const rename = async (c) => {
    const n = prompt("New category name", c.name);
    if (!n || n === c.name) return;
    try { await api(`/categories/${c.id}`, { method: "PUT", body: { name: n } }); load(); } catch (err) { setError(err.message); }
  };
  const del = async (c) => {
    if (!confirm(`Delete "${c.name}"?`)) return;
    try { await api(`/categories/${c.id}`, { method: "DELETE" }); load(); } catch (err) { setError(err.message); }
  };

  return (
    <div className="max-w-xl">
      <form onSubmit={add} className="mb-4 flex gap-2">
        <input className="input" placeholder="New category name" required value={name} onChange={(e) => setName(e.target.value)} />
        <button className="btn-primary">Add</button>
      </form>
      {error && <p className="mb-3 rounded-md bg-red-50 p-3 text-sm text-red-700" role="alert">{error}</p>}
      <ul className="panel divide-y divide-line">
        {cats.map((c) => (
          <li key={c.id} className="flex items-center justify-between p-3">
            <span className="font-semibold">{c.name}</span>
            <span className="space-x-2">
              <button className="btn-ghost !py-1" onClick={() => rename(c)}>Rename</button>
              <button className="btn-danger !py-1" onClick={() => del(c)}>Delete</button>
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}
