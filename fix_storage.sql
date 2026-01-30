-- RUN THIS IN YOUR SUPABASE SQL EDITOR TO FIX THE UPLOAD ERROR

-- 1. Reset Policies (Drop old ones to ensure no conflicts)
drop policy if exists "Public Access" on storage.objects;
drop policy if exists "Authenticated Upload" on storage.objects;
drop policy if exists "Individual Update" on storage.objects;
drop policy if exists "Individual Delete" on storage.objects;
drop policy if exists "Avatar Public Read" on storage.objects;
drop policy if exists "Avatar Auth Upload" on storage.objects;
drop policy if exists "Avatar Owner Logic" on storage.objects;

-- 2. Ensure 'avatars' bucket exists and is public
insert into storage.buckets (id, name, public)
values ('avatars', 'avatars', true)
on conflict (id) do update set public = true;

-- 3. Create Simple, Permissive Policies

-- Enable Read Access for Everyone
create policy "Avatar Public Read"
on storage.objects for select
using ( bucket_id = 'avatars' );

-- Enable Upload Access for Any Logged-in User
create policy "Avatar Auth Upload"
on storage.objects for insert
with check ( bucket_id = 'avatars' and auth.role() = 'authenticated' );

-- Enable Update/Delete for Content Owners
create policy "Avatar Owner Logic"
on storage.objects for all
using ( bucket_id = 'avatars' and auth.uid() = owner );

-- 4. Enable RLS on objects (just in case)
alter table storage.objects enable row level security;
