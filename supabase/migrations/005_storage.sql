-- ============================================================
-- BRICELO — Storage buckets & policies
-- ============================================================

-- Bucket product-images (public)
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'product-images',
  'product-images',
  true,
  5242880,
  ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif']
)
ON CONFLICT (id) DO NOTHING;

-- Lecture publique
CREATE POLICY "product-images: public read"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'product-images');

-- Upload pour les utilisateurs authentifiés
CREATE POLICY "product-images: authenticated upload"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'product-images'
    AND auth.role() = 'authenticated'
  );

-- Mise à jour
CREATE POLICY "product-images: owner update"
  ON storage.objects FOR UPDATE
  USING (
    bucket_id = 'product-images'
    AND auth.role() = 'authenticated'
  );

-- Suppression
CREATE POLICY "product-images: owner delete"
  ON storage.objects FOR DELETE
  USING (
    bucket_id = 'product-images'
    AND auth.role() = 'authenticated'
  );

-- Bucket store-assets (logos, bannières)
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'store-assets',
  'store-assets',
  true,
  5242880,
  ARRAY['image/jpeg', 'image/png', 'image/webp']
)
ON CONFLICT (id) DO NOTHING;

CREATE POLICY "store-assets: public read"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'store-assets');

CREATE POLICY "store-assets: authenticated upload"
  ON storage.objects FOR INSERT
  WITH CHECK (bucket_id = 'store-assets' AND auth.role() = 'authenticated');

CREATE POLICY "store-assets: authenticated update"
  ON storage.objects FOR UPDATE
  USING (bucket_id = 'store-assets' AND auth.role() = 'authenticated');

CREATE POLICY "store-assets: authenticated delete"
  ON storage.objects FOR DELETE
  USING (bucket_id = 'store-assets' AND auth.role() = 'authenticated');
