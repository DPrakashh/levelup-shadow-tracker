
-- Drop existing RLS policies that expect Supabase JWT
DROP POLICY IF EXISTS "Users can view their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can insert their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON public.profiles;

DROP POLICY IF EXISTS "Users can view their own habits" ON public.habits;
DROP POLICY IF EXISTS "Users can insert their own habits" ON public.habits;
DROP POLICY IF EXISTS "Users can update their own habits" ON public.habits;
DROP POLICY IF EXISTS "Users can delete their own habits" ON public.habits;

-- Temporarily disable RLS to allow inserts from our application
ALTER TABLE public.profiles DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.habits DISABLE ROW LEVEL SECURITY;

-- We'll re-enable RLS later with proper policies for Clerk authentication
-- For now, we rely on application-level security since users authenticate through Clerk
