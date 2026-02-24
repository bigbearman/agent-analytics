export type PlanType = 'free' | 'starter' | 'pro' | 'business';

export interface Site {
  id: string;
  userId: string;
  domain: string;
  apiKey: string;
  plan: PlanType;
  createdAt: Date;
}

export const PLAN_LIMITS = {
  free: {
    eventsPerMonth: 10_000,
    ratePerMinute: 100,
    sites: 1,
    retentionDays: 7,
  },
  starter: {
    eventsPerMonth: 100_000,
    ratePerMinute: 500,
    sites: 3,
    retentionDays: 30,
  },
  pro: {
    eventsPerMonth: 500_000,
    ratePerMinute: 2_000,
    sites: 10,
    retentionDays: 90,
  },
  business: {
    eventsPerMonth: 5_000_000,
    ratePerMinute: 10_000,
    sites: Infinity,
    retentionDays: 365,
  },
} as const satisfies Record<PlanType, PlanLimit>;

export interface PlanLimit {
  eventsPerMonth: number;
  ratePerMinute: number;
  sites: number;
  retentionDays: number;
}
