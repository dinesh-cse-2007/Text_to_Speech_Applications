/*
# Create tts_history table (single-tenant, no auth)

1. New Tables
- `tts_history`
  - `id` (uuid, primary key)
  - `text` (text, not null) — the spoken text
  - `voice_name` (text, not null) — name of the voice used
  - `rate` (real, default 1.0) — speech rate
  - `pitch` (real, default 1.0) — speech pitch
  - `volume` (real, default 1.0) — speech volume
  - `created_at` (timestamptz, default now())
2. Security
- Enable RLS on `tts_history`.
- Allow anon + authenticated CRUD because the data is intentionally shared/public (no sign-in).
*/

CREATE TABLE IF NOT EXISTS tts_history (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  text text NOT NULL,
  voice_name text NOT NULL,
  rate real NOT NULL DEFAULT 1.0,
  pitch real NOT NULL DEFAULT 1.0,
  volume real NOT NULL DEFAULT 1.0,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE tts_history ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "anon_select_tts_history" ON tts_history;
CREATE POLICY "anon_select_tts_history" ON tts_history FOR SELECT
TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "anon_insert_tts_history" ON tts_history;
CREATE POLICY "anon_insert_tts_history" ON tts_history FOR INSERT
TO anon, authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "anon_update_tts_history" ON tts_history;
CREATE POLICY "anon_update_tts_history" ON tts_history FOR UPDATE
TO anon, authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "anon_delete_tts_history" ON tts_history;
CREATE POLICY "anon_delete_tts_history" ON tts_history FOR DELETE
TO anon, authenticated USING (true);
