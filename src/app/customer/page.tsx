import { getSession } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { db } from '@/lib/db'
import Link from 'next/link'
import LogoutButton from '@/components/shared/LogoutButton'
export const dynamic = 'force-dynamic'
export default async function CustomerDashboard() {
  const session = getSession()
  if (!session || session.role !== 'customer') redirect('/login?role=customer')

  // Load this customer's requests
  const [requests] = await db.execute(
    `SELECT r.request_id, r.problem, r.address,
            s.name AS servicer_name
     FROM request r
     LEFT JOIN servicer s ON r.servicer_id = s.servicer_id
     WHERE r.customer_id = ?
     ORDER BY r.request_id DESC`,
    [session.id]
  ) as any[]

  // Load upcoming appointments
  const [appointments] = await db.execute(
    `SELECT a.appointment_id, a.address, a.est_time, a.contract_number,
            s.name AS servicer_name
     FROM appointment a
     LEFT JOIN servicer s ON a.servicer_id = s.servicer_id
     WHERE a.customer_id = ?
     ORDER BY a.est_time ASC`,
    [session.id]
  ) as any[]

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-100 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ background: '#1D9E75' }}>
            <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
              <path d="M10.707 2.293a1 1 0 00-1.414 0l-7 7a1 1 0 001.414 1.414L4 10.414V17a1 1 0 001 1h3a1 1 0 001-1v-2a1 1 0 011-1h2a1 1 0 011 1v2a1 1 0 001 1h3a1 1 0 001-1v-6.586l.293.293a1 1 0 001.414-1.414l-7-7z" />
            </svg>
          </div>
          <span className="font-semibold text-gray-900">HomeLink</span>
        </div>
        <div className="flex items-center gap-4">
          <span className="text-sm text-gray-500">Hi, {session.name}</span>
          <LogoutButton />
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-6 py-8">
        {/* Quick actions */}
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-xl font-semibold text-gray-900">My Dashboard</h1>
          <Link href="/customer/request/new"
            className="px-4 py-2 rounded-lg text-white text-sm font-medium"
            style={{ background: '#1D9E75' }}>
            + New Request
          </Link>
        </div>

        {/* Requests */}
        <section className="mb-8">
          <h2 className="text-sm font-medium text-gray-500 uppercase tracking-wide mb-3">My Requests</h2>
          <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
            {(requests as any[]).length === 0 ? (
              <p className="text-sm text-gray-400 text-center py-8">No requests yet. <Link href="/customer/request/new" className="underline" style={{ color: '#1D9E75' }}>Create one</Link></p>
            ) : (
              <table className="w-full text-sm">
                <thead><tr className="border-b border-gray-100">
                  <th className="text-left px-4 py-3 text-xs text-gray-400 uppercase">ID</th>
                  <th className="text-left px-4 py-3 text-xs text-gray-400 uppercase">Problem</th>
                  <th className="text-left px-4 py-3 text-xs text-gray-400 uppercase">Address</th>
                  <th className="text-left px-4 py-3 text-xs text-gray-400 uppercase">Servicer</th>
                </tr></thead>
                <tbody>
                  {(requests as any[]).map((r: any) => (
                    <tr key={r.request_id} className="border-b border-gray-50 last:border-0 hover:bg-gray-50">
                      <td className="px-4 py-3 text-gray-400">#{r.request_id}</td>
                      <td className="px-4 py-3 text-gray-700">{r.problem}</td>
                      <td className="px-4 py-3 text-gray-500">{r.address}</td>
                      <td className="px-4 py-3 text-gray-500">{r.servicer_name ?? '—'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </section>

        {/* Appointments */}
        <section className="mb-8">
          <h2 className="text-sm font-medium text-gray-500 uppercase tracking-wide mb-3">My Appointments</h2>
          <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
            {(appointments as any[]).length === 0 ? (
              <p className="text-sm text-gray-400 text-center py-8">No appointments scheduled.</p>
            ) : (
              <table className="w-full text-sm">
                <thead><tr className="border-b border-gray-100">
                  <th className="text-left px-4 py-3 text-xs text-gray-400 uppercase">Contract #</th>
                  <th className="text-left px-4 py-3 text-xs text-gray-400 uppercase">Servicer</th>
                  <th className="text-left px-4 py-3 text-xs text-gray-400 uppercase">Address</th>
                  <th className="text-left px-4 py-3 text-xs text-gray-400 uppercase">Date & Time</th>
                </tr></thead>
                <tbody>
                  {(appointments as any[]).map((a: any) => (
                    <tr key={a.appointment_id} className="border-b border-gray-50 last:border-0 hover:bg-gray-50">
                      <td className="px-4 py-3 font-medium" style={{ color: '#1D9E75' }}>{a.contract_number}</td>
                      <td className="px-4 py-3 text-gray-700">{a.servicer_name}</td>
                      <td className="px-4 py-3 text-gray-500">{a.address}</td>
                      <td className="px-4 py-3 text-gray-500">{new Date(a.est_time).toLocaleString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </section>

        {/* Nav links */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            { label: 'My Receipts', href: '/customer/receipts' },
            { label: 'Leave a Review', href: '/customer/reviews/new' },
            { label: 'Browse Services', href: '/customer/services' },
            { label: 'My Profile', href: '/customer/profile' },
          ].map(item => (
            <Link key={item.href} href={item.href}
              className="bg-white border border-gray-100 rounded-xl px-4 py-3 text-sm text-gray-600 hover:bg-gray-50 transition-colors text-center">
              {item.label}
            </Link>
          ))}
        </div>
      </main>
    </div>
  )
}
