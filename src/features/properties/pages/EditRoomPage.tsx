import { FormEvent, useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { deleteRoom, getRoomById, updateRoom } from '../api'

export function EditRoomPage() {
  const navigate = useNavigate()
  const { propertyId, roomId } = useParams<{ propertyId: string; roomId: string }>()
  const [name, setName] = useState('')
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function loadRoom() {
      if (!propertyId || !roomId) {
        setError('No se ha encontrado la habitación')
        setIsLoading(false)
        return
      }

      try {
        const room = await getRoomById(propertyId, roomId)
        setName(room.name)
      } catch (loadError) {
        const message = loadError instanceof Error ? loadError.message : 'Error desconocido'
        setError(message)
      } finally {
        setIsLoading(false)
      }
    }

    void loadRoom()
  }, [propertyId, roomId])

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setError(null)

    if (!propertyId || !roomId) {
      setError('No se ha encontrado la habitación')
      return
    }

    if (!name.trim()) {
      setError('El nombre de la habitación es obligatorio')
      return
    }

    try {
      setIsSaving(true)
      await updateRoom(propertyId, roomId, { name: name.trim() })
      navigate(`/properties/${propertyId}/edit`)
    } catch (saveError) {
      const message = saveError instanceof Error ? saveError.message : 'Error desconocido'
      setError(message)
    } finally {
      setIsSaving(false)
    }
  }

  async function handleDeleteRoom() {
    if (!propertyId || !roomId) {
      setError('No se ha encontrado la habitación')
      return
    }

    const confirmed = window.confirm(`¿Seguro que quieres eliminar la habitación ${name}?`)

    if (!confirmed) {
      return
    }

    try {
      setIsDeleting(true)
      setError(null)
      await deleteRoom(propertyId, roomId)
      navigate(`/properties/${propertyId}/edit`)
    } catch (deleteError) {
      const message = deleteError instanceof Error ? deleteError.message : 'Error desconocido'
      setError(message)
    } finally {
      setIsDeleting(false)
    }
  }

  if (isLoading) {
    return (
      <main className="mx-auto flex min-h-screen w-full max-w-2xl flex-col px-4 py-10 sm:px-6 lg:px-8">
        <div className="rounded-xl border border-slate-200 bg-white p-4 text-sm text-slate-600 shadow-sm">
          Cargando habitación...
        </div>
      </main>
    )
  }

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-2xl flex-col px-4 py-10 sm:px-6 lg:px-8">
      <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
        <div className="mb-6">
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">Editar habitación</h1>
          <p className="mt-1 text-sm text-slate-600">Actualiza o elimina la habitación.</p>
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
              className="block w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-900 outline-none ring-0 transition focus:border-slate-500"
            />
          </div>

          {error && <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>}

          <div className="flex flex-col-reverse gap-3 pt-2 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-3">
              <Link
                to={propertyId ? `/properties/${propertyId}/edit` : '/'}
                className="text-sm font-medium text-slate-600 transition hover:text-slate-900"
              >
                Volver al piso
              </Link>
              <button
                type="button"
                onClick={handleDeleteRoom}
                disabled={isDeleting || isSaving}
                className="inline-flex items-center justify-center rounded-lg border border-red-200 px-3 py-2 text-sm font-medium text-red-700 transition hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {isDeleting ? 'Eliminando...' : 'Eliminar'}
              </button>
            </div>
            <button
              type="submit"
              disabled={isSaving || isDeleting}
              className="inline-flex items-center justify-center rounded-lg bg-slate-900 px-4 py-2 text-sm font-medium text-white transition hover:bg-slate-700 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isSaving ? 'Guardando...' : 'Guardar cambios'}
            </button>
          </div>
        </form>
      </section>
    </main>
  )
}
