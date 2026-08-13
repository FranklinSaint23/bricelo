-- ============================================================
-- BRICELO — Seed de démonstration
-- Robuste : utilise des sous-requêtes par slug pour les FK
-- ============================================================

-- ============================================================
-- 1. Catégories (upsert par slug — garde les UUIDs existants)
-- ============================================================
INSERT INTO categories (id, name, slug) VALUES
  (gen_random_uuid(), 'Électronique',      'electronique'),
  (gen_random_uuid(), 'Mode & Vêtements',  'mode-vetements'),
  (gen_random_uuid(), 'Maison & Cuisine',  'maison-cuisine'),
  (gen_random_uuid(), 'Beauté & Santé',    'beaute-sante'),
  (gen_random_uuid(), 'Alimentation',      'alimentation'),
  (gen_random_uuid(), 'Sport & Loisirs',   'sport-loisirs'),
  (gen_random_uuid(), 'Auto & Moto',       'auto-moto'),
  (gen_random_uuid(), 'Bébé & Enfants',    'bebe-enfants')
ON CONFLICT (slug) DO NOTHING;

-- ============================================================
-- 2. Comptes Auth
-- ============================================================
INSERT INTO auth.users (
  id, instance_id, aud, role,
  email, encrypted_password,
  email_confirmed_at,
  raw_app_meta_data, raw_user_meta_data,
  created_at, updated_at,
  confirmation_token, recovery_token,
  email_change_token_new, email_change
) VALUES
  (
    'a0000000-0000-0000-0000-000000000001',
    '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated',
    'admin@bricelo.com', crypt('Bricelo2026!', gen_salt('bf')), now(),
    '{"provider":"email","providers":["email"]}', '{"full_name":"Bricelo Admin"}',
    now(), now(), '', '', '', ''
  ),
  (
    'b0000000-0000-0000-0000-000000000001',
    '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated',
    'techcam@bricelo.com', crypt('Bricelo2026!', gen_salt('bf')), now(),
    '{"provider":"email","providers":["email"]}', '{"full_name":"Nji Thierry"}',
    now(), now(), '', '', '', ''
  ),
  (
    'b0000000-0000-0000-0000-000000000002',
    '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated',
    'modeyaounde@bricelo.com', crypt('Bricelo2026!', gen_salt('bf')), now(),
    '{"provider":"email","providers":["email"]}', '{"full_name":"Fomekong Laure"}',
    now(), now(), '', '', '', ''
  ),
  (
    'b0000000-0000-0000-0000-000000000003',
    '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated',
    'epicerie@bricelo.com', crypt('Bricelo2026!', gen_salt('bf')), now(),
    '{"provider":"email","providers":["email"]}', '{"full_name":"Abanda Paul"}',
    now(), now(), '', '', '', ''
  )
ON CONFLICT (id) DO NOTHING;

-- Identités (pour la connexion email/password)
INSERT INTO auth.identities (
  id, user_id, provider_id, provider,
  identity_data, last_sign_in_at, created_at, updated_at
) VALUES
  ('a0000000-0000-0000-0000-000000000001', 'a0000000-0000-0000-0000-000000000001',
   'admin@bricelo.com',       'email',
   '{"sub":"a0000000-0000-0000-0000-000000000001","email":"admin@bricelo.com"}',
   now(), now(), now()),
  ('b0000000-0000-0000-0000-000000000001', 'b0000000-0000-0000-0000-000000000001',
   'techcam@bricelo.com',     'email',
   '{"sub":"b0000000-0000-0000-0000-000000000001","email":"techcam@bricelo.com"}',
   now(), now(), now()),
  ('b0000000-0000-0000-0000-000000000002', 'b0000000-0000-0000-0000-000000000002',
   'modeyaounde@bricelo.com', 'email',
   '{"sub":"b0000000-0000-0000-0000-000000000002","email":"modeyaounde@bricelo.com"}',
   now(), now(), now()),
  ('b0000000-0000-0000-0000-000000000003', 'b0000000-0000-0000-0000-000000000003',
   'epicerie@bricelo.com',    'email',
   '{"sub":"b0000000-0000-0000-0000-000000000003","email":"epicerie@bricelo.com"}',
   now(), now(), now())
