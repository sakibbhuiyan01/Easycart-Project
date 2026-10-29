import { Link, NavLink, useNavigate } from "react-router-dom";
import { useState } from "react";
import { useAuth } from "../context/AuthContext";
import { useCart } from "../context/CartContext";

export default function Navbar() {
  const { user, logout } = useAuth();
  const { count } = useCart();
  const nav = useNavigate();
  const [q, setQ] = useState("");

  const submit = (e) => {
    e.preventDefault();
    nav(q.trim() ? `/?search=${encodeURIComponent(q.trim())}` : "/");
  };

  return (
    <header className="sticky top-0 z-20 border-b border-line bg-white">
      <div className="mx-auto flex max-w-6xl flex-wrap items-center gap-x-6 gap-y-2 px-4 py-3">
        <Link to="/" className="text-xl font-extrabold tracking-tight">
          Easy<span className="text-volt">Cart</span>
        </Link>

        <form onSubmit={submit} className="order-last flex w-full flex-1 gap-2 md:order-none md:w-auto" role="search">
          <input className="input" value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search phones, laptops, SSDs..." aria-label="Search products" />
          <button className="btn-dark">Search</button>
        </form>

        <nav className="ml-auto flex items-center gap-4 text-sm font-semibold">
          {user?.role === "admin" && <NavLink to="/admin" className="text-volt">Admin</NavLink>}
          {user ? (
            <>
              <NavLink to="/profile">{user.name.split(" ")[0]}</NavLink>
              <button onClick={() => { logout(); nav("/"); }}>Log out</button>
            </>
          ) : (
            <>
              <NavLink to="/login">Log in</NavLink>
              <NavLink to="/register" className="btn-primary !py-1.5">Sign up</NavLink>
            </>
          )}
          <NavLink to="/cart" className="relative">
            Cart
            {count > 0 && (
              <span className="absolute -right-4 -top-3 rounded-full bg-volt px-1.5 text-xs font-bold text-white">{count}</span>
            )}
          </NavLink>
        </nav>
      </div>
    </header>
  );
}
