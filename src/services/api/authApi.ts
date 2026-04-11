export const authApi = {
  login: (password: string): Promise<{ role: 'admin' | 'user' }> =>
    fetch('/api/v1/auth/login', {
      method: 'POST',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ password }),
    }).then(async res => {
      if (!res.ok) throw new Error('Invalid credentials');
      return res.json() as Promise<{ role: 'admin' | 'user' }>;
    }),

  me: (): Promise<{ role: 'admin' | 'user' } | null> =>
    fetch('/api/v1/auth/me', { credentials: 'include' }).then(res =>
      res.ok ? (res.json() as Promise<{ role: 'admin' | 'user' }>) : null
    ),

  refresh: (): Promise<{ role: 'admin' | 'user' } | null> =>
    fetch('/api/v1/auth/refresh', { method: 'POST', credentials: 'include' }).then(res =>
      res.ok ? (res.json() as Promise<{ role: 'admin' | 'user' }>) : null
    ),

  logout: (): Promise<void> =>
    fetch('/api/v1/auth/logout', { method: 'POST', credentials: 'include' }).then(() => undefined),
};
