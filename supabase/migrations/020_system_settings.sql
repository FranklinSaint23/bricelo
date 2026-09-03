-- Migration 020: Table system_settings et configuration des paiements en ligne
-- Permet à l'administrateur d'activer/désactiver manuellement Orange Money et MTN Mobile Money.

CREATE TABLE IF NOT EXISTS system_settings (
  key TEXT PRIMARY KEY,
  value JSONB NOT NULL,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Activation de RLS
ALTER TABLE system_settings ENABLE ROW LEVEL SECURITY;

-- Politique d'accès en lecture pour tous
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'system_settings' AND policyname = 'Allow public read access to system_settings'
  ) THEN
    CREATE POLICY "Allow public read access to system_settings"
      ON system_settings FOR SELECT
      USING (true);
  END IF;
END $$;

-- Politique d'accès complet pour les administrateurs
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'system_settings' AND policyname = 'Allow admin full access to system_settings'
  ) THEN
    CREATE POLICY "Allow admin full access to system_settings"
      ON system_settings FOR ALL
      USING (
        EXISTS (
          SELECT 1 FROM users
          WHERE users.id = auth.uid() AND users.role = 'admin'
        )
      );
  END IF;
END $$;

-- Valeur par défaut : Paiements en ligne désactivés par défaut comme demandé
INSERT INTO system_settings (key, value)
VALUES (
  'online_payments_settings',
  '{"orange_money": false, "mtn_momo": false, "notice_message": "Paiement indisponible pour le moment"}'::jsonb
)
ON CONFLICT (key) DO NOTHING;
