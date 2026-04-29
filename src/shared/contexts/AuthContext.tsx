import { createContext, useContext, useState, useCallback, useEffect, type ReactNode } from 'react';
import { authApi } from '@/shared/services/api/authApi';

interface AuthContextValue {
  role: 'admin' | 'user' | null
  isChecking: boolean
  login: (password: string) => Promise<void>
  logout: () => Promise<void>
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [role, setRole] = useState<'admin' | 'user' | null>(null);
  const [isChecking, setIsChecking] = useState(true);

  useEffect(() => {
    authApi.me().then(result => {
      setRole(result?.role ?? null);
    }).finally(() => setIsChecking(false));
  }, []);

  const login = useCallback(async (password: string) => {
    const result = await authApi.login(password);
    setRole(result.role);
  }, []);

  const logout = useCallback(async () => {
    await authApi.logout();
    setRole(null);
  }, []);

  return (
    <AuthContext.Provider value={{ role, isChecking, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

// eslint-disable-next-line react-refresh/only-export-components
export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider');
  return ctx;
}
