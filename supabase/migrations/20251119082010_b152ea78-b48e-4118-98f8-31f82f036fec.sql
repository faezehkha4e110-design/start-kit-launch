-- Add new professional fields to submissions table
ALTER TABLE public.submissions
ADD COLUMN nda_required boolean NOT NULL DEFAULT false,
ADD COLUMN urgency_level text NOT NULL DEFAULT 'Standard (3–5 business days)',
ADD COLUMN preferred_response_time text;