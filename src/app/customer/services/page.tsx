import { db } from '@/lib/db'
import { getSession } from '@/lib/auth'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import LogoutButton from '@/components/shared/LogoutButton'

export default async function BrowseServicesPage() {
  const session = getSession()

  if (!session || session.role !== 'customer') {
    redirect('/login?role=customer')
  }

  const [rows] = await db.execute(
    `SELECT 
        s.servicer_id,
        s.name,
        s.email,
        s.phone_num,
        s.locations,
        c.company_name,
        c.service_type,
        c.address,
        c.comp_phone,
        COALESCE(AVG(r.rating), 0) AS avg_rating,
        COUNT(r.review_id) AS total_reviews
     FROM servicer s
     LEFT JOIN company c ON s.company_name = c.company_name
     LEFT JOIN review r ON s.servicer_id = r.servicer_id
     GROUP BY 
        s.servicer_id,
        s.name,
        s.email,
        s.phone_num,
        s.locations,
        c.company_name,
        c.service_type,
        c.address,
        c.comp_phone`
  )

  const servicers = rows as any[]

  return (
    <div className="min-h-screen bg-gray-50">

      {/* Header */}
      <header className="bg-white border-b border-gray-100 px-6 py-4 flex justify-between">
        <Link href="/customer" className="font-semibold text-gray-900">
          HomeLink
        </Link>
        <LogoutButton />
      </header>

      <main className="max-w-5xl mx-auto px-6 py-8">

        <h1 className="text-xl font-semibold mb-6">Browse Services</h1>

        {servicers.length === 0 ? (
          <p className="text-gray-500">No servicers available.</p>
        ) : (
          <div className="grid md:grid-cols-2 gap-4">
            {servicers.map((s) => (
              <div
                key={s.servicer_id}
                className="bg-white border border-gray-100 rounded-xl p-5"
              >

                <h2 className="text-lg font-semibold">{s.name}</h2>

                <p className="text-sm text-gray-500">
                  {s.company_name} • {s.service_type}
                </p>

                <div className="mt-3 text-sm text-gray-600 space-y-1">
                  <p>Email: {s.email ?? '—'}</p>
                  <p>Phone: {s.phone_num ?? '—'}</p>
                  <p>Location: {s.locations ?? '—'}</p>
                  <p>Company Phone: {s.comp_phone ?? '—'}</p>
                </div>

                {/* Rating */}
                <div className="mt-3 flex items-center gap-2">
                  <span className="text-yellow-500 font-semibold">
                    ⭐ {Number(s.avg_rating).toFixed(1)}
                  </span>
                  <span className="text-xs text-gray-400">
                    ({s.total_reviews} reviews)
                  </span>
                </div>

              </div>
            ))}
          </div>
        )}

      </main>
    </div>
  )
}