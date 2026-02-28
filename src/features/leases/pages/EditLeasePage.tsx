import { FormEvent, useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { getLeaseById, updateLease } from '../api'

export function EditLeasePage() {
  const navigate = useNavigate()
  const { leaseId } = useParams<{ leaseId: string }>()
  const [tenantId, setTenantId] = useState('')
  const [propertyId, setPropertyId] = useState<string | null>(null)
  const [roomId, setRoomId] = useState<string | null>(null)
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')
  const [monthlyRent, setMonthlyRent] = useState('')
  const [securityDeposit, setSecurityDeposit] = useState('')
  const [isActive, setIsActive] = useState(true)
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function loadLease() {
      if (!leaseId) {
        setError('No se ha encontrado el contrato')
        setIsLoading(false)
        return
      }

      try {
        const lease = await getLeaseById(leaseId)
        setTenantId(lease.tenant_id)
        setPropertyId(lease.property_id)
        setRoomId(lease.room_id)
        setStartDate(lease.start_date)
        setEndDate(lease.end_date ?? '')
        setMonthlyRent(String(lease.monthly_rent))
        setSecurityDeposit(String(lease.security_deposit))
        setIsActive(lease.is_active)
      } catch (loadError) {
        const message = loadError instanceof Error ? loadError.message : 'Error desconocido'
        setError(message)
      } finally {
        setIsLoading(false)
      }
    }

    void loadLease()
  }, [leaseId])

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setError(null)

    if (!leaseId) {
      setError('No se ha encontrado el contrato')
      return
    }

    if (!startDate) {
      setError('La fecha de inicio es obligatoria')
      return
    }

    if (endDate && endDate < startDate) {
      setError('La fecha de fin no puede ser anterior a la de inicio')
      return
    }

    const parsedMonthlyRent = Number.parseFloat(monthlyRent)
    const parsedSecurityDeposit = Number.parseFloat(securityDeposit)

    if (Number.isNaN(parsedMonthlyRent) || parsedMonthlyRent < 0) {
      setError('La renta mensual debe ser un número mayor o igual a 0')
      return
    }

    if (Number.isNaN(parsedSecurityDeposit) || parsedSecurityDeposit < 0) {
      setError('La fianza debe ser un número mayor o igual a 0')
      return
    }

    try {
      setIsSaving(true)
      await updateLease(leaseId, {
        start_date: startDate,
        end_date: endDate || null,
        monthly_rent: parsedMonthlyRent,
        security_deposit: parsedSecurityDeposit,
        is_active: isActive,
      })
      navigate('/tenants')
    } catch (saveError) {
      const message = saveError instanceof Error ? saveError.message : 'Error desconocido'
      setError(message)
    } finally {
      setIsSaving(false)
    }
  }

  if (isLoading) {
    return (
      <main className="mx-auto flex min-h-screen w-full max-w-2xl flex-col px-4 py-10 sm:px-6 lg:px-8">
        <div className="rounded-xl border border-slate-200 bg-white p-4 text-sm text-slate-600 shadow-sm">
          Cargando contrato...
        </div>
      </main>
    )
  }

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-2xl flex-col px-4 py-10 sm:px-6 lg:px-8">
      <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
        <div className="mb-6">
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">Editar contrato</h1>
          <p className="mt-1 text-sm text-slate-600">Actualiza los datos económicos y fechas del contrato.</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-1.5">
              <label className="block text-sm font-medium text-slate-700">Inquilino</label>
              <input
                type="text"
                value={tenantId}
                disabled
                className="block w-full rounded-lg border border-slate-300 bg-slate-100 px-3 py-2 text-sm text-slate-700"
              />
            </div>

            <div className="space-y-1.5">
              <label className="block text-sm font-medium text-slate-700">Asignación</label>
              <input
                type="text"
                value={roomId ? `Habitación (${roomId})` : `Piso (${propertyId ?? '—'})`}
                disabled
                className="block w-full rounded-lg border border-slate-300 bg-slate-100 px-3 py-2 text-sm text-slate-700"
              />
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-1.5">
              <label htmlFor="startDate" className="block text-sm font-medium text-slate-700">
                Fecha de inicio
              </label>
              <input
                id="startDate"
                type="date"
                value={startDate}
                onChange={(event) => setStartDate(event.target.value)}
                required
                className="block w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-900 outline-none ring-0 transition focus:border-slate-500"
              />
            </div>

            <div className="space-y-1.5">
              <label htmlFor="endDate" className="block text-sm font-medium text-slate-700">
                Fecha de fin (opcional)
              </label>
              <input
                id="endDate"
                type="date"
                value={endDate}
                onChange={(event) => setEndDate(event.target.value)}
                className="block w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-900 outline-none ring-0 transition focus:border-slate-500"
              />
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-1.5">
              <label htmlFor="monthlyRent" className="block text-sm font-medium text-slate-700">
                Renta mensual (€)
              </label>
              <input
                id="monthlyRent"
                type="number"
                min={0}
                step="0.01"
                value={monthlyRent}
                onChange={(event) => setMonthlyRent(event.target.value)}
                required
                className="block w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-900 outline-none ring-0 transition focus:border-slate-500"
              />
            </div>

            <div className="space-y-1.5">
              <label htmlFor="securityDeposit" className="block text-sm font-medium text-slate-700">
                Fianza (€)
              </label>
              <input
                id="securityDeposit"
                type="number"
                min={0}
                step="0.01"
                value={securityDeposit}
                onChange={(event) => setSecurityDeposit(event.target.value)}
                required
                className="block w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-900 outline-none ring-0 transition focus:border-slate-500"
              />
            </div>
          </div>

          <div className="flex items-center gap-2">
            <input
              id="isActive"
              type="checkbox"
              checked={isActive}
              onChange={(event) => setIsActive(event.target.checked)}
              className="h-4 w-4 rounded border-slate-300 text-slate-900"
            />
            <label htmlFor="isActive" className="text-sm text-slate-700">
              Contrato activo
            </label>
          </div>

          {error && <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>}

          <div className="flex flex-col-reverse gap-3 pt-2 sm:flex-row sm:items-center sm:justify-between">
            <Link
              to="/tenants"
              className="inline-flex items-center justify-center rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-100"
            >
              Volver a inquilinos
            </Link>
            <button
              type="submit"
              disabled={isSaving}
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
