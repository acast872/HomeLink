'use client'
import { useRouter } from 'next/navigation'

export default function LogoutButton() {
  const router = useRouter()

  async function logout() {
    await fetch('/api/auth/logout', { method: 'POST' })
    router.push('/')
  }

  return (
    <button onClick={logout}
      className="text-sm text-gray-400 hover:text-gray-600 transition-colors">
      Sign out
    </button>
  )
}
