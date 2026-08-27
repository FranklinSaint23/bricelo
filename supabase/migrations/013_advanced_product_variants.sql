-- ============================================================
-- BRICELO — Migration 013 : Moteur Générique & Relationnel de Variantes Produits
-- ============================================================

-- 1. Table des options de produits (Critères : Couleur, Taille, Stockage, RAM, Matière, etc.)
CREATE TABLE IF NOT EXISTS product_options (
  id           UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  product_id   UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  name         TEXT NOT NULL,
  display_type TEXT NOT NULL DEFAULT 'button' CHECK (display_type IN ('button', 'color', 'image', 'select', 'radio')),
  position     INT NOT NULL DEFAULT 0,
  required     BOOLEAN NOT NULL DEFAULT true,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS product_options_product_idx ON product_options(product_id, position);

-- 2. Table des valeurs d'options (ex: Noir, Rouge, 256 Go, 512 Go)
CREATE TABLE IF NOT EXISTS product_option_values (
  id                UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  product_option_id UUID NOT NULL REFERENCES product_options(id) ON DELETE CASCADE,
  value             TEXT NOT NULL,
  label             TEXT,
  position          INT NOT NULL DEFAULT 0,
  metadata          JSONB DEFAULT '{}'::jsonb,
  is_active         BOOLEAN NOT NULL DEFAULT true,
  created_at        TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at        TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS product_option_values_option_idx ON product_option_values(product_option_id, position);

-- 3. Mise à niveau de product_variants (Entité centrale SKU)
-- Ajout des colonnes avancées si la table existe déjà
ALTER TABLE product_variants ADD COLUMN IF NOT EXISTS compare_at_price NUMERIC(12,0) CHECK (compare_at_price >= 0);
ALTER TABLE product_variants ADD COLUMN IF NOT EXISTS stock_quantity INT NOT NULL DEFAULT 0 CHECK (stock_quantity >= 0);
ALTER TABLE product_variants ADD COLUMN IF NOT EXISTS weight NUMERIC(8,2);
ALTER TABLE product_variants ADD COLUMN IF NOT EXISTS description TEXT;
ALTER TABLE product_variants ADD COLUMN IF NOT EXISTS status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'out_of_stock'));
ALTER TABLE product_variants ADD COLUMN IF NOT EXISTS combination_key TEXT;
ALTER TABLE product_variants ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT NOW();

-- Si la colonne price est nullable ou si on a besoin de stocker le prix direct de variante
ALTER TABLE product_variants ADD COLUMN IF NOT EXISTS direct_price NUMERIC(12,0) CHECK (direct_price >= 0);

CREATE INDEX IF NOT EXISTS product_variants_product_idx ON product_variants(product_id);
CREATE INDEX IF NOT EXISTS product_variants_sku_idx ON product_variants(sku);

-- 4. Table pivot : variante <-> valeurs d'options
CREATE TABLE IF NOT EXISTS product_variant_values (
  variant_id      UUID NOT NULL REFERENCES product_variants(id) ON DELETE CASCADE,
  option_value_id UUID NOT NULL REFERENCES product_option_values(id) ON DELETE CASCADE,
  PRIMARY KEY (variant_id, option_value_id)
);

CREATE INDEX IF NOT EXISTS product_variant_values_value_idx ON product_variant_values(option_value_id);

-- 5. Table des images spécifiques de variante
CREATE TABLE IF NOT EXISTS variant_images (
  id         UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  variant_id UUID NOT NULL REFERENCES product_variants(id) ON DELETE CASCADE,
  url        TEXT NOT NULL,
  position   INT NOT NULL DEFAULT 0,
  alt        TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS variant_images_variant_idx ON variant_images(variant_id, position);

-- 6. Tables des présélections d'options globales (Administration)
CREATE TABLE IF NOT EXISTS global_product_options (
  id           UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name         TEXT NOT NULL UNIQUE,
  display_type TEXT NOT NULL DEFAULT 'button',
  created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS global_option_values (
  id                      UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  global_product_option_id UUID NOT NULL REFERENCES global_product_options(id) ON DELETE CASCADE,
  value                   TEXT NOT NULL,
  metadata                JSONB DEFAULT '{}'::jsonb,
  position                INT NOT NULL DEFAULT 0,
  created_at              TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Insertion des présélections globales universelles
INSERT INTO global_product_options (name, display_type) VALUES
  ('Couleur', 'color'),
  ('Taille', 'button'),
  ('Pointure', 'button'),
  ('Stockage', 'button'),
  ('Mémoire RAM', 'button'),
  ('Processeur', 'select'),
  ('Matière', 'button'),
  ('Nombre de places', 'button'),
  ('Épaisseur', 'button'),
  ('Puissance', 'button'),
  ('Volume / Format', 'button'),
  ('Finition', 'button')
ON CONFLICT (name) DO NOTHING;

-- RLS Policies
ALTER TABLE product_options ENABLE ROW LEVEL SECURITY;
ALTER TABLE product_option_values ENABLE ROW LEVEL SECURITY;
ALTER TABLE product_variant_values ENABLE ROW LEVEL SECURITY;
ALTER TABLE variant_images ENABLE ROW LEVEL SECURITY;
ALTER TABLE global_product_options ENABLE ROW LEVEL SECURITY;
ALTER TABLE global_option_values ENABLE ROW LEVEL SECURITY;

-- Accès public en lecture
CREATE POLICY "Public read product_options" ON product_options FOR SELECT USING (true);
CREATE POLICY "Public read product_option_values" ON product_option_values FOR SELECT USING (true);
CREATE POLICY "Public read product_variant_values" ON product_variant_values FOR SELECT USING (true);
CREATE POLICY "Public read variant_images" ON variant_images FOR SELECT USING (true);
CREATE POLICY "Public read global_options" ON global_product_options FOR SELECT USING (true);
CREATE POLICY "Public read global_values" ON global_option_values FOR SELECT USING (true);

-- Vendeurs & Admins : Gestion complète
CREATE POLICY "Vendors manage product_options" ON product_options FOR ALL USING (auth.uid() IS NOT NULL);
CREATE POLICY "Vendors manage product_option_values" ON product_option_values FOR ALL USING (auth.uid() IS NOT NULL);
CREATE POLICY "Vendors manage product_variant_values" ON product_variant_values FOR ALL USING (auth.uid() IS NOT NULL);
CREATE POLICY "Vendors manage variant_images" ON variant_images FOR ALL USING (auth.uid() IS NOT NULL);
