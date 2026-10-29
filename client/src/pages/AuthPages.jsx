import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

function Form({ title, fields, onSubmit, footer, button }) {
  const [vals, setVals] = useState({});
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    setBusy(true); setError("");
    try { await onSubmit(vals); } catch (err) { setError(err.message); } finally { setBusy(false); }
  };

  return (
    <form onSubmit={submit} className="panel mx-auto mt-6 max-w-md space-y-4 p-6">
      <h1 className="text-2xl font-extrabold">{title}</h1>
      {fields.map(([key, label, type]) => (
        <div key={key}>
          <label className="label" htmlFor={key}>{label}</label>
          <input id={key} className="input" type={type} required onChange={(e) => setVals({ ...vals, [key]: e.target.value })} />
        </div>
      ))}
      {error && <p className="rounded-md bg-red-50 p-3 text-sm text-red-700" role="alert">{error}</p>}
      <button className="btn-primary w-full" disabled={busy}>{busy ? "Please wait..." : button}</button>
      <p className="text-center text-sm">{footer}</p>
    </form>
  );
}

export function Login() {
  const { login } = useAuth();
  const nav = useNavigate();
  const from = useLocation().state?.from || "/";
  return (
    <Form title="Log in" button="Log in"
      fields={[["email", "Email", "email"], ["password", "Password", "password"]]}
      onSubmit={async (v) => { await login(v.email, v.password); nav(from, { replace: true }); }}
      footer={<>New here? <Link to="/register" className="font-semibold text-volt">Create an account</Link></>} />
  );
}

export function Register() {
  const { register } = useAuth();
  const nav = useNavigate();
  return (
    <Form title="Create your account" button="Sign up"
      fields={[["name", "Full name", "text"], ["email", "Email", "email"], ["password", "Password (min 6 characters)", "password"]]}
      onSubmit={async (v) => { await register(v.name, v.email, v.password); nav("/"); }}
      footer={<>Already have an account? <Link to="/login" className="font-semibold text-volt">Log in</Link></>} />
  );
}
