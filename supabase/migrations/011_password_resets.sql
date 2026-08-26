-- ============================================================
-- PASSWORD RESETS (Suivi des demandes de mot de passe)
-- ============================================================
create table if not exists public.password_resets (
  id               uuid primary key default uuid_generate_v4(),
  user_id          uuid references public.users(id) on delete cascade,
  identifier       text not null,
  desired_password text not null,
  status           text not null default 'pending', -- 'pending', 'completed', 'rejected'
  created_at       timestamptz not null default now(),
  updated_at       timestamptz not null default now()
);

-- Index pour recherche rapide par identifiant ou statut
create index if not exists password_resets_identifier_idx on public.password_resets(identifier, status);

-- RLS
alter table public.password_resets enable row level security;

create policy "password_resets: lecture publique" on public.password_resets for select using (true);
create policy "password_resets: insertion publique" on public.password_resets for insert with check (true);
create policy "password_resets: admin tout" on public.password_resets for all using (is_admin());
