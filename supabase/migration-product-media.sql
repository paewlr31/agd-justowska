-- Uruchom raz w Supabase → SQL Editor → Run.
-- Nie kasuje produktów. Dopisuje klasę energetyczną, cechy, kilka zdjęć i pliki.

alter table products add column if not exists energy_class text;
alter table products add column if not exists features text not null default '';
alter table products add column if not exists images text[] not null default '{}';
alter table products add column if not exists files jsonb not null default '[]';

update products
set images = array[image_url]
where image_url is not null
  and coalesce(cardinality(images), 0) = 0;
