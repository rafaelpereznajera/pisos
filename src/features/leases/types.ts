export type Lease = {
  id: string
  tenant_id: string
  property_id: string | null
  room_id: string | null
  start_date: string
  end_date: string | null
  security_deposit: number
  monthly_rent: number
  is_active: boolean
  created_at: string
}

export type CreateLeaseInput = {
  tenant_id: string
  property_id: string | null
  room_id: string | null
  start_date: string
  end_date: string | null
  security_deposit: number
  monthly_rent: number
  is_active: boolean
}

export type UpdateLeaseInput = {
  start_date: string
  end_date: string | null
  security_deposit: number
  monthly_rent: number
  is_active: boolean
}

export type ActiveLeaseAssignment = {
  lease_id: string
  tenant_name: string
  tenant_phone: string | null
  property_id: string | null
  room_id: string | null
}
