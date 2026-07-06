-- ====================================================================
-- Cultura Unificada — Migração Admin v2
-- ====================================================================
-- Execute no SQL Editor do Supabase (uma vez só).
-- Pré-requisito: migration_roles.sql já deve ter sido executado.
-- ====================================================================

-- ──────────────────────────────────────────────────────────────────────
-- 1. Coluna "banido" na tabela perfis
-- ──────────────────────────────────────────────────────────────────────
ALTER TABLE public.perfis
  ADD COLUMN IF NOT EXISTS banido boolean NOT NULL DEFAULT false;

COMMENT ON COLUMN public.perfis.banido IS 'Usuário banido não pode adicionar conteúdo nem acessar áreas restritas.';

-- ──────────────────────────────────────────────────────────────────────
-- 2. Função para deletar usuário completo (admin/super_admin only)
--    Deleta em auth.users — cascata cuida do resto (perfis, eventos, etc.)
-- ──────────────────────────────────────────────────────────────────────
CREATE OR REPLACE FUNCTION public.delete_user(target_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Só admin ou super_admin pode chamar isso
  IF NOT EXISTS (
    SELECT 1 FROM public.perfis
    WHERE id = auth.uid() AND role IN ('admin', 'super_admin')
  ) THEN
    RAISE EXCEPTION 'Acesso negado.';
  END IF;

  -- Super_admin não pode ser deletado por admin comum
  IF EXISTS (
    SELECT 1 FROM public.perfis
    WHERE id = target_id AND role = 'super_admin'
  ) AND NOT EXISTS (
    SELECT 1 FROM public.perfis
    WHERE id = auth.uid() AND role = 'super_admin'
  ) THEN
    RAISE EXCEPTION 'Apenas super_admin pode deletar outro super_admin.';
  END IF;

  DELETE FROM auth.users WHERE id = target_id;
END;
$$;

-- ──────────────────────────────────────────────────────────────────────
-- 3. Admin pode editar qualquer perfil de artista
-- ──────────────────────────────────────────────────────────────────────
DROP POLICY IF EXISTS "artistas_update_proprio" ON public.artistas;
CREATE POLICY "artistas_update_proprio_ou_admin" ON public.artistas
  FOR UPDATE USING (
    auth.uid() = id OR public.is_admin()
  );

-- ──────────────────────────────────────────────────────────────────────
-- 4. Bloquear usuários banidos de inserir conteúdo
-- ──────────────────────────────────────────────────────────────────────
CREATE OR REPLACE FUNCTION public.nao_esta_banido()
RETURNS boolean
LANGUAGE sql STABLE
AS $$
  SELECT NOT EXISTS (
    SELECT 1 FROM public.perfis
    WHERE id = auth.uid() AND banido = true
  );
$$;

-- Recria políticas de INSERT bloqueando banidos
DROP POLICY IF EXISTS "eventos_insert_logado" ON public.eventos;
CREATE POLICY "eventos_insert_logado" ON public.eventos
  FOR INSERT WITH CHECK (auth.uid() = user_id AND public.nao_esta_banido());

DROP POLICY IF EXISTS "editais_insert_logado" ON public.editais;
CREATE POLICY "editais_insert_logado" ON public.editais
  FOR INSERT WITH CHECK (auth.uid() = user_id AND public.nao_esta_banido());

DROP POLICY IF EXISTS "projetos_insert_logado" ON public.projetos_mapa;
CREATE POLICY "projetos_insert_logado" ON public.projetos_mapa
  FOR INSERT WITH CHECK (auth.uid() = user_id AND public.nao_esta_banido());

-- ──────────────────────────────────────────────────────────────────────
-- 5. Atualiza get_users_for_admin para incluir campo banido
-- ──────────────────────────────────────────────────────────────────────
CREATE OR REPLACE FUNCTION public.get_users_for_admin()
RETURNS TABLE (
  id         uuid,
  email      text,
  role       text,
  banido     boolean,
  created_at timestamptz
)
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT p.id, u.email, p.role, p.banido, p.created_at
  FROM public.perfis p
  JOIN auth.users u ON p.id = u.id
  ORDER BY
    CASE p.role
      WHEN 'super_admin' THEN 1
      WHEN 'admin'       THEN 2
      ELSE                    3
    END,
    p.created_at ASC;
$$;

-- ====================================================================
-- Pronto! Agora:
--   • Admins podem editar perfis de qualquer artista
--   • Super_admin pode banir e deletar usuários
--   • Usuários banidos não conseguem postar conteúdo
-- ====================================================================
