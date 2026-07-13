-- ============================================================
-- CURSOS — Cultura Unificada
-- Execute no Supabase > SQL Editor
-- ============================================================

create table if not exists public.cursos (
  id              uuid        primary key default gen_random_uuid(),
  created_at      timestamptz default now(),
  titulo          text        not null,
  descricao       text        not null,
  categoria       text        not null default 'Geral',
  nivel           text        not null default 'Todos os níveis'
    check (nivel in ('Iniciante', 'Intermediário', 'Avançado', 'Todos os níveis')),
  formato         text        not null default 'Online'
    check (formato in ('Online', 'Presencial', 'Híbrido')),
  carga_horaria   text,
  instituicao     text,
  link_inscricao  text,
  gratuito        boolean     not null default true,
  prazo_inscricao date,
  ativo           boolean     not null default true
);

alter table public.cursos enable row level security;

-- Qualquer um pode ver cursos ativos
create policy "Cursos ativos são públicos"
  on public.cursos for select
  using (ativo = true);

-- Admins veem todos
create policy "Admins veem todos os cursos"
  on public.cursos for select
  using (
    exists (
      select 1 from public.perfis
      where perfis.id = auth.uid()
        and perfis.role in ('admin', 'super_admin')
    )
  );

-- Só admins cadastram/editam/apagam
create policy "Admins gerenciam cursos"
  on public.cursos for insert
  with check (
    exists (
      select 1 from public.perfis
      where perfis.id = auth.uid()
        and perfis.role in ('admin', 'super_admin')
    )
  );

create policy "Admins atualizam cursos"
  on public.cursos for update
  using (
    exists (
      select 1 from public.perfis
      where perfis.id = auth.uid()
        and perfis.role in ('admin', 'super_admin')
    )
  );

create policy "Admins apagam cursos"
  on public.cursos for delete
  using (
    exists (
      select 1 from public.perfis
      where perfis.id = auth.uid()
        and perfis.role in ('admin', 'super_admin')
    )
  );

-- Dados de exemplo
insert into public.cursos (titulo, descricao, categoria, nivel, formato, carga_horaria, instituicao, link_inscricao, gratuito) values
  ('Gestão Cultural para Iniciantes', 'Aprenda os fundamentos da gestão cultural: editais, financiamento, produção e comunicação de projetos culturais.', 'Gestão Cultural', 'Iniciante', 'Online', '20h', 'Cultura Unificada', null, true),
  ('Como Montar um Projeto Cultural', 'Passo a passo para elaborar projetos culturais sólidos e competitivos para editais públicos e privados.', 'Produção Cultural', 'Iniciante', 'Online', '12h', 'Cultura Unificada', null, true),
  ('Direitos do Artista', 'Entenda seus direitos autorais, contratos, cachês e como formalizar sua carreira artística.', 'Legislação', 'Todos os níveis', 'Online', '8h', 'Cultura Unificada', null, true);
