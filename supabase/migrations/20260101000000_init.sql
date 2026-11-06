-- ZivCar schema (applied to project wwotwzpslwxluxvcwbvj).
-- Table mirrors the client Listing model; seller_id is a text id because the
-- prototype signs in with demo profiles instead of Supabase Auth.
-- Policies are intentionally permissive while there is no auth layer:
-- tighten them with auth.uid() checks as soon as Supabase Auth is enabled.

create table if not exists public.listings (
  id text primary key,
  title text not null,
  description text not null default '',
  price bigint not null default 0,
  city text not null default '',
  brand text not null default '',
  model text not null default '',
  year int,
  mileage bigint,
  condition text not null default 'used',
  fuel text,
  transmission text,
  body text,
  drive text,
  color text,
  engine numeric(4,1),
  owners int,
  negotiable boolean not null default true,
  exchange boolean not null default false,
  phone text not null default '',
  photos text[] not null default '{}',
  seller_id text not null,
  sold_at timestamptz,
  created_at timestamptz not null default now(),
  published boolean not null default true,
  views int not null default 0
);

alter table public.listings enable row level security;

grant select, insert, update, delete on public.listings to anon, authenticated;

create index if not exists listings_created_at_idx on public.listings (created_at desc);
create index if not exists listings_brand_idx on public.listings (brand);
create index if not exists listings_seller_idx on public.listings (seller_id);

create policy "listings are readable"
  on public.listings for select to anon, authenticated
  using (true);

create policy "demo insert listings"
  on public.listings for insert to anon, authenticated
  with check (true);

create policy "demo update listings"
  on public.listings for update to anon, authenticated
  using (true) with check (true);

create policy "demo delete listings"
  on public.listings for delete to anon, authenticated
  using (true);
