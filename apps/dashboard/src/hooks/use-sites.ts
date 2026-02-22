import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../lib/api';
import type { Site, ApiResponse } from '@agent-analytics/types';

export function useSites() {
  return useQuery({
    queryKey: ['sites'],
    queryFn: () => api.get<ApiResponse<Site[]>>('/sites'),
  });
}

export function useCreateSite() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (domain: string) => api.post<ApiResponse<Site>>('/sites', { domain }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['sites'] });
    },
  });
}

export function useRotateApiKey() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (siteId: string) =>
      api.post<ApiResponse<Site>>(`/sites/${siteId}/rotate-key`, {}),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['sites'] });
    },
  });
}
