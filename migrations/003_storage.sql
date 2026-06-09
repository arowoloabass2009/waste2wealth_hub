-- ============================================================
-- WASTE2WEALTH HUB — Storage Buckets & Policies  v1.0
-- ============================================================

-- ── KYC Documents Bucket ─────────────────────────────────
INSERT INTO storage.buckets (id, name, public)
VALUES ('kyc-documents', 'kyc-documents', false)
ON CONFLICT DO NOTHING;

-- ── Listing Images Bucket ────────────────────────────────
INSERT INTO storage.buckets (id, name, public)
VALUES ('listing-images', 'listing-images', true)
ON CONFLICT DO NOTHING;

-- ── Storage Policies ─────────────────────────────────────

-- KYC docs: owners only
CREATE POLICY "Owners can upload KYC documents"
  ON storage.objects FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'kyc-documents' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Owners can read own KYC documents"
  ON storage.objects FOR SELECT TO authenticated
  USING (bucket_id = 'kyc-documents' AND auth.uid()::text = (storage.foldername(name))[1]);

-- Listing images: public read, owner write
CREATE POLICY "Authenticated users can upload listing images"
  ON storage.objects FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'listing-images');

CREATE POLICY "Listing images are publicly viewable"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'listing-images');
