import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { getLeaseById } from '../../leases/api'
import { getTenantById } from '../../tenants/api'
import { listPaymentsByLeaseId, type Payment } from '../api'

function formatBillingMonth(value: string): string {
  const [year, month] = value.split('-')

  if (!year || !month) {
    return value
  }

  return `${month}/${year}`
}

export function LeasePaymentsHistoryPage() {
  const { leaseId } = useParams<{ leaseId: string }>()
  const [payments, setPayments] = useState<Payment[]>([])
  const [tenantName, setTenantName] = useState<string>('—')
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function loadPayments() {
      if (!leaseId) {
        setError('Contrato inválido')
        setIsLoading(false)
        return
      }

      try {
        const [paymentsData, lease] = await Promise.all([listPaymentsByLeaseId(leaseId), getLeaseById(leaseId)])
        setPayments(paymentsData)

        const tenant = await getTenantById(lease.tenant_id)
        setTenantName(tenant.full_name)
      } catch (loadError) {
        const message = loadError instanceof Error ? loadError.message : 'Error desconocido'
        setError(message)
      } finally {
        setIsLoading(false)
      }
    }

    void loadPayments()
  }, [leaseId])

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-5xl flex-col px-4 py-10 sm:px-6 lg:px-8">
      <section className="space-y-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-slate-900">Historial de pagos</h1>
            <p className="mt-1 text-sm text-slate-600">Contrato: {leaseId || '—'} · Inquilino: {tenantName}</p>
          </div>
          <div className="flex gap-2">
            <Link
              to={leaseId ? `/leases/${leaseId}/payments/new` : '#'}
              className="inline-flex items-center justify-center rounded-lg bg-slate-900 px-4 py-2 text-sm font-medium text-white transition hover:bg-slate-700"
            >
              Añadir pago
            </Link>
            <Link
              to="/"
              className="inline-flex items-center justify-center rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-100"
            >
              Volver a pisos
            </Link>
          </div>
        </div>

        {isLoading && (
          <div className="rounded-xl border border-slate-200 bg-white p-4 text-sm text-slate-600 shadow-sm">
            Cargando pagos...
          </div>
        )}

        {error && (
          <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">{error}</div>
        )}

        {!isLoading && !error && payments.length === 0 && (
          <div className="rounded-xl border border-dashed border-slate-300 bg-white p-8 text-center text-sm text-slate-600">
            Todavía no hay pagos para este contrato.
          </div>
        )}

        {!isLoading && !error && payments.length > 0 && (
          <ul className="space-y-2">
            {payments.map((payment) => (
              <li key={payment.id} className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
                <div className="flex flex-col gap-2 text-sm text-slate-700 sm:flex-row sm:items-center sm:justify-between">
                  <div className="flex flex-col gap-1">
                    <p>Mes: {formatBillingMonth(payment.billing_month)}</p>
                    <p>Importe: {payment.amount} €</p>
                    <p>{payment.is_paid ? `Pagado · ${payment.payment_date || 'Sin fecha'}` : 'Pendiente'}</p>
                  </div>
                  <div className="flex gap-2">
                    <Link
                      to={`/leases/${payment.lease_id}/payments/${payment.id}/edit`}
                      className="inline-flex items-center justify-center rounded-lg border border-slate-300 px-3 py-1.5 text-xs font-medium text-slate-700 transition hover:bg-slate-100"
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
