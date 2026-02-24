-- Add agent type classification and referrer tracking columns to events
ALTER TABLE "events" ADD COLUMN "agent_type" VARCHAR(20);
ALTER TABLE "events" ADD COLUMN "referrer_domain" VARCHAR(255);
ALTER TABLE "events" ADD COLUMN "referrer_type" VARCHAR(20);

-- Index for agent type queries (e.g. training vs search vs on_demand breakdown)
CREATE INDEX "idx_events_agent_type"
  ON "events" ("site_id", "agent_type", "timestamp" DESC);

-- Index for referrer type queries (e.g. AI referral analytics)
CREATE INDEX "idx_events_referrer_type"
  ON "events" ("site_id", "referrer_type", "timestamp" DESC);
