import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { signToken } from '@/lib/auth'
import bcrypt from 'bcryptjs'

export async function POST(req: NextRequest) {
  const { email, password, role } = await req.json()
  if (!email || !password || !role) {
    return NextResponse.json({ error: 'Missing fields' }, { status: 400 })
  }

  const table = role === 'servicer' ? 'servicer' : 'customer'
  const idCol = role === 'servicer' ? 'servicer_id' : 'customer_id'

  // Note: your current schema stores plain passwords.
  // This code supports both plain-text (for existing rows) and bcrypt hashes (for new signups).
  const [rows] = await db.execute(
    `SELECT * FROM \`${table}\` WHERE email = ? LIMIT 1`,
    [email]
  ) as any[]

  const user = rows[0]
  if (!user) return NextResponse.json({ error: 'Invalid email or password' }, { status: 401 })

  // Support both bcrypt hashes and legacy plain-text passwords
  const valid = user.password.startsWith('$2')
    ? await bcrypt.compare(password, user.password)
    : password === user.password

  if (!valid) return NextResponse.json({ error: 'Invalid email or password' }, { status: 401 })

  const token = signToken({ id: user[idCol], email: user.email, name: user.name, role })

  const res = NextResponse.json({ ok: true })
  res.cookies.set('hl_token', token, { httpOnly: true, sameSite: 'lax', path: '/', maxAge: 60 * 60 * 24 * 7 })
  return res
}
