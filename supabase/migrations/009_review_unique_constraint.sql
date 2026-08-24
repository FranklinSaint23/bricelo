-- ============================================================
-- BRICELO — Contrainte d'unicité et colonne nom pour les avis
-- ============================================================

-- 1. S'assurer que la colonne reviewer_name existe
ALTER TABLE public.reviews ADD COLUMN IF NOT EXISTS reviewer_name text;

-- 2. Ajouter la contrainte d'unicité (un seul avis par produit et par utilisateur connecté)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'reviews_product_user_unique'
  ) THEN
    ALTER TABLE public.reviews 
    ADD CONSTRAINT reviews_product_user_unique UNIQUE (product_id, user_id);
  END IF;
END $$;
