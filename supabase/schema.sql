-- ==========================================
-- BharatFlow Database Schema & RLS Policies
-- ==========================================

-- 1. Create Tables
-- Users are automatically created in auth.users by Supabase Auth.
-- We extend this with a 'profiles' table.

CREATE TABLE public.profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  username TEXT UNIQUE,
  full_name TEXT,
  avatar_url TEXT,
  bio TEXT,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Function to handle new user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (id, username, full_name, avatar_url)
  VALUES (
    new.id,
    new.raw_user_meta_data->>'username',
    new.raw_user_meta_data->>'full_name',
    new.raw_user_meta_data->>'avatar_url'
  );
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to create a profile automatically when a user signs up
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();


CREATE TABLE public.posts (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  image_url TEXT NOT NULL,
  caption TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);


CREATE TABLE public.follows (
  follower_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  following_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  PRIMARY KEY (follower_id, following_id)
);


CREATE TABLE public.comments (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  post_id UUID REFERENCES public.posts(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  content TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);


CREATE TABLE public.likes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  post_id UUID REFERENCES public.posts(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  UNIQUE(post_id, user_id)
);


CREATE TABLE public.conversations (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Linking users to conversations
CREATE TABLE public.conversation_participants (
  conversation_id UUID REFERENCES public.conversations(id) ON DELETE CASCADE,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  joined_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  PRIMARY KEY (conversation_id, user_id)
);

CREATE TABLE public.messages (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  conversation_id UUID REFERENCES public.conversations(id) ON DELETE CASCADE NOT NULL,
  sender_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  content TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);


CREATE TABLE public.notifications (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL, -- Who receives it
  actor_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL, -- Who did the action
  type TEXT NOT NULL, -- 'like', 'comment', 'follow'
  post_id UUID REFERENCES public.posts(id) ON DELETE CASCADE,
  read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- ==========================================
-- 2. Enable Row Level Security (RLS)
-- ==========================================

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.follows ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.likes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.conversation_participants ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

-- ==========================================
-- 3. RLS Policies
-- ==========================================

-- PROFILES
CREATE POLICY "Public profiles are viewable by everyone."
  ON public.profiles FOR SELECT
  USING ( true );

CREATE POLICY "Users can insert their own profile."
  ON public.profiles FOR INSERT
  WITH CHECK ( auth.uid() = id );

CREATE POLICY "Users can update own profile."
  ON public.profiles FOR UPDATE
  USING ( auth.uid() = id );

-- POSTS
CREATE POLICY "Posts are viewable by everyone."
  ON public.posts FOR SELECT
  USING ( true );

CREATE POLICY "Users can insert their own posts."
  ON public.posts FOR INSERT
  WITH CHECK ( auth.uid() = user_id );

CREATE POLICY "Users can update their own posts."
  ON public.posts FOR UPDATE
  USING ( auth.uid() = user_id );

CREATE POLICY "Users can delete their own posts."
  ON public.posts FOR DELETE
  USING ( auth.uid() = user_id );

-- FOLLOWS
CREATE POLICY "Follows are viewable by everyone."
  ON public.follows FOR SELECT
  USING ( true );

CREATE POLICY "Users can insert their own follows."
  ON public.follows FOR INSERT
  WITH CHECK ( auth.uid() = follower_id );

CREATE POLICY "Users can delete their own follows."
  ON public.follows FOR DELETE
  USING ( auth.uid() = follower_id );

-- COMMENTS
CREATE POLICY "Comments are viewable by everyone."
  ON public.comments FOR SELECT
  USING ( true );

CREATE POLICY "Users can insert their own comments."
  ON public.comments FOR INSERT
  WITH CHECK ( auth.uid() = user_id );

CREATE POLICY "Users can delete their own comments."
  ON public.comments FOR DELETE
  USING ( auth.uid() = user_id );

-- LIKES
CREATE POLICY "Likes are viewable by everyone."
  ON public.likes FOR SELECT
  USING ( true );

CREATE POLICY "Users can insert their own likes."
  ON public.likes FOR INSERT
  WITH CHECK ( auth.uid() = user_id );

CREATE POLICY "Users can delete their own likes."
  ON public.likes FOR DELETE
  USING ( auth.uid() = user_id );

-- CONVERSATIONS & MESSAGES
-- View conversations you are a part of
CREATE POLICY "Users can view conversations they are part of."
  ON public.conversation_participants FOR SELECT
  USING ( auth.uid() = user_id );

CREATE POLICY "Users can view conversations they are part of."
  ON public.conversations FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.conversation_participants
      WHERE conversation_id = public.conversations.id AND user_id = auth.uid()
    )
  );

CREATE POLICY "Users can view messages in their conversations."
  ON public.messages FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.conversation_participants
      WHERE conversation_id = public.messages.conversation_id AND user_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert messages in their conversations."
  ON public.messages FOR INSERT
  WITH CHECK (
    auth.uid() = sender_id AND
    EXISTS (
      SELECT 1 FROM public.conversation_participants
      WHERE conversation_id = public.messages.conversation_id AND user_id = auth.uid()
    )
  );

-- NOTIFICATIONS
CREATE POLICY "Users can view their own notifications."
  ON public.notifications FOR SELECT
  USING ( auth.uid() = user_id );

CREATE POLICY "Users can update their own notifications (mark read)."
  ON public.notifications FOR UPDATE
  USING ( auth.uid() = user_id );


-- ==========================================
-- 4. Storage Setup & Policies
-- ==========================================
-- Note: Supabase Storage uses its own 'storage.objects' table.
-- You need to run these queries in the SQL Editor to set up buckets if they don't exist.

-- Create buckets
INSERT INTO storage.buckets (id, name, public) VALUES ('avatars', 'avatars', true) ON CONFLICT DO NOTHING;
INSERT INTO storage.buckets (id, name, public) VALUES ('post-images', 'post-images', true) ON CONFLICT DO NOTHING;

-- Avatars Policies
CREATE POLICY "Avatar images are publicly accessible."
  ON storage.objects FOR SELECT
  USING ( bucket_id = 'avatars' );

CREATE POLICY "Anyone can upload an avatar."
  ON storage.objects FOR INSERT
  WITH CHECK ( bucket_id = 'avatars' AND auth.role() = 'authenticated' );

CREATE POLICY "Users can update their own avatar."
  ON storage.objects FOR UPDATE
  USING ( bucket_id = 'avatars' AND auth.uid() = owner );

-- Post Images Policies
CREATE POLICY "Post images are publicly accessible."
  ON storage.objects FOR SELECT
  USING ( bucket_id = 'post-images' );

CREATE POLICY "Authenticated users can upload post images."
  ON storage.objects FOR INSERT
  WITH CHECK ( bucket_id = 'post-images' AND auth.role() = 'authenticated' );

CREATE POLICY "Users can delete their own post images."
  ON storage.objects FOR DELETE
  USING ( bucket_id = 'post-images' AND auth.uid() = owner );
