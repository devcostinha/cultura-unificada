-- ====================================================================
-- Cultura Unificada — Migração: flyers de eventos
-- ====================================================================
-- Execute este arquivo no SQL Editor do Supabase (uma vez só).
-- ====================================================================

-- 1. Adiciona coluna de imagem na tabela de eventos
ALTER TABLE public.eventos
  ADD COLUMN IF NOT EXISTS imagem_url text;

-- ====================================================================
-- 2. Cria o bucket de armazenamento para os flyers
--    (imagens enviadas pelo formulário de eventos)
-- ====================================================================
INSERT INTO storage.buckets (id, name, public)
VALUES ('flyers', 'flyers', true)
ON CONFLICT (id) DO NOTHING;

-- Qualquer pessoa pode ver as imagens (bucket público)
CREATE POLICY "flyers_select_publico"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'flyers');

-- Qualquer usuário logado pode fazer upload
CREATE POLICY "flyers_upload_logado"
  ON storage.objects FOR INSERT
  WITH CHECK (bucket_id = 'flyers' AND auth.role() = 'authenticated');

-- Só o dono da pasta (user_id no caminho) pode deletar
CREATE POLICY "flyers_delete_proprio"
  ON storage.objects FOR DELETE
  USING (
    bucket_id = 'flyers'
    AND auth.uid()::text = (storage.foldername(name))[1]
  );

-- ====================================================================
-- 3. Auto-exclusão de eventos vencidos (2 dias após a data do evento)
--
--    O Supabase suporta pg_cron nativamente.
--    Este job roda todo dia às 4h da manhã (horário de Brasília = 7h UTC).
-- ====================================================================
CREATE EXTENSION IF NOT EXISTS pg_cron;

-- Remove job anterior caso já exista (evita duplicata)
SELECT cron.unschedule('delete-expired-events') WHERE EXISTS (
  SELECT 1 FROM cron.job WHERE jobname = 'delete-expired-events'
);

SELECT cron.schedule(
  'delete-expired-events',           -- nome do job
  '0 7 * * *',                       -- todo dia às 7h UTC (4h Brasília)
  $$
    DELETE FROM public.eventos
    WHERE data_evento < CURRENT_DATE - INTERVAL '2 days';
  $$
);

-- ====================================================================
-- Pronto! Após rodar este script:
--   • O formulário de evento aceita upload de flyer (imagem)
--   • As imagens ficam públicas no bucket "flyers"
--   • Eventos são apagados automaticamente 2 dias após a data deles
-- ====================================================================
