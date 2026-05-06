import Link from 'next/link'

export default function Home() {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center bg-white px-4">
      <div className="mb-8 text-center">
        <div className="inline-flex items-center gap-2 mb-4">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: '#1D9E75' }}>
            <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
              <path d="M10.707 2.293a1 1 0 00-1.414 0l-7 7a1 1 0 001.414 1.414L4 10.414V17a1 1 0 001 1h3a1 1 0 001-1v-2a1 1 0 011-1h2a1 1 0 011 1v2a1 1 0 001 1h3a1 1 0 001-1v-6.586l.293.293a1 1 0 001.414-1.414l-7-7z" />
            </svg>
          </div>
          <span className="text-2xl font-semibold text-gray-900">HomeLink</span>
        </div>
        <p className="text-gray-500 text-sm">Home services, connected.</p>
      </div>

      <div className="flex flex-col sm:flex-row gap-4 w-full max-w-sm">
        <Link
          href="/login?role=customer"
          className="flex-1 text-center py-3 px-6 rounded-xl border border-gray-200 text-gray-800 font-medium hover:bg-gray-50 transition-colors"
        >
          I need a service
        </Link>
        <Link
          href="/login?role=servicer"
          className="flex-1 text-center py-3 px-6 rounded-xl text-white font-medium transition-colors"
          style={{ background: '#1D9E75' }}
        >
          I provide services
        </Link>
      </div>
    </main>
  )
}
