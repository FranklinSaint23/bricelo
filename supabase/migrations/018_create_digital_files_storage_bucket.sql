-- ============================================================
-- BRICELO — Migration 018 : Auto-création du Bucket Storage `digital-files` pour les Produits Digitaux
-- ============================================================

-- Bucket digital-files (pas de restriction stricte sur les mime-types pour accepter PDF, ZIP, EPUB, DOCX, etc.)
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'digital-files',
  'digital-files',
  true,
  5242880, -- 5 MB
  NULL     -- Accepte tous les formats (PDF, ZIP, RAR, EPUB, TXT, DOCX, etc.)
)
ON CONFLICT (id) DO UPDATE SET
  public = true,
  allowed_mime_types = NULL;

-- Retirer la restriction mime-type sur le bucket 'products' pour flexibilité
UPDATE storage.buckets
SET allowed_mime_types = NULL
WHERE id = 'products';

-- Politiques RLS de lecture publique pour digital-files
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE policyname = 'digital-files: public read 018'
  ) THEN
    CREATE POLICY "digital-files: public read 018"
      ON storage.objects FOR SELECT
      USING (bucket_id IN ('digital-files', 'products', 'product-images'));
  END IF;
END $$;

-- Politiques d'upload authentifié
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE policyname = 'digital-files: authenticated upload 018'
  ) THEN
    CREATE POLICY "digital-files: authenticated upload 018"
      ON storage.objects FOR INSERT
      WITH CHECK (
        bucket_id IN ('digital-files', 'products', 'product-images')
        AND auth.role() = 'authenticated'
      );
  END IF;
END $$;
