// In production set VITE_API_URL to your backend, e.g. https://easycart-api.vercel.app/api
const BASE = import.meta.env.VITE_API_URL || "/api";

// Small fetch wrapper. Token is read from localStorage on every call.
export async function api(path, { method = "GET", body } = {}) {
  let token = null;
  try { token = JSON.parse(localStorage.getItem("ec_user"))?.token; } catch {}
  const res = await fetch(`${BASE}${path}`, {
    method,
    headers: { "Content-Type": "application/json", ...(token && { Authorization: `Bearer ${token}` }) },
    body: body ? JSON.stringify(body) : undefined,
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.message || "Something went wrong");
  return data;
}

export const money = (n) => "৳" + Number(n || 0).toLocaleString("en-US");
