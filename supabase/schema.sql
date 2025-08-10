/*
  # OpsForge Command Center Database Schema

  1. New Tables
    - `leads` - Customer leads with contact info and status
    - `photos` - Damage photos linked to leads with AI analysis
    - `quotes` - Price quotes with rationale and status
    - `messages` - SMS/WhatsApp message history
    - `events` - System event log for tracking all actions

  2. Security
    - Enable RLS on all tables
    - Add policies for authenticated access
    - Create storage bucket for photos

  3. Indexes
    - Phone lookup on leads
    - Message history by lead
    - Event filtering by type and lead
*/

-- Create tables
CREATE TABLE IF NOT EXISTS leads (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  phone text UNIQUE NOT NULL,
  vehicle text,
  source text,
  city text,
  status text DEFAULT 'draft',
  conversation_sid text,
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS photos (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  lead_id uuid REFERENCES leads(id) ON DELETE CASCADE,
  url text NOT NULL,
  ai_notes jsonb,
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS quotes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  lead_id uuid REFERENCES leads(id) ON DELETE CASCADE,
  low integer NOT NULL,
  high integer NOT NULL,
  system text NOT NULL,
  prep_flags text[],
  rationale text[],
  upsells text[],
  status text DEFAULT 'draft',
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  lead_id uuid REFERENCES leads(id) ON DELETE CASCADE,
  direction text NOT NULL CHECK (direction IN ('inbound', 'outbound')),
  channel text NOT NULL CHECK (channel IN ('sms', 'whatsapp', 'web')),
  body text NOT NULL,
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  lead_id uuid REFERENCES leads(id) ON DELETE SET NULL,
  type text NOT NULL,
  payload jsonb,
  created_at timestamptz DEFAULT now()
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_leads_phone ON leads(phone);
CREATE INDEX IF NOT EXISTS idx_messages_lead_created ON messages(lead_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_events_type ON events(type);
CREATE INDEX IF NOT EXISTS idx_events_lead ON events(lead_id);

-- Enable RLS
ALTER TABLE leads ENABLE ROW LEVEL SECURITY;
ALTER TABLE photos ENABLE ROW LEVEL SECURITY;
ALTER TABLE quotes ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE events ENABLE ROW LEVEL SECURITY;

-- RLS Policies (allow all for service role, restrict for others)
CREATE POLICY "Service role full access" ON leads
  FOR ALL TO service_role USING (true);

CREATE POLICY "Service role full access" ON photos
  FOR ALL TO service_role USING (true);

CREATE POLICY "Service role full access" ON quotes
  FOR ALL TO service_role USING (true);

CREATE POLICY "Service role full access" ON messages
  FOR ALL TO service_role USING (true);

CREATE POLICY "Service role full access" ON events
  FOR ALL TO service_role USING (true);

-- Authenticated users can read all data
CREATE POLICY "Authenticated read access" ON leads
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "Authenticated read access" ON photos
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "Authenticated read access" ON quotes
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "Authenticated read access" ON messages
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "Authenticated read access" ON events
  FOR SELECT TO authenticated USING (true);

-- Insert seed data
INSERT INTO leads (name, phone, vehicle, source, city, status, conversation_sid) VALUES
  ('John Smith', '+12671234567', '2019 Toyota Camry', 'website', 'Philadelphia', 'draft', 'CH123abc'),
  ('Jane Doe', '+12677654321', '2021 Honda Accord', 'referral', 'Philadelphia', 'sent', NULL),
  ('Mike Johnson', '+12675555555', '2020 Ford F-150', 'google', 'Philadelphia', 'draft', NULL)
ON CONFLICT (phone) DO NOTHING;

-- Insert sample events
INSERT INTO events (lead_id, type, payload) VALUES
  ((SELECT id FROM leads WHERE phone = '+12671234567'), 'lead.created', '{"source": "website"}'),
  ((SELECT id FROM leads WHERE phone = '+12671234567'), 'quote.drafted', '{"low": 1200, "high": 1800}'),
  ((SELECT id FROM leads WHERE phone = '+12677654321'), 'msg.outbound', '{"body": "Quote sent"}'),
  (NULL, 'ccc.imported', '{"count": 2, "success": 2, "errors": 0}'),
  (NULL, 'seo.generated', '{"keyword": "auto body shop", "city": "Philadelphia", "service": "collision repair", "url": "https://example.com/auto-body-shop-philadelphia"}')
