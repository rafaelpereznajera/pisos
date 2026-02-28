import { supabase } from '../../lib/supabase'
import type { CreateLeaseInput, Lease, UpdateLeaseInput } from './types'

export async function createLease(input: CreateLeaseInput): Promise<Lease> {
  const { data, error } = await supabase
    .from('leases')
    .insert(input)
    .select(
      'id, tenant_id, property_id, room_id, start_date, end_date, security_deposit, monthly_rent, is_active, created_at',
    )
    .single()

  if (error) {
    throw new Error(error.message)
  }

  return data
}

export async function listLeasesByTenantIds(tenantIds: string[]): Promise<Record<string, Lease[]>> {
  if (tenantIds.length === 0) {
    return {}
  }

  const { data, error } = await supabase
    .from('leases')
    .select(
      'id, tenant_id, property_id, room_id, start_date, end_date, security_deposit, monthly_rent, is_active, created_at',
    )
    .in('tenant_id', tenantIds)
    .order('start_date', { ascending: false })

  if (error) {
    throw new Error(error.message)
  }

  const leasesByTenantId: Record<string, Lease[]> = {}

  for (const lease of data ?? []) {
    if (!leasesByTenantId[lease.tenant_id]) {
      leasesByTenantId[lease.tenant_id] = []
    }

    leasesByTenantId[lease.tenant_id].push(lease)
  }

  return leasesByTenantId
}

export async function getLeaseById(leaseId: string): Promise<Lease> {
  const { data, error } = await supabase
    .from('leases')
    .select(
      'id, tenant_id, property_id, room_id, start_date, end_date, security_deposit, monthly_rent, is_active, created_at',
    )
    .eq('id', leaseId)
    .single()

  if (error) {
    throw new Error(error.message)
  }

  return data
}

export async function updateLease(leaseId: string, input: UpdateLeaseInput): Promise<Lease> {
  const { data, error } = await supabase
    .from('leases')
    .update(input)
    .eq('id', leaseId)
    .select(
      'id, tenant_id, property_id, room_id, start_date, end_date, security_deposit, monthly_rent, is_active, created_at',
    )
    .single()

  if (error) {
    throw new Error(error.message)
  }

  return data
}
