import { useEffect, useState } from "react";
import { api, inr, date } from "./api.js";
import CountUp from "./CountUp.jsx";

export default function Admin({ logout }) {
  const [s, setS] = useState(null);
  const [clients, setClients] = useState([]);
  const [inv, setInv] = useState([]);
  const [com, setCom] = useState([]);
  const [tab, setTab] = useState("investments");

  const load = async () => {
    try {
      setS(await api("/admin/summary"));
      setClients(await api("/admin/clients"));
      setInv(await api("/admin/investments"));
      setCom(await api("/admin/commissions"));
    } catch { logout(); }
  };
  useEffect(() => { load(); }, []);
  const act = async (path) => { try { await api(path, "POST"); load(); } catch (e) { alert(e.message); } };
  if (!s) return <p className="pt-loading">Loading…</p>;

  const cards = [
    ["Investors", s.investors, false],
    ["Money held", s.held, true],
    ["Refundable (owed back)", s.refundable_held, true],
    ["Interest owed to clients", s.interest, true],
    ["Referral share (total)", s.commissions, true],
    ["Referral share unpaid", s.commissions_unpaid, true],
    ["Refunded so far", s.refunded, true],
    ["Net retained for DPS", s.net, true],
  ];

  return (
    <div className="pt-wrap">
      <div className="pt-top"><h1>Admin Dashboard</h1><button className="btn btn-line" onClick={logout}>Logout</button></div>
      <div className="pt-grid">
        {cards.map(([k, v, money], n) => <div key={k} style={{ "--i": n }} className={"pt-stat" + (k.startsWith("Net") ? " pt-net" : "")}><small>{k}</small><b><CountUp value={v} money={money} /></b></div>)}
      </div>
      <p className="pt-muted">Net retained = money held − interest owed − referral share. Refundable money is a liability: it must be returned on request.</p>

      <div className="pt-tabs">
        {["investments", "clients", "referral share"].map((t) => <button key={t} className={tab === t ? "on" : ""} onClick={() => setTab(t)}>{t}</button>)}
      </div>

      <div className="pt-card pt-wide pt-fade" key={tab}><div className="pt-scroll">
        {tab === "investments" && (
          <table>
            <thead><tr><th>Client</th><th>Plan</th><th>Type</th><th>Amount</th><th>Rate</th><th>Interest</th><th>Status</th><th>Since</th><th></th></tr></thead>
            <tbody>{inv.map((i) => (
              <tr key={i.id}>
                <td>{i.name}<br /><small>{i.sponsor_code}</small></td>
                <td>{i.plan_type === "with_security" ? "With security" : "Without"}</td>
                <td>{i.property_type}</td><td>{inr(i.amount)}</td><td>{Number(i.rate_percent)}%</td><td>{inr(i.accrued)}</td>
                <td><span className={"tag " + i.status}>{i.status.replace("_", " ")}</span></td><td>{date(i.approved_at)}</td>
                <td className="pt-acts">
                  {i.status === "pending" && <><button onClick={() => act(`/admin/investments/${i.id}/approve`)}>Approve</button><button onClick={() => act(`/admin/investments/${i.id}/reject`)}>Reject</button></>}
                  {i.refundable && ["active", "refund_requested"].includes(i.status) && <button onClick={() => confirm(`Refund ${inr(Number(i.amount) + Number(i.accrued))} (principal + interest)?`) && act(`/admin/investments/${i.id}/refund`)}>Mark refunded</button>}
                </td>
              </tr>))}</tbody>
          </table>
        )}
        {tab === "clients" && (
          <table>
            <thead><tr><th>Client</th><th>Phone</th><th>Sponsor ID</th><th>Referred by</th><th>Invested</th><th>Interest</th><th>Referrals</th><th>Share earned</th></tr></thead>
            <tbody>{clients.map((c) => (
              <tr key={c.id}><td>{c.name}<br /><small>{c.email}</small></td><td>{c.phone}</td><td>{c.sponsor_code}</td>
                <td>{c.sponsor_name ? `${c.sponsor_name} (${c.sponsor_of})` : "-"}</td>
                <td>{inr(c.invested)}</td><td>{inr(c.interest)}</td><td>{c.referrals}</td><td>{inr(c.commission_earned)}</td></tr>))}</tbody>
          </table>
        )}
        {tab === "referral share" && (
          <table>
            <thead><tr><th>Sponsor</th><th>From client</th><th>Share</th><th>Amount</th><th>Date</th><th></th></tr></thead>
            <tbody>{com.map((c) => (
              <tr key={c.id}><td>{c.sponsor_name}<br /><small>{c.sponsor_code}</small></td><td>{c.from_name}</td><td>{Number(c.percent)}%</td><td>{inr(c.amount)}</td><td>{date(c.created_at)}</td>
                <td>{c.paid ? <span className="tag active">paid</span> : <button onClick={() => act(`/admin/commissions/${c.id}/pay`)}>Mark paid</button>}</td></tr>))}</tbody>
          </table>
        )}
      </div></div>
    </div>
  );
}
