-- Insert admin role for the first user (you'll need to replace the email)
-- This is a one-time setup - replace 'your-email@example.com' with your actual email
INSERT INTO public.user_roles (user_id, role)
SELECT user_id, 'admin'::app_role
FROM public.profiles 
WHERE email = 'your-email@example.com'  -- REPLACE THIS WITH YOUR EMAIL
ON CONFLICT (user_id, role) DO NOTHING;

-- Alternative: Make the first registered user an admin automatically
-- Uncomment the lines below if you want the first user to be admin automatically
/*
INSERT INTO public.user_roles (user_id, role)
SELECT user_id, 'admin'::app_role
FROM public.profiles 
ORDER BY created_at ASC 
LIMIT 1
ON CONFLICT (user_id, role) DO NOTHING;
*/