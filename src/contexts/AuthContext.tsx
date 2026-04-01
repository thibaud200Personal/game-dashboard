import { createContext, useContext, useState, useCallback } from 'react'
import { authApi } from '../services/api/authApi'

interface AuthContextValue {
  role: 'admin' | 'user' | null
  login: (password: string) => Promise<void>
  logout: () => Promise<void>
}

const AuthContext = createContext<AuthContextValue | null>(null)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [role, setRole] = useState<'admin' | 'user' | null>(null)

  const login = useCallback(async (password: string) => {
    const result = await authApi.login(password)
    setRole(result.role)
  }, [])

  const logout = useCallback(async () => {
    await authApi.logout()
    setRole(null)
  }, [])

  return (
    <AuthContext.Provider value={{ role, login, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider')
  return ctx
}
