-- ReferAus: Post-a-Request, Availability Alerts, AI Match support columns
-- Run this in Supabase SQL Editor. Safe to run multiple times.
-- Matches the live schema convention: provider_id (uuid, FK to providers.id)
-- as primary relation, provider_slug kept alongside for convenience/display.

-- ============================================================
-- 1. Participant requests ("Post a Request")
-- ============================================================
CREATE TABLE IF NOT EXISTS participant_requests (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  participant_id uuid REFERENCES participants(id) ON DELETE SET NULL,
  participant_name text NOT NULL,
  email text NOT NULL,
  services_needed text[] DEFAULT '{}',
  region text,
  postcode text,
  budget numeric,
  preferences text[] DEFAULT '{}',
  details text,
  status text DEFAULT 'open' CHECK (status IN ('open', 'closed')),
  created_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_participant_requests_status ON participant_requests(status);
CREATE INDEX IF NOT EXISTS idx_participant_requests_region ON participant_requests(region);

-- ============================================================
-- 2. Responses from providers to a request
-- ============================================================
CREATE TABLE IF NOT EXISTS request_responses (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  request_id uuid REFERENCES participant_requests(id) ON DELETE CASCADE,
  provider_id uuid REFERENCES providers(id) ON DELETE CASCADE,
  provider_slug text,
  message text NOT NULL,
  price text,
  availability text,
  created_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_request_responses_request_id ON request_responses(request_id);
CREATE INDEX IF NOT EXISTS idx_request_responses_provider_id ON request_responses(provider_id);

-- ============================================================
-- 3. Availability alerts (email-based, no login required)
-- ============================================================
CREATE TABLE IF NOT EXISTS availability_alerts (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  email text NOT NULL,
  service text,
  region text,
  provider_id uuid REFERENCES providers(id) ON DELETE CASCADE,
  notified boolean DEFAULT false,
  created_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_availability_alerts_provider_id ON availability_alerts(provider_id);
CREATE INDEX IF NOT EXISTS idx_availability_alerts_email ON availability_alerts(email);

-- ============================================================
-- 4. Provider columns for match/booking features
--    (NOTE: "availability" already exists as jsonb weekly schedule —
--    these are new, differently-named columns, no collision)
-- ============================================================
ALTER TABLE providers ADD COLUMN IF NOT EXISTS availability_status text DEFAULT 'Contact for availability';
ALTER TABLE providers ADD COLUMN IF NOT EXISTS availability_rank integer DEFAULT 1;
ALTER TABLE providers ADD COLUMN IF NOT EXISTS registration_expiry date;
ALTER TABLE providers ADD COLUMN IF NOT EXISTS video_url text;
ALTER TABLE providers ADD COLUMN IF NOT EXISTS booking_url text;

-- ============================================================
-- 5. Row Level Security
-- ============================================================
ALTER TABLE participant_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE request_responses ENABLE ROW LEVEL SECURITY;
ALTER TABLE availability_alerts ENABLE ROW LEVEL SECURITY;

-- Anyone can post a request; open requests are publicly browsable so providers can respond
DROP POLICY IF EXISTS "Anyone can create a request" ON participant_requests;
CREATE POLICY "Anyone can create a request" ON participant_requests FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Open requests are publicly viewable" ON participant_requests;
CREATE POLICY "Open requests are publicly viewable" ON participant_requests FOR SELECT USING (true);

-- Providers can respond to requests; responses are publicly viewable (so the
-- participant who posted the request can see replies without an account)
DROP POLICY IF EXISTS "Providers can respond to requests" ON request_responses;
CREATE POLICY "Providers can respond to requests" ON request_responses FOR INSERT TO authenticated
  WITH CHECK (EXISTS (SELECT 1 FROM providers WHERE providers.id = request_responses.provider_id AND providers.user_id = auth.uid()));

DROP POLICY IF EXISTS "Responses are publicly viewable" ON request_responses;
CREATE POLICY "Responses are publicly viewable" ON request_responses FOR SELECT USING (true);

-- Anyone can subscribe to an availability alert
DROP POLICY IF EXISTS "Anyone can create an alert" ON availability_alerts;
CREATE POLICY "Anyone can create an alert" ON availability_alerts FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Provider owner can view their alerts" ON availability_alerts;
CREATE POLICY "Provider owner can view their alerts" ON availability_alerts FOR SELECT TO authenticated
  USING (EXISTS (SELECT 1 FROM providers WHERE providers.id = availability_alerts.provider_id AND providers.user_id = auth.uid()));