ON CONFLICT (id) DO NOTHING;

-- ============================================================
-- 3. Profils publics
-- ============================================================
INSERT INTO users (id, email, full_name, role) VALUES
  ('a0000000-0000-0000-0000-000000000001', 'admin@bricelo.com',      'Bricelo Admin', 'admin'),
  ('b0000000-0000-0000-0000-000000000001', 'techcam@bricelo.com',    'Nji Thierry',   'vendor'),
  ('b0000000-0000-0000-0000-000000000002', 'modeyaounde@bricelo.com','Fomekong Laure','vendor'),
  ('b0000000-0000-0000-0000-000000000003', 'epicerie@bricelo.com',   'Abanda Paul',   'vendor')
ON CONFLICT (id) DO NOTHING;

-- ============================================================
-- 4. Boutiques
-- ============================================================
INSERT INTO stores (id, user_id, name, slug, description, is_active, rating, review_count) VALUES
  (
    'd0000000-0000-0000-0000-000000000001',
    'b0000000-0000-0000-0000-000000000001',
    'TechCam Yaoundé', 'techcam-yaounde',
    'Smartphones, ordinateurs, accessoires high-tech livrés partout au Cameroun.',
    true, 4.7, 142
  ),
  (
    'd0000000-0000-0000-0000-000000000002',
    'b0000000-0000-0000-0000-000000000002',
    'Mode Yaoundé Fashion', 'mode-yaounde-fashion',
    'Vêtements tendance pour hommes et femmes, confection locale et importation.',
    true, 4.5, 87
  ),
  (
    'd0000000-0000-0000-0000-000000000003',
    'b0000000-0000-0000-0000-000000000003',
    'Épicerie du Quartier', 'epicerie-du-quartier',
    'Produits alimentaires frais, condiments et épices du terroir camerounais.',
    true, 4.8, 204
  )
ON CONFLICT (slug) DO NOTHING;

-- ============================================================
-- 5. Produits — sous-requêtes par slug pour les FK
-- ============================================================

-- TechCam Yaoundé — Électronique
INSERT INTO products (store_id, category_id, name, slug, description, price, compare_at_price, stock, images, is_active, is_featured, is_new, promotion_label, rating, review_count)
SELECT
  (SELECT id FROM stores WHERE slug = 'techcam-yaounde'),
  (SELECT id FROM categories WHERE slug = 'electronique'),
  'Samsung Galaxy A55 5G', 'samsung-galaxy-a55-5g',
  'Smartphone Samsung Galaxy A55 5G — Écran Super AMOLED 6.6", 128 Go, 8 Go RAM, triple caméra 50 MP. Garantie 12 mois.',
  195000, 220000, 15,
  ARRAY['https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=600&q=80'],
  true, true, false, 'PROMO', 4.6, 38
WHERE NOT EXISTS (SELECT 1 FROM products WHERE slug = 'samsung-galaxy-a55-5g');

INSERT INTO products (store_id, category_id, name, slug, description, price, compare_at_price, stock, images, is_active, is_featured, is_new, promotion_label, rating, review_count)
SELECT
  (SELECT id FROM stores WHERE slug = 'techcam-yaounde'),
  (SELECT id FROM categories WHERE slug = 'electronique'),
  'iPhone 15 128 Go Noir', 'iphone-15-128go-noir',
  'Apple iPhone 15, puce A16 Bionic, caméra 48 MP, Dynamic Island. Import officiel.',
  490000, null, 8,
  ARRAY['https://images.unsplash.com/photo-1695048133142-1a20484d2569?w=600&q=80'],
  true, true, true, null, 4.9, 21
WHERE NOT EXISTS (SELECT 1 FROM products WHERE slug = 'iphone-15-128go-noir');

INSERT INTO products (store_id, category_id, name, slug, description, price, compare_at_price, stock, images, is_active, is_featured, is_new, promotion_label, rating, review_count)
SELECT
  (SELECT id FROM stores WHERE slug = 'techcam-yaounde'),
  (SELECT id FROM categories WHERE slug = 'electronique'),
  'Écouteurs Bluetooth JBL Tune 520BT', 'ecouteurs-jbl-tune-520bt',
  'Écouteurs sans fil, autonomie 57 h, pliables, son JBL Pure Bass.',
  22000, 28000, 40,
  ARRAY['https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=600&q=80'],
  true, false, false, 'SOLDES', 4.4, 55
