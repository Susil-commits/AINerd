-- ============================================================================
-- Veritas — Day 3 Session State Persistence Migration
-- Run this in your Supabase SQL Editor (Dashboard -> SQL Editor -> New Query)
-- ============================================================================

-- 1. Add `state` JSONB column to sessions table for full session persistence
ALTER TABLE IF EXISTS public.sessions 
ADD COLUMN IF NOT EXISTS state JSONB DEFAULT '{}'::jsonb;

-- 2. Add index for faster session state queries
CREATE INDEX IF NOT EXISTS sessions_student_id_idx ON public.sessions(student_id);

-- 3. Comment explaining the architecture
COMMENT ON COLUMN public.sessions.state IS 'Full TutorState JSONB snapshot for seamless recovery across Render container redeploys';
