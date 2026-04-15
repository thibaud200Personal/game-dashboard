let refreshPromise: Promise<boolean> | null = null;

async function attemptRefresh(): Promise<boolean> {
  if (!refreshPromise) {
    refreshPromise = fetch('/api/v1/auth/refresh', {
      method: 'POST',
      credentials: 'include',
    })
      .then(r => r.ok)
      .catch(() => false)
      .finally(() => { refreshPromise = null; });
  }
  return refreshPromise;
}

function redirectToLogin(): never {
  window.location.href = '/login';
  throw new Error('Session expired — redirecting to login');
}

export async function request<T>(url: string, options?: RequestInit): Promise<T> {
  const res = await fetch(url, { credentials: 'include', ...options });

  if (res.status === 401) {
    const refreshed = await attemptRefresh();
    if (!refreshed) redirectToLogin();

    const retry = await fetch(url, { credentials: 'include', ...options });
    if (retry.status === 401) redirectToLogin();
    if (!retry.ok) {
      const body = await retry.json().catch(() => ({})) as { error?: string };
      throw new Error(body.error ?? `HTTP ${retry.status}`);
    }
    if (retry.status === 204) return undefined as T;
    return retry.json() as Promise<T>;
  }

  if (!res.ok) {
    const body = await res.json().catch(() => ({})) as { error?: string };
    throw new Error(body.error ?? `HTTP ${res.status}`);
  }
  if (res.status === 204) return undefined as T;
  return res.json() as Promise<T>;
}
