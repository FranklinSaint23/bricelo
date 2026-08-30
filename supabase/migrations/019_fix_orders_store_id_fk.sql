-- Migration 019: Safe Cascade & Foreign Key Constraint Fixes across All Tables
-- Résout intégralement les erreurs NOT NULL et de contrainte de clé étrangère lors des suppressions d'utilisateurs, boutiques ou produits.

DO $$
BEGIN
  -- 1. Table ORDERS : Assouplir NOT NULL et clés étrangères pour préserver l'historique d'achats
  ALTER TABLE orders ALTER COLUMN store_id DROP NOT NULL;
  ALTER TABLE orders ALTER COLUMN user_id DROP NOT NULL;

  IF EXISTS (SELECT 1 FROM information_schema.table_constraints WHERE constraint_name = 'orders_store_id_fkey' AND table_name = 'orders') THEN
    ALTER TABLE orders DROP CONSTRAINT orders_store_id_fkey;
  END IF;
  ALTER TABLE orders ADD CONSTRAINT orders_store_id_fkey FOREIGN KEY (store_id) REFERENCES stores(id) ON DELETE SET NULL ON UPDATE CASCADE;

  IF EXISTS (SELECT 1 FROM information_schema.table_constraints WHERE constraint_name = 'orders_user_id_fkey' AND table_name = 'orders') THEN
    ALTER TABLE orders DROP CONSTRAINT orders_user_id_fkey;
  END IF;
  ALTER TABLE orders ADD CONSTRAINT orders_user_id_fkey FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL ON UPDATE CASCADE;

  -- 2. Table ORDER_ITEMS : Assouplir NOT NULL et clés étrangères sur les produits et variantes
  ALTER TABLE order_items ALTER COLUMN product_id DROP NOT NULL;
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'order_items' AND column_name = 'variant_id') THEN
    ALTER TABLE order_items ALTER COLUMN variant_id DROP NOT NULL;
  END IF;

  IF EXISTS (SELECT 1 FROM information_schema.table_constraints WHERE constraint_name = 'order_items_product_id_fkey' AND table_name = 'order_items') THEN
    ALTER TABLE order_items DROP CONSTRAINT order_items_product_id_fkey;
  END IF;
  ALTER TABLE order_items ADD CONSTRAINT order_items_product_id_fkey FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE SET NULL ON UPDATE CASCADE;

  IF EXISTS (SELECT 1 FROM information_schema.table_constraints WHERE constraint_name = 'order_items_variant_id_fkey' AND table_name = 'order_items') THEN
    ALTER TABLE order_items DROP CONSTRAINT order_items_variant_id_fkey;
  END IF;
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'order_items' AND column_name = 'variant_id') THEN
    ALTER TABLE order_items ADD CONSTRAINT order_items_variant_id_fkey FOREIGN KEY (variant_id) REFERENCES product_variants(id) ON DELETE SET NULL ON UPDATE CASCADE;
  END IF;

  -- 3. Table PRODUCTS : Assouplir category_id et s'assurer que store_id est en CASCADE
  ALTER TABLE products ALTER COLUMN category_id DROP NOT NULL;

  IF EXISTS (SELECT 1 FROM information_schema.table_constraints WHERE constraint_name = 'products_store_id_fkey' AND table_name = 'products') THEN
    ALTER TABLE products DROP CONSTRAINT products_store_id_fkey;
  END IF;
  ALTER TABLE products ADD CONSTRAINT products_store_id_fkey FOREIGN KEY (store_id) REFERENCES stores(id) ON DELETE CASCADE ON UPDATE CASCADE;

  IF EXISTS (SELECT 1 FROM information_schema.table_constraints WHERE constraint_name = 'products_category_id_fkey' AND table_name = 'products') THEN
    ALTER TABLE products DROP CONSTRAINT products_category_id_fkey;
  END IF;
  ALTER TABLE products ADD CONSTRAINT products_category_id_fkey FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE SET NULL ON UPDATE CASCADE;

  -- 4. Table STORES : Suppression en CASCADE lors de la suppression de l'utilisateur vendeur
  IF EXISTS (SELECT 1 FROM information_schema.table_constraints WHERE constraint_name = 'stores_user_id_fkey' AND table_name = 'stores') THEN
    ALTER TABLE stores DROP CONSTRAINT stores_user_id_fkey;
  END IF;
  ALTER TABLE stores ADD CONSTRAINT stores_user_id_fkey FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE ON UPDATE CASCADE;

END $$;
