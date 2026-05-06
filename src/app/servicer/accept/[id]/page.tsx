'use client'
import { useState } from 'react'
import { useRouter, useParams } from 'next/navigation'
import Link from 'next/link'

export default function AcceptRequestPage() {
  const router = useRouter()
  const params = useParams()
  const requestId = params.id

  const [form, setForm] = useState({
    address: '',
    est_time: '',
    contract_number: '',
  })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  function update(e: React.ChangeEvent<HTMLInputElement>) {
    setForm(f => ({ ...f, [e.target.name]: e.target.value }))
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setLoading(true)
    const res = await fetch('/api/appointments', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...form, request_id: Number(requestId), contract_number: Number(form.contract_number) }),
    })
    const data = await res.json()
    setLoading(false)
    if (!res.ok) { setError(data.error || 'Failed to book'); return }
    router.push('/servicer')
  }

  return (
    <main className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="w-full max-w-md bg-white rounded-2xl border border-gray-100 p-8 shadow-sm">
        <Link href="/servicer" className="text-sm text-gray-400 hover:text-gray-600 mb-6 block">← Back</Link>
        <h1 className="text-xl font-semibold text-gray-900 mb-2">Accept Request #{requestId}</h1>
        <p className="text-sm text-gray-400 mb-6">Schedule an appointment to confirm this job.</p>
        <form onSubmit={submit} className="flex flex-col gap-4">
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1">Service address</label>
            <input name="address" value={form.address} onChange={update} required
              placeholder="123 Main St"
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500" />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1">Estimated date & time</label>
            <input name="est_time" type="datetime-local" value={form.est_time} onChange={update} required
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500" />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1">Contract number</label>
            <input name="contract_number" type="number" value={form.contract_number} onChange={update} required
              placeholder="e.g. 1002"
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500" />
          </div>
          {error && <p className="text-red-500 text-xs">{error}</p>}
          <button type="submit" disabled={loading}
            className="w-full py-2.5 rounded-lg text-white font-medium text-sm disabled:opacity-50"
            style={{ background: '#1D9E75' }}>
            {loading ? 'Booking…' : 'Confirm Appointment'}
          </button>
        </form>
      </div>
    </main>
  )
}
