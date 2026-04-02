import jwt from 'jsonwebtoken'

interface TokenPayload {
  sub: string
  role: 'admin' | 'user'
  iat?: number
  exp?: number
}

export class AuthService {
  constructor(
    private readonly secret: string,
    private readonly adminPassword: string,
    private readonly userPassword: string,
  ) {}

  login(password: string): { token: string; role: 'admin' | 'user' } | null {
    if (password === this.adminPassword) return { token: this._sign('admin'), role: 'admin' }
    if (this.userPassword && password === this.userPassword) return { token: this._sign('user'), role: 'user' }
    return null
  }

  verifyToken(token: string): TokenPayload | null {
    try {
      return jwt.verify(token, this.secret) as TokenPayload
    } catch {
      return null
    }
  }

  private _sign(role: 'admin' | 'user'): string {
    return jwt.sign({ sub: role, role }, this.secret, { expiresIn: '1h' })
  }
}

export function createAuthService(): AuthService {
  const secret = process.env.AUTH_JWT_SECRET
  if (!secret || secret.length < 32) {
    throw new Error('[FATAL] AUTH_JWT_SECRET must be set and at least 32 characters')
  }
  const adminPwd = process.env.ADMIN_PASSWORD
  if (!adminPwd) throw new Error('[FATAL] ADMIN_PASSWORD must be set')
  const userPwd = process.env.USER_PASSWORD ?? ''
  return new AuthService(secret, adminPwd, userPwd)
}
