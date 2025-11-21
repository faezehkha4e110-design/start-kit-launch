-- Fix orphaned submissions by assigning them to the correct user
UPDATE public.submissions 
SET user_id = '1847963a-118c-4615-acf1-447c8eaa0f9e'
WHERE user_id IS NULL 
  AND email = 'ffesharakif@gmail.com';

-- Make user_id column NOT NULL to prevent future orphaned records
ALTER TABLE public.submissions 
ALTER COLUMN user_id SET NOT NULL;

-- Add a comment explaining the security requirement
COMMENT ON COLUMN public.submissions.user_id IS 'Required for RLS policies. Must never be NULL to ensure proper access control.';