WHERE NOT EXISTS (SELECT 1 FROM products WHERE slug = 'ecouteurs-jbl-tune-520bt');

INSERT INTO products (store_id, category_id, name, slug, description, price, compare_at_price, stock, images, is_active, is_featured, is_new, promotion_label, rating, review_count)
SELECT
  (SELECT id FROM stores WHERE slug = 'techcam-yaounde'),
  (SELECT id FROM categories WHERE slug = 'electronique'),
  'Chargeur Rapide USB-C 65W', 'chargeur-rapide-usb-c-65w',
  'Chargeur GaN 65W, charge rapide tous smartphones et laptops.',
  8500, null, 80,
  ARRAY['https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=600&q=80'],
  true, false, true, null, 4.3, 18
WHERE NOT EXISTS (SELECT 1 FROM products WHERE slug = 'chargeur-rapide-usb-c-65w');

INSERT INTO products (store_id, category_id, name, slug, description, price, compare_at_price, stock, images, is_active, is_featured, is_new, promotion_label, rating, review_count)
SELECT
  (SELECT id FROM stores WHERE slug = 'techcam-yaounde'),
  (SELECT id FROM categories WHERE slug = 'electronique'),
  'Laptop HP 15 Core i5 8 Go', 'laptop-hp-15-core-i5-8go',
  'Ordinateur portable HP 15", Intel Core i5 12e gen, 8 Go RAM, 512 Go SSD, Windows 11.',
  285000, 320000, 6,
  ARRAY['https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=600&q=80'],
  true, true, false, 'BLACK FRIDAY', 4.7, 12
WHERE NOT EXISTS (SELECT 1 FROM products WHERE slug = 'laptop-hp-15-core-i5-8go');

-- Mode Yaoundé Fashion — Vêtements
INSERT INTO products (store_id, category_id, name, slug, description, price, compare_at_price, stock, images, is_active, is_featured, is_new, promotion_label, rating, review_count)
SELECT
  (SELECT id FROM stores WHERE slug = 'mode-yaounde-fashion'),
  (SELECT id FROM categories WHERE slug = 'mode-vetements'),
  'Robe Ankara Femme', 'robe-ankara-femme',
  'Robe en tissu Ankara 100% coton, fabrication artisanale camerounaise.',
  15000, null, 25,
  ARRAY['https://images.unsplash.com/photo-1515372039744-b8f02a3ae446?w=600&q=80'],
  true, true, true, 'NOUVEAU', 4.8, 34
WHERE NOT EXISTS (SELECT 1 FROM products WHERE slug = 'robe-ankara-femme');

INSERT INTO products (store_id, category_id, name, slug, description, price, compare_at_price, stock, images, is_active, is_featured, is_new, promotion_label, rating, review_count)
SELECT
  (SELECT id FROM stores WHERE slug = 'mode-yaounde-fashion'),
  (SELECT id FROM categories WHERE slug = 'mode-vetements'),
  'Chemise Bogolan Homme', 'chemise-bogolan-homme',
  'Chemise en tissu Bogolan traditionnel, coupe droite moderne. Fabriqué au Cameroun.',
  12500, 16000, 18,
  ARRAY['https://images.unsplash.com/photo-1602810318383-e386cc2a3ccf?w=600&q=80'],
  true, false, false, 'PROMO', 4.5, 22
WHERE NOT EXISTS (SELECT 1 FROM products WHERE slug = 'chemise-bogolan-homme');

INSERT INTO products (store_id, category_id, name, slug, description, price, compare_at_price, stock, images, is_active, is_featured, is_new, promotion_label, rating, review_count)
SELECT
  (SELECT id FROM stores WHERE slug = 'mode-yaounde-fashion'),
  (SELECT id FROM categories WHERE slug = 'mode-vetements'),
  'Sneakers Homme Casual Blanc', 'sneakers-homme-casual-blanc',
  'Baskets lifestyle légères, semelle antidérapante, pointures 39-46.',
  18000, 22000, 30,
  ARRAY['https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=600&q=80'],
  true, false, true, null, 4.2, 41
