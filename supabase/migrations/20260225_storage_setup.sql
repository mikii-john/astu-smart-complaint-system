-- Create the storage bucket for complaint attachments
INSERT INTO storage.buckets (id, name, public)
VALUES ('complaint-attachments', 'complaint-attachments', false)
ON CONFLICT (id) DO NOTHING;

-- Set up RLS for the bucket
-- Allow students to upload files to their own folder
CREATE POLICY "Students can upload attachments"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'complaint-attachments' AND
  (storage.foldername(name))[1] = auth.uid()::text
);

-- Allow students to view their own files
CREATE POLICY "Students can view their own attachments"
ON storage.objects FOR SELECT
TO authenticated
USING (
  bucket_id = 'complaint-attachments' AND
  (storage.foldername(name))[1] = auth.uid()::text
);

-- Allow staff/admin to view all files
CREATE POLICY "Staff and admins can view all attachments"
ON storage.objects FOR SELECT
TO authenticated
USING (
  bucket_id = 'complaint-attachments' AND
  EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() AND (role = 'staff' OR role = 'admin')
  )
);
