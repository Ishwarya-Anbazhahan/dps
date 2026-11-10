import { useEffect, useState } from "react";
import { api, getToken, setToken } from "./api.js";
import Auth from "./Auth.jsx";
import Client from "./Client.jsx";
import Admin from "./Admin.jsx";
import "./portal.css";

export default function Portal() {
  const [role, setRole] = useState(getToken() ? "loading" : null);
  const logout = () => { setToken(null); setRole(null); };
  const check = () => api("/me").then((d) => setRole(d.user.role)).catch(logout);
  useEffect(() => { if (getToken()) check(); }, []);

  if (role === "loading") return <p className="pt-loading">Loading…</p>;
  if (!role) return <Auth onDone={check} />;
  return role === "admin" ? <Admin logout={logout} /> : <Client logout={logout} />;
}
