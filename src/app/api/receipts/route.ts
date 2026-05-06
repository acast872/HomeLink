import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { getSession } from '@/lib/auth'

export async function GET() {
  const session = getSession()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  // Join receipt → appointment → customer/servicer so each role sees only their own
  const col = session.role === 'customer' ? 'a.customer_id' : 'a.servicer_id'
  const [rows] = await db.execute(
    `SELECT rc.*, a.address, a.est_time, c.name AS customer_name, s.name AS servicer_name
     FROM receipt rc
     JOIN appointment a ON rc.contract_number = a.contract_number
     LEFT JOIN customer c ON a.customer_id = c.customer_id
     LEFT JOIN servicer s ON a.servicer_id = s.servicer_id
     WHERE ${col} = ?
     ORDER BY rc.receipt_id DESC`,
    [session.id]
  )
  return NextResponse.json(rows)
}

export async function POST(req: NextRequest) {
  const session = getSession()
  if (!session || session.role !== 'servicer') {
    return NextResponse.json({ error: 'Only servicers can create receipts' }, { status: 403 })
  }

  const { contract_number, price } = await req.json()
  if (!contract_number || price == null) {
    return NextResponse.json({ error: 'contract_number and price are required' }, { status: 400 })
  }

  const [result] = await db.execute(
    `INSERT INTO receipt (contract_number, price) VALUES (?, ?)`,
    [contract_number, price]
  ) as any[]

  return NextResponse.json({ receipt_id: (result as any).insertId }, { status: 201 })
}
