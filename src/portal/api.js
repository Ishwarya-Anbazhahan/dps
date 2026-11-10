export const getToken = () => localStorage.getItem("dps_token");
export const setToken = (t) => (t ? localStorage.setItem("dps_token", t) : localStorage.removeItem("dps_token"));

const BASE = import.meta.env.VITE_API_URL || "";

export async function api(path, method = "GET", body) {
  const res = await fetch(BASE + "/api" + path, {
    method,
    headers: { "Content-Type": "application/json", Authorization: "Bearer " + getToken() },
    body: body ? JSON.stringify(body) : undefined,
  });
  const data = await res.json().catch(() => null);
  if (!data) throw new Error("Cannot reach the server. Is `npm run server` running without errors?");
  if (!res.ok) throw new Error(data.error || "Something went wrong");
  return data;
}

export const inr = (n) => "₹" + Number(n || 0).toLocaleString("en-IN", { maximumFractionDigits: 2 });
export const date = (d) => (d ? new Date(d).toLocaleDateString("en-IN") : "-");
