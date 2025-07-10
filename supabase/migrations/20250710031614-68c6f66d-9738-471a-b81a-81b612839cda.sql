
-- Create a table to track daily habit completions with historical data
CREATE TABLE IF NOT EXISTS public.daily_habit_logs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id TEXT NOT NULL,
  habit_id UUID NOT NULL REFERENCES public.habits(id) ON DELETE CASCADE,
  completed_date DATE NOT NULL DEFAULT CURRENT_DATE,
  xp_earned INTEGER NOT NULL DEFAULT 0,
  completed_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  reset_cycle TEXT NOT NULL DEFAULT '6am-6am', -- Track which 24-hour cycle this belongs to
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create an index for faster queries
CREATE INDEX IF NOT EXISTS idx_daily_habit_logs_user_date ON public.daily_habit_logs(user_id, completed_date);
CREATE INDEX IF NOT EXISTS idx_daily_habit_logs_habit_date ON public.daily_habit_logs(habit_id, completed_date);

-- Create a table to track user progress and streaks
CREATE TABLE IF NOT EXISTS public.user_progress (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id TEXT NOT NULL UNIQUE,
  total_habits_completed INTEGER NOT NULL DEFAULT 0,
  current_streak INTEGER NOT NULL DEFAULT 0,
  longest_streak INTEGER NOT NULL DEFAULT 0,
  last_reset_date DATE,
  last_activity_date DATE,
  total_xp_earned INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create a function to handle daily reset (called at 6 AM)
CREATE OR REPLACE FUNCTION public.reset_daily_habits()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  reset_date DATE := CURRENT_DATE;
BEGIN
  -- Update user progress streaks based on yesterday's completions
  UPDATE public.user_progress 
  SET 
    current_streak = CASE 
      WHEN EXISTS (
        SELECT 1 FROM public.daily_habit_logs 
        WHERE daily_habit_logs.user_id = user_progress.user_id 
        AND completed_date = reset_date - 1
      ) THEN current_streak + 1
      ELSE 0
    END,
    longest_streak = GREATEST(longest_streak, current_streak + 1),
    last_reset_date = reset_date,
    updated_at = now()
  WHERE last_reset_date < reset_date OR last_reset_date IS NULL;
  
  -- The daily habits will automatically reset since we check for today's date
  -- No need to delete data - we keep historical records
END;
$$;

-- Enable RLS on new tables
ALTER TABLE public.daily_habit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_progress ENABLE ROW LEVEL SECURITY;

-- Temporarily disable RLS for our Clerk authentication setup
ALTER TABLE public.daily_habit_logs DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_progress DISABLE ROW LEVEL SECURITY;
