-- CreateTable
CREATE TABLE "users" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "name" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "sites" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "domain" VARCHAR(255) NOT NULL,
    "api_key" VARCHAR(64) NOT NULL,
    "plan" VARCHAR(20) NOT NULL DEFAULT 'free',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "sites_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "events" (
    "id" BIGSERIAL NOT NULL,
    "site_id" TEXT NOT NULL,
    "session_id" VARCHAR(64),
    "url" TEXT NOT NULL,
    "action" VARCHAR(50) NOT NULL,
    "is_agent" BOOLEAN NOT NULL DEFAULT false,
    "agent_name" VARCHAR(100),
    "confidence" SMALLINT NOT NULL DEFAULT 0,
    "country" VARCHAR(2),
    "timestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "meta" JSONB,

    CONSTRAINT "events_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "daily_aggregates" (
    "id" BIGSERIAL NOT NULL,
    "site_id" TEXT NOT NULL,
    "date" DATE NOT NULL,
    "total_events" INTEGER NOT NULL DEFAULT 0,
    "agent_events" INTEGER NOT NULL DEFAULT 0,
    "human_events" INTEGER NOT NULL DEFAULT 0,
    "unique_agents" INTEGER NOT NULL DEFAULT 0,
    "top_agents" JSONB NOT NULL DEFAULT '[]',

    CONSTRAINT "daily_aggregates_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "monthly_usage" (
    "id" BIGSERIAL NOT NULL,
    "site_id" TEXT NOT NULL,
    "month" DATE NOT NULL,
    "event_count" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "monthly_usage_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE UNIQUE INDEX "sites_api_key_key" ON "sites"("api_key");

-- CreateIndex
CREATE INDEX "sites_user_id_idx" ON "sites"("user_id");

-- CreateIndex
CREATE INDEX "sites_api_key_idx" ON "sites"("api_key");

-- CreateIndex
CREATE INDEX "idx_events_site_agent" ON "events"("site_id", "is_agent", "timestamp" DESC);

-- CreateIndex
CREATE INDEX "idx_events_agent_name" ON "events"("agent_name", "timestamp" DESC);

-- CreateIndex
CREATE INDEX "idx_events_site_timestamp" ON "events"("site_id", "timestamp" DESC);

-- CreateIndex
CREATE INDEX "daily_aggregates_site_id_date_idx" ON "daily_aggregates"("site_id", "date" DESC);

-- CreateIndex
CREATE UNIQUE INDEX "daily_aggregates_site_id_date_key" ON "daily_aggregates"("site_id", "date");

-- CreateIndex
CREATE UNIQUE INDEX "monthly_usage_site_id_month_key" ON "monthly_usage"("site_id", "month");

-- AddForeignKey
ALTER TABLE "sites" ADD CONSTRAINT "sites_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "events" ADD CONSTRAINT "events_site_id_fkey" FOREIGN KEY ("site_id") REFERENCES "sites"("id") ON DELETE CASCADE ON UPDATE CASCADE;
