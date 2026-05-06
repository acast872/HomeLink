import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { getSession } from '@/lib/auth'

export async function GET() {
  const session = getSession()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const col = session.role === 'customer' ? 'a.customer_id' : 'a.servicer_id'
  const [rows] = await db.execute(
    `SELECT a.*, c.name AS customer_name, s.name AS servicer_name
     FROM appointment a
     LEFT JOIN customer c ON a.customer_id = c.customer_id
     LEFT JOIN servicer s ON a.servicer_id = s.servicer_id
     WHERE ${col} = ?
     ORDER BY a.est_time ASC`,
    [session.id]
  )
  return NextResponse.json(rows)
}

// POST /api/appointments — servicer accepts a request and books an appointment
export async function POST(req: NextRequest) {
  const session = getSession()
  if (!session || session.role !== 'servicer') {
    return NextResponse.json({ error: 'Only servicers can create appointments' }, { status: 403 })
  }

  const { request_id, address, est_time, contract_number } = await req.json()
  if (!request_id || !address || !est_time || !contract_number) {
    return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
  }

  // Get the customer_id from the request
  const [reqRows] = await db.execute(
    `SELECT customer_id FROM request WHERE request_id = ?`, [request_id]
  ) as any[]
  const reqRow = (reqRows as any[])[0]
  if (!reqRow) return NextResponse.json({ error: 'Request not found' }, { status: 404 })

  // Assign servicer to the request
  await db.execute(
    `UPDATE request SET servicer_id = ? WHERE request_id = ?`,
    [session.id, request_id]
  )

  // Create the appointment
  const [result] = await db.execute(
    `INSERT INTO appointment (customer_id, servicer_id, contract_number, address, est_time)
     VALUES (?, ?, ?, ?, ?)`,
    [reqRow.customer_id, session.id, contract_number, address, new Date(est_time)]
  ) as any[]

  return NextResponse.json({ appointment_id: (result as any).insertId }, { status: 201 })
}
