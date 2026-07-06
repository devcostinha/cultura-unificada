-- ====================================================================
-- Cultura Unificada — Schema do Supabase
-- ====================================================================
-- Como usar:
-- 1. Crie um projeto em https://supabase.com
-- 2. Abra o "SQL Editor" do projeto
-- 3. Cole e execute este arquivo inteiro de uma vez
-- 4. Copie a "Project URL" e a "anon public key" (Project Settings > API)
--    para o seu arquivo .env.local
-- ====================================================================

create extension if not exists "pgcrypto";

-- --------------------------------------------------------------------
-- TABELA: artistas
-- Cadastro de artistas (1 perfil por usuário autenticado).
-- id = mesmo id do usuário em auth.users (relação 1 para 1).
-- --------------------------------------------------------------------
create table if not exists public.artistas (
  id uuid primary key references auth.users(id) on delete cascade,
  nome_artistico text not null,
  area_atuacao text not null,
  coletivo text,
  telefone text,
  email text,
  regiao_atuacao text not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

comment on table public.artistas is 'Perfis de artistas e agentes culturais cadastrados na plataforma.';

-- --------------------------------------------------------------------
-- TABELA: eventos
-- Calendário Unificado de eventos culturais.
-- --------------------------------------------------------------------
create table if not exists public.eventos (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  titulo text not null,
  descricao text,
  categoria text not null,
  data_evento date not null,
  horario time,
  local text not null,
  bairro text not null,
  link text,
  created_at timestamptz not null default now()
);

comment on table public.eventos is 'Eventos culturais cadastrados no Calendário Unificado.';
comment on column public.eventos.local is 'Nome/endereço do local (texto livre, ex: nome do espaço ou rua).';
comment on column public.eventos.bairro is 'Bairro/subregião da Zona Leste, usado no filtro avançado do calendário.';

-- --------------------------------------------------------------------
-- TABELA: editais
-- Editais abertos organizados por categoria.
-- --------------------------------------------------------------------
create table if not exists public.editais (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  titulo text not null,
  descricao text,
  categoria text not null check (categoria in (
    'Edital Federal',
    'Edital Estadual',
    'Edital Municipal',
    'Edital de Iniciativa Privada'
  )),
  subcategoria text,
  entidade_responsavel text,
  link text,
  prazo date,
  created_at timestamptz not null default now()
);

comment on table public.editais is 'Editais abertos cadastrados por categoria (Federal, Estadual, Municipal, Iniciativa Privada).';

-- --------------------------------------------------------------------
-- TABELA: projetos_mapa
-- Mapeamento Cultural — projetos culturais da Zona Leste.
-- --------------------------------------------------------------------
create table if not exists public.projetos_mapa (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  nome text not null,
  descricao text,
  categoria text not null,
  localidade text not null,
  endereco text,
  latitude double precision not null,
  longitude double precision not null,
  tags text[] not null default '{}',
  created_at timestamptz not null default now()
);

comment on table public.projetos_mapa is 'Projetos culturais mapeados na Zona Leste (Mapeamento Cultural).';

-- --------------------------------------------------------------------
-- ÍNDICES — aceleram filtros usados nas telas de Calendário, Editais e Mapa
-- --------------------------------------------------------------------
create index if not exists idx_eventos_data on public.eventos (data_evento);
create index if not exists idx_eventos_categoria on public.eventos (categoria);
create index if not exists idx_eventos_bairro on public.eventos (bairro);
create index if not exists idx_editais_categoria on public.editais (categoria);
create index if not exists idx_projetos_localidade on public.projetos_mapa (localidade);
create index if not exists idx_projetos_categoria on public.projetos_mapa (categoria);
create index if not exists idx_artistas_area on public.artistas (area_atuacao);
create index if not exists idx_artistas_regiao on public.artistas (regiao_atuacao);

-- --------------------------------------------------------------------
-- ROW LEVEL SECURITY (RLS)
-- Regra geral do projeto: qualquer pessoa pode VER os dados (inclusive
-- visitantes não logados), mas só o próprio usuário pode CRIAR, EDITAR
-- ou EXCLUIR os registros que ele mesmo criou. Não há painel admin de
-- moderação nesta versão — todo conteúdo publica direto.
-- --------------------------------------------------------------------

alter table public.artistas enable row level security;
alter table public.eventos enable row level security;
alter table public.editais enable row level security;
alter table public.projetos_mapa enable row level security;

-- artistas: leitura pública (perfil público do artista), escrita só do próprio
create policy "artistas_select_publico" on public.artistas
  for select using (true);

create policy "artistas_insert_proprio" on public.artistas
  for insert with check (auth.uid() = id);

create policy "artistas_update_proprio" on public.artistas
  for update using (auth.uid() = id);

create policy "artistas_delete_proprio" on public.artistas
  for delete using (auth.uid() = id);

-- eventos: leitura pública (Calendário Unificado visível a todos), escrita só do autor
create policy "eventos_select_publico" on public.eventos
  for select using (true);

create policy "eventos_insert_logado" on public.eventos
  for insert with check (auth.uid() = user_id);

create policy "eventos_update_proprio" on public.eventos
  for update using (auth.uid() = user_id);

create policy "eventos_delete_proprio" on public.eventos
  for delete using (auth.uid() = user_id);

-- editais: leitura pública, escrita por qualquer usuário logado (sem perfil "organizador")
create policy "editais_select_publico" on public.editais
  for select using (true);

create policy "editais_insert_logado" on public.editais
  for insert with check (auth.uid() = user_id);

create policy "editais_update_proprio" on public.editais
  for update using (auth.uid() = user_id);

create policy "editais_delete_proprio" on public.editais
  for delete using (auth.uid() = user_id);

-- projetos_mapa: leitura pública, escrita só do autor
create policy "projetos_select_publico" on public.projetos_mapa
  for select using (true);

create policy "projetos_insert_logado" on public.projetos_mapa
  for insert with check (auth.uid() = user_id);

create policy "projetos_update_proprio" on public.projetos_mapa
  for update using (auth.uid() = user_id);

create policy "projetos_delete_proprio" on public.projetos_mapa
  for delete using (auth.uid() = user_id);

-- --------------------------------------------------------------------
-- REALTIME — ativa replicação para que mudanças apareçam instantaneamente
-- em todos os dispositivos conectados (celular, PC etc.), sem recarregar.
-- --------------------------------------------------------------------
alter publication supabase_realtime add table public.eventos;
alter publication supabase_realtime add table public.editais;
alter publication supabase_realtime add table public.projetos_mapa;
alter publication supabase_realtime add table public.artistas;

-- --------------------------------------------------------------------
-- TRIGGER: mantém updated_at de artistas sempre atualizado
-- --------------------------------------------------------------------
create or replace function public.handle_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

drop trigger if exists set_updated_at on public.artistas;
create trigger set_updated_at
  before update on public.artistas
  for each row execute function public.handle_updated_at();

-- ====================================================================
-- Fim do schema. Pronto para uso pela aplicação Next.js.
-- ====================================================================
