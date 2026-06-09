# Waste2Wealth Hub — Database Setup

## Running Migrations

Run in order in your Supabase SQL editor:

1. `001_initial_schema.sql` — Creates all tables and indexes
2. `002_rls_policies.sql`   — Applies Row Level Security policies
3. `003_storage.sql`        — Creates storage buckets

## Supabase Configuration

Update `js/supabase.js` with your project credentials:

```js
const SUPABASE_URL     = 'https://YOUR-PROJECT.supabase.co';
const SUPABASE_ANON_KEY = 'YOUR-ANON-PUBLIC-KEY';
```

Both values are in **Supabase → Settings → API**.

## Tables Overview

| Table | Purpose |
|-------|---------|
| `profiles` | User profiles mirroring auth.users |
| `kyc_profiles` | KYC and verification data |
| `waste_listings` | Waste for sale listings |
| `trade_offers` | Buyer offers and negotiations |
| `messages` | In-platform messaging |

## Storage Buckets

| Bucket | Access | Purpose |
|--------|--------|---------|
| `kyc-documents` | Private (owner only) | ID docs, CAC certificates |
| `listing-images` | Public | Waste listing photos |
