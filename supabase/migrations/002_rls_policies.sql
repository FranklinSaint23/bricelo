-- ============================================================
-- BRICELO — Row Level Security (RLS)
-- ============================================================

-- Activer RLS sur toutes les tables
alter table users             enable row level security;
alter table addresses         enable row level security;
alter table categories        enable row level security;
alter table stores            enable row level security;
alter table products          enable row level security;
alter table product_variants  enable row level security;
alter table cart_items        enable row level security;
alter table orders            enable row level security;
alter table order_items       enable row level security;
alter table payments          enable row level security;
alter table reviews           enable row level security;
alter table notifications     enable row level security;
alter table ai_conversations  enable row level security;
alter table ai_messages       enable row level security;
alter table audit_logs        enable row level security;

-- Helpers
create or replace function is_admin()
returns boolean language sql security definer stable as $$
  select exists (select 1 from users where id = auth.uid() and role = 'admin')
$$;

create or replace function is_vendor()
returns boolean language sql security definer stable as $$
  select exists (select 1 from users where id = auth.uid() and role in ('vendor', 'admin'))
$$;

create or replace function owns_store(store_id uuid)
returns boolean language sql security definer stable as $$
  select exists (select 1 from stores where id = store_id and user_id = auth.uid())
$$;

-- ============================================================
-- USERS
-- ============================================================
create policy "users: lecture profil propre" on users for select
  using (id = auth.uid() or is_admin());

create policy "users: mise à jour profil propre" on users for update
  using (id = auth.uid()) with check (id = auth.uid());

create policy "users: insertion par trigger" on users for insert
  with check (id = auth.uid());

create policy "users: admin tout" on users for all
  using (is_admin());

-- ============================================================
-- ADDRESSES
-- ============================================================
create policy "addresses: crud propre" on addresses for all
  using (user_id = auth.uid()) with check (user_id = auth.uid());

create policy "addresses: admin lecture" on addresses for select
  using (is_admin());

-- ============================================================
-- CATEGORIES (publiques en lecture)
-- ============================================================
create policy "categories: lecture publique" on categories for select using (true);
create policy "categories: admin gestion" on categories for all using (is_admin());

-- ============================================================
-- STORES
-- ============================================================
create policy "stores: lecture publique active" on stores for select
  using (is_active = true or user_id = auth.uid() or is_admin());

create policy "stores: vendeur gère sa boutique" on stores for update
  using (user_id = auth.uid()) with check (user_id = auth.uid());

create policy "stores: création par vendeur" on stores for insert
  with check (user_id = auth.uid() and is_vendor());

create policy "stores: admin tout" on stores for all using (is_admin());

-- ============================================================
-- PRODUCTS
-- ============================================================
create policy "products: lecture publique active" on products for select
  using (is_active = true or owns_store(store_id) or is_admin());

create policy "products: vendeur gère ses produits" on products for insert
  with check (owns_store(store_id));

create policy "products: vendeur update" on products for update
  using (owns_store(store_id));

create policy "products: vendeur delete" on products for delete
  using (owns_store(store_id));

create policy "products: admin tout" on products for all using (is_admin());

-- ============================================================
-- PRODUCT VARIANTS
-- ============================================================
create policy "variants: lecture publique" on product_variants for select using (true);

create policy "variants: vendeur gère" on product_variants for all
  using (exists (select 1 from products p where p.id = product_id and owns_store(p.store_id)));

create policy "variants: admin tout" on product_variants for all using (is_admin());

-- ============================================================
-- CART
-- ============================================================
create policy "cart: crud propre" on cart_items for all
  using (user_id = auth.uid()) with check (user_id = auth.uid());

-- ============================================================
-- ORDERS
-- ============================================================
create policy "orders: client voit ses commandes" on orders for select
  using (user_id = auth.uid() or owns_store(store_id) or is_admin());

create policy "orders: client crée" on orders for insert
  with check (user_id = auth.uid());

create policy "orders: vendeur/admin update statut" on orders for update
  using (owns_store(store_id) or is_admin());

create policy "orders: admin tout" on orders for all using (is_admin());

-- ============================================================
-- ORDER ITEMS
-- ============================================================
create policy "order_items: lecture via commande" on order_items for select
  using (
    exists (select 1 from orders o where o.id = order_id
      and (o.user_id = auth.uid() or owns_store(o.store_id) or is_admin()))
  );

create policy "order_items: création" on order_items for insert
  with check (exists (select 1 from orders o where o.id = order_id and o.user_id = auth.uid()));

-- ============================================================
-- PAYMENTS
-- ============================================================
create policy "payments: client voit ses paiements" on payments for select
  using (
    exists (select 1 from orders o where o.id = order_id
      and (o.user_id = auth.uid() or is_admin()))
  );

-- Les insertions/updates se font uniquement via service_role (webhook)

-- ============================================================
-- REVIEWS
-- ============================================================
create policy "reviews: lecture publique" on reviews for select using (is_visible = true or user_id = auth.uid() or is_admin());
create policy "reviews: client crée après achat" on reviews for insert with check (user_id = auth.uid());
create policy "reviews: client modifie le sien" on reviews for update using (user_id = auth.uid());
create policy "reviews: admin tout" on reviews for all using (is_admin());

-- ============================================================
-- NOTIFICATIONS
-- ============================================================
create policy "notifications: propres" on notifications for select using (user_id = auth.uid());
create policy "notifications: mark read" on notifications for update using (user_id = auth.uid());

-- ============================================================
-- AI CONVERSATIONS
-- ============================================================
create policy "ai_conversations: propres" on ai_conversations for all
  using (user_id = auth.uid() or user_id is null);

create policy "ai_messages: propres" on ai_messages for all
  using (
    exists (select 1 from ai_conversations c where c.id = conversation_id
      and (c.user_id = auth.uid() or c.user_id is null))
  );

-- ============================================================
-- AUDIT LOGS (admin seulement)
-- ============================================================
create policy "audit_logs: admin lecture" on audit_logs for select using (is_admin());
