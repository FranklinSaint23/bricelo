-- ============================================================
-- BRICELO — Migration 010: Fix "Database error saving new user"
-- ============================================================

-- 1. S'assurer que email et phone sur public.users sont facultatifs (NULLABLE)
ALTER TABLE public.users ALTER COLUMN email DROP NOT NULL;
ALTER TABLE public.users ALTER COLUMN phone DROP NOT NULL;

-- 2. Sécuriser le trigger d'inscription handle_new_user avec gestion d'exceptions (EXCEPTION WHEN OTHERS)
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
  v_email text;
  v_name text;
  v_phone text;
BEGIN
  v_email := new.email;
  v_phone := COALESCE(new.raw_user_meta_data->>'phone', new.phone);
  v_name  := COALESCE(
    NULLIF(TRIM(new.raw_user_meta_data->>'full_name'), ''),
    CASE 
      WHEN v_email IS NOT NULL AND v_email != '' AND v_email NOT LIKE '%@bricelo.phone' THEN SPLIT_PART(v_email, '@', 1)
      WHEN v_phone IS NOT NULL AND v_phone != '' THEN v_phone
      ELSE 'Client Bricelo'
    END
  );

  INSERT INTO public.users (id, email, full_name, avatar_url, phone, role)
  VALUES (
    new.id,
    v_email,
    v_name,
    new.raw_user_meta_data->>'avatar_url',
    v_phone,
    'customer'
  )
  ON CONFLICT (id) DO UPDATE SET
    phone = COALESCE(excluded.phone, public.users.phone),
    email = COALESCE(excluded.email, public.users.email),
    full_name = COALESCE(excluded.full_name, public.users.full_name);

  RETURN new;
EXCEPTION WHEN OTHERS THEN
  -- Ne jamais faire échouer l'inscription dans auth.users même en cas d'erreur secondaire
  RETURN new;
END;
$$;

-- 3. Réactiver le trigger sur auth.users
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
