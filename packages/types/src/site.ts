export type PlanType = 'free' | 'starter' | 'pro' | 'enterprise';

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
    retentionDays: 30,
  },
  starter: {
    eventsPerMonth: 100_000,
    ratePerMinute: 500,
    sites: 5,
    retentionDays: 90,
  },
  pro: {
    eventsPerMonth: 1_000_000,
    ratePerMinute: 2_000,
    sites: Infinity,
    retentionDays: 365,
  },
  enterprise: {
    eventsPerMonth: Infinity,
    ratePerMinute: Infinity,
    sites: Infinity,
    retentionDays: Infinity,
  },
} as const satisfies Record<PlanType, PlanLimit>;

export interface PlanLimit {
  eventsPerMonth: number;
  ratePerMinute: number;
  sites: number;
  retentionDays: number;
}
