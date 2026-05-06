import jwt from 'jsonwebtoken'
import { cookies } from 'next/headers'

const SECRET = process.env.JWT_SECRET || 'dev_secret'

export type UserRole = 'customer' | 'servicer'

export interface AuthPayload {
  id: number
  email: string
  name: string
  role: UserRole
}

export function signToken(payload: AuthPayload): string {
  return jwt.sign(payload, SECRET, { expiresIn: '7d' })
}

export function verifyToken(token: string): AuthPayload | null {
  try {
    return jwt.verify(token, SECRET) as AuthPayload
  } catch {
    return null
  }
}

export function getSession(): AuthPayload | null {
  const cookieStore = cookies()
  const token = cookieStore.get('hl_token')?.value
  if (!token) return null
  return verifyToken(token)
}
