-- ============================================================
-- BRICELO — Schéma initial PostgreSQL
-- ============================================================

-- Extensions
create extension if not exists "uuid-ossp";
create extension if not exists "pg_trgm";

-- ============================================================
-- TYPES ENUM
-- ============================================================
create type user_role      as enum ('customer', 'vendor', 'admin', 'support');
create type order_status   as enum ('pending', 'confirmed', 'preparing', 'shipped', 'delivered', 'cancelled', 'returned');
create type payment_status as enum ('pending', 'success', 'failed', 'cancelled');
create type notif_type     as enum ('order', 'payment', 'system');

-- ============================================================
-- USERS (profil étendu de auth.users)
-- ============================================================
create table users (
  id          uuid primary key references auth.users(id) on delete cascade,
  email       text not null,
  full_name   text,
  avatar_url  text,
  phone       text,
  role        user_role not null default 'customer',
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

-- ============================================================
-- ADDRESSES
-- ============================================================
create table addresses (
  id           uuid primary key default uuid_generate_v4(),
  user_id      uuid not null references users(id) on delete cascade,
  label        text not null default 'Domicile',
  full_name    text not null,
  phone        text not null,
  address_line text not null,
  city         text not null,
  country      text not null default 'Cameroun',
  is_default   boolean not null default false,
  created_at   timestamptz not null default now()
);

-- ============================================================
-- CATEGORIES
-- ============================================================
create table categories (
  id          uuid primary key default uuid_generate_v4(),
  name        text not null,
  slug        text not null unique,
  description text,
  image_url   text,
  parent_id   uuid references categories(id) on delete set null,
  sort_order  int not null default 0,
  created_at  timestamptz not null default now()
);

-- ============================================================
-- STORES (boutiques vendeurs)
-- ============================================================
create table stores (
  id          uuid primary key default uuid_generate_v4(),
  user_id     uuid not null references users(id) on delete cascade,
  name        text not null,
  slug        text not null unique,
  description text,
  logo_url    text,
  banner_url  text,
  rating      numeric(3,2) not null default 0,
  review_count int not null default 0,
  is_active   boolean not null default false,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

-- ============================================================
-- PRODUCTS
-- ============================================================
create table products (
  id               uuid primary key default uuid_generate_v4(),
  store_id         uuid not null references stores(id) on delete cascade,
  category_id      uuid references categories(id) on delete set null,
  name             text not null,
  slug             text not null unique,
  description      text not null default '',
  price            numeric(12,0) not null check (price >= 0),
  compare_at_price numeric(12,0) check (compare_at_price >= 0),
  stock            int not null default 0 check (stock >= 0),
  images           text[] not null default '{}',
  rating           numeric(3,2) not null default 0,
  review_count     int not null default 0,
  is_active        boolean not null default true,
  is_featured      boolean not null default false,
  created_at       timestamptz not null default now(),
  updated_at       timestamptz not null default now()
);

-- Index full-text search
create index products_name_trgm_idx on products using gin(name gin_trgm_ops);
create index products_store_idx on products(store_id);
create index products_category_idx on products(category_id);
create index products_active_idx on products(is_active, is_featured, created_at desc);

-- ============================================================
-- PRODUCT VARIANTS
-- ============================================================
create table product_variants (
  id               uuid primary key default uuid_generate_v4(),
  product_id       uuid not null references products(id) on delete cascade,
  name             text not null,
  value            text not null,
  price_adjustment numeric(12,0) not null default 0,
  stock            int not null default 0 check (stock >= 0),
  sku              text,
  created_at       timestamptz not null default now()
);

-- ============================================================
-- CART
-- ============================================================
create table cart_items (
  id         uuid primary key default uuid_generate_v4(),
  user_id    uuid not null references users(id) on delete cascade,
  product_id uuid not null references products(id) on delete cascade,
  variant_id uuid references product_variants(id) on delete set null,
  quantity   int not null default 1 check (quantity > 0),
  created_at timestamptz not null default now(),
  unique(user_id, product_id, variant_id)
);

create index cart_items_user_idx on cart_items(user_id);

-- ============================================================
-- ORDERS
-- ============================================================
create table orders (
  id               uuid primary key default uuid_generate_v4(),
  user_id          uuid not null references users(id),
  store_id         uuid not null references stores(id),
  status           order_status not null default 'pending',
  subtotal         numeric(12,0) not null,
  shipping_cost    numeric(12,0) not null default 0,
  total            numeric(12,0) not null,
  shipping_address jsonb not null,
  notes            text,
  created_at       timestamptz not null default now(),
  updated_at       timestamptz not null default now()
);

create index orders_user_idx  on orders(user_id, created_at desc);
create index orders_store_idx on orders(store_id, created_at desc);
create index orders_status_idx on orders(status);

-- ============================================================
-- ORDER ITEMS
-- ============================================================
create table order_items (
  id          uuid primary key default uuid_generate_v4(),
  order_id    uuid not null references orders(id) on delete cascade,
  product_id  uuid not null references products(id),
  variant_id  uuid references product_variants(id),
  quantity    int not null check (quantity > 0),
  unit_price  numeric(12,0) not null,
  total_price numeric(12,0) not null,
  snapshot    jsonb not null  -- copie du produit au moment de la commande
);

create index order_items_order_idx on order_items(order_id);

-- ============================================================
-- PAYMENTS
-- ============================================================
create table payments (
  id              uuid primary key default uuid_generate_v4(),
  order_id        uuid not null references orders(id),
  transaction_ref text not null unique,
  amount          numeric(12,0) not null,
  currency        text not null default 'XAF',
  status          payment_status not null default 'pending',
  provider        text not null default 'cinetpay',
  metadata        jsonb,
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now()
);

create index payments_order_idx on payments(order_id);
create index payments_ref_idx   on payments(transaction_ref);

-- ============================================================
-- REVIEWS
-- ============================================================
create table reviews (
  id         uuid primary key default uuid_generate_v4(),
  product_id uuid not null references products(id) on delete cascade,
  user_id    uuid not null references users(id) on delete cascade,
  order_id   uuid not null references orders(id),
  rating     int not null check (rating between 1 and 5),
  comment    text,
  is_visible boolean not null default true,
  created_at timestamptz not null default now(),
  unique(user_id, product_id, order_id)
);

create index reviews_product_idx on reviews(product_id, created_at desc);

-- ============================================================
-- NOTIFICATIONS
-- ============================================================
create table notifications (
  id         uuid primary key default uuid_generate_v4(),
  user_id    uuid not null references users(id) on delete cascade,
  title      text not null,
  body       text not null,
  type       notif_type not null default 'system',
  is_read    boolean not null default false,
  created_at timestamptz not null default now()
);

create index notifications_user_idx on notifications(user_id, is_read, created_at desc);

-- ============================================================
-- AI CONVERSATIONS (Chatbot Groq)
-- ============================================================
create table ai_conversations (
  id         uuid primary key default uuid_generate_v4(),
  user_id    uuid references users(id) on delete set null,
  session_id text not null,
  created_at timestamptz not null default now()
);

create table ai_messages (
  id              uuid primary key default uuid_generate_v4(),
  conversation_id uuid not null references ai_conversations(id) on delete cascade,
  role            text not null check (role in ('user', 'assistant')),
  content         text not null,
  created_at      timestamptz not null default now()
);

create index ai_messages_conv_idx on ai_messages(conversation_id, created_at);

-- ============================================================
-- ADMIN AUDIT LOG
-- ============================================================
create table audit_logs (
  id         uuid primary key default uuid_generate_v4(),
  user_id    uuid references users(id) on delete set null,
  action     text not null,
  entity     text not null,
  entity_id  uuid,
  metadata   jsonb,
  created_at timestamptz not null default now()
);

create index audit_logs_user_idx   on audit_logs(user_id, created_at desc);
create index audit_logs_entity_idx on audit_logs(entity, entity_id);
