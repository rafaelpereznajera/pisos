import { useState } from 'react'
import { useNavigate, useParams, Link } from 'react-router-dom'
import { createPaymentForLease } from '../api'

export function AddPaymentPage() {
  const { leaseId } = useParams<{ leaseId: string }>()
  const [amount, setAmount] = useState('')
  const [billingMonth, setBillingMonth] = useState('')
  const [isPaid, setIsPaid] = useState(true)
  const [paymentDate, setPaymentDate] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [isSaving, setIsSaving] = useState(false)
  const navigate = useNavigate()

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setError(null)
    setIsSaving(true)
    try {
      if (!leaseId) throw new Error('Contrato inválido')
      if (!amount || !billingMonth) throw new Error('Importe y mes requeridos')
      // Normalizar billing_month a primer día del mes
      const [year, month] = billingMonth.split('-')
      const normalizedBillingMonth = year && month ? `${year}-${month.padStart(2, '0')}-01` : billingMonth
      await createPaymentForLease({
        lease_id: leaseId,
        amount: Number(amount),
        billing_month: normalizedBillingMonth,
        is_paid: isPaid,
        payment_date: paymentDate || null,
      })
      navigate(`/leases/${leaseId}/payments`)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error desconocido')
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-2xl flex-col px-4 py-10 sm:px-6 lg:px-8">
      <section className="space-y-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">Añadir pago manual</h1>
          <Link
            to={leaseId ? `/leases/${leaseId}/payments` : '/'}
            className="inline-flex items-center justify-center rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-100"
          >
            Volver a historial
          </Link>
        </div>
        <form className="space-y-4" onSubmit={handleSubmit}>
          <div>
            <label htmlFor="amount" className="block text-sm font-medium text-slate-700">Importe (€)</label>
            <input
              id="amount"
              type="number"
              min="0"
              step="0.01"
              className="mt-1 w-full rounded border border-slate-300 px-3 py-2 text-sm"
              value={amount}
              onChange={e => setAmount(e.target.value)}
              required
            />
          </div>
          <div>
            <label htmlFor="billingMonth" className="block text-sm font-medium text-slate-700">Mes de facturación (YYYY-MM-01)</label>
            <input
              id="billingMonth"
              type="date"
              className="mt-1 w-full rounded border border-slate-300 px-3 py-2 text-sm"
              value={billingMonth}
              onChange={e => setBillingMonth(e.target.value)}
              required
            />
          </div>
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="isPaid"
              checked={isPaid}
              onChange={e => setIsPaid(e.target.checked)}
            />
            <label htmlFor="isPaid" className="text-sm text-slate-700">¿Pagado?</label>
          </div>
          <div>
            <label htmlFor="paymentDate" className="block text-sm font-medium text-slate-700">Fecha de pago (opcional)</label>
            <input
              id="paymentDate"
              type="date"
              className="mt-1 w-full rounded border border-slate-300 px-3 py-2 text-sm"
              value={paymentDate}
              onChange={e => setPaymentDate(e.target.value)}
            />
          </div>
          {error && <div className="text-red-600 text-sm">{error}</div>}
          <button
            type="submit"
            disabled={isSaving}
            className="inline-flex items-center justify-center rounded-lg bg-slate-900 px-4 py-2 text-sm font-medium text-white transition hover:bg-slate-700 disabled:opacity-60"
          >
            {isSaving ? 'Guardando...' : 'Añadir pago'}
          </button>
        </form>
      </section>
    </main>
  )
}