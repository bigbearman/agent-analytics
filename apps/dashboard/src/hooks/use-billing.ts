import { useMutation } from '@tanstack/react-query';
import { api } from '../lib/api';
import type { PlanType } from '@agent-analytics/types';

export function useCreateCheckout() {
  return useMutation({
    mutationFn: async (plan: Exclude<PlanType, 'free'>) => {
      const res = await api.post<{ data: { checkoutUrl: string } }>(
        '/billing/checkout',
        { plan },
      );
      return res.data.checkoutUrl;
    },
    onSuccess: (checkoutUrl) => {
      window.location.href = checkoutUrl;
    },
  });
}

export function useManageBilling() {
  return useMutation({
    mutationFn: async () => {
      const res = await api.get<{ data: { portalUrl: string } }>(
        '/billing/portal',
      );
      return res.data.portalUrl;
    },
    onSuccess: (portalUrl) => {
      window.location.href = portalUrl;
    },
  });
}
