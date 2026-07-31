-- Catálogo gastronómico de un solo negocio. Ejecutar en Supabase SQL Editor.
create extension if not exists pgcrypto;
create schema if not exists private;
revoke all on schema private from public;
grant usage on schema private to anon, authenticated;

create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text not null check (btrim(email) <> ''),
  display_name text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.categories (
  id uuid primary key default gen_random_uuid(),
  name text not null check (btrim(name) <> '' and char_length(name) <= 80),
  slug text not null unique check (slug ~ '^[a-z0-9]+(?:-[a-z0-9]+)*$'),
  description text check (description is null or char_length(description) <= 300),
  active boolean not null default true,
  display_order integer not null default 0 check (display_order >= 0),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.products (
  id uuid primary key default gen_random_uuid(),
  category_id uuid not null references public.categories(id) on delete restrict,
  name text not null check (btrim(name) <> '' and char_length(name) <= 120),
  slug text not null unique check (slug ~ '^[a-z0-9]+(?:-[a-z0-9]+)*$'),
  short_description text check (short_description is null or char_length(short_description) <= 180),
  description text check (description is null or char_length(description) <= 2000),
  price numeric(12,2) not null default 0 check (price >= 0),
  image_url text,
  available boolean not null default true,
  featured boolean not null default false,
  active boolean not null default true,
  display_order integer not null default 0 check (display_order >= 0),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.business_settings (
  id uuid primary key default gen_random_uuid(),
  business_name text not null check (btrim(business_name) <> '' and char_length(business_name) <= 100),
  description text check (description is null or char_length(description) <= 800),
  logo_url text,
  hero_image_url text,
  whatsapp_number text check (
    whatsapp_number is null or whatsapp_number = '' or whatsapp_number ~ '^[0-9]{8,20}$'
  ),
  whatsapp_default_message text not null default 'Hola, quiero hacer una consulta.'
    check (btrim(whatsapp_default_message) <> '' and char_length(whatsapp_default_message) <= 300),
  address text check (address is null or char_length(address) <= 200),
  opening_hours text check (opening_hours is null or char_length(opening_hours) <= 300),
  instagram_url text check (
    instagram_url is null or instagram_url = '' or instagram_url ~* '^https?://'
  ),
  primary_color text not null default '#B45309' check (primary_color ~ '^#[0-9A-Fa-f]{6}$'),
  secondary_color text not null default '#14532D' check (secondary_color ~ '^#[0-9A-Fa-f]{6}$'),
  hero_title text not null check (btrim(hero_title) <> '' and char_length(hero_title) <= 120),
  hero_subtitle text check (hero_subtitle is null or char_length(hero_subtitle) <= 200),
  currency char(3) not null default 'ARS' check (currency ~ '^[A-Z]{3}$'),
  show_prices boolean not null default true,
  business_open boolean not null default true,
  singleton boolean not null default true unique check (singleton),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index categories_order_idx on public.categories(active, display_order);
create index products_catalog_idx on public.products(active, category_id, display_order);
create index products_featured_idx on public.products(active, featured) where featured = true;

create function public.set_updated_at()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.updated_at = now();
  return new;
end
$$;

create trigger profiles_updated before update on public.profiles
for each row execute function public.set_updated_at();
create trigger categories_updated before update on public.categories
for each row execute function public.set_updated_at();
create trigger products_updated before update on public.products
for each row execute function public.set_updated_at();
create trigger settings_updated before update on public.business_settings
for each row execute function public.set_updated_at();

-- Un perfil es la lista explícita de administradores. No se crea automáticamente:
-- una alta pública en Auth nunca obtiene permisos por el solo hecho de autenticarse.
create function private.is_admin()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1 from public.profiles where id = (select auth.uid())
  )
$$;

revoke all on function private.is_admin() from public;
grant execute on function private.is_admin() to anon, authenticated;

alter table public.profiles enable row level security;
alter table public.categories enable row level security;
alter table public.products enable row level security;
alter table public.business_settings enable row level security;

create policy "Users read own authorized profile"
on public.profiles for select
to authenticated
using ((select auth.uid()) = id);

create policy "Users update own authorized profile"
on public.profiles for update
to authenticated
using ((select auth.uid()) = id and (select private.is_admin()))
with check ((select auth.uid()) = id and (select private.is_admin()));

create policy "Public reads active categories"
on public.categories for select
to anon, authenticated
using (active or (select private.is_admin()));

create policy "Public reads active products in active categories"
on public.products for select
to anon, authenticated
using (
  (
    active
    and category_id in (select id from public.categories where active)
  )
  or (select private.is_admin())
);

create policy "Public reads settings"
on public.business_settings for select
to anon, authenticated
using (true);

create policy "Admins manage categories"
on public.categories for all
to authenticated
using ((select private.is_admin()))
with check ((select private.is_admin()));

create policy "Admins manage products"
on public.products for all
to authenticated
using ((select private.is_admin()))
with check ((select private.is_admin()));

create policy "Admins manage settings"
on public.business_settings for all
to authenticated
using ((select private.is_admin()))
with check ((select private.is_admin()));

insert into storage.buckets(id, name, public, file_size_limit, allowed_mime_types)
values
  ('products', 'products', true, 4194304, array['image/jpeg', 'image/png', 'image/webp']),
  ('branding', 'branding', true, 4194304, array['image/jpeg', 'image/png', 'image/webp'])
on conflict(id) do update
set
  public = excluded.public,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

-- Los buckets públicos sirven objetos por URL. Esta SELECT existe para que Storage
-- pueda devolver metadata tras una carga, pero no permite listar objetos a anónimos.
create policy "Admins read catalog image metadata"
on storage.objects for select
to authenticated
using (bucket_id in ('products', 'branding') and (select private.is_admin()));

create policy "Admins upload catalog images"
on storage.objects for insert
to authenticated
with check (bucket_id in ('products', 'branding') and (select private.is_admin()));

create policy "Admins update catalog images"
on storage.objects for update
to authenticated
using (bucket_id in ('products', 'branding') and (select private.is_admin()))
with check (bucket_id in ('products', 'branding') and (select private.is_admin()));

create policy "Admins delete catalog images"
on storage.objects for delete
to authenticated
using (bucket_id in ('products', 'branding') and (select private.is_admin()));
