-- Reviews anonymes : user_id optionnel + nom du rédacteur
ALTER TABLE reviews
  ALTER COLUMN user_id DROP NOT NULL,
  ADD COLUMN IF NOT EXISTS reviewer_name TEXT;

-- Commandes invités : user_id optionnel + moyen de paiement
ALTER TABLE orders
  ALTER COLUMN user_id DROP NOT NULL,
  ADD COLUMN IF NOT EXISTS payment_method TEXT NOT NULL DEFAULT 'cash';

-- Index utile pour filtrer les commandes espèces en attente
CREATE INDEX IF NOT EXISTS idx_orders_payment_pending
  ON orders (payment_method, status)
  WHERE payment_method = 'cash' AND status = 'pending';
