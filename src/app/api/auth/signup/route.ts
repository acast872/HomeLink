import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { signToken } from '@/lib/auth'
import bcrypt from 'bcryptjs'

export async function POST(req: NextRequest) {
  const { name, email, password, phone_num, address, role } = await req.json()
  if (!email || !password || !role) {
    return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
  }

  const table = role === 'servicer' ? 'servicer' : 'customer'
  const idCol  = role === 'servicer' ? 'servicer_id' : 'customer_id'

  // Check for duplicate email
  const [existing] = await db.execute(
    `SELECT ${idCol} FROM \`${table}\` WHERE email = ? LIMIT 1`, [email]
  ) as any[]
  if ((existing as any[]).length > 0) {
    return NextResponse.json({ error: 'Email already registered' }, { status: 409 })
  }

  const hashed = await bcrypt.hash(password, 10)

  let result: any
  if (role === 'servicer') {
    // servicer table: name, phone_num, email, password (no address col)
    ;[result] = await db.execute(
      `INSERT INTO servicer (name, phone_num, email, password) VALUES (?, ?, ?, ?)`,
      [name || null, phone_num || null, email, hashed]
    )
  } else {
    // customer table: name, address, phone_num, email, password
    ;[result] = await db.execute(
      `INSERT INTO customer (name, address, phone_num, email, password) VALUES (?, ?, ?, ?, ?)`,
      [name || null, address || null, phone_num || null, email, hashed]
    )
  }

  const newId = (result as any).insertId
  const token = signToken({ id: newId, email, name: name || email, role })

  const res = NextResponse.json({ ok: true })
  res.cookies.set('hl_token', token, { httpOnly: true, sameSite: 'lax', path: '/', maxAge: 60 * 60 * 24 * 7 })
  return res
}
