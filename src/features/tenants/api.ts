import { supabase } from '../../lib/supabase'
import type { Tenant } from './types'

type CreateTenantInput = {
  full_name: string
  phone: string | null
  email: string | null
  document_id: string
}

type UpdateTenantInput = {
  full_name: string
  phone: string | null
  email: string | null
  document_id: string
}

export async function listTenants(): Promise<Tenant[]> {
  const { data, error } = await supabase
    .from('tenants')
    .select('id, full_name, phone, email, document_id, created_at')
    .order('created_at', { ascending: false })

  if (error) {
    throw new Error(error.message)
  }

  return data ?? []
}

export async function createTenant(input: CreateTenantInput): Promise<Tenant> {
  const { data, error } = await supabase
    .from('tenants')
    .insert(input)
    .select('id, full_name, phone, email, document_id, created_at')
    .single()

  if (error) {
    throw new Error(error.message)
  }

  return data
}

export async function getTenantById(id: string): Promise<Tenant> {
  const { data, error } = await supabase
    .from('tenants')
    .select('id, full_name, phone, email, document_id, created_at')
    .eq('id', id)
    .single()

  if (error) {
    throw new Error(error.message)
  }

  return data
}

export async function updateTenant(id: string, input: UpdateTenantInput): Promise<Tenant> {
  const { data, error } = await supabase
    .from('tenants')
    .update(input)
    .eq('id', id)
    .select('id, full_name, phone, email, document_id, created_at')
    .single()

  if (error) {
    throw new Error(error.message)
  }

  return data
}
