-- Étiquettes de promotion personnalisées par le vendeur
ALTER TABLE products
  ADD COLUMN IF NOT EXISTS promotion_label VARCHAR(40) DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS is_new         BOOLEAN     NOT NULL DEFAULT false;

-- Commentaires
COMMENT ON COLUMN products.promotion_label IS 'Étiquette custom du vendeur : ex "DÉSTOCKAGE", "BLACK FRIDAY", "SOLDES"';
COMMENT ON COLUMN products.is_new         IS 'Marquer le produit comme nouveau (badge Nouveau)';
