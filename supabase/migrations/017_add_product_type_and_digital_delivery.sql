-- =========================================================================
-- BRICELO — Migration 017 : Support des Types de Produits (Simple, Variable, Digital)
-- =========================================================================

ALTER TABLE public.products
ADD COLUMN IF NOT EXISTS product_type VARCHAR(20) NOT NULL DEFAULT 'simple' CHECK (product_type IN ('simple', 'variable', 'digital')),
ADD COLUMN IF NOT EXISTS digital_file_url TEXT;

-- Index pour filtres rapides
CREATE INDEX IF NOT EXISTS idx_products_product_type ON public.products(product_type);
