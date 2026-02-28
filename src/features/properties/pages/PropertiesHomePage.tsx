import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { listActiveLeaseAssignmentsByAssets } from '../../leases/api'
import type { ActiveLeaseAssignment } from '../../leases/types'
import { listProperties, listRoomsByPropertyIds } from '../api'
import type { Property, Room } from '../types'

export function PropertiesHomePage() {
  const [properties, setProperties] = useState<Property[]>([])
  const [roomsByPropertyId, setRoomsByPropertyId] = useState<Record<string, Room[]>>({})
  const [activeLeaseByPropertyId, setActiveLeaseByPropertyId] = useState<
    Record<string, ActiveLeaseAssignment>
  >({})
  const [activeLeaseByRoomId, setActiveLeaseByRoomId] = useState<Record<string, ActiveLeaseAssignment>>({})
  const [isLoading, setIsLoading] = useState(true)
  const [isLoadingRooms, setIsLoadingRooms] = useState(false)
  const [isLoadingLeases, setIsLoadingLeases] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function loadProperties() {
      try {
        const data = await listProperties()
        setProperties(data)
      } catch (loadError) {
        const message = loadError instanceof Error ? loadError.message : 'Error desconocido'
        setError(message)
      } finally {
        setIsLoading(false)
      }
    }

    void loadProperties()
  }, [])

  useEffect(() => {
    async function loadRooms() {
      const byRoomPropertyIds = properties
        .filter((property) => property.rental_mode === 'by_room')
        .map((property) => property.id)

      if (byRoomPropertyIds.length === 0) {
        setRoomsByPropertyId({})
        return
      }

      try {
        setIsLoadingRooms(true)
        const groupedRooms = await listRoomsByPropertyIds(byRoomPropertyIds)
        setRoomsByPropertyId(groupedRooms)
      } catch (loadError) {
        const message = loadError instanceof Error ? loadError.message : 'Error desconocido'
        setError(message)
      } finally {
        setIsLoadingRooms(false)
      }
    }

    void loadRooms()
  }, [properties])

  useEffect(() => {
    async function loadActiveLeases() {
      if (properties.length === 0) {
        setActiveLeaseByPropertyId({})
        setActiveLeaseByRoomId({})
        return
      }

      const propertyIds = properties.map((property) => property.id)
      const roomIds = Object.values(roomsByPropertyId)
        .flat()
        .map((room) => room.id)

      try {
        setIsLoadingLeases(true)
        const assignments = await listActiveLeaseAssignmentsByAssets(propertyIds, roomIds)
        setActiveLeaseByPropertyId(assignments.byPropertyId)
        setActiveLeaseByRoomId(assignments.byRoomId)
      } catch (loadError) {
        const message = loadError instanceof Error ? loadError.message : 'Error desconocido'
        setError(message)
      } finally {
        setIsLoadingLeases(false)
      }
    }

    void loadActiveLeases()
  }, [properties, roomsByPropertyId])

  function formatTenant(assignment: ActiveLeaseAssignment | undefined): string {
    if (!assignment) {
      return ''
    }

    return `${assignment.tenant_name} (${assignment.tenant_phone || '—'})`
  }

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-5xl flex-col px-4 py-10 sm:px-6 lg:px-8">
      <section className="space-y-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-slate-900">Gestor de Pisos de Alquiler</h1>
            <p className="mt-1 text-sm text-slate-600">Gestiona tu cartera de alquileres en un solo lugar.</p>
          </div>
          <div className="flex items-center gap-2">
            <Link
              to="/tenants"
              className="inline-flex items-center justify-center rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-100"
            >
              Inquilinos
            </Link>
            <Link
              to="/properties/new"
              className="inline-flex items-center justify-center rounded-lg bg-slate-900 px-4 py-2 text-sm font-medium text-white transition hover:bg-slate-700"
            >
              Añadir piso
            </Link>
          </div>
        </div>

        {isLoading && (
          <div className="rounded-xl border border-slate-200 bg-white p-4 text-sm text-slate-600 shadow-sm">
            Cargando pisos...
          </div>
        )}

        {error && (
          <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">{error}</div>
        )}

        {!isLoading && !error && properties.length === 0 && (
          <div className="rounded-xl border border-dashed border-slate-300 bg-white p-8 text-center text-sm text-slate-600">
            Todavía no hay pisos.
          </div>
        )}

        {!isLoading && !error && properties.length > 0 && (
          <ul className="grid gap-3">
            {properties.map((property) => (
              <li key={property.id} className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                  <div>
                    <p className="font-medium text-slate-900">{property.address}</p>
                    <p className="mt-1 text-sm text-slate-600">
                      {property.bedroom_count} habitaciones · {property.rental_mode === 'by_room' ? 'Por habitaciones' : 'Piso completo'}
                    </p>

                    {property.rental_mode === 'entire_property' &&
                      activeLeaseByPropertyId[property.id] &&
                      !isLoadingLeases && (
                        <p className="mt-1 text-sm text-slate-600">
                          {formatTenant(activeLeaseByPropertyId[property.id])}
                        </p>
                      )}

                    {property.rental_mode === 'by_room' && (
                      <div className="mt-3">
                        <p className="text-xs font-medium uppercase tracking-wide text-slate-500">Habitaciones</p>

                        {isLoadingRooms && <p className="mt-1 text-sm text-slate-500">Cargando habitaciones...</p>}

                        {!isLoadingRooms && (roomsByPropertyId[property.id]?.length ?? 0) === 0 && (
                          <p className="mt-1 text-sm text-slate-500">Sin habitaciones.</p>
                        )}

                        {!isLoadingRooms && (roomsByPropertyId[property.id]?.length ?? 0) > 0 && (
                          <ul className="mt-2 space-y-1">
                            {roomsByPropertyId[property.id].map((room) => (
                              <li key={room.id} className="text-sm text-slate-700">
                                - {room.name}
                                {activeLeaseByRoomId[room.id] && !isLoadingLeases
                                  ? ` · ${formatTenant(activeLeaseByRoomId[room.id])}`
                                  : ''}
                              </li>
                            ))}
                          </ul>
                        )}
                      </div>
                    )}
                  </div>
                  <Link
                    to={`/properties/${property.id}/edit`}
                    className="inline-flex items-center justify-center rounded-lg border border-slate-300 px-3 py-1.5 text-sm font-medium text-slate-700 transition hover:bg-slate-100"
                  >
                    Editar
                  </Link>
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>
    </main>
  )
}
