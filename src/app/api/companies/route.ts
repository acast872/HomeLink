import { NextResponse } from 'next/server'
import { db } from '@/lib/db'

// Public route — anyone can browse companies & services
export async function GET() {
  const [rows] = await db.execute(
    `SELECT c.company_name, c.address, c.comp_phone, c.service_type,
            s.description AS service_description
     FROM company c
     LEFT JOIN service s ON c.service_type = s.service_type
     ORDER BY c.company_name ASC`
  )
  return NextResponse.json(rows)
}
