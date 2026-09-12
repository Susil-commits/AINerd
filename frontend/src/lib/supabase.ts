import { createClient } from '@supabase/supabase-js'

const supabaseUrl =
  import.meta.env.VITE_SUPABASE_URL || 'https://nuurwevusaqwhezvbixa.supabase.co'
const supabaseAnonKey =
  import.meta.env.VITE_SUPABASE_ANON_KEY ||
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im51dXJ3ZXZ1c2Fxd2hlenZiaXhhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODYwMjM4MTQsImV4cCI6MjEwMTU5OTgxNH0.JuHtG3SmXo-Ji80mCMVCJS7q0Ut1tfTZDaCeFtn8upg'

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
  },
})

export type UserRole = 'student' | 'parent'
