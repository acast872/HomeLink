import { getSession } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { db } from '@/lib/db'
import Link from 'next/link'
import LogoutButton from '@/components/shared/LogoutButton'

export default async function ServicerDashboard() {
  const session = getSession()
  if (!session || session.role !== 'servicer') redirect('/login?role=servicer')

  // Open (unassigned) requests the servicer can pick up
  const [openRequests] = await db.execute(
    `SELECT r.request_id, r.problem, r.address,
            c.name AS customer_name, c.phone_num AS customer_phone
     FROM request r
     JOIN customer c ON r.customer_id = c.customer_id
     WHERE r.servicer_id IS NULL
     ORDER BY r.request_id DESC
     LIMIT 20`,
  ) as any[]

  // This servicer's assigned requests
  const [myRequests] = await db.execute(
    `SELECT r.request_id, r.problem, r.address,
            c.name AS customer_name
     FROM request r
     JOIN customer c ON r.customer_id = c.customer_id
     WHERE r.servicer_id = ?
     ORDER BY r.request_id DESC`,
    [session.id]
  ) as any[]

  // This servicer's upcoming appointments
  const [appointments] = await db.execute(
    `SELECT a.appointment_id, a.address, a.est_time, a.contract_number,
            c.name AS customer_name
     FROM appointment a
     JOIN customer c ON a.customer_id = c.customer_id
     WHERE a.servicer_id = ?
     ORDER BY a.est_time ASC`,
    [session.id]
  ) as any[]

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-100 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ background: '#1D9E75' }}>
            <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
              <path d="M10.707 2.293a1 1 0 00-1.414 0l-7 7a1 1 0 001.414 1.414L4 10.414V17a1 1 0 001 1h3a1 1 0 001-1v-2a1 1 0 011-1h2a1 1 0 011 1v2a1 1 0 001 1h3a1 1 0 001-1v-6.586l.293.293a1 1 0 001.414-1.414l-7-7z" />
            </svg>
          </div>
          <span className="font-semibold text-gray-900">HomeLink</span>
          <span className="text-xs text-gray-400 ml-1">· Servicer</span>
        </div>
        <div className="flex items-center gap-4">
          <span className="text-sm text-gray-500">Hi, {session.name}</span>
          <LogoutButton />
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-6 py-8">
        <h1 className="text-xl font-semibold text-gray-900 mb-6">Servicer Dashboard</h1>

        {/* Open requests to accept */}
        <section className="mb-8">
          <h2 className="text-sm font-medium text-gray-500 uppercase tracking-wide mb-3">Open Requests</h2>
          <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
            {(openRequests as any[]).length === 0 ? (
              <p className="text-sm text-gray-400 text-center py-8">No open requests right now.</p>
            ) : (
              <table className="w-full text-sm">
                <thead><tr className="border-b border-gray-100">
                  <th className="text-left px-4 py-3 text-xs text-gray-400 uppercase">ID</th>
                  <th className="text-left px-4 py-3 text-xs text-gray-400 uppercase">Problem</th>
                  <th className="text-left px-4 py-3 text-xs text-gray-400 uppercase">Address</th>
                  <th className="text-left px-4 py-3 text-xs text-gray-400 uppercase">Customer</th>
                  <th className="px-4 py-3"></th>
                </tr></thead>
                <tbody>
                  {(openRequests as any[]).map((r: any) => (
                    <tr key={r.request_id} className="border-b border-gray-50 last:border-0 hover:bg-gray-50">
                      <td className="px-4 py-3 text-gray-400">#{r.request_id}</td>
                      <td className="px-4 py-3 text-gray-700">{r.problem}</td>
                      <td className="px-4 py-3 text-gray-500">{r.address}</td>
                      <td className="px-4 py-3 text-gray-500">{r.customer_name}</td>
                      <td className="px-4 py-3">
                        <Link href={`/servicer/accept/${r.request_id}`}
                          className="px-3 py-1 rounded-lg text-xs font-medium text-white"
                          style={{ background: '#1D9E75' }}>
                          Accept
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </section>

        {/* My accepted jobs */}
        <section className="mb-8">
          <h2 className="text-sm font-medium text-gray-500 uppercase tracking-wide mb-3">My Jobs</h2>
          <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
            {(myRequests as any[]).length === 0 ? (
              <p className="text-sm text-gray-400 text-center py-8">No jobs accepted yet.</p>
            ) : (
              <table className="w-full text-sm">
                <thead><tr className="border-b border-gray-100">
                  <th className="text-left px-4 py-3 text-xs text-gray-400 uppercase">ID</th>
                  <th className="text-left px-4 py-3 text-xs text-gray-400 uppercase">Problem</th>
                  <th className="text-left px-4 py-3 text-xs text-gray-400 uppercase">Address</th>
                  <th className="text-left px-4 py-3 text-xs text-gray-400 uppercase">Customer</th>
                </tr></thead>
                <tbody>
                  {(myRequests as any[]).map((r: any) => (
                    <tr key={r.request_id} className="border-b border-gray-50 last:border-0">
                      <td className="px-4 py-3 text-gray-400">#{r.request_id}</td>
                      <td className="px-4 py-3 text-gray-700">{r.problem}</td>
                      <td className="px-4 py-3 text-gray-500">{r.address}</td>
                      <td className="px-4 py-3 text-gray-500">{r.customer_name}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </section>

        {/* Appointments */}
        <section>
          <h2 className="text-sm font-medium text-gray-500 uppercase tracking-wide mb-3">My Appointments</h2>
          <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
            {(appointments as any[]).length === 0 ? (
              <p className="text-sm text-gray-400 text-center py-8">No appointments yet.</p>
            ) : (
              <table className="w-full text-sm">
                <thead><tr className="border-b border-gray-100">
                  <th className="text-left px-4 py-3 text-xs text-gray-400 uppercase">Contract #</th>
                  <th className="text-left px-4 py-3 text-xs text-gray-400 uppercase">Customer</th>
                  <th className="text-left px-4 py-3 text-xs text-gray-400 uppercase">Address</th>
                  <th className="text-left px-4 py-3 text-xs text-gray-400 uppercase">Date & Time</th>
                </tr></thead>
                <tbody>
                  {(appointments as any[]).map((a: any) => (
                    <tr key={a.appointment_id} className="border-b border-gray-50 last:border-0">
                      <td className="px-4 py-3 font-medium" style={{ color: '#1D9E75' }}>{a.contract_number}</td>
                      <td className="px-4 py-3 text-gray-700">{a.customer_name}</td>
                      <td className="px-4 py-3 text-gray-500">{a.address}</td>
                      <td className="px-4 py-3 text-gray-500">{new Date(a.est_time).toLocaleString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </section>
      </main>
    </div>
  )
}
