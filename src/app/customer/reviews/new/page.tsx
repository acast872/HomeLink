import { getSession } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { db } from '@/lib/db'
import { revalidatePath } from 'next/cache'
import Link from 'next/link'

export default async function NewReviewPage() {
  const session = getSession()

  if (!session || session.role !== 'customer') {
    redirect('/login?role=customer')
  }

  // Get servicers for dropdown
  const [servicers] = await db.execute(
    `SELECT servicer_id, name FROM servicer`
  )

  async function submitReview(formData: FormData) {
    'use server'

    const session = getSession()
    if (!session) return

    const servicer_id = Number(formData.get('servicer_id'))
    const rating = Number(formData.get('rating'))
    const comment = formData.get('comment')
    const date = new Date().toISOString().split('T')[0]

    await db.execute(
      `INSERT INTO review (customer_id, servicer_id, rating, date, comment)
       VALUES (?, ?, ?, ?, ?)`,
      [session.id, servicer_id, rating, date, comment]
    )

    revalidatePath('/customer/services')
    revalidatePath('/customer')
    redirect('/customer')
  }

  return (
    <div className="min-h-screen bg-gray-50">

      {/* Header */}
      <header className="bg-white border-b border-gray-100 px-6 py-4">
        <Link href="/customer" className="font-semibold text-gray-900">
          HomeLink
        </Link>
      </header>

      <main className="max-w-lg mx-auto px-6 py-10">

        <h1 className="text-xl font-semibold mb-6">Leave a Review</h1>

        <form
          action={submitReview}
          className="bg-white border border-gray-100 rounded-xl p-6 space-y-4"
        >

          {/* Servicer */}
          <div>
            <label className="text-sm text-gray-600">Servicer</label>
            <select
              name="servicer_id"
              required
              className="w-full mt-1 border rounded-lg px-3 py-2"
            >
              <option value="">Select a servicer</option>
              {(servicers as any[]).map((s) => (
                <option key={s.servicer_id} value={s.servicer_id}>
                  {s.name}
                </option>
              ))}
            </select>
          </div>

          {/* Rating */}
          <div>
            <label className="text-sm text-gray-600">Rating</label>
            <select
              name="rating"
              required
              className="w-full mt-1 border rounded-lg px-3 py-2"
            >
              <option value="">Select rating</option>
              <option value="5">★★★★★ (5)</option>
              <option value="4">★★★★☆ (4)</option>
              <option value="3">★★★☆☆ (3)</option>
              <option value="2">★★☆☆☆ (2)</option>
              <option value="1">★☆☆☆☆ (1)</option>
            </select>
          </div>

          {/* Comment (NEW) */}
          <div>
            <label className="text-sm text-gray-600">Review</label>
            <textarea
              name="comment"
              required
              rows={4}
              className="w-full mt-1 border rounded-lg px-3 py-2"
              placeholder="Write your experience..."
            />
          </div>

          {/* Submit */}
          <button
            type="submit"
            className="w-full py-2 rounded-lg text-white font-medium"
            style={{ background: '#1D9E75' }}
          >
            Submit Review
          </button>

        </form>
      </main>
      
    </div>
    
  )
}