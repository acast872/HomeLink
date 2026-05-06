import { getSession } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { db } from '@/lib/db'
import { revalidatePath } from 'next/cache'
import Link from 'next/link'

export default async function CustomerProfilePage() {
  const session = getSession()

  if (!session || session.role !== 'customer') {
    redirect('/login?role=customer')
  }

  // Load current user
  const [rows] = await db.execute(
    `SELECT * FROM customer WHERE customer_id = ?`,
    [session.id]
  )

  const customer = (rows as any[])[0]

  async function updateProfile(formData: FormData) {
    'use server'

    const session = getSession()
    if (!session) return

    const name = formData.get('name')
    const address = formData.get('address')
    const phone = formData.get('phone')

    await db.execute(
      `UPDATE customer 
       SET name = ?, address = ?, phone_num = ?
       WHERE customer_id = ?`,
      [name, address, phone, session.id]
    )

    revalidatePath('/customer/profile')
  }

  async function deleteAccount() {
    'use server'

    const session = getSession()
    if (!session) return

    // WARNING: this will remove user permanently
    await db.execute(
      `DELETE FROM customer WHERE customer_id = ?`,
      [session.id]
    )

    redirect('/login?role=customer')
  }

  return (
    <div className="min-h-screen bg-gray-50">

      {/* Header */}
      <header className="bg-white border-b border-gray-100 px-6 py-4 flex justify-between">
        <Link href="/customer" className="font-semibold text-gray-900">
          HomeLink
        </Link>
      </header>

      <main className="max-w-lg mx-auto px-6 py-10">

        <h1 className="text-xl font-semibold mb-6">My Profile</h1>

        {/* Update Form */}
        <form action={updateProfile} className="bg-white border border-gray-100 rounded-xl p-6 space-y-4">

          <div>
            <label className="text-sm text-gray-600">Name</label>
            <input
              name="name"
              defaultValue={customer.name}
              className="w-full mt-1 border rounded-lg px-3 py-2"
            />
          </div>

          <div>
            <label className="text-sm text-gray-600">Address</label>
            <input
              name="address"
              defaultValue={customer.address}
              className="w-full mt-1 border rounded-lg px-3 py-2"
            />
          </div>

          <div>
            <label className="text-sm text-gray-600">Phone</label>
            <input
              name="phone"
              defaultValue={customer.phone_num}
              className="w-full mt-1 border rounded-lg px-3 py-2"
            />
          </div>

          <button
            type="submit"
            className="w-full py-2 rounded-lg text-white font-medium"
            style={{ background: '#1D9E75' }}
          >
            Save Changes
          </button>
        </form>


      </main>
    </div>
  )
}