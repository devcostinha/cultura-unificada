-- ============================================================
-- SUGESTÕES — Cultura Unificada
-- Execute este SQL no Supabase > SQL Editor
-- ============================================================

-- Tabela
create table if not exists public.sugestoes (
  id          uuid primary key default gen_random_uuid(),
  created_at  timestamptz      default now(),
  user_id     uuid             references auth.users(id) on delete set null,
  nome        text,
  email       text,
  categoria   text             not null default 'Outro',
  titulo      text             not null,
  descricao   text             not null,
  status      text             not null default 'nova'
    check (status in ('nova', 'lida', 'em_analise', 'feita'))
);

-- RLS
alter table public.sugestoes enable row level security;

-- Qualquer pessoa (logada ou não) pode enviar sugestão
create policy "Qualquer um pode enviar sugestão"
  on public.sugestoes for insert
  with check (true);

-- Só admin e super_admin podem ler
create policy "Admins podem ler sugestões"
  on public.sugestoes for select
  using (
    exists (
      select 1 from public.perfis
      where perfis.id = auth.uid()
        and perfis.role in ('admin', 'super_admin')
    )
  );

-- Só admin e super_admin podem atualizar status
create policy "Admins podem atualizar sugestões"
  on public.sugestoes for update
  using (
    exists (
      select 1 from public.perfis
      where perfis.id = auth.uid()
        and perfis.role in ('admin', 'super_admin')
    )
  );
