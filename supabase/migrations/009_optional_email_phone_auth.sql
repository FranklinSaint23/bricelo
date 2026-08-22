-- ============================================================
-- BRICELO — Migration 009: Email facultatif & Authentification Téléphone
-- ============================================================

-- 1. Rendre l'email facultatif (NULLABLE) sur la table users
ALTER TABLE public.users ALTER COLUMN email DROP NOT NULL;

-- 2. Index unique sur le téléphone pour éviter les doublons
CREATE UNIQUE INDEX IF NOT EXISTS users_phone_key ON public.users(phone) WHERE phone IS NOT NULL AND phone != '';

-- 3. Mettre à jour le trigger d'inscription automatique handle_new_user()
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  INSERT INTO public.users (id, email, full_name, avatar_url, phone)
  VALUES (
    new.id,
    new.email,
    COALESCE(new.raw_user_meta_data->>'full_name', SPLIT_PART(COALESCE(new.email, ''), '@', 1), 'Utilisateur Bricelo'),
    new.raw_user_meta_data->>'avatar_url',
    COALESCE(new.raw_user_meta_data->>'phone', new.phone)
  )
  ON CONFLICT (id) DO UPDATE SET
    phone = COALESCE(excluded.phone, public.users.phone),
    email = COALESCE(excluded.email, public.users.email),
    full_name = COALESCE(excluded.full_name, public.users.full_name);
  RETURN new;
END;
$$;
