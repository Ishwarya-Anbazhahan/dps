import "dotenv/config";
import crypto from "node:crypto";
import express from "express";
import cors from "cors";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import pg from "pg";
import fs from "node:fs";

const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL });
const q = (t, p) => pool.query(t, p);
const SECRET = process.env.JWT_SECRET;
if (!SECRET || !process.env.DATABASE_URL) {
  console.error("Set DATABASE_URL and JWT_SECRET in .env");
  process.exit(1);
}

const app = express();
app.use(cors({ origin: process.env.CORS_ORIGIN ? process.env.CORS_ORIGIN.split(",") : true }));
app.use(express.json());
const wrap = (fn) => (req, res) =>
  fn(req, res).catch((e) => {
    console.error(e);
    res.status(500).json({ error: "Server error" });
  });

// Interest = amount x yearly rate x days held / 365 (simple interest, from approval date)
const ACCRUED = `CASE WHEN i.approved_at IS NULL THEN 0 ELSE ROUND(i.amount * i.rate_percent / 100 *
  GREATEST(EXTRACT(EPOCH FROM (COALESCE(i.refunded_at, now()) - i.approved_at)) / 86400, 0) / 365, 2) END`;

const sign = (u) => jwt.sign({ id: u.id, role: u.role }, SECRET, { expiresIn: "7d" });
const auth = (req, res, next) => {
  try {
    req.user = jwt.verify((req.headers.authorization || "").replace("Bearer ", ""), SECRET);
    next();
  } catch {
    res.status(401).json({ error: "Please log in" });
  }
};
const admin = (req, res, next) =>
  req.user.role === "admin" ? next() : res.status(403).json({ error: "Admin only" });

async function newSponsorCode() {
  for (;;) {
    const code = "DPS" + crypto.randomInt(100000, 999999);
    if (!(await q("SELECT 1 FROM users WHERE sponsor_code=$1", [code])).rowCount) return code;
  }
}

// ---------- Auth ----------
app.post("/api/auth/register", wrap(async (req, res) => {
  const { name, phone, email, password, sponsorCode } = req.body;
  if (!name || !email || !password || password.length < 6)
    return res.status(400).json({ error: "Name, email and a password of 6+ characters are required" });
  let sponsorId = null;
  if (sponsorCode) {
    const s = await q("SELECT id FROM users WHERE sponsor_code=$1", [sponsorCode.trim().toUpperCase()]);
    if (!s.rowCount) return res.status(400).json({ error: "Invalid Sponsor ID" });
    sponsorId = s.rows[0].id;
  }
  if ((await q("SELECT 1 FROM users WHERE email=$1", [email.toLowerCase()])).rowCount)
    return res.status(409).json({ error: "Email already registered" });
  const { rows } = await q(
    `INSERT INTO users (sponsor_code,name,phone,email,password_hash,sponsor_id)
     VALUES ($1,$2,$3,$4,$5,$6) RETURNING id, role`,
    [await newSponsorCode(), name.trim(), phone || null, email.toLowerCase(), await bcrypt.hash(password, 10), sponsorId],
  );
  res.json({ token: sign(rows[0]) });
}));

app.post("/api/auth/login", wrap(async (req, res) => {
  const { email = "", password = "" } = req.body;
  const { rows } = await q("SELECT * FROM users WHERE email=$1", [email.toLowerCase()]);
  if (!rows[0] || !(await bcrypt.compare(password, rows[0].password_hash)))
    return res.status(401).json({ error: "Wrong email or password" });
  res.json({ token: sign(rows[0]) });
}));

// ---------- Client ----------
app.get("/api/me", auth, wrap(async (req, res) => {
  const id = req.user.id;
  const [u, rates, ref, inv, refs, com] = await Promise.all([
    q(`SELECT u.id,u.name,u.email,u.role,u.sponsor_code,s.name AS sponsor_name, s.sponsor_code AS sponsor_of
       FROM users u LEFT JOIN users s ON s.id=u.sponsor_id WHERE u.id=$1`, [id]),
    q("SELECT * FROM plan_rates"),
    q("SELECT value FROM settings WHERE key='referral_percent'"),
    q(`SELECT i.*, ${ACCRUED} AS accrued FROM investments i WHERE user_id=$1 ORDER BY id DESC`, [id]),
    q("SELECT name, sponsor_code, created_at FROM users WHERE sponsor_id=$1 ORDER BY id DESC", [id]),
    q(`SELECT c.*, u.name AS from_name FROM commissions c JOIN users u ON u.id=c.from_user_id
       WHERE sponsor_user_id=$1 ORDER BY c.id DESC`, [id]),
  ]);
  res.json({ user: u.rows[0], rates: rates.rows, referralPercent: Number(ref.rows[0].value),
    investments: inv.rows, referrals: refs.rows, commissions: com.rows });
}));

