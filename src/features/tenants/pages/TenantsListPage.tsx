import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { listLeasesByTenantIds } from '../../leases/api'
import type { Lease } from '../../leases/types'
import { listTenants } from '../api'
import type { Tenant } from '../types'

export function TenantsListPage() {
  const [tenants, setTenants] = useState<Tenant[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isLoadingLeases, setIsLoadingLeases] = useState(false)
  const [leasesByTenantId, setLeasesByTenantId] = useState<Record<string, Lease[]>>({})
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function loadTenants() {
      try {
        const data = await listTenants()
        setTenants(data)
      } catch (loadError) {
        const message = loadError instanceof Error ? loadError.message : 'Error desconocido'
        setError(message)
      } finally {
        setIsLoading(false)
      }
    }

    void loadTenants()
  }, [])

  useEffect(() => {
    async function loadLeases() {
      if (tenants.length === 0) {
        setLeasesByTenantId({})
        return
      }

      try {
        setIsLoadingLeases(true)
        const tenantIds = tenants.map((tenant) => tenant.id)
        const groupedLeases = await listLeasesByTenantIds(tenantIds)
        setLeasesByTenantId(groupedLeases)
      } catch (loadError) {
        const message = loadError instanceof Error ? loadError.message : 'Error desconocido'
        setError(message)
      } finally {
        setIsLoadingLeases(false)
      }
    }

    void loadLeases()
  }, [tenants])

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-5xl flex-col px-4 py-10 sm:px-6 lg:px-8">
      <section className="space-y-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-slate-900">Inquilinos</h1>
            <p className="mt-1 text-sm text-slate-600">Gestiona los inquilinos de tus pisos.</p>
          </div>
          <div className="flex items-center gap-2">
            <Link
              to="/"
              className="inline-flex items-center justify-center rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-100"
            >
              Volver a pisos
            </Link>
            <Link
              to="/tenants/new"
              className="inline-flex items-center justify-center rounded-lg bg-slate-900 px-4 py-2 text-sm font-medium text-white transition hover:bg-slate-700"
            >
              Añadir inquilino
            </Link>
          </div>
        </div>

        {isLoading && (
          <div className="rounded-xl border border-slate-200 bg-white p-4 text-sm text-slate-600 shadow-sm">
            Cargando inquilinos...
          </div>
        )}

        {error && (
          <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">{error}</div>
        )}

        {!isLoading && !error && tenants.length === 0 && (
          <div className="rounded-xl border border-dashed border-slate-300 bg-white p-8 text-center text-sm text-slate-600">
            Todavía no hay inquilinos.
          </div>
        )}

        {!isLoading && !error && tenants.length > 0 && (
          <ul className="grid gap-3">
            {tenants.map((tenant) => (
              <li key={tenant.id} className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                  <div>
                    <p className="font-medium text-slate-900">
                      {tenant.full_name} - {tenant.phone || '—'}
                    </p>

                    <div className="mt-3">
                      <p className="text-xs font-medium uppercase tracking-wide text-slate-500">Contratos</p>

                      {isLoadingLeases && <p className="mt-1 text-sm text-slate-500">Cargando contratos...</p>}

                      {!isLoadingLeases && (leasesByTenantId[tenant.id]?.length ?? 0) === 0 && (
                        <p className="mt-1 text-sm text-slate-500">Sin contratos.</p>
                      )}

                      {!isLoadingLeases && (leasesByTenantId[tenant.id]?.length ?? 0) > 0 && (
                        <ul className="mt-2 space-y-2">
                          {leasesByTenantId[tenant.id].map((lease) => (
                            <li
                              key={lease.id}
                              className="flex flex-col gap-2 rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 sm:flex-row sm:items-center sm:justify-between"
                            >
                              <div className="text-sm text-slate-700">
                                <p>
                                  Inicio: {lease.start_date}
                                  {lease.end_date ? ` · Fin: ${lease.end_date}` : ' · Sin fin'}
                                </p>
                                <p>
                                  Renta: {lease.monthly_rent} € · {lease.is_active ? 'Activo' : 'Inactivo'}
                                </p>
                              </div>
                              <Link
                                to={`/leases/${lease.id}/edit`}
                                className="inline-flex items-center justify-center rounded-lg border border-slate-300 px-3 py-1.5 text-sm font-medium text-slate-700 transition hover:bg-slate-100"
                              >
                                Editar contrato
                              </Link>
                            </li>
                          ))}
                        </ul>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Link
                      to={`/leases/new?tenantId=${tenant.id}`}
                      className="inline-flex items-center justify-center rounded-lg border border-slate-300 px-3 py-1.5 text-sm font-medium text-slate-700 transition hover:bg-slate-100"
                    >
                      Añadir contrato
                    </Link>
                    <Link
                      to={`/tenants/${tenant.id}/edit`}
                      className="inline-flex items-center justify-center rounded-lg border border-slate-300 px-3 py-1.5 text-sm font-medium text-slate-700 transition hover:bg-slate-100"
                    >
                      Editar
                    </Link>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>
    </main>
  )
}
