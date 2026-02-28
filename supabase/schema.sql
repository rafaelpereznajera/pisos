create extension if not exists "pgcrypto";

create type rental_mode as enum ('entire_property', 'by_room');

create table if not exists properties (
  id uuid primary key default gen_random_uuid(),
  address text not null,
  bedroom_count integer not null check (bedroom_count > 0),
  rental_mode rental_mode not null,
  created_at timestamptz not null default now()
);

create table if not exists rooms (
  id uuid primary key default gen_random_uuid(),
  property_id uuid not null references properties(id) on delete cascade,
  name text not null,
  created_at timestamptz not null default now(),
  unique (property_id, name)
);

create table if not exists tenants (
  id uuid primary key default gen_random_uuid(),
  full_name text not null,
  phone text,
  email text,
  document_id text not null,
  created_at timestamptz not null default now(),
  unique (document_id)
);

create table if not exists leases (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references tenants(id) on delete restrict,
  property_id uuid references properties(id) on delete restrict,
  room_id uuid references rooms(id) on delete restrict,
  start_date date not null,
  end_date date,
  security_deposit numeric(10,2) not null default 0,
  monthly_rent numeric(10,2) not null check (monthly_rent >= 0),
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  check (end_date is null or end_date >= start_date),
  check (
    (property_id is not null and room_id is null)
    or
    (property_id is null and room_id is not null)
  )
);

create table if not exists payments (
  id uuid primary key default gen_random_uuid(),
  lease_id uuid not null references leases(id) on delete cascade,
  billing_month date not null,
  amount numeric(10,2) not null check (amount >= 0),
  is_paid boolean not null default false,
  payment_date date,
  created_at timestamptz not null default now(),
  check (date_trunc('month', billing_month)::date = billing_month),
  check (not is_paid or payment_date is not null),
  unique (lease_id, billing_month)
);

create index if not exists idx_rooms_property_id on rooms(property_id);
create index if not exists idx_leases_tenant_id on leases(tenant_id);
create index if not exists idx_leases_property_id on leases(property_id);
create index if not exists idx_leases_room_id on leases(room_id);
create index if not exists idx_payments_lease_id on payments(lease_id);
create index if not exists idx_payments_billing_month on payments(billing_month);

alter table properties disable row level security;
alter table rooms disable row level security;
alter table tenants disable row level security;
alter table leases disable row level security;
alter table payments disable row level security;

grant usage on schema public to anon, authenticated;
grant all privileges on table properties to anon, authenticated;
grant all privileges on table rooms to anon, authenticated;
grant all privileges on table tenants to anon, authenticated;
grant all privileges on table leases to anon, authenticated;
grant all privileges on table payments to anon, authenticated;
