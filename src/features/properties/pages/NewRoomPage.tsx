import { FormEvent, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { createRoom } from '../api'

export function NewRoomPage() {
  const navigate = useNavigate()
  const { propertyId } = useParams<{ propertyId: string }>()
  const [name, setName] = useState('')
  const [isSaving, setIsSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setError(null)

    if (!propertyId) {
      setError('No se ha encontrado el piso')
      return
    }

    if (!name.trim()) {
      setError('El nombre de la habitación es obligatorio')
      return
    }

    try {
      setIsSaving(true)
      await createRoom({
        property_id: propertyId,
        name: name.trim(),
      })
      navigate(`/properties/${propertyId}/edit`)
    } catch (saveError) {
      const message = saveError instanceof Error ? saveError.message : 'Error desconocido'
      setError(message)
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-2xl flex-col px-4 py-10 sm:px-6 lg:px-8">
      <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
        <div className="mb-6">
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">Nueva habitación</h1>
          <p className="mt-1 text-sm text-slate-600">Añade una habitación al piso.</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="space-y-1.5">
            <label htmlFor="name" className="block text-sm font-medium text-slate-700">
              Nombre de la habitación
            </label>
            <input
              id="name"
              type="text"
              value={name}
              onChange={(event) => setName(event.target.value)}
              required
              className="block w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-900 outline-none ring-0 transition placeholder:text-slate-400 focus:border-slate-500"
              placeholder="Habitación 1"
            />
          </div>

          {error && <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>}

          <div className="flex flex-col-reverse gap-3 pt-2 sm:flex-row sm:items-center sm:justify-between">
            <Link
              to={propertyId ? `/properties/${propertyId}/edit` : '/'}
              className="text-sm font-medium text-slate-600 transition hover:text-slate-900"
            >
              Volver al piso
            </Link>
            <button
              type="submit"
              disabled={isSaving}
              className="inline-flex items-center justify-center rounded-lg bg-slate-900 px-4 py-2 text-sm font-medium text-white transition hover:bg-slate-700 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isSaving ? 'Guardando...' : 'Guardar habitación'}
            </button>
          </div>
        </form>
      </section>
    </main>
  )
}
