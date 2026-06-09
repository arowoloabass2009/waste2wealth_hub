-- ============================================================
-- WASTE2WEALTH HUB — Row Level Security Policies  v1.0
-- ============================================================

-- ── Enable RLS ───────────────────────────────────────────
ALTER TABLE profiles       ENABLE ROW LEVEL SECURITY;
ALTER TABLE kyc_profiles   ENABLE ROW LEVEL SECURITY;
ALTER TABLE waste_listings ENABLE ROW LEVEL SECURITY;
ALTER TABLE trade_offers   ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages       ENABLE ROW LEVEL SECURITY;

-- ── Profiles ─────────────────────────────────────────────
CREATE POLICY "Public profiles visible to all"
  ON profiles FOR SELECT TO authenticated USING (true);

CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile"
  ON profiles FOR INSERT WITH CHECK (auth.uid() = id);

-- ── KYC Profiles ─────────────────────────────────────────
CREATE POLICY "Users can view own KYC"
  ON kyc_profiles FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own KYC"
  ON kyc_profiles FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own KYC"
  ON kyc_profiles FOR UPDATE USING (auth.uid() = user_id);

-- ── Waste Listings ───────────────────────────────────────
CREATE POLICY "Active listings visible to all authenticated"
  ON waste_listings FOR SELECT TO authenticated
  USING (status = 'active');

CREATE POLICY "Sellers can insert own listings"
  ON waste_listings FOR INSERT
  WITH CHECK (auth.uid() = seller_id);

CREATE POLICY "Sellers can update own listings"
  ON waste_listings FOR UPDATE
  USING (auth.uid() = seller_id);

CREATE POLICY "Sellers can delete own listings"
  ON waste_listings FOR DELETE
  USING (auth.uid() = seller_id);

-- ── Trade Offers ─────────────────────────────────────────
CREATE POLICY "Buyers and sellers can view their offers"
  ON trade_offers FOR SELECT
  USING (auth.uid() = buyer_id OR auth.uid() = seller_id);

CREATE POLICY "Buyers can create offers"
  ON trade_offers FOR INSERT
  WITH CHECK (auth.uid() = buyer_id);

CREATE POLICY "Parties can update their offers"
  ON trade_offers FOR UPDATE
  USING (auth.uid() = buyer_id OR auth.uid() = seller_id);

-- ── Messages ─────────────────────────────────────────────
CREATE POLICY "Users can read their own messages"
  ON messages FOR SELECT
  USING (auth.uid() = sender_id OR auth.uid() = receiver_id);

CREATE POLICY "Users can send messages"
  ON messages FOR INSERT
  WITH CHECK (auth.uid() = sender_id);