app.post("/api/investments", auth, wrap(async (req, res) => {
  const { planType, propertyType } = req.body;
  const amount = Number(req.body.amount);
  const r = await q("SELECT * FROM plan_rates WHERE plan_type=$1 AND property_type=$2", [planType, propertyType]);
  if (!r.rowCount) return res.status(400).json({ error: "Invalid plan" });
  const rate = r.rows[0];
  if (!(amount >= Number(rate.min_amount)))
    return res.status(400).json({ error: `Minimum amount is ₹${Number(rate.min_amount).toLocaleString("en-IN")}` });
  const { rows } = await q(
    `INSERT INTO investments (user_id,plan_type,property_type,amount,rate_percent,refundable)
     VALUES ($1,$2,$3,$4,$5,$6) RETURNING *`,
    [req.user.id, planType, propertyType, amount, rate.rate_percent, rate.refundable],
  );
  res.json(rows[0]);
}));

app.post("/api/investments/:id/refund-request", auth, wrap(async (req, res) => {
  const r = await q(
    `UPDATE investments SET status='refund_requested'
     WHERE id=$1 AND user_id=$2 AND refundable AND status='active' RETURNING id`,
    [req.params.id, req.user.id],
  );
  if (!r.rowCount) return res.status(400).json({ error: "Refund not possible for this investment" });
  res.json({ ok: true });
}));

// ---------- Admin ----------
const adm = [auth, admin];

app.get("/api/admin/summary", ...adm, wrap(async (req, res) => {
  const { rows } = await q(`
    SELECT
      COUNT(DISTINCT user_id) FILTER (WHERE status IN ('active','refund_requested','refunded')) AS investors,
      COALESCE(SUM(amount) FILTER (WHERE status IN ('active','refund_requested')),0) AS held,
      COALESCE(SUM(amount) FILTER (WHERE status IN ('active','refund_requested') AND refundable),0) AS refundable_held,
      COALESCE(SUM(amount) FILTER (WHERE status='refunded'),0) AS refunded,
      COALESCE(SUM(${ACCRUED}) FILTER (WHERE status IN ('active','refund_requested','refunded')),0) AS interest,
      (SELECT COALESCE(SUM(amount),0) FROM commissions) AS commissions,
      (SELECT COALESCE(SUM(amount),0) FROM commissions WHERE NOT paid) AS commissions_unpaid
    FROM investments i`);
  const s = rows[0];
  // Net retained = money currently held - interest owed to clients - referral share
  s.net = Number(s.held) - Number(s.interest) - Number(s.commissions);
  res.json(s);
}));

app.get("/api/admin/clients", ...adm, wrap(async (req, res) => {
  const { rows } = await q(`
    SELECT u.id,u.name,u.phone,u.email,u.sponsor_code,s.name AS sponsor_name,s.sponsor_code AS sponsor_of,
      COALESCE(i.invested,0) AS invested, COALESCE(i.interest,0) AS interest,
      (SELECT COUNT(*) FROM users r WHERE r.sponsor_id=u.id) AS referrals,
      COALESCE((SELECT SUM(amount) FROM commissions c WHERE c.sponsor_user_id=u.id),0) AS commission_earned
    FROM users u LEFT JOIN users s ON s.id=u.sponsor_id
    LEFT JOIN (SELECT user_id,
        SUM(amount) FILTER (WHERE status IN ('active','refund_requested')) AS invested,
        SUM(${ACCRUED}) FILTER (WHERE status IN ('active','refund_requested','refunded')) AS interest
      FROM investments i GROUP BY user_id) i ON i.user_id=u.id
    WHERE u.role='client' ORDER BY u.id DESC`);
  res.json(rows);
}));

app.get("/api/admin/investments", ...adm, wrap(async (req, res) => {
  const { rows } = await q(`SELECT i.*, ${ACCRUED} AS accrued, u.name, u.sponsor_code
    FROM investments i JOIN users u ON u.id=i.user_id ORDER BY i.id DESC`);
  res.json(rows);
}));

