-- Create Friendships Table (Bidirectional or two rows? Let's use two rows for simplicity or one row with status)
-- We'll use one row where user1_id < user2_id
create table friendships (
  id uuid default uuid_generate_v4() primary key,
  user1_id uuid references auth.users(id) not null,
  user2_id uuid references auth.users(id) not null,
  status text check (status in ('pending', 'accepted', 'blocked')) default 'pending',
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  unique(user1_id, user2_id)
);

-- Messages Table
create table messages (
  id uuid default uuid_generate_v4() primary key,
  sender_id uuid references auth.users(id) not null,
  receiver_id uuid references auth.users(id) not null,
  content text not null,
  is_read boolean default false,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Policies (RLS)
alter table friendships enable row level security;
alter table messages enable row level security;

-- Friends: View own friendships
create policy "Users can view their own friendships"
  on friendships for select
  using (auth.uid() = user1_id or auth.uid() = user2_id);

-- Friends: Insert (send request)
create policy "Users can send friend requests"
  on friendships for insert
  with check (auth.uid() = user1_id or auth.uid() = user2_id);

-- Messages: View own messages
create policy "Users can view their messages"
  on messages for select
  using (auth.uid() = sender_id or auth.uid() = receiver_id);

-- Messages: Send messages
create policy "Users can send messages"
  on messages for insert
  with check (auth.uid() = sender_id);
