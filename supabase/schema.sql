create table if not exists public.store_state (
  id text primary key,
  data jsonb not null,
  updated_at timestamptz not null default now()
);

insert into storage.buckets (id, name, public)
values ('product-images', 'product-images', true)
on conflict (id) do update set public = excluded.public;

drop policy if exists "Public product images are readable" on storage.objects;
create policy "Public product images are readable"
on storage.objects for select
using (bucket_id = 'product-images');

drop policy if exists "Service role can manage product images" on storage.objects;
create policy "Service role can manage product images"
on storage.objects for all
using (bucket_id = 'product-images')
with check (bucket_id = 'product-images');
