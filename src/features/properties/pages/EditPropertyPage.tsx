import { FormEvent, useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { deleteProperty, getPropertyById, listRoomsByProperty, updateProperty } from '../api'
import type { RentalMode, Room } from '../types'

export function EditPropertyPage() {
  const navigate = useNavigate()
  const { propertyId } = useParams<{ propertyId: string }>()
  const [address, setAddress] = useState('')
  const [bedroomCount, setBedroomCount] = useState('1')
  const [rentalMode, setRentalMode] = useState<RentalMode>('entire_property')
  const [rooms, setRooms] = useState<Room[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isLoadingRooms, setIsLoadingRooms] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function loadProperty() {
      if (!propertyId) {
        setError('No se ha encontrado el piso a editar')
        setIsLoading(false)
        return
      }

      try {
        const property = await getPropertyById(propertyId)
        setAddress(property.address)
        setBedroomCount(String(property.bedroom_count))
        setRentalMode(property.rental_mode)
      } catch (loadError) {
        const message = loadError instanceof Error ? loadError.message : 'Error desconocido'
        setError(message)
      } finally {
        setIsLoading(false)
      }
    }

    void loadProperty()
  }, [propertyId])

  useEffect(() => {
    async function loadRooms() {
      if (!propertyId || rentalMode !== 'by_room') {
        setRooms([])
        return
      }

      try {
        setIsLoadingRooms(true)
        const roomData = await listRoomsByProperty(propertyId)
        setRooms(roomData)
      } catch (loadError) {
        const message = loadError instanceof Error ? loadError.message : 'Error desconocido'
        setError(message)
      } finally {
        setIsLoadingRooms(false)
      }
    }

    void loadRooms()
  }, [propertyId, rentalMode])

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setError(null)

    if (!propertyId) {
      setError('No se ha encontrado el piso a editar')
      return
    }

    const parsedBedroomCount = Number.parseInt(bedroomCount, 10)

    if (!address.trim()) {
      setError('La dirección es obligatoria')
      return
    }

    if (!Number.isInteger(parsedBedroomCount) || parsedBedroomCount <= 0) {
      setError('El número de habitaciones debe ser mayor que 0')
      return
    }

    try {
      setIsSaving(true)
      await updateProperty(propertyId, {
        address: address.trim(),
        bedroom_count: parsedBedroomCount,
        rental_mode: rentalMode,
      })
      navigate('/')
    } catch (saveError) {
      const message = saveError instanceof Error ? saveError.message : 'Error desconocido'
      setError(message)
    } finally {
      setIsSaving(false)
    }
  }

  async function handleDeleteProperty() {
    if (!propertyId) {
      setError('No se ha encontrado el piso a editar')
      return
    }

    const confirmed = window.confirm(`¿Seguro que quieres eliminar el piso en ${address}?`)

    if (!confirmed) {
      return
    }

    try {
      setIsDeleting(true)
      setError(null)
      await deleteProperty(propertyId)
      navigate('/')
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
          Cargando piso...
        </div>
      </main>
    )
  }

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-2xl flex-col px-4 py-10 sm:px-6 lg:px-8">
      <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
        <div className="mb-6">
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">Editar piso</h1>
          <p className="mt-1 text-sm text-slate-600">Actualiza la información del piso.</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="space-y-1.5">
            <label htmlFor="address" className="block text-sm font-medium text-slate-700">
              Dirección
            </label>
            <input
              id="address"
              type="text"
              value={address}
              onChange={(event) => setAddress(event.target.value)}
              required
              className="block w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-900 outline-none ring-0 transition placeholder:text-slate-400 focus:border-slate-500"
            />
          </div>

          <div className="space-y-1.5">
            <label htmlFor="bedroomCount" className="block text-sm font-medium text-slate-700">
              Número de habitaciones
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
              Tipo de alquiler
            </label>
            <select
              id="rentalMode"
              value={rentalMode}
              onChange={(event) => setRentalMode(event.target.value as RentalMode)}
              className="block w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-900 outline-none ring-0 transition focus:border-slate-500"
            >
              <option value="entire_property">Piso completo</option>
              <option value="by_room">Por habitaciones</option>
            </select>
          </div>

          {rentalMode === 'by_room' && propertyId && (
            <div className="space-y-3 rounded-xl border border-slate-200 bg-slate-50 p-4">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <h2 className="text-sm font-semibold text-slate-900">Habitaciones</h2>
                <Link
                  to={`/properties/${propertyId}/rooms/new`}
                  className="inline-flex items-center justify-center rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-sm font-medium text-slate-700 transition hover:bg-slate-100"
                >
                  Añadir habitación
                </Link>
              </div>

              {isLoadingRooms && <p className="text-sm text-slate-600">Cargando habitaciones...</p>}

              {!isLoadingRooms && rooms.length === 0 && (
                <p className="text-sm text-slate-600">No hay habitaciones todavía.</p>
              )}

              {!isLoadingRooms && rooms.length > 0 && (
                <ul className="space-y-2">
                  {rooms.map((room) => (
                    <li
                      key={room.id}
                      className="flex items-center justify-between rounded-lg border border-slate-200 bg-white px-3 py-2"
                    >
                      <span className="text-sm text-slate-800">{room.name}</span>
                      <Link
                        to={`/properties/${propertyId}/rooms/${room.id}/edit`}
                        className="inline-flex items-center justify-center rounded-lg border border-slate-300 px-3 py-1.5 text-xs font-medium text-slate-700 transition hover:bg-slate-100"
                      >
                        Editar / Borrar
                      </Link>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          )}

          {error && <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>}

          <div className="flex flex-col-reverse gap-3 pt-2 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-3">
              <Link to="/" className="text-sm font-medium text-slate-600 transition hover:text-slate-900">
                Volver al listado
              </Link>
              <button
                type="button"
                onClick={handleDeleteProperty}
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
