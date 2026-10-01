-- Wklej całość w Supabase → SQL Editor → Run.
-- Tabele są zamknięte dla anonimowych odwiedzin.
-- Zapis robi tylko serwer strony, kluczem service_role.

create table if not exists manufacturers (
  slug text primary key,
  name text not null unique,
  categories text[] not null default '{}',
  sort_order integer not null default 0
);

create table if not exists products (
  id text primary key,
  brand text not null,
  model text not null,
  category text not null,
  price numeric,
  description text not null default '',
  image_url text,
  created_at timestamptz not null default now()
);

create table if not exists gallery (
  id text primary key,
  image_url text not null,
  caption text not null default '',
  created_at timestamptz not null default now()
);

create index if not exists products_brand_idx on products (brand);

alter table manufacturers enable row level security;
alter table products enable row level security;
alter table gallery enable row level security;

insert into storage.buckets (id, name, public)
values ('media', 'media', true)
on conflict (id) do update set public = true;

drop policy if exists "media public read" on storage.objects;
create policy "media public read"
on storage.objects for select
to public
using (bucket_id = 'media');
