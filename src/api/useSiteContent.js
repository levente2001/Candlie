import { useQuery, useQueryClient } from '@tanstack/react-query';
import { fetchAllSiteContent, saveSiteContentValue } from '@/api/siteContent';

export function useSiteContentMap() {
  return useQuery({
    queryKey: ['site-content'],
    queryFn: fetchAllSiteContent,
    staleTime: 60_000,
  });
}

export function useSiteContentValue(contentKey, fallback = '') {
  const { data } = useSiteContentMap();
  const v = data?.[contentKey];
  return typeof v === 'string' && v.length ? v : fallback;
}

export function useSaveSiteContent() {
  const qc = useQueryClient();
  return async (contentKey, value) => {
    await saveSiteContentValue(contentKey, value);
    qc.setQueryData(['site-content'], (old) => ({ ...(old || {}), [contentKey]: String(value ?? '') }));
  };
}
