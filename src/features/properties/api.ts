import { supabase } from '../../lib/supabase'
import type { Property, RentalMode } from './types'

type CreatePropertyInput = {
  address: string
  bedroom_count: number
  rental_mode: RentalMode
}

type UpdatePropertyInput = {
  address: string
  bedroom_count: number
  rental_mode: RentalMode
}

export async function listProperties(): Promise<Property[]> {
  const { data, error } = await supabase
    .from('properties')
    .select('id, address, bedroom_count, rental_mode, created_at')
    .order('created_at', { ascending: false })

  if (error) {
    throw new Error(error.message)
  }

  return data ?? []
}

export async function createProperty(input: CreatePropertyInput): Promise<Property> {
  const { data, error } = await supabase
    .from('properties')
    .insert(input)
    .select('id, address, bedroom_count, rental_mode, created_at')
    .single()

  if (error) {
    throw new Error(error.message)
  }

  return data
}

export async function getPropertyById(id: string): Promise<Property> {
  const { data, error } = await supabase
    .from('properties')
    .select('id, address, bedroom_count, rental_mode, created_at')
    .eq('id', id)
    .single()

  if (error) {
    throw new Error(error.message)
  }

  return data
}

export async function updateProperty(id: string, input: UpdatePropertyInput): Promise<Property> {
  const { data, error } = await supabase
    .from('properties')
    .update(input)
    .eq('id', id)
    .select('id, address, bedroom_count, rental_mode, created_at')
    .single()

  if (error) {
    throw new Error(error.message)
  }

  return data
}

export async function deleteProperty(id: string): Promise<void> {
  const { error } = await supabase.from('properties').delete().eq('id', id)

  if (error) {
    throw new Error(error.message)
  }
}
