-- Add new columns to submissions table for enhanced intake form
ALTER TABLE public.submissions
ADD COLUMN company TEXT,
ADD COLUMN interface_type TEXT,
ADD COLUMN target_data_rate TEXT;