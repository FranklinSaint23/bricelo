-- ============================================================
-- BRICELO — Functions & Triggers
-- ============================================================

-- Créer automatiquement un profil user à l'inscription
create or replace function handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into public.users (id, email, full_name, avatar_url)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data->>'full_name', split_part(new.email, '@', 1)),
    new.raw_user_meta_data->>'avatar_url'
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

create or replace trigger on_auth_user_created
  after insert on auth.users
  for each row execute function handle_new_user();

-- Mettre à jour updated_at automatiquement
create or replace function set_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger users_updated_at   before update on users   for each row execute function set_updated_at();
create trigger stores_updated_at  before update on stores  for each row execute function set_updated_at();
create trigger products_updated_at before update on products for each row execute function set_updated_at();
create trigger orders_updated_at  before update on orders  for each row execute function set_updated_at();
create trigger payments_updated_at before update on payments for each row execute function set_updated_at();

-- Recalculer la note moyenne d'un produit après un avis
create or replace function update_product_rating()
returns trigger language plpgsql security definer as $$
begin
  update products
  set
    rating       = (select coalesce(avg(rating), 0) from reviews where product_id = coalesce(new.product_id, old.product_id) and is_visible = true),
    review_count = (select count(*) from reviews where product_id = coalesce(new.product_id, old.product_id) and is_visible = true)
  where id = coalesce(new.product_id, old.product_id);
  return null;
end;
$$;

create trigger after_review_change
  after insert or update or delete on reviews
  for each row execute function update_product_rating();

-- Recalculer la note de la boutique
create or replace function update_store_rating()
returns trigger language plpgsql security definer as $$
declare
  v_store_id uuid;
begin
  select store_id into v_store_id from products where id = coalesce(new.product_id, old.product_id);
  update stores
  set
    rating       = (select coalesce(avg(r.rating), 0) from reviews r join products p on p.id = r.product_id where p.store_id = v_store_id and r.is_visible = true),
    review_count = (select count(*) from reviews r join products p on p.id = r.product_id where p.store_id = v_store_id and r.is_visible = true)
  where id = v_store_id;
  return null;
end;
$$;

create trigger after_review_store
  after insert or update or delete on reviews
  for each row execute function update_store_rating();

-- S'assurer qu'une seule adresse par défaut par user
create or replace function ensure_single_default_address()
returns trigger language plpgsql as $$
begin
  if new.is_default then
    update addresses set is_default = false
    where user_id = new.user_id and id <> new.id;
  end if;
  return new;
end;
$$;

create trigger single_default_address
  before insert or update on addresses
  for each row execute function ensure_single_default_address();

-- Créer une notification pour les changements de statut de commande
create or replace function notify_order_status_change()
returns trigger language plpgsql security definer as $$
declare
  v_msg text;
begin
  if old.status = new.status then return new; end if;
  case new.status
    when 'confirmed'  then v_msg := 'Votre commande a été confirmée.';
    when 'preparing'  then v_msg := 'Votre commande est en cours de préparation.';
    when 'shipped'    then v_msg := 'Votre commande a été expédiée.';
    when 'delivered'  then v_msg := 'Votre commande a été livrée. Merci !';
    when 'cancelled'  then v_msg := 'Votre commande a été annulée.';
    else v_msg := 'Le statut de votre commande a changé.';
  end case;
  insert into notifications (user_id, title, body, type)
  values (new.user_id, 'Mise à jour de commande', v_msg, 'order');
  return new;
end;
$$;

create trigger order_status_notification
  after update on orders
  for each row execute function notify_order_status_change();
