-- ====================================================================
-- Cultura Unificada — Migração: Sistema de Roles (níveis de acesso)
-- ====================================================================
-- Execute no SQL Editor do Supabase (uma vez só).
--
-- Níveis:
--   'user'        → usuário comum: adiciona conteúdo próprio, não apaga de ninguém
--   'admin'       → pode apagar/editar conteúdo de qualquer usuário
--   'super_admin' → pode promover/rebaixar admins + tudo que o admin pode
--
-- Depois de rodar, defina o primeiro super_admin manualmente:
--   UPDATE public.perfis SET role = 'super_admin' WHERE id = '<seu-user-id>';
-- ====================================================================

-- ──────────────────────────────────────────────────────────────────────
-- 1. TABELA DE PERFIS (role por usuário)
-- ──────────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.perfis (
  id          uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  role        text NOT NULL DEFAULT 'user'
                   CHECK (role IN ('user', 'admin', 'super_admin')),
  created_at  timestamptz NOT NULL DEFAULT now()
);

COMMENT ON TABLE public.perfis IS 'Nível de acesso de cada usuário: user, admin ou super_admin.';

-- ──────────────────────────────────────────────────────────────────────
-- 2. TRIGGER — cria perfil automaticamente a cada novo cadastro
-- ──────────────────────────────────────────────────────────────────────
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.perfis (id, role)
  VALUES (NEW.id, 'user')
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Insere perfis para usuários que já existem (retroativo)
INSERT INTO public.perfis (id, role)
SELECT id, 'user' FROM auth.users
ON CONFLICT (id) DO NOTHING;

-- ──────────────────────────────────────────────────────────────────────
-- 3. RLS NA TABELA DE PERFIS
-- ──────────────────────────────────────────────────────────────────────
ALTER TABLE public.perfis ENABLE ROW LEVEL SECURITY;

-- Qualquer pessoa logada pode ver os perfis (necessário para o admin ver a lista)
CREATE POLICY "perfis_select_logado" ON public.perfis
  FOR SELECT USING (auth.role() = 'authenticated');

-- Só o próprio usuário atualiza seu perfil... exceto super_admin que pode trocar role de qualquer um
-- (controlamos isso no código — a política aqui libera para super_admins)
CREATE POLICY "perfis_update_admin" ON public.perfis
  FOR UPDATE USING (
    auth.uid() = id
    OR EXISTS (
      SELECT 1 FROM public.perfis p
      WHERE p.id = auth.uid() AND p.role = 'super_admin'
    )
  );

-- ──────────────────────────────────────────────────────────────────────
-- 4. FUNÇÃO — retorna lista de usuários com e-mail (só para admins)
--    Usa SECURITY DEFINER para acessar auth.users server-side.
-- ──────────────────────────────────────────────────────────────────────
CREATE OR REPLACE FUNCTION public.get_users_for_admin()
RETURNS TABLE (
  id         uuid,
  email      text,
  role       text,
  created_at timestamptz
)
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT p.id, u.email, p.role, p.created_at
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

-- ──────────────────────────────────────────────────────────────────────
-- 5. ATUALIZA RLS DOS CONTEÚDOS — admins e super_admins podem apagar tudo
-- ──────────────────────────────────────────────────────────────────────

-- Helper: retorna true se o usuário atual é admin ou super_admin
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS boolean
LANGUAGE sql STABLE
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.perfis
    WHERE id = auth.uid() AND role IN ('admin', 'super_admin')
  );
$$;

-- ── EVENTOS ──
DROP POLICY IF EXISTS "eventos_delete_proprio" ON public.eventos;
CREATE POLICY "eventos_delete_proprio_ou_admin" ON public.eventos
  FOR DELETE USING (
    auth.uid() = user_id OR public.is_admin()
  );

DROP POLICY IF EXISTS "eventos_update_proprio" ON public.eventos;
CREATE POLICY "eventos_update_proprio_ou_admin" ON public.eventos
  FOR UPDATE USING (
    auth.uid() = user_id OR public.is_admin()
  );

-- ── EDITAIS ──
DROP POLICY IF EXISTS "editais_delete_proprio" ON public.editais;
CREATE POLICY "editais_delete_proprio_ou_admin" ON public.editais
  FOR DELETE USING (
    auth.uid() = user_id OR public.is_admin()
  );

DROP POLICY IF EXISTS "editais_update_proprio" ON public.editais;
CREATE POLICY "editais_update_proprio_ou_admin" ON public.editais
  FOR UPDATE USING (
    auth.uid() = user_id OR public.is_admin()
  );

-- ── PROJETOS MAPA ──
DROP POLICY IF EXISTS "projetos_delete_proprio" ON public.projetos_mapa;
CREATE POLICY "projetos_delete_proprio_ou_admin" ON public.projetos_mapa
  FOR DELETE USING (
    auth.uid() = user_id OR public.is_admin()
  );

DROP POLICY IF EXISTS "projetos_update_proprio" ON public.projetos_mapa;
CREATE POLICY "projetos_update_proprio_ou_admin" ON public.projetos_mapa
  FOR UPDATE USING (
    auth.uid() = user_id OR public.is_admin()
  );

-- ──────────────────────────────────────────────────────────────────────
-- 6. ATIVA REALTIME PARA PERFIS (opcional — útil se o admin ficar na tela)
-- ──────────────────────────────────────────────────────────────────────
ALTER PUBLICATION supabase_realtime ADD TABLE public.perfis;

-- ====================================================================
-- Pronto! Após rodar:
--
--  1. Defina o super_admin inicial:
--     UPDATE public.perfis SET role = 'super_admin'
--     WHERE id = (SELECT id FROM auth.users WHERE email = 'seu@email.com');
--
--  2. No Supabase Dashboard → Authentication → Settings:
--     Desmarque "Enable email confirmations"
--     (assim o usuário entra direto ao se cadastrar)
-- ====================================================================
