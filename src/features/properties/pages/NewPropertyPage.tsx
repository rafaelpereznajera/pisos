import { FormEvent, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { createProperty } from '../api'
import type { RentalMode } from '../types'

export function NewPropertyPage() {
  const navigate = useNavigate()
  const [address, setAddress] = useState('')
  const [bedroomCount, setBedroomCount] = useState('1')
  const [rentalMode, setRentalMode] = useState<RentalMode>('entire_property')
  const [isSaving, setIsSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setError(null)

    const parsedBedroomCount = Number.parseInt(bedroomCount, 10)

    if (!address.trim()) {
      setError('Address is required')
      return
    }

    if (!Number.isInteger(parsedBedroomCount) || parsedBedroomCount <= 0) {
      setError('Bedroom count must be greater than 0')
      return
    }

    try {
      setIsSaving(true)
      await createProperty({
        address: address.trim(),
        bedroom_count: parsedBedroomCount,
        rental_mode: rentalMode,
      })
      navigate('/')
    } catch (saveError) {
      const message = saveError instanceof Error ? saveError.message : 'Unknown error'
      setError(message)
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-2xl flex-col px-4 py-10 sm:px-6 lg:px-8">
      <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
        <div className="mb-6">
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">New Property</h1>
          <p className="mt-1 text-sm text-slate-600">Create a property to start managing rentals.</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="space-y-1.5">
            <label htmlFor="address" className="block text-sm font-medium text-slate-700">
              Address
            </label>
            <input
              id="address"
              type="text"
              value={address}
              onChange={(event) => setAddress(event.target.value)}
              required
              className="block w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-900 outline-none ring-0 transition placeholder:text-slate-400 focus:border-slate-500"
              placeholder="Calle Ejemplo 123, Madrid"
            />
          </div>

          <div className="space-y-1.5">
            <label htmlFor="bedroomCount" className="block text-sm font-medium text-slate-700">
              Bedroom count
            </label>
            <input
              id="bedroomCount"
              type="number"
              min={1}
              step={1}
              value={bedroomCount}
              onChange={(event) => setBedroomCount(event.target.value)}
              required
              className="block w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-900 outline-none ring-0 transition focus:border-slate-500"
            />
          </div>

          <div className="space-y-1.5">
            <label htmlFor="rentalMode" className="block text-sm font-medium text-slate-700">
              Rental mode
            </label>
            <select
              id="rentalMode"
              value={rentalMode}
              onChange={(event) => setRentalMode(event.target.value as RentalMode)}
              className="block w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-900 outline-none ring-0 transition focus:border-slate-500"
            >
              <option value="entire_property">Entire property</option>
              <option value="by_room">By room</option>
            </select>
          </div>

          {error && <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>}

          <div className="flex flex-col-reverse gap-3 pt-2 sm:flex-row sm:items-center sm:justify-between">
            <Link to="/" className="text-sm font-medium text-slate-600 transition hover:text-slate-900">
              Back to list
            </Link>
            <button
              type="submit"
              disabled={isSaving}
              className="inline-flex items-center justify-center rounded-lg bg-slate-900 px-4 py-2 text-sm font-medium text-white transition hover:bg-slate-700 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isSaving ? 'Saving...' : 'Save property'}
            </button>
          </div>
        </form>
      </section>
    </main>
  )
}
