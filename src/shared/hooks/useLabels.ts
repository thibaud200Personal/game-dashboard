import { useQuery } from '@tanstack/react-query';
import { labelsApi } from '@/shared/services/api/labelsApi';
import { getStoredLocale } from '@/shared/hooks/useLocale';
import enFallback from '@/shared/i18n/en.json';

export function useLabels() {
  const locale = getStoredLocale();

  const { data, isLoading } = useQuery<Record<string, string>>({
    queryKey: ['labels', locale],
    queryFn: () => labelsApi.fetchLabels(locale),
    staleTime: Infinity,
    placeholderData: enFallback as Record<string, string>,
  });

  const labels = data ?? (enFallback as Record<string, string>);

  function t(key: string, fallback?: string): string {
    return labels[key] ?? fallback ?? key;
  }

  return { t, isLoading };
}
