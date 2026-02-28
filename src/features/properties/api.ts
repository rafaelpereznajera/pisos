import { supabase } from '../../lib/supabase'
import type { Property, RentalMode } from './types'

type CreatePropertyInput = {
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
