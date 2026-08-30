-- Migration 019: Fix foreign key constraint on orders.store_id to ON DELETE SET NULL
-- Permet la suppression ou modification sécurisée des boutiques sans violer la contrainte des commandes historiques.

DO $$
BEGIN
  -- Supprimer l'ancienne contrainte stricte sur orders.store_id si elle existe
  IF EXISTS (
    SELECT 1 
    FROM information_schema.table_constraints 
    WHERE constraint_name = 'orders_store_id_fkey' 
      AND table_name = 'orders'
  ) THEN
    ALTER TABLE orders DROP CONSTRAINT orders_store_id_fkey;
  END IF;

  -- Re-créer la contrainte avec ON DELETE SET NULL et ON UPDATE CASCADE
  ALTER TABLE orders 
    ADD CONSTRAINT orders_store_id_fkey 
    FOREIGN KEY (store_id) 
    REFERENCES stores(id) 
    ON DELETE SET NULL 
    ON UPDATE CASCADE;
END $$;
