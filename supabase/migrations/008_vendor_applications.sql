-- Table des candidatures vendeur (soumises avant création du compte)
CREATE TABLE IF NOT EXISTS vendor_applications (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  -- Infos personnelles
  full_name       TEXT NOT NULL,
  email           TEXT NOT NULL,
  phone           TEXT NOT NULL,
  gender          TEXT CHECK (gender IN ('homme', 'femme')),
  birth_date      DATE,

  -- Infos entreprise
  business_name   TEXT NOT NULL,
  business_type   TEXT,
  city            TEXT,
  address         TEXT,

  -- Documents disponibles (déclaratif)
  has_cni                   BOOLEAN NOT NULL DEFAULT false,
  has_registre_commerce     BOOLEAN NOT NULL DEFAULT false,
  has_carte_contribuable    BOOLEAN NOT NULL DEFAULT false,
  has_plan_localisation     BOOLEAN NOT NULL DEFAULT false,
  has_patente               BOOLEAN NOT NULL DEFAULT false,
  has_licence_exploitation  BOOLEAN NOT NULL DEFAULT false,

  -- Gestion admin
  status          TEXT NOT NULL DEFAULT 'pending'
                    CHECK (status IN ('pending', 'approved', 'rejected')),
  admin_note      TEXT,
  reviewed_at     TIMESTAMPTZ,
  reviewed_by     UUID REFERENCES auth.users(id)
);

-- RLS
ALTER TABLE vendor_applications ENABLE ROW LEVEL SECURITY;

-- Toute personne peut soumettre une candidature
CREATE POLICY "public_insert_vendor_application"
  ON vendor_applications FOR INSERT
  WITH CHECK (true);

-- Seuls les admins peuvent lire
CREATE POLICY "admin_read_vendor_applications"
  ON vendor_applications FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin'
  ));

-- Seuls les admins peuvent mettre à jour (approve/reject)
CREATE POLICY "admin_update_vendor_applications"
  ON vendor_applications FOR UPDATE
  USING (EXISTS (
    SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin'
  ));
