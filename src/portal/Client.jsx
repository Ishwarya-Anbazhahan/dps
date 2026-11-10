import { useEffect, useState } from "react";
import { api, inr, date } from "./api.js";
import CountUp from "./CountUp.jsx";

const PLANS = {
  with_security: { label: "With Security", note: "Principal is refundable any time." },
  without_security: { label: "Without Security", note: "Principal is not refundable." },
};
const PT = { land: "Land", property: "Property" };

export default function Client({ logout }) {
  const [d, setD] = useState(null);
  const [tab, setTab] = useState("with_security");
  const [propertyType, setPT] = useState("land");
  const [amount, setAmount] = useState("");
  const [msg, setMsg] = useState("");

  const load = () => api("/me").then(setD).catch(() => logout());
  useEffect(() => { load(); }, []);
  if (!d) return <p className="pt-loading">Loading…</p>;

  const rate = d.rates.find((r) => r.plan_type === tab && r.property_type === propertyType);
  const mine = d.investments.filter((i) => i.plan_type === tab);
  const live = d.investments.filter((i) => ["active", "refund_requested"].includes(i.status));
  const totalInv = live.reduce((s, i) => s + Number(i.amount), 0);
  const totalInt = d.investments.reduce((s, i) => s + Number(i.accrued), 0);
  const totalCom = d.commissions.reduce((s, c) => s + Number(c.amount), 0);

  async function invest(e) {
    e.preventDefault();
    setMsg("");
    try {
      await api("/investments", "POST", { planType: tab, propertyType, amount });
      setAmount("");
      setMsg("Submitted. It becomes active once DPS confirms your payment.");
      load();
    } catch (x) { setMsg(x.message); }
  }
  async function refund(id) {
    if (!confirm("Request refund of this investment?")) return;
    try { await api(`/investments/${id}/refund-request`, "POST"); load(); } catch (x) { setMsg(x.message); }
  }

  return (
    <div className="pt-wrap">
      <div className="pt-top">
        <div><h1>Welcome, {d.user.name}</h1><span className="pt-muted">{d.user.email}</span></div>
        <button className="btn btn-line" onClick={logout}>Logout</button>
      </div>

      <div className="pt-grid">
        <div className="pt-stat pt-sponsor">
          <small>Your Sponsor ID</small><b>{d.user.sponsor_code}</b>
          <button onClick={() => navigator.clipboard.writeText(d.user.sponsor_code)}>Copy</button>
          <small>Share it. You earn {d.referralPercent}% when your direct referral invests.</small>
        </div>
        <div className="pt-stat"><small>Active investment</small><b><CountUp money value={totalInv} /></b></div>
        <div className="pt-stat"><small>Interest earned</small><b><CountUp money value={totalInt} /></b></div>
        <div className="pt-stat"><small>Referral earnings</small><b><CountUp money value={totalCom} /></b></div>
      </div>

      <div className="pt-tabs">
        {Object.entries(PLANS).map(([k, p]) => (
          <button key={k} className={tab === k ? "on" : ""} onClick={() => setTab(k)}>{p.label}</button>
        ))}
      </div>

      <div className="pt-card pt-wide pt-fade" key={tab}>
        <h3>New investment · {PLANS[tab].label}</h3>
        <p className="pt-muted">
          {PLANS[tab].note} Minimum {inr(rate?.min_amount)}. Interest {Number(rate?.rate_percent)}% per year on {PT[propertyType]}.
        </p>
        <form className="pt-row" onSubmit={invest}>
          <select value={propertyType} onChange={(e) => setPT(e.target.value)}>
            <option value="land">Land (5%)</option>
            <option value="property">Property (10%)</option>
          </select>
          <input type="number" min={rate?.min_amount} placeholder="Amount ₹" value={amount} onChange={(e) => setAmount(e.target.value)} required />
          <button className="btn btn-red">Invest</button>
        </form>
        {msg && <p className="pt-msg">{msg}</p>}

        <div className="pt-scroll">
          <table>
            <thead><tr><th>Type</th><th>Amount</th><th>Rate</th><th>Interest</th><th>Status</th><th>Since</th><th></th></tr></thead>
            <tbody>
              {mine.map((i) => (
                <tr key={i.id} style={{ "--i": mine.indexOf(i) }}>
                  <td>{PT[i.property_type]}</td><td>{inr(i.amount)}</td><td>{Number(i.rate_percent)}%</td>
                  <td>{inr(i.accrued)}</td><td><span className={"tag " + i.status}>{i.status.replace("_", " ")}</span></td>
                  <td>{date(i.approved_at)}</td>
                  <td>{i.refundable && i.status === "active" && <button className="pt-link" onClick={() => refund(i.id)}>Request refund</button>}</td>
                </tr>
              ))}
              {!mine.length && <tr><td colSpan="7" className="pt-muted">No investments yet.</td></tr>}
            </tbody>
          </table>
        </div>
      </div>

      <div className="pt-card pt-wide">
        <h3>My direct referrals ({d.referrals.length})</h3>
        <div className="pt-scroll">
          <table>
            <thead><tr><th>Name</th><th>Joined</th></tr></thead>
            <tbody>{d.referrals.map((r) => <tr key={r.sponsor_code}><td>{r.name}</td><td>{date(r.created_at)}</td></tr>)}
              {!d.referrals.length && <tr><td colSpan="2" className="pt-muted">No referrals yet.</td></tr>}</tbody>
          </table>
        </div>
        <h3>Referral earnings</h3>
        <div className="pt-scroll">
          <table>
            <thead><tr><th>From</th><th>Share</th><th>Amount</th><th>Status</th></tr></thead>
            <tbody>{d.commissions.map((c) => (
              <tr key={c.id}><td>{c.from_name}</td><td>{Number(c.percent)}%</td><td>{inr(c.amount)}</td>
                <td><span className={"tag " + (c.paid ? "active" : "pending")}>{c.paid ? "paid" : "unpaid"}</span></td></tr>
            ))}
              {!d.commissions.length && <tr><td colSpan="4" className="pt-muted">Nothing yet.</td></tr>}</tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
