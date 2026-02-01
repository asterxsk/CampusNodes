-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- 1. Create Friendships Table
create table if not exists friendships (
  id uuid default uuid_generate_v4() primary key,
  user1_id uuid references auth.users(id) not null,
  user2_id uuid references auth.users(id) not null,
  status text check (status in ('pending', 'accepted', 'blocked')) default 'pending',
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  unique(user1_id, user2_id)
);

-- 2. Create Messages Table
create table if not exists messages (
  id uuid default uuid_generate_v4() primary key,
  sender_id uuid references auth.users(id) not null,
  receiver_id uuid references auth.users(id) not null,
  content text not null,
  is_read boolean default false,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 3. Enable RLS
alter table friendships enable row level security;
alter table messages enable row level security;

-- 4. Create Policies
-- Friendships: View
create policy "Users can view their own friendships"
  on friendships for select
  using (auth.uid() = user1_id or auth.uid() = user2_id);

-- Friendships: Insert (Request)
create policy "Users can send friend requests"
  on friendships for insert
  with check (auth.uid() = user1_id or auth.uid() = user2_id);

-- Friendships: Update (Accept/Block)
create policy "Users can update their own friendships"
  on friendships for update
  using (auth.uid() = user1_id or auth.uid() = user2_id);

-- Messages: View
create policy "Users can view their messages"
  on messages for select
  using (auth.uid() = sender_id or auth.uid() = receiver_id);

-- Messages: Send
create policy "Users can send messages"
  on messages for insert
  with check (auth.uid() = sender_id);
