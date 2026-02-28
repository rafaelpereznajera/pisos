import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { listProperties } from '../api'
import type { Property } from '../types'

export function PropertiesHomePage() {
  const [properties, setProperties] = useState<Property[]>([])
  const [isLoading, setIsLoading] = useState(true)
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

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-5xl flex-col px-4 py-10 sm:px-6 lg:px-8">
      <section className="space-y-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-slate-900">Gestor de Pisos de Alquiler</h1>
            <p className="mt-1 text-sm text-slate-600">Gestiona tu cartera de alquileres en un solo lugar.</p>
          </div>
          <Link
            to="/properties/new"
            className="inline-flex items-center justify-center rounded-lg bg-slate-900 px-4 py-2 text-sm font-medium text-white transition hover:bg-slate-700"
          >
            Añadir piso
          </Link>
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
