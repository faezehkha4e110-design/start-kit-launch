-- Fix storage bucket security issues
-- Drop the existing public policies that allow anyone to read and upload files

DROP POLICY IF EXISTS "Allow public read of review-files" ON storage.objects;
DROP POLICY IF EXISTS "Allow public uploads to review-files" ON storage.objects;

-- Create authenticated-only policy for users to read their own submission files
CREATE POLICY "Users can read own submission files"
ON storage.objects
FOR SELECT
TO authenticated
USING (
  bucket_id = 'review-files' AND
  (storage.foldername(name))[1] IN (
    SELECT id::text FROM public.submissions WHERE user_id = auth.uid()
  )
);

-- Create policy for admins to read all submission files
CREATE POLICY "Admins can read all submission files"
ON storage.objects
FOR SELECT
TO authenticated
USING (
  bucket_id = 'review-files' AND
  public.has_role(auth.uid(), 'admin')
);

-- Create authenticated-only policy for users to upload to their own submission folders
CREATE POLICY "Authenticated users can upload to own submissions"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'review-files' AND
  (storage.foldername(name))[1] IN (
    SELECT id::text FROM public.submissions WHERE user_id = auth.uid()
  )
);

-- Create policy for admins to upload files (if needed for admin operations)
CREATE POLICY "Admins can upload all submission files"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'review-files' AND
  public.has_role(auth.uid(), 'admin')
);