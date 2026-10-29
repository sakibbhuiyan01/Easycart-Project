import { Routes, Route, Link } from "react-router-dom";
import Navbar from "./components/Navbar";
import { RequireAuth, RequireAdmin } from "./components/Guards";
import Home from "./pages/Home";
import ProductDetails from "./pages/ProductDetails";
import Cart from "./pages/Cart";
import Checkout from "./pages/Checkout";
import { Login, Register } from "./pages/AuthPages";
import Profile from "./pages/Profile";
import Dashboard from "./pages/admin/Dashboard";

export default function App() {
  return (
    <>
      <Navbar />
      <main className="mx-auto max-w-6xl px-4 py-6">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/product/:id" element={<ProductDetails />} />
          <Route path="/cart" element={<Cart />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/checkout" element={<RequireAuth><Checkout /></RequireAuth>} />
          <Route path="/profile" element={<RequireAuth><Profile /></RequireAuth>} />
          <Route path="/admin" element={<RequireAdmin><Dashboard /></RequireAdmin>} />
          <Route path="*" element={<p className="py-20 text-center">Page not found. <Link className="text-volt" to="/">Back to the store</Link></p>} />
        </Routes>
      </main>
      <footer className="mt-10 border-t border-line py-6 text-center text-sm text-slate-500">
        EasyCart · Genuine electronics, delivered.
      </footer>
    </>
  );
}
