import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { getSession } from '@/lib/auth'

// GET /api/requests — returns all requests (servicer) or own requests (customer)
export async function GET() {
  const session = getSession()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const [rows] = session.role === 'customer'
    ? await db.execute(
        `SELECT r.*, s.name AS servicer_name FROM request r
         LEFT JOIN servicer s ON r.servicer_id = s.servicer_id
         WHERE r.customer_id = ? ORDER BY r.request_id DESC`, [session.id])
    : await db.execute(
        `SELECT r.*, c.name AS customer_name FROM request r
         LEFT JOIN customer c ON r.customer_id = c.customer_id
         ORDER BY r.request_id DESC`)

  return NextResponse.json(rows)
}

// POST /api/requests — customer creates a new request
export async function POST(req: NextRequest) {
  const session = getSession()
  if (!session || session.role !== 'customer') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { problem, address } = await req.json()
  if (!problem) return NextResponse.json({ error: 'Problem description is required' }, { status: 400 })

  const [result] = await db.execute(
    `INSERT INTO request (customer_id, problem, address) VALUES (?, ?, ?)`,
    [session.id, problem, address || null]
  ) as any[]

  return NextResponse.json({ request_id: (result as any).insertId }, { status: 201 })
}
