-- 1. Ensure Profiles table is correct
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID REFERENCES auth.users ON DELETE CASCADE NOT NULL PRIMARY KEY,
  first_name TEXT,
  last_name TEXT,
  email TEXT,
  role TEXT DEFAULT 'Student',
  avatar_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Enable RLS
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- 3. Profiles Policies
DROP POLICY IF EXISTS "Public profiles are viewable by everyone." ON public.profiles;
CREATE POLICY "Public profiles are viewable by everyone." ON public.profiles FOR SELECT USING (true);

DROP POLICY IF EXISTS "Users can update own profile." ON public.profiles;
CREATE POLICY "Users can update own profile." ON public.profiles FOR UPDATE USING (auth.uid() = id);

-- 4. Create handles_new_user function
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, first_name, last_name, avatar_url, role, email)
  VALUES (
    new.id,
    new.raw_user_meta_data->>'first_name',
    new.raw_user_meta_data->>'last_name',
    new.raw_user_meta_data->>'avatar_url',
    'Student',
    new.email
  )
  ON CONFLICT (id) DO UPDATE SET
    first_name = EXCLUDED.first_name,
    last_name = EXCLUDED.last_name,
    email = EXCLUDED.email;
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 5. Trigger for new user
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- 6. Friendships Table
CREATE TABLE IF NOT EXISTS public.friendships (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user1_id UUID REFERENCES auth.users(id) NOT NULL,
  user2_id UUID REFERENCES auth.users(id) NOT NULL,
  status TEXT CHECK (status IN ('pending', 'accepted', 'blocked')) DEFAULT 'pending',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  UNIQUE(user1_id, user2_id)
);

-- 7. Friendships RLS
ALTER TABLE public.friendships ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view their own friendships" ON public.friendships;
CREATE POLICY "Users can view their own friendships" ON public.friendships FOR SELECT 
USING (auth.uid() = user1_id OR auth.uid() = user2_id);

DROP POLICY IF EXISTS "Users can send friend requests" ON public.friendships;
CREATE POLICY "Users can send friend requests" ON public.friendships FOR INSERT 
WITH CHECK (auth.uid() = user1_id OR auth.uid() = user2_id);

DROP POLICY IF EXISTS "Users can update own friendships" ON public.friendships;
CREATE POLICY "Users can update own friendships" ON public.friendships FOR UPDATE 
USING (auth.uid() = user1_id OR auth.uid() = user2_id);

-- 8. Backfill existing profiles
INSERT INTO public.profiles (id, first_name, last_name, email, role)
SELECT id, raw_user_meta_data->>'first_name', raw_user_meta_data->>'last_name', email, 'Student'
FROM auth.users
ON CONFLICT (id) DO NOTHING;
