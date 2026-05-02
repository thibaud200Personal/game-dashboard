import { useQuery } from '@tanstack/react-query';
import { labelsApi } from '@/shared/services/api/labelsApi';
import { useLocaleContext } from '@/shared/contexts/LocaleContext';
import enFallback from '@/shared/i18n/en.json';

export function useLabels() {
  const { locale } = useLocaleContext();

  const { data, isLoading } = useQuery<Record<string, string>>({
    queryKey: ['labels', locale],
    queryFn: () => labelsApi.fetchLabels(locale),
    staleTime: Infinity,
    placeholderData: enFallback as Record<string, string>,
  });

  const labels = { ...(enFallback as Record<string, string>), ...(data ?? {}) };

  function t(key: string, fallback?: string): string {
    return labels[key] ?? fallback ?? key;
  }

  return { t, isLoading };
}
