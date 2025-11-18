-- Create submissions table for SI/PI review intake
CREATE TABLE IF NOT EXISTS public.submissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  project_description TEXT NOT NULL,
  schematic_url TEXT,
  stackup_url TEXT,
  layout_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create storage bucket for review files
INSERT INTO storage.buckets (id, name, public)
VALUES ('review-files', 'review-files', false)
ON CONFLICT (id) DO NOTHING;

-- RLS policies for storage bucket
CREATE POLICY "Allow public uploads to review-files"
ON storage.objects FOR INSERT
TO public
WITH CHECK (bucket_id = 'review-files');

CREATE POLICY "Allow public read of review-files"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'review-files');

-- Enable RLS on submissions
ALTER TABLE public.submissions ENABLE ROW LEVEL SECURITY;

-- Allow anyone to insert submissions (public form)
CREATE POLICY "Allow public insert on submissions"
ON public.submissions FOR INSERT
TO public
WITH CHECK (true);

-- Allow anyone to read submissions (for now, can be restricted later)
CREATE POLICY "Allow public read on submissions"
ON public.submissions FOR SELECT
TO public
USING (true);