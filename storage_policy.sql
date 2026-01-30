-- RUN THIS IN YOUR SUPABASE SQL EDITOR

-- 1. Create the 'avatars' bucket (if it doesn't already exist)
insert into storage.buckets (id, name, public)
values ('avatars', 'avatars', true)
on conflict (id) do nothing;

-- 2. Enable RLS (Should be on by default, but nice to be sure)
-- alter table storage.objects enable row level security;

-- 3. ALLOW PUBLIC READ (So everyone can see profile pics)
create policy "Public Access"
on storage.objects for select
using ( bucket_id = 'avatars' );

-- 4. ALLOW AUTHENTICATED UPLOAD
-- Allows any logged-in user to upload a file to 'avatars'
create policy "Authenticated Upload"
on storage.objects for insert
with check ( bucket_id = 'avatars' and auth.role() = 'authenticated' );

-- 5. ALLOW OWNER UPDATE/DELETE
-- Allows users to replace/delete only their own files
create policy "Individual Update"
on storage.objects for update
using ( bucket_id = 'avatars' and auth.uid() = owner );

create policy "Individual Delete"
on storage.objects for delete
using ( bucket_id = 'avatars' and auth.uid() = owner );
