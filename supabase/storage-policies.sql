-- ============================================
-- STORAGE POLICIES
-- Supabase Storage Row Level Security
-- ============================================

-- ============================================
-- BUCKET: uploads (File Uploads Umum)
-- ============================================

-- Allow public read
CREATE POLICY "Public can read uploads" ON storage.objects
  FOR SELECT USING (bucket_id = 'uploads');

-- Allow authenticated users to upload
CREATE POLICY "Authenticated users can upload" ON storage.objects
  FOR INSERT WITH CHECK (bucket_id = 'uploads' AND auth.role() = 'authenticated');

-- Allow authenticated users to update own files
CREATE POLICY "Authenticated users can update uploads" ON storage.objects
  FOR UPDATE USING (bucket_id = 'uploads' AND auth.role() = 'authenticated');

-- Allow authenticated users to delete own files
CREATE POLICY "Authenticated users can delete uploads" ON storage.objects
  FOR DELETE USING (bucket_id = 'uploads' AND auth.role() = 'authenticated');

-- ============================================
-- BUCKET: covers (Cover Images)
-- ============================================

-- Allow public read
CREATE POLICY "Public can read covers" ON storage.objects
  FOR SELECT USING (bucket_id = 'covers');

-- Allow authenticated users to upload covers
CREATE POLICY "Authenticated users can upload covers" ON storage.objects
  FOR INSERT WITH CHECK (bucket_id = 'covers' AND auth.role() = 'authenticated');

-- Allow authenticated users to update covers
CREATE POLICY "Authenticated users can update covers" ON storage.objects
  FOR UPDATE USING (bucket_id = 'covers' AND auth.role() = 'authenticated');

-- Allow authenticated users to delete covers
CREATE POLICY "Authenticated users can delete covers" ON storage.objects
  FOR DELETE USING (bucket_id = 'covers' AND auth.role() = 'authenticated');

-- ============================================
-- BUCKET: documents (PDF/Documents)
-- ============================================

-- Allow public read
CREATE POLICY "Public can read documents" ON storage.objects
  FOR SELECT USING (bucket_id = 'documents');

-- Allow authenticated users to upload documents
CREATE POLICY "Authenticated users can upload documents" ON storage.objects
  FOR INSERT WITH CHECK (bucket_id = 'documents' AND auth.role() = 'authenticated');

-- Allow authenticated users to update documents
CREATE POLICY "Authenticated users can update documents" ON storage.objects
  FOR UPDATE USING (bucket_id = 'documents' AND auth.role() = 'authenticated');

-- Allow authenticated users to delete documents
CREATE POLICY "Authenticated users can delete documents" ON storage.objects
  FOR DELETE USING (bucket_id = 'documents' AND auth.role() = 'authenticated');

-- ============================================
-- BUCKET: avatars (User Photos)
-- ============================================

-- Allow public read
CREATE POLICY "Public can read avatars" ON storage.objects
  FOR SELECT USING (bucket_id = 'avatars');

-- Allow users to upload own avatar (folder structure: avatars/{user_id}/photo.png)
CREATE POLICY "Users can upload own avatar" ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'avatars' 
    AND auth.role() = 'authenticated'
    AND (storage.foldername(name))[1] = auth.uid()::text
  );

-- Allow users to update own avatar
CREATE POLICY "Users can update own avatar" ON storage.objects
  FOR UPDATE USING (
    bucket_id = 'avatars' 
    AND auth.role() = 'authenticated'
    AND (storage.foldername(name))[1] = auth.uid()::text
  );

-- Allow users to delete own avatar
CREATE POLICY "Users can delete own avatar" ON storage.objects
  FOR DELETE USING (
    bucket_id = 'avatars' 
    AND auth.role() = 'authenticated'
    AND (storage.foldername(name))[1] = auth.uid()::text
  );

-- ============================================
-- END OF STORAGE POLICIES
-- ============================================
