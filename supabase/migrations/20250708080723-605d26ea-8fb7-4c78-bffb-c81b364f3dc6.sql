
-- Create enum for attribute types
CREATE TYPE public.attribute_type AS ENUM ('brain', 'health', 'skill', 'discipline', 'focus');

-- Create enum for difficulty levels
CREATE TYPE public.difficulty_level AS ENUM ('easy', 'medium', 'hard');

-- Create enum for app roles
CREATE TYPE public.app_role AS ENUM ('admin', 'user');

-- Create user profiles table
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id TEXT NOT NULL UNIQUE, -- Clerk user ID
  full_name TEXT NOT NULL,
  email TEXT NOT NULL,
  current_xp INTEGER DEFAULT 0,
  current_level INTEGER DEFAULT 1,
  streak_count INTEGER DEFAULT 0,
  last_activity_date DATE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create habits table
CREATE TABLE public.habits (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id TEXT NOT NULL REFERENCES public.profiles(user_id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  attribute attribute_type NOT NULL,
  difficulty difficulty_level NOT NULL,
  xp_value INTEGER NOT NULL DEFAULT 5,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create habit completions table
CREATE TABLE public.habit_completions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id TEXT NOT NULL REFERENCES public.profiles(user_id) ON DELETE CASCADE,
  habit_id UUID NOT NULL REFERENCES public.habits(id) ON DELETE CASCADE,
  completed_date DATE NOT NULL DEFAULT CURRENT_DATE,
  xp_earned INTEGER NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(habit_id, completed_date)
);

-- Create user roles table
CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id TEXT NOT NULL REFERENCES public.profiles(user_id) ON DELETE CASCADE,
  role app_role NOT NULL DEFAULT 'user',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, role)
);

-- Enable Row Level Security
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.habits ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.habit_completions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for profiles
CREATE POLICY "Users can view their own profile" ON public.profiles
  FOR SELECT USING (user_id = current_setting('request.jwt.claims', true)::json->>'sub');

CREATE POLICY "Users can insert their own profile" ON public.profiles
  FOR INSERT WITH CHECK (user_id = current_setting('request.jwt.claims', true)::json->>'sub');

CREATE POLICY "Users can update their own profile" ON public.profiles
  FOR UPDATE USING (user_id = current_setting('request.jwt.claims', true)::json->>'sub');

-- Create RLS policies for habits
CREATE POLICY "Users can view their own habits" ON public.habits
  FOR SELECT USING (user_id = current_setting('request.jwt.claims', true)::json->>'sub');

CREATE POLICY "Users can insert their own habits" ON public.habits
  FOR INSERT WITH CHECK (user_id = current_setting('request.jwt.claims', true)::json->>'sub');

CREATE POLICY "Users can update their own habits" ON public.habits
  FOR UPDATE USING (user_id = current_setting('request.jwt.claims', true)::json->>'sub');

CREATE POLICY "Users can delete their own habits" ON public.habits
  FOR DELETE USING (user_id = current_setting('request.jwt.claims', true)::json->>'sub');

-- Create RLS policies for habit completions
CREATE POLICY "Users can view their own completions" ON public.habit_completions
  FOR SELECT USING (user_id = current_setting('request.jwt.claims', true)::json->>'sub');

CREATE POLICY "Users can insert their own completions" ON public.habit_completions
  FOR INSERT WITH CHECK (user_id = current_setting('request.jwt.claims', true)::json->>'sub');

CREATE POLICY "Users can update their own completions" ON public.habit_completions
  FOR UPDATE USING (user_id = current_setting('request.jwt.claims', true)::json->>'sub');

CREATE POLICY "Users can delete their own completions" ON public.habit_completions
  FOR DELETE USING (user_id = current_setting('request.jwt.claims', true)::json->>'sub');

-- Create RLS policies for user roles
CREATE POLICY "Users can view their own roles" ON public.user_roles
  FOR SELECT USING (user_id = current_setting('request.jwt.claims', true)::json->>'sub');

-- Create function to calculate level from XP
CREATE OR REPLACE FUNCTION public.calculate_level(xp INTEGER)
RETURNS INTEGER AS $$
BEGIN
  -- Level progression: Level 1 = 0-99 XP, Level 2 = 100-299 XP, Level 3 = 300-599 XP, etc.
  -- Formula: Level = floor(sqrt(xp/100)) + 1
  RETURN GREATEST(1, FLOOR(SQRT(xp::float / 100)) + 1);
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- Create function to get rank from level
CREATE OR REPLACE FUNCTION public.get_rank(level INTEGER)
RETURNS TEXT AS $$
BEGIN
  CASE 
    WHEN level >= 50 THEN RETURN 'Universal Hunter';
    WHEN level >= 40 THEN RETURN 'Monarch';
    WHEN level >= 30 THEN RETURN 'Shadow';
    WHEN level >= 25 THEN RETURN 'S-Rank';
    WHEN level >= 20 THEN RETURN 'A-Rank';
    WHEN level >= 15 THEN RETURN 'B-Rank';
    WHEN level >= 10 THEN RETURN 'C-Rank';
    WHEN level >= 5 THEN RETURN 'D-Rank';
    ELSE RETURN 'E-Rank';
  END CASE;
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- Create function to update user XP and level
CREATE OR REPLACE FUNCTION public.update_user_xp(p_user_id TEXT, xp_to_add INTEGER)
RETURNS VOID AS $$
DECLARE
  new_xp INTEGER;
  new_level INTEGER;
BEGIN
  -- Update XP
  UPDATE public.profiles 
  SET current_xp = current_xp + xp_to_add,
      updated_at = NOW()
  WHERE user_id = p_user_id
  RETURNING current_xp INTO new_xp;
  
  -- Calculate and update level
  new_level := public.calculate_level(new_xp);
  
  UPDATE public.profiles 
  SET current_level = new_level,
      updated_at = NOW()
  WHERE user_id = p_user_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create indexes for better performance
CREATE INDEX idx_profiles_user_id ON public.profiles(user_id);
CREATE INDEX idx_habits_user_id ON public.habits(user_id);
CREATE INDEX idx_habit_completions_user_id ON public.habit_completions(user_id);
CREATE INDEX idx_habit_completions_date ON public.habit_completions(completed_date);
CREATE INDEX idx_user_roles_user_id ON public.user_roles(user_id);
