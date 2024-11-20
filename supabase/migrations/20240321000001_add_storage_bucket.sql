-- Create storage bucket for profile images
INSERT INTO storage.buckets (id, name, public)
VALUES ('profile-images', 'profile-images', true)
ON CONFLICT (id) DO NOTHING;

-- Allow public access to view profile images
CREATE POLICY "Profile images are publicly accessible"
ON storage.objects FOR SELECT
USING (bucket_id = 'profile-images');

-- Allow authenticated users to upload profile images
CREATE POLICY "Users can upload profile images"
ON storage.objects FOR INSERT
WITH CHECK (
    bucket_id = 'profile-images' AND
    auth.uid() = (storage.foldername(name))[1]::uuid
);

-- Allow users to update their own profile images
CREATE POLICY "Users can update their own profile images"
ON storage.objects FOR UPDATE
USING (
    bucket_id = 'profile-images' AND
    auth.uid() = (storage.foldername(name))[1]::uuid
);

-- Allow users to delete their own profile images
CREATE POLICY "Users can delete their own profile images"
ON storage.objects FOR DELETE
USING (
    bucket_id = 'profile-images' AND
    auth.uid() = (storage.foldername(name))[1]::uuid
);
