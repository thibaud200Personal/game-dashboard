import { useState, useEffect, useCallback } from 'react';

export function useApiReachable() {
  const [isReachable, setIsReachable] = useState<boolean>(true);
  const [retryTick, setRetryTick] = useState(0);

  useEffect(() => {
    let cancelled = false;
    fetch('/api/v1/health', { credentials: 'include' })
      .then(res => { if (!cancelled) setIsReachable(res.ok); })
      .catch(() => { if (!cancelled) setIsReachable(false); });
    return () => { cancelled = true; };
  }, [retryTick]);

  const triggerRetry = useCallback(() => setRetryTick(t => t + 1), []);

  return { isReachable, triggerRetry };
}
