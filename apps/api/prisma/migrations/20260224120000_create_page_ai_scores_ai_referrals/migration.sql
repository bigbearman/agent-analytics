-- CreateTable
CREATE TABLE "page_ai_scores" (
    "id" BIGSERIAL NOT NULL,
    "site_id" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "date" DATE NOT NULL,
    "ai_score" SMALLINT NOT NULL DEFAULT 0,
    "crawl_score" SMALLINT NOT NULL DEFAULT 0,
    "citation_score" SMALLINT NOT NULL DEFAULT 0,
    "readiness_score" SMALLINT NOT NULL DEFAULT 0,
    "crawl_count" INTEGER NOT NULL DEFAULT 0,
    "referral_count" INTEGER NOT NULL DEFAULT 0,
    "agent_count" INTEGER NOT NULL DEFAULT 0,
    "top_agent" VARCHAR(100),

    CONSTRAINT "page_ai_scores_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ai_referrals" (
    "id" BIGSERIAL NOT NULL,
    "site_id" TEXT NOT NULL,
    "referrer_domain" VARCHAR(255) NOT NULL,
    "landing_url" TEXT NOT NULL,
    "timestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "meta" JSONB,

    CONSTRAINT "ai_referrals_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "page_ai_scores_site_id_url_date_key" ON "page_ai_scores"("site_id", "url", "date");

-- CreateIndex
CREATE INDEX "page_ai_scores_site_id_date_idx" ON "page_ai_scores"("site_id", "date" DESC);

-- CreateIndex
CREATE INDEX "ai_referrals_site_id_referrer_domain_timestamp_idx" ON "ai_referrals"("site_id", "referrer_domain", "timestamp" DESC);

-- CreateIndex
CREATE INDEX "ai_referrals_site_id_timestamp_idx" ON "ai_referrals"("site_id", "timestamp" DESC);
