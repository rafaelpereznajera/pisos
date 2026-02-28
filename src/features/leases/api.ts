import { supabase } from '../../lib/supabase'
import type { ActiveLeaseAssignment, CreateLeaseInput, Lease, UpdateLeaseInput } from './types'

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

export async function listActiveLeaseAssignmentsByAssets(
  propertyIds: string[],
  roomIds: string[],
): Promise<{
  byPropertyId: Record<string, ActiveLeaseAssignment>
  byRoomId: Record<string, ActiveLeaseAssignment>
}> {
  if (propertyIds.length === 0 && roomIds.length === 0) {
    return { byPropertyId: {}, byRoomId: {} }
  }

  const leasesResponse = await supabase
    .from('leases')
    .select('id, tenant_id, property_id, room_id, start_date')
    .eq('is_active', true)
    .order('start_date', { ascending: false })

  if (leasesResponse.error) {
    throw new Error(leasesResponse.error.message)
  }

  const propertyIdSet = new Set(propertyIds)
  const roomIdSet = new Set(roomIds)
  const activeLeases = (leasesResponse.data ?? []).filter(
    (lease) =>
      (lease.property_id && propertyIdSet.has(lease.property_id)) ||
      (lease.room_id && roomIdSet.has(lease.room_id)),
  )

  const tenantIds = Array.from(
    new Set([
      ...activeLeases.map((lease) => lease.tenant_id),
    ]),
  )

  const tenantsResponse =
    tenantIds.length > 0
      ? await supabase.from('tenants').select('id, full_name, phone').in('id', tenantIds)
      : { data: [], error: null }

  if (tenantsResponse.error) {
    throw new Error(tenantsResponse.error.message)
  }

  const tenantById = new Map((tenantsResponse.data ?? []).map((tenant) => [tenant.id, tenant]))

  const byPropertyId: Record<string, ActiveLeaseAssignment> = {}
  const byRoomId: Record<string, ActiveLeaseAssignment> = {}

  for (const lease of activeLeases) {
    if (!lease.property_id || byPropertyId[lease.property_id]) {
      continue
    }

    const tenant = tenantById.get(lease.tenant_id)

    byPropertyId[lease.property_id] = {
      lease_id: lease.id,
      tenant_name: tenant?.full_name ?? 'Inquilino',
      tenant_phone: tenant?.phone ?? null,
      property_id: lease.property_id,
      room_id: lease.room_id,
    }
  }

  for (const lease of activeLeases) {
    if (!lease.room_id || byRoomId[lease.room_id]) {
      continue
    }

    const tenant = tenantById.get(lease.tenant_id)

    byRoomId[lease.room_id] = {
      lease_id: lease.id,
      tenant_name: tenant?.full_name ?? 'Inquilino',
      tenant_phone: tenant?.phone ?? null,
      property_id: lease.property_id,
      room_id: lease.room_id,
    }
  }

  return { byPropertyId, byRoomId }
}
