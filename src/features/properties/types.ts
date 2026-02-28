export type RentalMode = 'entire_property' | 'by_room'

export type Property = {
  id: string
  address: string
  bedroom_count: number
  rental_mode: RentalMode
  created_at: string
}
