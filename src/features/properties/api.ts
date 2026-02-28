import { supabase } from '../../lib/supabase'
import type { Property, RentalMode, Room } from './types'

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

type CreateRoomInput = {
  property_id: string
  name: string
}

type UpdateRoomInput = {
  name: string
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

export async function listRoomsByProperty(propertyId: string): Promise<Room[]> {
  const { data, error } = await supabase
    .from('rooms')
    .select('id, property_id, name, created_at')
    .eq('property_id', propertyId)
    .order('created_at', { ascending: true })

  if (error) {
    throw new Error(error.message)
  }

  return data ?? []
}

export async function listRoomsByPropertyIds(propertyIds: string[]): Promise<Record<string, Room[]>> {
  if (propertyIds.length === 0) {
    return {}
  }

  const { data, error } = await supabase
    .from('rooms')
    .select('id, property_id, name, created_at')
    .in('property_id', propertyIds)
    .order('created_at', { ascending: true })

  if (error) {
    throw new Error(error.message)
  }

  const roomsByPropertyId: Record<string, Room[]> = {}

  for (const room of data ?? []) {
    if (!roomsByPropertyId[room.property_id]) {
      roomsByPropertyId[room.property_id] = []
    }

    roomsByPropertyId[room.property_id].push(room)
  }

  return roomsByPropertyId
}

export async function createRoom(input: CreateRoomInput): Promise<Room> {
  const { data, error } = await supabase
    .from('rooms')
    .insert(input)
    .select('id, property_id, name, created_at')
    .single()

  if (error) {
    throw new Error(error.message)
  }

  return data
}

export async function getRoomById(propertyId: string, roomId: string): Promise<Room> {
  const { data, error } = await supabase
    .from('rooms')
    .select('id, property_id, name, created_at')
    .eq('property_id', propertyId)
    .eq('id', roomId)
    .single()

  if (error) {
    throw new Error(error.message)
  }

  return data
}

export async function getRoomByIdOnly(roomId: string): Promise<Room> {
  const { data, error } = await supabase
    .from('rooms')
    .select('id, property_id, name, created_at')
    .eq('id', roomId)
    .single()

  if (error) {
    throw new Error(error.message)
  }

  return data
}

export async function updateRoom(propertyId: string, roomId: string, input: UpdateRoomInput): Promise<Room> {
  const { data, error } = await supabase
    .from('rooms')
    .update(input)
    .eq('property_id', propertyId)
    .eq('id', roomId)
    .select('id, property_id, name, created_at')
    .single()

  if (error) {
    throw new Error(error.message)
  }

  return data
}

export async function deleteRoom(propertyId: string, roomId: string): Promise<void> {
  const { error } = await supabase.from('rooms').delete().eq('property_id', propertyId).eq('id', roomId)

  if (error) {
    throw new Error(error.message)
  }
}