app.get("/api/admin/commissions", ...adm, wrap(async (req, res) => {
  const { rows } = await q(`SELECT c.*, sp.name AS sponsor_name, sp.sponsor_code, f.name AS from_name
    FROM commissions c JOIN users sp ON sp.id=c.sponsor_user_id JOIN users f ON f.id=c.from_user_id
    ORDER BY c.id DESC`);
  res.json(rows);
}));

// Approve = money received. Interest starts now; sponsor gets referral share (one time).
app.post("/api/admin/investments/:id/approve", ...adm, wrap(async (req, res) => {
  const c = await pool.connect();
  try {
    await c.query("BEGIN");
    const a = await c.query(
      `UPDATE investments SET status='active', approved_at=now() WHERE id=$1 AND status='pending' RETURNING *`,
      [req.params.id]);
    if (!a.rowCount) { await c.query("ROLLBACK"); return res.status(400).json({ error: "Not pending" }); }
    const inv = a.rows[0];
    const sp = await c.query("SELECT sponsor_id FROM users WHERE id=$1", [inv.user_id]);
    if (sp.rows[0].sponsor_id) {
      const pct = Number((await c.query("SELECT value FROM settings WHERE key='referral_percent'")).rows[0].value);
      await c.query(
        `INSERT INTO commissions (sponsor_user_id,from_user_id,investment_id,percent,amount)
         VALUES ($1,$2,$3,$4,ROUND($5::numeric * $4 / 100, 2))`,
        [sp.rows[0].sponsor_id, inv.user_id, inv.id, pct, inv.amount]);
    }
    await c.query("COMMIT");
    res.json({ ok: true });
  } catch (e) { await c.query("ROLLBACK"); throw e; } finally { c.release(); }
}));

app.post("/api/admin/investments/:id/reject", ...adm, wrap(async (req, res) => {
  await q("UPDATE investments SET status='rejected' WHERE id=$1 AND status='pending'", [req.params.id]);
  res.json({ ok: true });
}));

app.post("/api/admin/investments/:id/refund", ...adm, wrap(async (req, res) => {
  const r = await q(
    `UPDATE investments SET status='refunded', refunded_at=now()
     WHERE id=$1 AND refundable AND status IN ('active','refund_requested') RETURNING id`, [req.params.id]);
  if (!r.rowCount) return res.status(400).json({ error: "Cannot refund" });
  res.json({ ok: true });
}));

app.post("/api/admin/commissions/:id/pay", ...adm, wrap(async (req, res) => {
  await q("UPDATE commissions SET paid=true WHERE id=$1", [req.params.id]);
  res.json({ ok: true });
}));

app.put("/api/admin/rates", ...adm, wrap(async (req, res) => {
  const { planType, propertyType, ratePercent, minAmount } = req.body;
  await q("UPDATE plan_rates SET rate_percent=$3, min_amount=$4 WHERE plan_type=$1 AND property_type=$2",
    [planType, propertyType, ratePercent, minAmount]);
  res.json({ ok: true });
}));

// ---------- Boot: create tables + admin ----------
async function init() {
  await q(fs.readFileSync(new URL("./schema.sql", import.meta.url), "utf8"));
  const { ADMIN_EMAIL, ADMIN_PASSWORD } = process.env;
  if (ADMIN_EMAIL && ADMIN_PASSWORD) {
    const email = ADMIN_EMAIL.trim().toLowerCase();
    const hash = await bcrypt.hash(ADMIN_PASSWORD, 10);
    // .env is the source of truth for the admin login: create it, or reset it if it already exists
    const upd = await q("UPDATE users SET email=$1, password_hash=$2 WHERE role='admin'", [email, hash]);
    if (!upd.rowCount)
      await q(`INSERT INTO users (sponsor_code,name,email,password_hash,role) VALUES ('DPSADMIN','Admin',$1,$2,'admin')`, [email, hash]);
    console.log("Admin login ready ->", email);
  }
}
init()
  .then(() => app.listen(process.env.PORT || 4000, () => console.log("API running on port " + (process.env.PORT || 4000))))
  .catch((e) => {
    console.error("\nDATABASE CONNECTION FAILED:", e.message);
    console.error("Check DATABASE_URL in .env, that PostgreSQL is running, and that database 'dps' exists.");
    process.exit(1);
  });
