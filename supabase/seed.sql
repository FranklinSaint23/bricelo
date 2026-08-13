-- ============================================================
-- BRICELO — Données de démo
-- ============================================================

-- Catégories racines
insert into categories (name, slug, description) values
  ('Électronique',      'electronique',     'Smartphones, ordinateurs, accessoires tech'),
  ('Mode & Vêtements',  'mode-vetements',   'Vêtements, chaussures, accessoires de mode'),
  ('Maison & Cuisine',  'maison-cuisine',   'Décoration, électroménager, cuisine'),
  ('Beauté & Santé',    'beaute-sante',     'Cosmétiques, soins, bien-être'),
  ('Sport & Loisirs',   'sport-loisirs',    'Équipement sportif, jeux, outdoor'),
  ('Alimentation',      'alimentation',     'Épicerie, boissons, produits frais'),
  ('Bébé & Enfants',    'bebe-enfants',     'Jouets, vêtements enfants, puériculture'),
  ('Auto & Moto',       'auto-moto',        'Pièces, accessoires, entretien')
on conflict (slug) do nothing;

-- Sous-catégories Électronique
insert into categories (name, slug, parent_id)
select 'Smartphones', 'smartphones', id from categories where slug = 'electronique'
on conflict (slug) do nothing;

insert into categories (name, slug, parent_id)
select 'Ordinateurs', 'ordinateurs', id from categories where slug = 'electronique'
on conflict (slug) do nothing;

insert into categories (name, slug, parent_id)
select 'Accessoires tech', 'accessoires-tech', id from categories where slug = 'electronique'
on conflict (slug) do nothing;
