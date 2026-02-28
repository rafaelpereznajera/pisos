import { FormEvent, useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { getTenantById, updateTenant } from '../api'

export function EditTenantPage() {
  const navigate = useNavigate()
  const { tenantId } = useParams<{ tenantId: string }>()
  const [fullName, setFullName] = useState('')
  const [documentId, setDocumentId] = useState('')
  const [phone, setPhone] = useState('')
  const [email, setEmail] = useState('')
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function loadTenant() {
      if (!tenantId) {
        setError('No se ha encontrado el inquilino')
        setIsLoading(false)
        return
      }

      try {
        const tenant = await getTenantById(tenantId)
        setFullName(tenant.full_name)
        setDocumentId(tenant.document_id)
        setPhone(tenant.phone || '')
        setEmail(tenant.email || '')
      } catch (loadError) {
        const message = loadError instanceof Error ? loadError.message : 'Error desconocido'
        setError(message)
      } finally {
        setIsLoading(false)
      }
    }

    void loadTenant()
  }, [tenantId])

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setError(null)

    if (!tenantId) {
      setError('No se ha encontrado el inquilino')
      return
    }

    if (!fullName.trim()) {
      setError('El nombre completo es obligatorio')
      return
    }

    if (!documentId.trim()) {
      setError('El DNI/NIE es obligatorio')
      return
    }

    try {
      setIsSaving(true)
      await updateTenant(tenantId, {
        full_name: fullName.trim(),
        document_id: documentId.trim(),
        phone: phone.trim() || null,
        email: email.trim() || null,
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
          Cargando inquilino...
        </div>
      </main>
    )
  }

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-2xl flex-col px-4 py-10 sm:px-6 lg:px-8">
      <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
        <div className="mb-6">
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">Editar inquilino</h1>
          <p className="mt-1 text-sm text-slate-600">Actualiza la información del inquilino.</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="space-y-1.5">
            <label htmlFor="fullName" className="block text-sm font-medium text-slate-700">
              Nombre completo
            </label>
            <input
              id="fullName"
              type="text"
              value={fullName}
              onChange={(event) => setFullName(event.target.value)}
              required
              className="block w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-900 outline-none ring-0 transition focus:border-slate-500"
            />
          </div>

          <div className="space-y-1.5">
            <label htmlFor="documentId" className="block text-sm font-medium text-slate-700">
              DNI/NIE
            </label>
            <input
              id="documentId"
              type="text"
              value={documentId}
              onChange={(event) => setDocumentId(event.target.value)}
              required
              className="block w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-900 outline-none ring-0 transition focus:border-slate-500"
            />
          </div>

          <div className="space-y-1.5">
            <label htmlFor="phone" className="block text-sm font-medium text-slate-700">
              Teléfono
            </label>
            <input
              id="phone"
              type="text"
              value={phone}
              onChange={(event) => setPhone(event.target.value)}
              className="block w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-900 outline-none ring-0 transition focus:border-slate-500"
            />
          </div>

          <div className="space-y-1.5">
            <label htmlFor="email" className="block text-sm font-medium text-slate-700">
              Email
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              className="block w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-900 outline-none ring-0 transition focus:border-slate-500"
            />
          </div>

          {error && <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>}

          <div className="flex flex-col-reverse gap-3 pt-2 sm:flex-row sm:items-center sm:justify-between">
            <Link to="/tenants" className="text-sm font-medium text-slate-600 transition hover:text-slate-900">
              Volver al listado
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
