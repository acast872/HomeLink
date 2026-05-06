import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { getSession } from '@/lib/auth'

export async function GET() {
  const session = getSession()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const [rows] = session.role === 'customer'
    ? await db.execute(
        `SELECT rv.*, s.name AS servicer_name FROM review rv
         LEFT JOIN servicer s ON rv.servicer_id = s.servicer_id
         WHERE rv.customer_id = ? ORDER BY rv.date DESC`, [session.id])
    : await db.execute(
        `SELECT rv.*, c.name AS customer_name FROM review rv
         LEFT JOIN customer c ON rv.customer_id = c.customer_id
         WHERE rv.servicer_id = ? ORDER BY rv.date DESC`, [session.id])

  return NextResponse.json(rows)
}

// POST /api/reviews — customer leaves a review for a servicer
export async function POST(req: NextRequest) {
  const session = getSession()
  if (!session || session.role !== 'customer') {
    return NextResponse.json({ error: 'Only customers can leave reviews' }, { status: 403 })
  }

  const { servicer_id, rating } = await req.json()
  if (!servicer_id || !rating) {
    return NextResponse.json({ error: 'servicer_id and rating are required' }, { status: 400 })
  }
  if (rating < 1 || rating > 5) {
    return NextResponse.json({ error: 'Rating must be between 1 and 5' }, { status: 400 })
  }

  const today = new Date().toISOString().split('T')[0]
  const [result] = await db.execute(
    `INSERT INTO review (customer_id, servicer_id, rating, date) VALUES (?, ?, ?, ?)`,
    [session.id, servicer_id, rating, today]
  ) as any[]

  return NextResponse.json({ review_id: (result as any).insertId }, { status: 201 })
}
