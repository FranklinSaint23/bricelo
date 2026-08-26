-- Migration 012 : Ajout des colonnes user_id et desired_password dans vendor_applications
ALTER TABLE vendor_applications ADD COLUMN IF NOT EXISTS desired_password TEXT;
ALTER TABLE vendor_applications ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL;
