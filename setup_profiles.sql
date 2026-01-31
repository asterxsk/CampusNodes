-- 1. Create Profiles Table (if not exists)
create table if not exists public.profiles (
  id uuid references auth.users on delete cascade not null primary key,
  first_name text,
  last_name text,
  role text default 'Student',
  avatar_url text,
  bio text,
  skills text[] default '{}',
  updated_at timestamp with time zone,
  username text unique,
  website text,

  constraint username_length check (char_length(username) >= 3)
);

-- 2. Enable RLS
alter table public.profiles enable row level security;

-- 3. Policies
create policy "Public profiles are viewable by everyone."
  on profiles for select
  using ( true );

create policy "Users can insert their own profile."
  on profiles for insert
  with check ( auth.uid() = id );

create policy "Users can update own profile."
  on profiles for update
  using ( auth.uid() = id );

-- 4. Function to handle new user signup
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.profiles (id, first_name, last_name, avatar_url, role)
  values (
    new.id,
    new.raw_user_meta_data->>'first_name',
    new.raw_user_meta_data->>'last_name',
    new.raw_user_meta_data->>'avatar_url',
    'Student'
  );
  return new;
end;
$$;

-- 5. Trigger
drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- 6. Backfill existing users (CRITICAL: Run this to populate profiles for existing users)
insert into public.profiles (id, first_name, last_name, avatar_url, role)
select 
  id, 
  raw_user_meta_data->>'first_name', 
  raw_user_meta_data->>'last_name', 
  raw_user_meta_data->>'avatar_url', 
  'Student'
from auth.users
on conflict (id) do nothing;
