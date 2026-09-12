-- ============================================================================
-- Veritas — Day 2 Auth & Parent-Child Schema Migration
-- Run this in your Supabase SQL Editor (Dashboard -> SQL Editor -> New Query)
-- ============================================================================

-- 1. Ensure user_role column exists on auth.users
ALTER TABLE IF EXISTS auth.users ADD COLUMN IF NOT EXISTS user_role text DEFAULT 'student';

-- 2. Sync trigger: Automatically update user_role from raw_user_meta_data
CREATE OR REPLACE FUNCTION public.sync_user_role()
RETURNS trigger AS $$
BEGIN
    NEW.user_role := COALESCE(NEW.raw_user_meta_data->>'user_role', NEW.user_role, 'student');
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_role_sync ON auth.users;
CREATE TRIGGER on_auth_user_role_sync
BEFORE INSERT OR UPDATE ON auth.users
FOR EACH ROW EXECUTE FUNCTION public.sync_user_role();

-- 3. Create children table mapping parent_id -> student_id
CREATE TABLE IF NOT EXISTS public.children (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    parent_id UUID NOT NULL,
    student_id UUID NOT NULL,
    student_email TEXT,
    student_name TEXT,
    created_at TIMESTAMPTZ DEFAULT now(),
    UNIQUE(parent_id, student_id)
);

-- 4. Enable Row Level Security (RLS) on children table
ALTER TABLE public.children ENABLE ROW LEVEL SECURITY;

-- Allow parents to see and manage their linked children
DROP POLICY IF EXISTS "Allow parent all on own children" ON public.children;
CREATE POLICY "Allow parent all on own children"
ON public.children
FOR ALL
USING (auth.uid() = parent_id OR auth.uid() IS NULL)
WITH CHECK (auth.uid() = parent_id OR auth.uid() IS NULL);

-- Allow public read for authenticated/anon keys
DROP POLICY IF EXISTS "Allow public select children" ON public.children;
CREATE POLICY "Allow public select children"
ON public.children
FOR SELECT
USING (true);

-- 5. Ensure students table has email column for easier child lookup
ALTER TABLE IF EXISTS public.students ADD COLUMN IF NOT EXISTS email TEXT;
CREATE INDEX IF NOT EXISTS students_email_idx ON public.students(email);

-- 6. Enable Realtime on student_skill_mastery, sessions, and session_events
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_publication_tables 
        WHERE pubname = 'supabase_realtime' AND tablename = 'student_skill_mastery'
    ) THEN
        ALTER PUBLICATION supabase_realtime ADD TABLE public.student_skill_mastery;
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM pg_publication_tables 
        WHERE pubname = 'supabase_realtime' AND tablename = 'sessions'
    ) THEN
        ALTER PUBLICATION supabase_realtime ADD TABLE public.sessions;
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM pg_publication_tables 
        WHERE pubname = 'supabase_realtime' AND tablename = 'children'
    ) THEN
        ALTER PUBLICATION supabase_realtime ADD TABLE public.children;
    END IF;
END $$;
