import { useQuery } from '@tanstack/react-query';
import { labelsApi } from '@/shared/services/api/labelsApi';
import type { LocaleInfo } from '@/types';

export function useLocales(isReachable: boolean) {
  const { data: locales = [], isLoading } = useQuery<LocaleInfo[]>({
    queryKey: ['labels', 'locales'],
    queryFn: () => labelsApi.fetchLocales(),
    staleTime: Infinity,
    enabled: isReachable,
  });

  return { locales, isLoading };
}