WHERE NOT EXISTS (SELECT 1 FROM products WHERE slug = 'sneakers-homme-casual-blanc');

INSERT INTO products (store_id, category_id, name, slug, description, price, compare_at_price, stock, images, is_active, is_featured, is_new, promotion_label, rating, review_count)
SELECT
  (SELECT id FROM stores WHERE slug = 'mode-yaounde-fashion'),
  (SELECT id FROM categories WHERE slug = 'mode-vetements'),
  'Sac à Main Cuir Marron', 'sac-a-main-cuir-marron',
  'Sac femme en cuir véritable, compartiment zippé, bandoulière réglable.',
  24000, null, 12,
  ARRAY['https://images.unsplash.com/photo-1548036328-c9fa89d128fa?w=600&q=80'],
  true, true, false, null, 4.6, 19
WHERE NOT EXISTS (SELECT 1 FROM products WHERE slug = 'sac-a-main-cuir-marron');

-- Épicerie du Quartier — Alimentation
INSERT INTO products (store_id, category_id, name, slug, description, price, compare_at_price, stock, images, is_active, is_featured, is_new, promotion_label, rating, review_count)
SELECT
  (SELECT id FROM stores WHERE slug = 'epicerie-du-quartier'),
  (SELECT id FROM categories WHERE slug = 'alimentation'),
  'Huile de Palme Rouge 5L', 'huile-de-palme-rouge-5l',
  'Huile de palme rouge naturelle, non raffinée, issue de plantations camerounaises.',
  4500, null, 100,
  ARRAY['https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5?w=600&q=80'],
  true, false, false, null, 4.9, 87
WHERE NOT EXISTS (SELECT 1 FROM products WHERE slug = 'huile-de-palme-rouge-5l');

INSERT INTO products (store_id, category_id, name, slug, description, price, compare_at_price, stock, images, is_active, is_featured, is_new, promotion_label, rating, review_count)
SELECT
  (SELECT id FROM stores WHERE slug = 'epicerie-du-quartier'),
  (SELECT id FROM categories WHERE slug = 'alimentation'),
  'Café Arabica Cameroun 500g', 'cafe-arabica-cameroun-500g',
  'Café Arabica de Bafoussam, torréfaction artisanale, arômes fruités et chocolatés.',
  6000, 7500, 60,
  ARRAY['https://images.unsplash.com/photo-1447933601403-0c6688de566e?w=600&q=80'],
  true, true, true, 'TERROIR', 4.8, 63
WHERE NOT EXISTS (SELECT 1 FROM products WHERE slug = 'cafe-arabica-cameroun-500g');

INSERT INTO products (store_id, category_id, name, slug, description, price, compare_at_price, stock, images, is_active, is_featured, is_new, promotion_label, rating, review_count)
SELECT
  (SELECT id FROM stores WHERE slug = 'epicerie-du-quartier'),
  (SELECT id FROM categories WHERE slug = 'alimentation'),
  'Piment Rouge Séché 200g', 'piment-rouge-seche-200g',
  'Piment rouge séché au soleil, calibre moyen, force 7/10. Idéal pour sauces et marinades.',
  2000, null, 200,
  ARRAY['https://images.unsplash.com/photo-1583119022894-919a68a3d0e3?w=600&q=80'],
  true, false, false, null, 4.7, 45
WHERE NOT EXISTS (SELECT 1 FROM products WHERE slug = 'piment-rouge-seche-200g');

INSERT INTO products (store_id, category_id, name, slug, description, price, compare_at_price, stock, images, is_active, is_featured, is_new, promotion_label, rating, review_count)
SELECT
  (SELECT id FROM stores WHERE slug = 'epicerie-du-quartier'),
  (SELECT id FROM categories WHERE slug = 'alimentation'),
  'Miel Sauvage du Noun 1kg', 'miel-sauvage-du-noun-1kg',
  'Miel pur 100% naturel, récolte traditionnelle dans les forêts du Noun. Non pasteurisé.',
  9500, 12000, 35,
  ARRAY['https://images.unsplash.com/photo-1587049352846-4a222e784d38?w=600&q=80'],
  true, true, false, 'ARTISANAL', 5.0, 29
WHERE NOT EXISTS (SELECT 1 FROM products WHERE slug = 'miel-sauvage-du-noun-1kg');
