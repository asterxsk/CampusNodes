# Comprehensive Supabase Database Fixes

This file contains the complete SQL script to optimize your database, resolve "Multiple Permissive Policies" warnings (especially for `post_likes`), and fix function security issues.

### Instructions
1.  Open your **Supabase Dashboard**.
2.  Go to the **SQL Editor**.
3.  **Copy and paste** the entire SQL code block below.
4.  Click **Run**.

```sql
-- ==============================================================================
-- MASTER SUPABASE FIX SCRIPT (v2 - Aggressive Cleanup)
-- ==============================================================================
-- This script consolidates all fixes for RLS, Indexes, and Security.
-- Run this ENTIRE file in the Supabase SQL Editor.

-- 1. FIX FUNCTION SECURITY (Mutable Search Path)
-- ==============================================================================
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public -- Explicitly set search_path
AS $$
BEGIN
  INSERT INTO public.profiles (id, first_name, last_name, avatar_url, role)
  VALUES (
    new.id,
    new.raw_user_meta_data->>'first_name',
    new.raw_user_meta_data->>'last_name',
    new.raw_user_meta_data->>'avatar_url',
    'Student'
  );
  RETURN new;
END;
$$;


-- 2. ENSURE TABLES EXIST (Schema Fixes)
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.profiles (
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
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

CREATE TABLE IF NOT EXISTS public.friendships (
  id uuid default gen_random_uuid() primary key,
  user1_id uuid references auth.users(id) not null,
  user2_id uuid references auth.users(id) not null,
  status text check (status in ('pending', 'accepted', 'blocked')) default 'pending',
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  unique(user1_id, user2_id)
);
ALTER TABLE public.friendships ENABLE ROW LEVEL SECURITY;

CREATE TABLE IF NOT EXISTS public.messages (
  id uuid default gen_random_uuid() primary key,
  sender_id uuid references auth.users(id) not null,
  receiver_id uuid references auth.users(id) not null,
  content text not null,
  is_read boolean default false,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;

CREATE TABLE IF NOT EXISTS public.posts (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    content TEXT NOT NULL,
    media_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    likes_count INTEGER DEFAULT 0
);
ALTER TABLE public.posts ENABLE ROW LEVEL SECURITY;

CREATE TABLE IF NOT EXISTS public.post_likes (
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    post_id UUID REFERENCES public.posts(id) ON DELETE CASCADE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    PRIMARY KEY (user_id, post_id)
);
ALTER TABLE public.post_likes ENABLE ROW LEVEL SECURITY;


-- 3. CLEANUP & OPTIMIZE INDEXES
-- ==============================================================================
-- Remove indexes redundant with UNIQUE constraints or other indexes
-- We also drop the "new" indexes momentarily to ensure clean recreation if needed
DROP INDEX IF EXISTS idx_profiles_username;
DROP INDEX IF EXISTS idx_friendships_user1;
DROP INDEX IF EXISTS idx_messages_sender;
DROP INDEX IF EXISTS idx_messages_created_at; -- Clean up potential old one

-- Create necessary indexes for performance (if they don't exist)
CREATE INDEX IF NOT EXISTS idx_friendships_user2 ON public.friendships(user2_id);
CREATE INDEX IF NOT EXISTS idx_friendships_status ON public.friendships(status);
CREATE INDEX IF NOT EXISTS idx_messages_receiver ON public.messages(receiver_id);
CREATE INDEX IF NOT EXISTS idx_messages_conversation ON public.messages(sender_id, receiver_id, created_at);
CREATE INDEX IF NOT EXISTS idx_posts_user_id ON public.posts(user_id);
CREATE INDEX IF NOT EXISTS idx_posts_created_at ON public.posts(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_post_likes_post_id ON public.post_likes(post_id);


-- 4. CLEANUP & RE-CREATE RLS POLICIES
-- ==============================================================================
-- Drop ALL known variations of policies to clear "Multiple Permissive Policies" warnings.
-- Includes specific names found in user logs.

-- PROFILES
DROP POLICY IF EXISTS "Public profiles are viewable by everyone." ON public.profiles;
DROP POLICY IF EXISTS "Users can insert their own profile." ON public.profiles;
DROP POLICY IF EXISTS "Users can update own profile." ON public.profiles;
DROP POLICY IF EXISTS "Public profiles are viewable by everyone" ON public.profiles;
DROP POLICY IF EXISTS "Users can insert their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;

-- FRIENDSHIPS
DROP POLICY IF EXISTS "Users can view their own friendships" ON public.friendships;
DROP POLICY IF EXISTS "Users can send friend requests" ON public.friendships;
DROP POLICY IF EXISTS "Users can update their own friendships" ON public.friendships;
DROP POLICY IF EXISTS "Users can delete their own friendships" ON public.friendships; -- Found in logs
DROP POLICY IF EXISTS "Users can insert friendships" ON public.friendships; -- Found in logs

-- MESSAGES
DROP POLICY IF EXISTS "Users can view their messages" ON public.messages;
DROP POLICY IF EXISTS "Users can view their own messages" ON public.messages;         -- Found in logs
DROP POLICY IF EXISTS "Users can send messages" ON public.messages;
DROP POLICY IF EXISTS "Users can update their own messages" ON public.messages;       -- Found in logs

-- POSTS
DROP POLICY IF EXISTS "Public posts are viewable by everyone" ON public.posts;
DROP POLICY IF EXISTS "Users can create posts" ON public.posts;
DROP POLICY IF EXISTS "Users can delete own posts" ON public.posts;

-- LIKES
DROP POLICY IF EXISTS "Likes are viewable by everyone" ON public.post_likes;
DROP POLICY IF EXISTS "Anyone can view post likes" ON public.post_likes;
DROP POLICY IF EXISTS "Users can like posts" ON public.post_likes;
DROP POLICY IF EXISTS "Users can unlike posts" ON public.post_likes;
DROP POLICY IF EXISTS "Users can unlike their own likes" ON public.post_likes; -- Found in logs

-- Drop potentially redundant user_id index (covered by composite PK)
DROP INDEX IF EXISTS idx_post_likes_user_id;

-- Re-create Optimized Policies (Performance Best Practices)

-- PROFILES
CREATE POLICY "Public profiles are viewable by everyone"
ON public.profiles FOR SELECT
USING (true);

CREATE POLICY "Users can insert their own profile"
ON public.profiles FOR INSERT
WITH CHECK ((select auth.uid()) = id);

CREATE POLICY "Users can update own profile"
ON public.profiles FOR UPDATE
USING ((select auth.uid()) = id);

-- FRIENDSHIPS
CREATE POLICY "Users can view their own friendships"
ON public.friendships FOR SELECT
USING (
  (select auth.uid()) = user1_id OR 
  (select auth.uid()) = user2_id
);

CREATE POLICY "Users can send friend requests"
ON public.friendships FOR INSERT
WITH CHECK (
  (select auth.uid()) = user1_id OR 
  (select auth.uid()) = user2_id
);

CREATE POLICY "Users can update their own friendships"
ON public.friendships FOR UPDATE
USING (
  (select auth.uid()) = user1_id OR 
  (select auth.uid()) = user2_id
);

-- MESSAGES
CREATE POLICY "Users can view their messages"
ON public.messages FOR SELECT
USING (
  (select auth.uid()) = sender_id OR 
  (select auth.uid()) = receiver_id
);

CREATE POLICY "Users can send messages"
ON public.messages FOR INSERT
WITH CHECK (
  (select auth.uid()) = sender_id
);

-- POSTS
CREATE POLICY "Public posts are viewable by everyone"
ON public.posts FOR SELECT
USING (true);

CREATE POLICY "Users can create posts"
ON public.posts FOR INSERT
WITH CHECK (
  (select auth.uid()) = user_id
);

CREATE POLICY "Users can delete own posts"
ON public.posts FOR DELETE
USING (
  (select auth.uid()) = user_id
);

-- LIKES
CREATE POLICY "Likes are viewable by everyone"
ON public.post_likes FOR SELECT
USING (true);

CREATE POLICY "Users can like posts"
ON public.post_likes FOR INSERT
WITH CHECK (
  (select auth.uid()) = user_id
);

CREATE POLICY "Users can unlike posts"
ON public.post_likes FOR DELETE
USING (
  (select auth.uid()) = user_id
);
```
