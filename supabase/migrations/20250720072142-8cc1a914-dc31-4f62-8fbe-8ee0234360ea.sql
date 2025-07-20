-- Fix all security and authentication issues

-- 1. Enable RLS on all public tables that don't have it
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.habits ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.daily_habit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_progress ENABLE ROW LEVEL SECURITY;

-- 2. Create comprehensive RLS policies for profiles table
CREATE POLICY "Users can view their own profile"
ON public.profiles
FOR SELECT
USING (auth.uid()::text = user_id);

CREATE POLICY "Users can insert their own profile"
ON public.profiles
FOR INSERT
WITH CHECK (auth.uid()::text = user_id);

CREATE POLICY "Users can update their own profile"
ON public.profiles
FOR UPDATE
USING (auth.uid()::text = user_id);

CREATE POLICY "Users can delete their own profile"
ON public.profiles
FOR DELETE
USING (auth.uid()::text = user_id);

-- 3. Create RLS policies for habits table
CREATE POLICY "Users can view their own habits"
ON public.habits
FOR SELECT
USING (auth.uid()::text = user_id);

CREATE POLICY "Users can insert their own habits"
ON public.habits
FOR INSERT
WITH CHECK (auth.uid()::text = user_id);

CREATE POLICY "Users can update their own habits"
ON public.habits
FOR UPDATE
USING (auth.uid()::text = user_id);

CREATE POLICY "Users can delete their own habits"
ON public.habits
FOR DELETE
USING (auth.uid()::text = user_id);

-- 4. Create RLS policies for daily_habit_logs table
CREATE POLICY "Users can view their own habit logs"
ON public.daily_habit_logs
FOR SELECT
USING (auth.uid()::text = user_id);

CREATE POLICY "Users can insert their own habit logs"
ON public.daily_habit_logs
FOR INSERT
WITH CHECK (auth.uid()::text = user_id);

CREATE POLICY "Users can update their own habit logs"
ON public.daily_habit_logs
FOR UPDATE
USING (auth.uid()::text = user_id);

CREATE POLICY "Users can delete their own habit logs"
ON public.daily_habit_logs
FOR DELETE
USING (auth.uid()::text = user_id);

-- 5. Create RLS policies for user_progress table
CREATE POLICY "Users can view their own progress"
ON public.user_progress
FOR SELECT
USING (auth.uid()::text = user_id);

CREATE POLICY "Users can insert their own progress"
ON public.user_progress
FOR INSERT
WITH CHECK (auth.uid()::text = user_id);

CREATE POLICY "Users can update their own progress"
ON public.user_progress
FOR UPDATE
USING (auth.uid()::text = user_id);

CREATE POLICY "Users can delete their own progress"
ON public.user_progress
FOR DELETE
USING (auth.uid()::text = user_id);

-- 6. Fix function security by setting search_path (addresses linter warnings)
CREATE OR REPLACE FUNCTION public.calculate_level(xp integer)
 RETURNS integer
 LANGUAGE plpgsql
 IMMUTABLE
 SECURITY DEFINER
 SET search_path = public
AS $function$
BEGIN
  -- Level progression: Level 1 = 0-99 XP, Level 2 = 100-299 XP, Level 3 = 300-599 XP, etc.
  -- Formula: Level = floor(sqrt(xp/100)) + 1
  RETURN GREATEST(1, FLOOR(SQRT(xp::float / 100)) + 1);
END;
$function$;

CREATE OR REPLACE FUNCTION public.get_rank(level integer)
 RETURNS text
 LANGUAGE plpgsql
 IMMUTABLE
 SECURITY DEFINER
 SET search_path = public
AS $function$
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
$function$;

CREATE OR REPLACE FUNCTION public.reset_daily_habits()
 RETURNS void
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path = public
AS $function$
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
$function$;

CREATE OR REPLACE FUNCTION public.update_user_xp(p_user_id text, xp_to_add integer)
 RETURNS void
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path = public
AS $function$
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
$function$;

-- 7. Create trigger to auto-create profile when user signs up
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (user_id, full_name, email)
  VALUES (
    NEW.id::text,
    COALESCE(NEW.raw_user_meta_data ->> 'full_name', NEW.email),
    NEW.email
  );
  
  -- Also create initial user progress record
  INSERT INTO public.user_progress (user_id)
  VALUES (NEW.id::text);
  
  RETURN NEW;
END;
$$;

-- Create trigger if it doesn't exist
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();