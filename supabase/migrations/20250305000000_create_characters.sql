-- Character Forge: characters table for Supabase inventory
-- Run this in Supabase Dashboard → SQL Editor (or via supabase db push if you use Supabase CLI)

create table if not exists public.characters (
  id uuid primary key default gen_random_uuid(),
  owner_address text not null,
  background_id text not null,
  body_id text not null,
  head_id text not null,
  accessory_id text not null,
  noggles_id text not null,
  payment_tx_hash text,
  created_at timestamptz not null default now()
);

create index if not exists characters_owner_address_idx on public.characters (owner_address);
