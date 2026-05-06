import { getSession } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { db } from '@/lib/db'
import Link from 'next/link'
import LogoutButton from '@/components/shared/LogoutButton'

export default async function CustomerReceiptsPage() {
  const session = getSession()
  if (!session || session.role !== 'customer') redirect('/login?role=customer')

  const [receipts] = await db.execute(
    `SELECT rc.receipt_id, rc.contract_number, rc.price,
            a.address, a.est_time,
            s.name AS servicer_name,
            comp.company_name, comp.service_type
     FROM receipt rc
     JOIN appointment a ON rc.contract_number = a.contract_number
     LEFT JOIN servicer s ON a.servicer_id = s.servicer_id
     LEFT JOIN company comp ON s.company_name = comp.company_name
     WHERE a.customer_id = ?
     ORDER BY rc.receipt_id DESC`,
    [session.id]
  ) as any[]

  const total = (receipts as any[]).reduce((sum: number, r: any) => sum + Number(r.price), 0)

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-100 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link href="/customer" className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ background: '#1D9E75' }}>
              <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                <path d="M10.707 2.293a1 1 0 00-1.414 0l-7 7a1 1 0 001.414 1.414L4 10.414V17a1 1 0 001 1h3a1 1 0 001-1v-2a1 1 0 011-1h2a1 1 0 011 1v2a1 1 0 001 1h3a1 1 0 001-1v-6.586l.293.293a1 1 0 001.414-1.414l-7-7z" />
              </svg>
            </div>
            <span className="font-semibold text-gray-900">HomeLink</span>
          </Link>
          <span className="text-gray-300">/</span>
          <span className="text-sm text-gray-500">Receipts</span>
        </div>
        <div className="flex items-center gap-4">
          <span className="text-sm text-gray-500">{session.name}</span>
          <LogoutButton />
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-6 py-8">
        {/* Page title + summary stat */}
        <div className="flex items-start justify-between mb-6">
          <div>
            <h1 className="text-xl font-semibold text-gray-900">My Receipts</h1>
            <p className="text-sm text-gray-400 mt-1">Payment records for completed services</p>
          </div>
          {(receipts as any[]).length > 0 && (
            <div className="text-right">
              <p className="text-xs text-gray-400 uppercase tracking-wide">Total paid</p>
              <p className="text-2xl font-semibold text-gray-900">${total.toFixed(2)}</p>
            </div>
          )}
        </div>

        {/* Empty state */}
        {(receipts as any[]).length === 0 ? (
          <div className="bg-white rounded-2xl border border-gray-100 px-6 py-16 text-center">
            <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center mx-auto mb-4">
              <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 14H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v6a2 2 0 01-2 2h-4m-4 4v-4m0 4H9m4 0h-4" />
              </svg>
            </div>
            <p className="text-sm text-gray-500 mb-1">No receipts yet</p>
            <p className="text-xs text-gray-400">Receipts appear here once a job is completed and payment is recorded.</p>
          </div>
        ) : (
          <div className="flex flex-col gap-4">
            {(receipts as any[]).map((r: any) => (
              <ReceiptCard key={r.receipt_id} receipt={r} />
            ))}
          </div>
        )}
      </main>
    </div>
  )
}

function ReceiptCard({ receipt }: { receipt: any }) {
  const date = receipt.est_time ? new Date(receipt.est_time).toLocaleDateString('en-US', {
    weekday: 'short', year: 'numeric', month: 'short', day: 'numeric'
  }) : '—'

  return (
    <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
      {/* Card header */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-gray-50">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: '#E1F5EE' }}>
            <svg className="w-4 h-4" style={{ color: '#1D9E75' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          </div>
          <div>
            <p className="text-sm font-medium text-gray-900">Contract #{receipt.contract_number}</p>
            <p className="text-xs text-gray-400">{date}</p>
          </div>
        </div>
        <div className="text-right">
          <p className="text-lg font-semibold text-gray-900">${Number(receipt.price).toFixed(2)}</p>
          <span className="inline-block text-xs px-2 py-0.5 rounded-full font-medium" style={{ background: '#E1F5EE', color: '#085041' }}>Paid</span>
        </div>
      </div>

      {/* Card body */}
      <div className="px-6 py-4 grid grid-cols-2 gap-4 text-sm">
        <div>
          <p className="text-xs text-gray-400 mb-1">Servicer</p>
          <p className="text-gray-700 font-medium">{receipt.servicer_name ?? '—'}</p>
          {receipt.company_name && (
            <p className="text-xs text-gray-400 mt-0.5">{receipt.company_name}</p>
          )}
        </div>
        <div>
          <p className="text-xs text-gray-400 mb-1">Service type</p>
          <p className="text-gray-700">{receipt.service_type ?? '—'}</p>
        </div>
        <div className="col-span-2">
          <p className="text-xs text-gray-400 mb-1">Service address</p>
          <p className="text-gray-700">{receipt.address ?? '—'}</p>
        </div>
      </div>

      {/* Print hint */}
      <div className="px-6 pb-4">
        <p className="text-xs text-gray-300">Receipt #{receipt.receipt_id} · HomeLink</p>
      </div>
    </div>
  )
}
