-- ============================================================
-- WASTE2WEALTH HUB — Initial Schema  v1.0
-- Global Waste Trading Marketplace
-- ============================================================

-- ── Extensions ──────────────────────────────────────────
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ── Profiles ────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS profiles (
  id              UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  first_name      TEXT,
  last_name       TEXT,
  email           TEXT UNIQUE NOT NULL,
  phone           TEXT,
  role            TEXT DEFAULT 'buyer' CHECK (role IN ('seller','buyer','trader','recycler','corporate','broker','admin')),
  country         TEXT DEFAULT 'Nigeria',
  state           TEXT,
  business_name   TEXT,
  kyc_status      TEXT DEFAULT 'not_started' CHECK (kyc_status IN ('not_started','in_progress','under_review','verified','rejected')),
  verified_badge  BOOLEAN DEFAULT FALSE,
  trader_rating   NUMERIC(3,2),
  total_trades    INTEGER DEFAULT 0,
  created_at      TIMESTAMPTZ DEFAULT NOW(),
  updated_at      TIMESTAMPTZ DEFAULT NOW()
);

-- ── KYC Profiles ────────────────────────────────────────
CREATE TABLE IF NOT EXISTS kyc_profiles (
  id                  UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id             UUID UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,

  -- Personal
  first_name          TEXT,
  middle_name         TEXT,
  last_name           TEXT,
  date_of_birth       DATE,
  gender              TEXT,
  nationality         TEXT,
  country             TEXT,
  state_of_origin     TEXT,
  residential_address TEXT,
  phone               TEXT,

  -- Trade profile
  trading_role        TEXT,
  market_zone         TEXT,
  business_name       TEXT,
  monthly_volume      TEXT,
  experience          TEXT,
  preferred_currency  TEXT DEFAULT 'NGN',

  -- Documents
  id_type             TEXT,
  id_number           TEXT,
  id_front_url        TEXT,
  id_back_url         TEXT,

  -- Business docs
  rc_number           TEXT,
  year_inc            TEXT,
  cac_doc_url         TEXT,
  permit_number       TEXT,
  permit_authority    TEXT,
  permit_url          TEXT,

  -- Banking
  bank_name           TEXT,
  account_name        TEXT,
  account_number      TEXT,  -- Stored encrypted in production
  bank_currency       TEXT DEFAULT 'NGN',

  -- Status
  status              TEXT DEFAULT 'not_started' CHECK (status IN ('not_started','in_progress','under_review','verified','rejected')),
  submitted_at        TIMESTAMPTZ,
  reviewed_at         TIMESTAMPTZ,
  reviewer_notes      TEXT,

  created_at          TIMESTAMPTZ DEFAULT NOW(),
  updated_at          TIMESTAMPTZ DEFAULT NOW()
);

-- ── Waste Listings ───────────────────────────────────────
CREATE TABLE IF NOT EXISTS waste_listings (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  seller_id       UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,

  title           TEXT NOT NULL,
  category        TEXT NOT NULL CHECK (category IN ('domestic','industrial','ewaste','agricultural','medical','construction','plastic','metal','paper','textile')),
  description     TEXT,
  quantity        NUMERIC(12,3) NOT NULL,
  unit            TEXT NOT NULL CHECK (unit IN ('kg','tonnes','litres','units','bales')),
  price_per_unit  NUMERIC(14,2) NOT NULL,
  currency        TEXT DEFAULT 'NGN' CHECK (currency IN ('NGN','USD','GBP','EUR','GHS','KES','ZAR')),

  -- Location
  location        TEXT,
  state           TEXT,
  country         TEXT DEFAULT 'Nigeria',
  zone            TEXT NOT NULL CHECK (zone IN ('local-nigeria','african-continent','international')),

  -- Status
  status          TEXT DEFAULT 'active' CHECK (status IN ('active','pending','sold','expired','suspended')),

  -- Metadata
  views           INTEGER DEFAULT 0,
  enquiries       INTEGER DEFAULT 0,
  images          TEXT[],
  tags            TEXT[],

  created_at      TIMESTAMPTZ DEFAULT NOW(),
  updated_at      TIMESTAMPTZ DEFAULT NOW(),
  expires_at      TIMESTAMPTZ DEFAULT (NOW() + INTERVAL '90 days')
);

-- ── Trade Enquiries / Offers ─────────────────────────────
CREATE TABLE IF NOT EXISTS trade_offers (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  listing_id      UUID NOT NULL REFERENCES waste_listings(id) ON DELETE CASCADE,
  buyer_id        UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  seller_id       UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,

  offered_price   NUMERIC(14,2) NOT NULL,
  offered_qty     NUMERIC(12,3),
  currency        TEXT DEFAULT 'NGN',
  message         TEXT,
  status          TEXT DEFAULT 'pending' CHECK (status IN ('pending','accepted','rejected','countered','expired','completed')),

  created_at      TIMESTAMPTZ DEFAULT NOW(),
  updated_at      TIMESTAMPTZ DEFAULT NOW()
);

-- ── Messages ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS messages (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  offer_id    UUID REFERENCES trade_offers(id) ON DELETE SET NULL,
  sender_id   UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  receiver_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  content     TEXT NOT NULL,
  read        BOOLEAN DEFAULT FALSE,
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

-- ── Indexes ──────────────────────────────────────────────
CREATE INDEX IF NOT EXISTS idx_listings_category  ON waste_listings(category);
CREATE INDEX IF NOT EXISTS idx_listings_zone       ON waste_listings(zone);
CREATE INDEX IF NOT EXISTS idx_listings_country    ON waste_listings(country);
CREATE INDEX IF NOT EXISTS idx_listings_state      ON waste_listings(state);
CREATE INDEX IF NOT EXISTS idx_listings_seller     ON waste_listings(seller_id);
CREATE INDEX IF NOT EXISTS idx_listings_status     ON waste_listings(status);
CREATE INDEX IF NOT EXISTS idx_offers_listing      ON trade_offers(listing_id);
CREATE INDEX IF NOT EXISTS idx_offers_buyer        ON trade_offers(buyer_id);
CREATE INDEX IF NOT EXISTS idx_messages_receiver   ON messages(receiver_id);
