-- Add user_id column to submissions table
ALTER TABLE public.submissions 
ADD COLUMN user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;

-- Create enum for user roles
CREATE TYPE public.app_role AS ENUM ('admin', 'user');

-- Create user_roles table
CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  role app_role NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(user_id, role)
);

-- Enable RLS on user_roles
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- Create security definer function to check roles
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN
LANGUAGE SQL
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role = _role
  )
$$;

-- Drop existing public policies on submissions
DROP POLICY IF EXISTS "Allow public insert on submissions" ON public.submissions;
DROP POLICY IF EXISTS "Allow public read on submissions" ON public.submissions;

-- Create new RLS policies for submissions
-- Users can only insert their own submissions
CREATE POLICY "Users can insert own submissions"
ON public.submissions
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

-- Users can only read their own submissions
CREATE POLICY "Users can read own submissions"
ON public.submissions
FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

-- Admins can read all submissions
CREATE POLICY "Admins can read all submissions"
ON public.submissions
FOR SELECT
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

-- Admins can update all submissions
CREATE POLICY "Admins can update all submissions"
ON public.submissions
FOR UPDATE
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

-- Policy for user_roles: users can view their own roles
CREATE POLICY "Users can view own roles"
ON public.user_roles
FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

-- Admins can manage all roles
CREATE POLICY "Admins can manage all roles"
ON public.user_roles
FOR ALL
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));