-- ============================================================
-- BRICELO — Migration 015 : Auto-création des Buckets Storage `product-images` & `products`
-- ============================================================

-- Bucket product-images
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'product-images',
  'product-images',
  true,
  5242880,
  ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif']
)
ON CONFLICT (id) DO NOTHING;

-- Bucket products
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'products',
  'products',
  true,
  5242880,
  ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif']
)
ON CONFLICT (id) DO NOTHING;

-- Politiques de lecture publique
CREATE POLICY "product-images: public read 015"
  ON storage.objects FOR SELECT
  USING (bucket_id IN ('product-images', 'products'));

-- Politiques d'upload authentifié
CREATE POLICY "product-images: authenticated upload 015"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id IN ('product-images', 'products')
    AND auth.role() = 'authenticated'
  );

CREATE POLICY "product-images: owner update 015"
  ON storage.objects FOR UPDATE
  USING (
    bucket_id IN ('product-images', 'products')
    AND auth.role() = 'authenticated'
  );

CREATE POLICY "product-images: owner delete 015"
  ON storage.objects FOR DELETE
  USING (
    bucket_id IN ('product-images', 'products')
    AND auth.role() = 'authenticated'
  );
