-- DraftLoop v2: richer brand context (business identity, objections, founder
-- story) + file attachments that feed the draft-generation prompt.

alter table brand_profiles add column if not exists business_identity text;
alter table brand_profiles add column if not exists objections_notes text;
alter table brand_profiles add column if not exists founder_story text;

create table if not exists brand_files (
  id uuid primary key default gen_random_uuid(),
  user_id uuid,
  brand_profile_id uuid references brand_profiles(id) on delete cascade,
  section text not null, -- 'business_identity' | 'objections' | 'founder_story'
  file_name text not null,
  storage_path text not null,
  mime_type text,
  file_size int,
  extracted_text text,
  extraction_status text not null default 'pending', -- pending|done|failed|unsupported
  created_at timestamptz not null default now()
);

alter table brand_files enable row level security;
drop policy if exists "brand_files_v1_read" on brand_files;
create policy "brand_files_v1_read" on brand_files for select using (true);
drop policy if exists "brand_files_v1_write" on brand_files;
create policy "brand_files_v1_write" on brand_files for all using (true) with check (true);

-- Storage bucket for the raw uploaded files (demo-first: public + permissive,
-- matches the permissive v1 RLS on every other table; locked down alongside
-- auth in the later "Lock it down" sprint).
insert into storage.buckets (id, name, public)
values ('brand-files', 'brand-files', true)
on conflict (id) do nothing;

drop policy if exists "brand_files_storage_v1_read" on storage.objects;
create policy "brand_files_storage_v1_read" on storage.objects
  for select using (bucket_id = 'brand-files');

drop policy if exists "brand_files_storage_v1_write" on storage.objects;
create policy "brand_files_storage_v1_write" on storage.objects
  for insert with check (bucket_id = 'brand-files');

drop policy if exists "brand_files_storage_v1_delete" on storage.objects;
create policy "brand_files_storage_v1_delete" on storage.objects
  for delete using (bucket_id = 'brand-files');
