import { useState } from "react";
import { api, setToken } from "./api.js";

export default function Auth({ onDone }) {
  const [mode, setMode] = useState("login");
  const [f, setF] = useState({ name: "", phone: "", email: "", password: "", sponsorCode: "" });
  const [err, setErr] = useState("");
  const set = (k) => (e) => setF({ ...f, [k]: e.target.value });

  async function submit(e) {
    e.preventDefault();
    setErr("");
    try {
      const { token } = await api(mode === "login" ? "/auth/login" : "/auth/register", "POST", f);
      setToken(token);
      onDone();
    } catch (x) {
      setErr(x.message);
    }
  }

  return (
    <div className="pt-auth">
      <span className="pt-blob b1" aria-hidden="true" /><span className="pt-blob b2" aria-hidden="true" />
      <form className="pt-card" onSubmit={submit}>
        <a href="/" className="pt-back">← Back to website</a>
        <img className="pt-logo" src="/brand/logo-monogram.jpg" alt="DPS Enterprises" />
        <h2 key={mode} className="pt-fade">{mode === "login" ? "Client Login" : "Create your account"}</h2>
        {mode === "register" && (
          <>
            <input placeholder="Full name" value={f.name} onChange={set("name")} required />
            <input placeholder="Phone" value={f.phone} onChange={set("phone")} />
          </>
        )}
        <input type={mode === "login" ? "text" : "email"} placeholder={mode === "login" ? "Email or username" : "Email"} value={f.email} onChange={set("email")} required />
        <input type="password" placeholder="Password" value={f.password} onChange={set("password")} required />
        {mode === "register" && (
          <input placeholder="Sponsor ID (optional, e.g. DPS123456)" value={f.sponsorCode} onChange={set("sponsorCode")} />
        )}
        {err && <p className="pt-err">{err}</p>}
        <button className="btn btn-red" type="submit">{mode === "login" ? "Login" : "Create account"}</button>
        <p className="pt-switch">
          {mode === "login" ? "New client? " : "Already registered? "}
          <a href="#" onClick={(e) => { e.preventDefault(); setMode(mode === "login" ? "register" : "login"); }}>
            {mode === "login" ? "Create account" : "Login"}
          </a>
        </p>
      </form>
    </div>
  );
}
