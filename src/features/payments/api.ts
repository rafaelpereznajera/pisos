import { supabase } from '../../lib/supabase'

type Payment = {
  id: string
  lease_id: string
  billing_month: string
  amount: number
  is_paid: boolean
  payment_date: string | null
}

function getCurrentMonthStart(): string {
  const today = new Date()
  return `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-01`
}

function getToday(): string {
  const today = new Date()
  return `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`
}

export async function listCurrentMonthPaymentsByLeaseIds(
  leaseIds: string[],
): Promise<Record<string, Payment>> {
  if (leaseIds.length === 0) {
    return {}
  }

  const monthStart = getCurrentMonthStart()

  const { data, error } = await supabase
    .from('payments')
    .select('id, lease_id, billing_month, amount, is_paid, payment_date')
    .in('lease_id', leaseIds)
    .eq('billing_month', monthStart)

  if (error) {
    throw new Error(error.message)
  }

  const paymentsByLeaseId: Record<string, Payment> = {}

  for (const payment of data ?? []) {
    if (!paymentsByLeaseId[payment.lease_id]) {
      paymentsByLeaseId[payment.lease_id] = payment
    }
  }

  return paymentsByLeaseId
}

export async function createCurrentMonthPaymentForLease(leaseId: string, amount: number): Promise<Payment> {
  const monthStart = getCurrentMonthStart()
  const today = getToday()

  const { data, error } = await supabase
    .from('payments')
    .insert({
      lease_id: leaseId,
      billing_month: monthStart,
      amount,
      is_paid: true,
      payment_date: today,
    })
    .select('id, lease_id, billing_month, amount, is_paid, payment_date')
    .single()

  if (error) {
    throw new Error(error.message)
  }

  return data
}
