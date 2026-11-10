CREATE TABLE IF NOT EXISTS users (
  id SERIAL PRIMARY KEY,
  sponsor_code TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  phone TEXT,
  email TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  role TEXT NOT NULL DEFAULT 'client' CHECK (role IN ('client','admin')),
  sponsor_id INT REFERENCES users(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS plan_rates (
  plan_type TEXT NOT NULL CHECK (plan_type IN ('with_security','without_security')),
  property_type TEXT NOT NULL CHECK (property_type IN ('land','property')),
  rate_percent NUMERIC(5,2) NOT NULL,        -- per year
  min_amount NUMERIC(14,2) NOT NULL,
  refundable BOOLEAN NOT NULL,
  PRIMARY KEY (plan_type, property_type)
);

CREATE TABLE IF NOT EXISTS settings (key TEXT PRIMARY KEY, value TEXT NOT NULL);

CREATE TABLE IF NOT EXISTS investments (
  id SERIAL PRIMARY KEY,
  user_id INT NOT NULL REFERENCES users(id),
  plan_type TEXT NOT NULL,
  property_type TEXT NOT NULL,
  amount NUMERIC(14,2) NOT NULL CHECK (amount > 0),
  rate_percent NUMERIC(5,2) NOT NULL,        -- snapshot at purchase time
  refundable BOOLEAN NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending'
    CHECK (status IN ('pending','active','refund_requested','refunded','rejected')),
  approved_at TIMESTAMPTZ,
  refunded_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS commissions (
  id SERIAL PRIMARY KEY,
  sponsor_user_id INT NOT NULL REFERENCES users(id),
  from_user_id INT NOT NULL REFERENCES users(id),
  investment_id INT UNIQUE NOT NULL REFERENCES investments(id),
  percent NUMERIC(5,2) NOT NULL,
  amount NUMERIC(14,2) NOT NULL,
  paid BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Defaults (edit anytime). Without-security values are placeholders: confirm them.
INSERT INTO plan_rates VALUES
  ('with_security','land',5,10000,true),
  ('with_security','property',10,10000,true),
  ('without_security','land',5,1000,false),
  ('without_security','property',10,1000,false)
ON CONFLICT DO NOTHING;
INSERT INTO settings VALUES ('referral_percent','5') ON CONFLICT DO NOTHING;
