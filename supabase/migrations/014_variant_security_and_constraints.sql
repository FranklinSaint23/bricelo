-- ============================================================
-- BRICELO — Migration 014 : Contraintes d'intégrité, RLS Multi-vendeurs & Gestion Transactionnelle du Stock pour Variantes
-- ============================================================

-- 1. Dimensions logistiques physiques sur product_variants
ALTER TABLE product_variants ADD COLUMN IF NOT EXISTS weight_kg NUMERIC(8,3) DEFAULT 0 CHECK (weight_kg >= 0);
ALTER TABLE product_variants ADD COLUMN IF NOT EXISTS length_cm NUMERIC(8,2) DEFAULT 0 CHECK (length_cm >= 0);
ALTER TABLE product_variants ADD COLUMN IF NOT EXISTS width_cm NUMERIC(8,2) DEFAULT 0 CHECK (width_cm >= 0);
ALTER TABLE product_variants ADD COLUMN IF NOT EXISTS height_cm NUMERIC(8,2) DEFAULT 0 CHECK (height_cm >= 0);

-- 2. Contrainte d'unicité de la clé de combinaison déterministe par produit
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'product_variants_combination_key_key'
  ) THEN
    ALTER TABLE product_variants ADD CONSTRAINT product_variants_combination_key_key UNIQUE (product_id, combination_key);
  END IF;
EXCEPTION WHEN OTHERS THEN NULL;
END $$;

-- 3. Fonction RPC transactionnelle d'abaissement de stock atomique (Anti-race conditions)
CREATE OR REPLACE FUNCTION decrement_variant_stock(
  p_variant_id UUID,
  p_quantity INT
) RETURNS INT AS $$
DECLARE
  v_current_stock INT;
BEGIN
  IF p_quantity <= 0 THEN
    RAISE EXCEPTION 'Quantity must be positive';
  END IF;

  -- Verrouillage atomique de la ligne variante (FOR UPDATE)
  SELECT stock_quantity INTO v_current_stock
  FROM product_variants
  WHERE id = p_variant_id
  FOR UPDATE;

  IF v_current_stock IS NULL THEN
    RAISE EXCEPTION 'Variant not found';
  END IF;

  IF v_current_stock < p_quantity THEN
    RAISE EXCEPTION 'Rupture de stock pour cette variante (% disponible(s), % demandé(s))', v_current_stock, p_quantity;
  END IF;

  UPDATE product_variants
  SET stock_quantity = stock_quantity - p_quantity,
      status = CASE WHEN (stock_quantity - p_quantity) <= 0 THEN 'out_of_stock' ELSE status END,
      updated_at = NOW()
  WHERE id = p_variant_id;

  RETURN (v_current_stock - p_quantity);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 4. Renforcement des politiques RLS d'isolation Multi-Vendeurs
DROP POLICY IF EXISTS "Vendors manage product_options" ON product_options;
DROP POLICY IF EXISTS "Vendors manage product_option_values" ON product_option_values;
DROP POLICY IF EXISTS "Vendors manage product_variant_values" ON product_variant_values;
DROP POLICY IF EXISTS "Vendors manage variant_images" ON variant_images;

-- Isolation stricte par Store / Owner
CREATE POLICY "Vendors manage product_options" ON product_options
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM products p
      JOIN stores s ON s.id = p.store_id
      WHERE p.id = product_options.product_id
        AND s.user_id = auth.uid()
    )
  );

CREATE POLICY "Vendors manage product_option_values" ON product_option_values
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM product_options po
      JOIN products p ON p.id = po.product_id
      JOIN stores s ON s.id = p.store_id
      WHERE po.id = product_option_values.product_option_id
        AND s.user_id = auth.uid()
    )
  );

CREATE POLICY "Vendors manage product_variant_values" ON product_variant_values
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM product_variants pv
      JOIN products p ON p.id = pv.product_id
      JOIN stores s ON s.id = p.store_id
      WHERE pv.id = product_variant_values.variant_id
        AND s.user_id = auth.uid()
    )
  );

CREATE POLICY "Vendors manage variant_images" ON variant_images
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM product_variants pv
      JOIN products p ON p.id = pv.product_id
      JOIN stores s ON s.id = p.store_id
      WHERE pv.id = variant_images.variant_id
        AND s.user_id = auth.uid()
    )
  );
