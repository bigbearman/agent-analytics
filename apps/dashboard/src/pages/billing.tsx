import { Check } from 'lucide-react';
import { useSearchParams } from 'react-router-dom';
import { useCreateCheckout, useManageBilling } from '../hooks/use-billing';
import { useSites } from '../hooks/use-sites';
import clsx from 'clsx';
import type { PlanType } from '@agent-analytics/types';

interface PlanCard {
  id: Exclude<PlanType, 'free'>;
  name: string;
  price: number;
  features: string[];
  limits: string;
  highlight?: boolean;
}

const PLANS: PlanCard[] = [
  {
    id: 'starter',
    name: 'Starter',
    price: 19,
    limits: '100K events/mo, 3 sites',
    features: [
      'AI referral tracking',
      'Top 50 page analysis',
      'Top 20 Content AI Score',
      'Basic recommendations',
      'Weekly alerts',
    ],
  },
  {
    id: 'pro',
    name: 'Pro',
    price: 49,
    limits: '500K events/mo, 10 sites',
    highlight: true,
    features: [
      'Everything in Starter',
      'Unlimited page analysis',
      'Unlimited Content AI Score',
      'Advanced recommendations',
      'Realtime alerts',
      'CSV/PDF export',
      'API access',
      '3 team members',
    ],
  },
  {
    id: 'business',
    name: 'Business',
    price: 149,
    limits: '5M events/mo, unlimited sites',
    features: [
      'Everything in Pro',
      'White-label reports',
      'Unlimited team members',
      'Priority support',
      '1 year data retention',
    ],
  },
];

export function BillingPage() {
  const [searchParams] = useSearchParams();
  const checkout = useCreateCheckout();
  const manageBilling = useManageBilling();
  const { data: sitesData } = useSites();
  const currentPlan = (sitesData?.data?.[0]?.plan ?? 'free') as PlanType;
  const success = searchParams.get('success') === 'true';
  const canceled = searchParams.get('canceled') === 'true';

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Billing</h2>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
          Manage your subscription and billing
        </p>
      </div>

      {success && (
        <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4 text-green-700 dark:text-green-400 text-sm">
          Subscription updated successfully! Your plan may take a moment to reflect.
        </div>
      )}

      {canceled && (
        <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4 text-yellow-700 dark:text-yellow-400 text-sm">
          Checkout was canceled. You can try again anytime.
        </div>
      )}

      {/* Current plan info */}
      <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-gray-500 dark:text-gray-400">Current plan</p>
            <p className="text-xl font-bold text-gray-900 dark:text-white capitalize">{currentPlan}</p>
          </div>
          {currentPlan !== 'free' && (
            <button
              onClick={() => manageBilling.mutate()}
              disabled={manageBilling.isPending}
              className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-800 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors disabled:opacity-50"
            >
              {manageBilling.isPending ? 'Loading...' : 'Manage Billing'}
            </button>
          )}
        </div>
      </div>

      {/* Pricing cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {PLANS.map((plan) => {
          const isCurrentPlan = currentPlan === plan.id;

          return (
            <div
              key={plan.id}
              className={clsx(
                'bg-white dark:bg-gray-900 rounded-xl border p-6 flex flex-col',
                plan.highlight
                  ? 'border-brand-500 ring-2 ring-brand-500/20'
                  : 'border-gray-200 dark:border-gray-800',
              )}
            >
              {plan.highlight && (
                <span className="self-start px-3 py-1 text-xs font-semibold text-brand-700 dark:text-brand-400 bg-brand-50 dark:bg-brand-900/20 rounded-full mb-4">
                  Most Popular
                </span>
              )}

              <h3 className="text-lg font-bold text-gray-900 dark:text-white">{plan.name}</h3>
              <div className="mt-2 flex items-baseline gap-1">
                <span className="text-3xl font-bold text-gray-900 dark:text-white">${plan.price}</span>
                <span className="text-sm text-gray-500">/mo</span>
              </div>
              <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">{plan.limits}</p>

              <ul className="mt-6 space-y-3 flex-1">
                {plan.features.map((feature) => (
                  <li key={feature} className="flex items-start gap-2">
                    <Check size={16} className="text-green-500 mt-0.5 flex-shrink-0" />
                    <span className="text-sm text-gray-600 dark:text-gray-400">{feature}</span>
                  </li>
                ))}
              </ul>

              <button
                onClick={() => !isCurrentPlan && checkout.mutate(plan.id)}
                disabled={isCurrentPlan || checkout.isPending}
                className={clsx(
                  'mt-6 w-full py-2.5 rounded-lg text-sm font-semibold transition-colors',
                  isCurrentPlan
                    ? 'bg-gray-100 dark:bg-gray-800 text-gray-400 cursor-not-allowed'
                    : plan.highlight
                      ? 'bg-brand-600 text-white hover:bg-brand-700'
                      : 'bg-gray-900 dark:bg-white text-white dark:text-gray-900 hover:bg-gray-800 dark:hover:bg-gray-100',
                )}
              >
                {isCurrentPlan ? 'Current Plan' : checkout.isPending ? 'Loading...' : `Upgrade to ${plan.name}`}
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}
