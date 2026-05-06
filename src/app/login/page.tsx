'use client'
import { useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'

export default function LoginPage() {
  const params = useSearchParams()
  const role = params.get('role') === 'servicer' ? 'servicer' : 'customer'
  const router = useRouter()

  const [mode, setMode] = useState<'login' | 'signup'>('login')
  const [form, setForm] = useState({ name: '', email: '', password: '', phone_num: '', address: '' })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const isServicer = role === 'servicer'
  const label = isServicer ? 'Servicer' : 'Customer'

  function update(e: React.ChangeEvent<HTMLInputElement>) {
    setForm(f => ({ ...f, [e.target.name]: e.target.value }))
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setLoading(true)
    const endpoint = mode === 'login' ? '/api/auth/login' : '/api/auth/signup'
    const res = await fetch(endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...form, role }),
    })
    const data = await res.json()
    setLoading(false)
    if (!res.ok) { setError(data.error || 'Something went wrong'); return }
    router.push(isServicer ? '/servicer' : '/customer')
  }

  return (
    <main className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="w-full max-w-sm bg-white rounded-2xl border border-gray-100 p-8 shadow-sm">
        <Link href="/" className="text-sm text-gray-400 hover:text-gray-600 mb-6 block">← Back</Link>

        <div className="mb-6">
          <h1 className="text-xl font-semibold text-gray-900">
            {mode === 'login' ? `Sign in as ${label}` : `Create ${label} account`}
          </h1>
          <p className="text-sm text-gray-400 mt-1">
            {mode === 'login'
              ? `Don't have an account? `
              : 'Already have an account? '}
            <button
              className="underline text-gray-600"
              onClick={() => setMode(mode === 'login' ? 'signup' : 'login')}
            >
              {mode === 'login' ? 'Sign up' : 'Sign in'}
            </button>
          </p>
        </div>

        <form onSubmit={submit} className="flex flex-col gap-3">
          {mode === 'signup' && (
            <>
              <input name="name" placeholder="Full name" value={form.name} onChange={update}
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500" required />
              <input name="phone_num" placeholder="Phone number" value={form.phone_num} onChange={update}
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500" />
              {!isServicer && (
                <input name="address" placeholder="Home address" value={form.address} onChange={update}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500" />
              )}
            </>
          )}
          <input name="email" type="email" placeholder="Email" value={form.email} onChange={update}
            className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500" required />
          <input name="password" type="password" placeholder="Password" value={form.password} onChange={update}
            className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500" required />

          {error && <p className="text-red-500 text-xs">{error}</p>}

          <button type="submit" disabled={loading}
            className="mt-2 w-full py-2.5 rounded-lg text-white font-medium text-sm transition-colors disabled:opacity-50"
            style={{ background: '#1D9E75' }}>
            {loading ? 'Please wait…' : mode === 'login' ? 'Sign in' : 'Create account'}
          </button>
        </form>
      </div>
    </main>
  )
}
