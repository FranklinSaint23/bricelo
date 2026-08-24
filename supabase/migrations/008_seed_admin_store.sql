-- ============================================================
-- BRICELO — Promotion Admin & Création Boutique BRICELO SHOP
-- ============================================================

-- 1. S'assurer que les colonnes 'city' et 'phone' existent sur la table stores
ALTER TABLE public.stores ADD COLUMN IF NOT EXISTS city text DEFAULT 'Douala';
ALTER TABLE public.stores ADD COLUMN IF NOT EXISTS phone text;

DO $$
DECLARE
  v_admin_id UUID;
  v_store_id UUID;
  v_cat_high_tech UUID;
BEGIN
  -- 2. Récupérer l'ID de l'utilisateur admin par son email
  SELECT id INTO v_admin_id 
  FROM public.users 
  WHERE lower(email) = 'bricelo237@gmail.com';

  -- Si l'utilisateur existe dans public.users, lui attribuer le rôle 'admin'
  IF v_admin_id IS NOT NULL THEN
    UPDATE public.users 
    SET role = 'admin' 
    WHERE id = v_admin_id;

    -- 3. Vérifier si la boutique de cet admin existe déjà
    SELECT id INTO v_store_id 
    FROM public.stores 
    WHERE user_id = v_admin_id 
    LIMIT 1;

    IF v_store_id IS NULL THEN
      -- Créer la nouvelle boutique
      INSERT INTO public.stores (
        user_id,
        name,
        slug,
        description,
        city,
        phone,
        is_active,
        rating,
        review_count
      ) VALUES (
        v_admin_id,
        'BRICELO SHOP',
        'bricelo-shop',
        'Boutique officielle BRICELO - Produits certifiés et livrés chez vous.',
        'Yaoundé',
        '+237 6 52 70 42 18',
        true,
        5.0,
        0
      )
      RETURNING id INTO v_store_id;
    ELSE
      -- Mettre à jour la boutique existante
      UPDATE public.stores
      SET 
        name = 'BRICELO SHOP',
        slug = 'bricelo-shop',
        description = 'Boutique officielle BRICELO - Produits certifiés et livrés chez vous.',
        city = 'Yaoundé',
        phone = '+237 6 52 70 42 18',
        is_active = true
      WHERE id = v_store_id;
    END IF;

    -- 4. Obtenir l'ID d'une catégorie existante
    SELECT id INTO v_cat_high_tech FROM public.categories WHERE slug = 'high-tech' LIMIT 1;
    IF v_cat_high_tech IS NULL THEN
      SELECT id INTO v_cat_high_tech FROM public.categories LIMIT 1;
    END IF;

    -- 5. Ajouter les produits certifiés initiaux pour la boutique officielle
    IF v_store_id IS NOT NULL AND v_cat_high_tech IS NOT NULL THEN
      INSERT INTO public.products (
        store_id, category_id, name, slug, description, price, compare_at_price, stock, is_active, is_featured, images
      ) VALUES
      (
        v_store_id,
        v_cat_high_tech,
        'Écouteurs Sans Fil Bluetooth Premium Pro',
        'ecouteurs-sans-fil-bluetooth-premium-pro',
        'Écouteurs avec réduction de bruit active, basses profondes et autonomie de 24h avec le boîtier de charge.',
        15000,
        25000,
        50,
        true,
        true,
        ARRAY['https://images.unsplash.com/photo-1590658268037-6bf12165a8df?w=800&auto=format&fit=crop']
      ),
      (
        v_store_id,
        v_cat_high_tech,
        'Montre Connectée Sport Smartwatch HR',
        'montre-connectee-sport-smartwatch-hr',
        'Suivi cardiaque, étanche IP68, notifications d appels et messages. Compatible Android & iOS.',
        22000,
        35000,
        30,
        true,
        true,
        ARRAY['https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800&auto=format&fit=crop']
      )
      ON CONFLICT (slug) DO NOTHING;
    END IF;

    RAISE NOTICE 'Succès : La boutique BRICELO SHOP a été associée à l''admin bricelo237@gmail.com !';
  ELSE
    RAISE NOTICE 'Attention : Connectez-vous d''abord sur le site avec bricelo237@gmail.com pour créer votre compte.';
  END IF;
END $$;
