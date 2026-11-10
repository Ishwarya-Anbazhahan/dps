# DPS Enterprises: website + client portal

## Run
1. Create a database: `createdb dps`
2. `cp .env.example .env` and edit DATABASE_URL, JWT_SECRET, ADMIN_EMAIL, ADMIN_PASSWORD
3. `npm install`
4. Terminal 1: `npm run server`  (creates tables + admin on first start)
5. Terminal 2: `npm run dev`  then open http://localhost:5173/portal

## Rules built in
- Client registers (optional Sponsor ID) and logs in; dashboard shows their own Sponsor ID.
- With Security: min Rs 10,000, Land 5% / Property 10% per year, refundable any time.
- Without Security: rates/minimum are placeholders in `plan_rates` (non-refundable).
- Direct referral: sponsor gets 5% of the referred client's investment (one time) when admin approves it.
- Interest = simple interest per year, counted from approval date.
- Admin approves/rejects investments, marks refunds, marks referral share paid.

Change rates: `UPDATE plan_rates SET rate_percent=.., min_amount=.. WHERE ...;`
Referral %: `UPDATE settings SET value='5' WHERE key='referral_percent';`

## Deploy
- Database: Neon / Supabase / Render Postgres (copy the connection string)
- Backend (Render): build `npm install`, start `npm start`. Env vars: DATABASE_URL, JWT_SECRET, ADMIN_EMAIL, ADMIN_PASSWORD, CORS_ORIGIN
- Frontend (Netlify): set VITE_API_URL to the backend URL, `npm run build`, upload `dist` (or connect GitHub). Never upload `.env`.
