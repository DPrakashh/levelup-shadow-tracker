-- Create function to check if user is admin
CREATE OR REPLACE FUNCTION public.is_admin(user_id_param TEXT)
RETURNS BOOLEAN
LANGUAGE SQL
SECURITY DEFINER
STABLE
AS $$
  SELECT EXISTS (
    SELECT 1 
    FROM public.user_roles 
    WHERE user_id = user_id_param 
    AND role = 'admin'
  );
$$;

-- Create function to delete user and all related data
CREATE OR REPLACE FUNCTION public.admin_delete_user(target_user_id TEXT)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Check if the calling user is admin
  IF NOT public.is_admin(auth.uid()::text) THEN
    RAISE EXCEPTION 'Access denied. Admin privileges required.';
  END IF;

  -- Delete user data in correct order (respecting foreign keys)
  DELETE FROM public.daily_habit_logs WHERE user_id = target_user_id;
  DELETE FROM public.habit_completions WHERE user_id = target_user_id;
  DELETE FROM public.habits WHERE user_id = target_user_id;
  DELETE FROM public.user_progress WHERE user_id = target_user_id;
  DELETE FROM public.user_roles WHERE user_id = target_user_id;
  DELETE FROM public.profiles WHERE user_id = target_user_id;
  
  -- Delete from auth.users (this will cascade to other auth-related tables)
  DELETE FROM auth.users WHERE id = target_user_id::uuid;
END;
$$;

-- Create function to reset user progress
CREATE OR REPLACE FUNCTION public.admin_reset_user_progress(target_user_id TEXT)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Check if the calling user is admin
  IF NOT public.is_admin(auth.uid()::text) THEN
    RAISE EXCEPTION 'Access denied. Admin privileges required.';
  END IF;

  -- Reset user progress
  UPDATE public.user_progress 
  SET 
    total_habits_completed = 0,
    current_streak = 0,
    longest_streak = 0,
    total_xp_earned = 0,
    last_reset_date = CURRENT_DATE,
    last_activity_date = NULL,
    updated_at = NOW()
  WHERE user_id = target_user_id;

  -- Reset user profile stats
  UPDATE public.profiles 
  SET 
    current_xp = 0,
    current_level = 1,
    streak_count = 0,
    last_activity_date = NULL,
    updated_at = NOW()
  WHERE user_id = target_user_id;

  -- Clear habit completion logs
  DELETE FROM public.daily_habit_logs WHERE user_id = target_user_id;
  DELETE FROM public.habit_completions WHERE user_id = target_user_id;
END;
$$;