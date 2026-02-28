import { FormEvent, useEffect, useState } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { listProperties, listRoomsByProperty } from '../../properties/api'
import type { Property, Room } from '../../properties/types'
import { createLease } from '../api'
import { listTenants } from '../../tenants/api'
import type { Tenant } from '../../tenants/types'

export function NewLeasePage() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const tenantIdFromQuery = searchParams.get('tenantId')
  const [tenants, setTenants] = useState<Tenant[]>([])
  const [properties, setProperties] = useState<Property[]>([])
  const [rooms, setRooms] = useState<Room[]>([])
  const [selectedTenantId, setSelectedTenantId] = useState('')
  const [selectedPropertyId, setSelectedPropertyId] = useState('')
  const [selectedRoomId, setSelectedRoomId] = useState('')
  const [startDate, setStartDate] = useState(new Date().toISOString().slice(0, 10))
  const [endDate, setEndDate] = useState('')
  const [monthlyRent, setMonthlyRent] = useState('')
  const [securityDeposit, setSecurityDeposit] = useState('0')
  const [isActive, setIsActive] = useState(true)
  const [isLoadingData, setIsLoadingData] = useState(true)
  const [isLoadingRooms, setIsLoadingRooms] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const selectedProperty = properties.find((property) => property.id === selectedPropertyId)
  const isByRoomMode = selectedProperty?.rental_mode === 'by_room'

  useEffect(() => {
    async function loadData() {
      try {
        const [tenantData, propertyData] = await Promise.all([listTenants(), listProperties()])

        setTenants(tenantData)
        setProperties(propertyData)

        if (tenantData.length === 0) {
          setSelectedTenantId('')
        } else {
          const tenantExists = tenantIdFromQuery
            ? tenantData.some((tenant) => tenant.id === tenantIdFromQuery)
            : false

          if (tenantExists && tenantIdFromQuery) {
            setSelectedTenantId(tenantIdFromQuery)
          } else {
            setSelectedTenantId(tenantData[0].id)
          }
        }

        if (propertyData.length > 0) {
          setSelectedPropertyId(propertyData[0].id)
        }
      } catch (loadError) {
        const message = loadError instanceof Error ? loadError.message : 'Error desconocido'
        setError(message)
      } finally {
        setIsLoadingData(false)
      }
    }

    void loadData()
  }, [tenantIdFromQuery])

  useEffect(() => {
    async function loadRooms() {
      if (!selectedProperty || selectedProperty.rental_mode !== 'by_room') {
        setRooms([])
        setSelectedRoomId('')
        return
      }

      try {
        setIsLoadingRooms(true)
        const roomData = await listRoomsByProperty(selectedProperty.id)
        setRooms(roomData)
        setSelectedRoomId(roomData[0]?.id ?? '')
      } catch (loadError) {
        const message = loadError instanceof Error ? loadError.message : 'Error desconocido'
        setError(message)
      } finally {
        setIsLoadingRooms(false)
      }
    }

    void loadRooms()
  }, [selectedProperty])

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setError(null)

    if (!selectedTenantId) {
      setError('Selecciona un inquilino')
      return
    }

    if (!selectedProperty) {
      setError('Selecciona un piso')
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

    if (selectedProperty.rental_mode === 'by_room' && !selectedRoomId) {
      setError('Selecciona una habitación para este contrato')
      return
    }

    try {
      setIsSaving(true)
      await createLease({
        tenant_id: selectedTenantId,
        property_id: selectedProperty.rental_mode === 'entire_property' ? selectedProperty.id : null,
        room_id: selectedProperty.rental_mode === 'by_room' ? selectedRoomId : null,
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

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-2xl flex-col px-4 py-10 sm:px-6 lg:px-8">
      <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
        <div className="mb-6">
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">Nuevo contrato</h1>
          <p className="mt-1 text-sm text-slate-600">Completa los datos para dar de alta el contrato.</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <label htmlFor="tenantId" className="block text-sm font-medium text-slate-700">
              Inquilino
            </label>
            <select
              id="tenantId"
              value={selectedTenantId}
              onChange={(event) => setSelectedTenantId(event.target.value)}
              disabled={isLoadingData || tenants.length === 0 || Boolean(tenantIdFromQuery)}
              className="block w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-900 outline-none ring-0 transition focus:border-slate-500 disabled:cursor-not-allowed disabled:bg-slate-100"
            >
              {tenants.length === 0 && <option value="">Sin inquilinos disponibles</option>}
              {tenants.map((tenant) => (
                <option key={tenant.id} value={tenant.id}>
                  {tenant.full_name} · {tenant.document_id}
                </option>
              ))}
            </select>
            {tenantIdFromQuery && selectedTenantId === tenantIdFromQuery && (
              <p className="text-xs text-slate-500">Inquilino precargado desde el listado.</p>
            )}
          </div>

          <div className="space-y-1.5">
            <label htmlFor="propertyId" className="block text-sm font-medium text-slate-700">
              Piso
            </label>
            <select
              id="propertyId"
              value={selectedPropertyId}
              onChange={(event) => setSelectedPropertyId(event.target.value)}
              disabled={isLoadingData || properties.length === 0}
              className="block w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-900 outline-none ring-0 transition focus:border-slate-500 disabled:cursor-not-allowed disabled:bg-slate-100"
            >
              {properties.length === 0 && <option value="">Sin pisos disponibles</option>}
              {properties.map((property) => (
                <option key={property.id} value={property.id}>
                  {property.address} · {property.rental_mode === 'by_room' ? 'Por habitaciones' : 'Piso completo'}
                </option>
              ))}
            </select>
          </div>

          {isByRoomMode && (
            <div className="space-y-1.5">
              <label htmlFor="roomId" className="block text-sm font-medium text-slate-700">
                Habitación
              </label>
              <select
                id="roomId"
                value={selectedRoomId}
                onChange={(event) => setSelectedRoomId(event.target.value)}
                disabled={isLoadingRooms || rooms.length === 0}
                className="block w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-900 outline-none ring-0 transition focus:border-slate-500 disabled:cursor-not-allowed disabled:bg-slate-100"
              >
                {rooms.length === 0 && <option value="">Sin habitaciones disponibles</option>}
                {rooms.map((room) => (
                  <option key={room.id} value={room.id}>
                    {room.name}
                  </option>
                ))}
              </select>
            </div>
          )}

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

          {isLoadingData && <p className="text-sm text-slate-600">Cargando datos...</p>}
          {isLoadingRooms && <p className="text-sm text-slate-600">Cargando habitaciones...</p>}

          {error && <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>}

          <div className="pt-2">
            <div className="flex flex-col-reverse gap-3 sm:flex-row sm:items-center sm:justify-between">
              <Link
                to="/tenants"
                className="inline-flex items-center justify-center rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-100"
              >
                Volver a inquilinos
              </Link>
              <button
                type="submit"
                disabled={isSaving || isLoadingData || (isByRoomMode && rooms.length === 0)}
                className="inline-flex items-center justify-center rounded-lg bg-slate-900 px-4 py-2 text-sm font-medium text-white transition hover:bg-slate-700 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {isSaving ? 'Guardando...' : 'Guardar contrato'}
              </button>
            </div>
          </div>
        </form>
      </section>
    </main>
  )
}
