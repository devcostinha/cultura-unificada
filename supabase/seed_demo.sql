-- ====================================================================
-- Cultura Unificada — Dados de Exemplo para Apresentação
-- ====================================================================
-- Execute este arquivo no SQL Editor do Supabase UMA VEZ.
-- Depois que a plataforma tiver conteúdo real, pode apagar esses dados
-- usando o bloco "APAGAR DADOS DE EXEMPLO" no final deste arquivo.
-- ====================================================================

-- ──────────────────────────────────────────────────────────────────────
-- 1. USUÁRIOS DEMO (necessários para satisfazer a FK de user_id)
-- ──────────────────────────────────────────────────────────────────────
-- Esses usuários existem só para os dados de exemplo.
-- Não são contas reais — não possuem senha definida.

INSERT INTO auth.users (
  id, aud, role, email, encrypted_password,
  email_confirmed_at, created_at, updated_at,
  raw_app_meta_data, raw_user_meta_data, is_super_admin
)
VALUES
  (
    '00000000-demo-0001-0000-000000000001',
    'authenticated', 'authenticated',
    'demo1@culturazo.interno',
    crypt('DemoInterno#1', gen_salt('bf')),
    now(), now(), now(),
    '{"provider":"email","providers":["email"]}', '{}', false
  ),
  (
    '00000000-demo-0002-0000-000000000002',
    'authenticated', 'authenticated',
    'demo2@culturazo.interno',
    crypt('DemoInterno#2', gen_salt('bf')),
    now(), now(), now(),
    '{"provider":"email","providers":["email"]}', '{}', false
  ),
  (
    '00000000-demo-0003-0000-000000000003',
    'authenticated', 'authenticated',
    'demo3@culturazo.interno',
    crypt('DemoInterno#3', gen_salt('bf')),
    now(), now(), now(),
    '{"provider":"email","providers":["email"]}', '{}', false
  )
ON CONFLICT (id) DO NOTHING;

-- ──────────────────────────────────────────────────────────────────────
-- 2. ARTISTAS / AGENTES CULTURAIS
-- ──────────────────────────────────────────────────────────────────────
INSERT INTO public.artistas (id, nome_artistico, area_atuacao, coletivo, telefone, email, regiao_atuacao)
VALUES
  (
    '00000000-demo-0001-0000-000000000001',
    'MC Perifeira',
    'Música',
    'Coletivo Voz da Leste',
    '(11) 99800-0001',
    'mcperifeira@exemplo.com',
    'Itaquera'
  ),
  (
    '00000000-demo-0002-0000-000000000002',
    'Grafiteiros da Penha',
    'Grafite',
    'Grafiteiros da Penha',
    '(11) 99800-0002',
    'grafitepenha@exemplo.com',
    'Penha'
  ),
  (
    '00000000-demo-0003-0000-000000000003',
    'Cia de Dança Tatuapé',
    'Dança',
    'Cia de Dança Tatuapé',
    '(11) 99800-0003',
    'ciadancatatuape@exemplo.com',
    'Tatuapé'
  )
ON CONFLICT (id) DO NOTHING;

-- ──────────────────────────────────────────────────────────────────────
-- 3. EVENTOS (Calendário Unificado + Carrossel de Flyers)
--    Datas: a partir de hoje + alguns dias, para aparecerem no carrossel
--    imagem_url: fotos coloridas do Unsplash que simulam flyers
-- ──────────────────────────────────────────────────────────────────────
INSERT INTO public.eventos (
  id, user_id, titulo, descricao, categoria,
  data_evento, horario, local, bairro, link, imagem_url
)
VALUES
  (
    gen_random_uuid(),
    '00000000-demo-0001-0000-000000000001',
    'Batalha de MC — Zona Leste Representa',
    'A maior batalha de freestyle da Zona Leste reúne MCs de toda a região. Entrada franca. Aberto para todos.',
    'Cultura Hip-Hop',
    (CURRENT_DATE + INTERVAL '3 days')::date,
    '18:00',
    'CEU Itaquera — Av. do Contorno, 500',
    'Itaquera',
    'https://instagram.com/culturazo',
    'https://images.unsplash.com/photo-1547982954-65b48fc77268?w=600&q=80'
  ),
  (
    gen_random_uuid(),
    '00000000-demo-0001-0000-000000000001',
    'Sarau das Minas da Leste',
    'Sarau exclusivo para mulheres artistas da periferia. Poesia, música e empoderamento.',
    'Sarau',
    (CURRENT_DATE + INTERVAL '5 days')::date,
    '19:30',
    'Casa de Cultura da Vila Matilde',
    'Vila Matilde',
    NULL,
    'https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?w=600&q=80'
  ),
  (
    gen_random_uuid(),
    '00000000-demo-0002-0000-000000000002',
    'Intervenção Grafite — Mural Vivo',
    'Grafiteiros da Zona Leste pintam o mural do CEU ao vivo. Traga tinta, traga ideia.',
    'Grafite',
    (CURRENT_DATE + INTERVAL '7 days')::date,
    '10:00',
    'CEU Pêssego — R. Vespasiano Ramos, 1000',
    'São Miguel Paulista',
    NULL,
    'https://images.unsplash.com/photo-1499781350541-7783f6c6a0c8?w=600&q=80'
  ),
  (
    gen_random_uuid(),
    '00000000-demo-0002-0000-000000000002',
    'Show: Pagode da Quebrada',
    'Roda de pagode com os sons mais pedidos. Chopp, bate-papo e muito samba da pesada.',
    'Música',
    (CURRENT_DATE + INTERVAL '9 days')::date,
    '15:00',
    'Praça do Forró — Penha',
    'Penha',
    'https://instagram.com/pagodedaquebradademo',
    'https://images.unsplash.com/photo-1501386761578-eac5c94b800a?w=600&q=80'
  ),
  (
    gen_random_uuid(),
    '00000000-demo-0003-0000-000000000003',
    'Espetáculo de Dança Contemporânea',
    'A Cia de Dança Tatuapé apresenta "Raízes" — espetáculo que mistura street dance e dança contemporânea.',
    'Dança',
    (CURRENT_DATE + INTERVAL '12 days')::date,
    '20:00',
    'Teatro Paulo Eiró — Tatuapé',
    'Tatuapé',
    NULL,
    'https://images.unsplash.com/photo-1508700929628-666bc8bd84ea?w=600&q=80'
  ),
  (
    gen_random_uuid(),
    '00000000-demo-0003-0000-000000000003',
    'Feirinha Cultural da Penha',
    'Artesanato, livros, discos de vinil, comida caseira e arte. Domingo o dia todo.',
    'Artes Visuais',
    (CURRENT_DATE + INTERVAL '14 days')::date,
    '09:00',
    'Largo da Matriz da Penha',
    'Penha',
    NULL,
    'https://images.unsplash.com/photo-1519998762689-a38f9dc9e5fb?w=600&q=80'
  ),
  (
    gen_random_uuid(),
    '00000000-demo-0001-0000-000000000001',
    'Mostra de Curtas: Cinema da Periferia',
    'Filmes feitos por moradores da Zona Leste. Entrada gratuita. Debate com os diretores ao final.',
    'Audiovisual',
    (CURRENT_DATE + INTERVAL '17 days')::date,
    '18:30',
    'Centro Cultural São Paulo — Leste',
    'Guaianases',
    NULL,
    'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?w=600&q=80'
  ),
  (
    gen_random_uuid(),
    '00000000-demo-0002-0000-000000000002',
    'Oficina de Literatura Periférica',
    'Aprenda técnicas de escrita criativa com autores da cena literária periférica de SP.',
    'Literatura',
    (CURRENT_DATE + INTERVAL '20 days')::date,
    '14:00',
    'Biblioteca Álvares de Azevedo',
    'Itaquera',
    NULL,
    'https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=600&q=80'
  );

-- ──────────────────────────────────────────────────────────────────────
-- 4. EDITAIS ABERTOS
-- ──────────────────────────────────────────────────────────────────────
INSERT INTO public.editais (
  id, user_id, titulo, descricao, categoria, subcategoria,
  entidade_responsavel, link, prazo
)
VALUES
  (
    gen_random_uuid(),
    '00000000-demo-0001-0000-000000000001',
    'Programa de Apoio à Cultura de Periferia 2025',
    'Seleção de projetos culturais desenvolvidos em regiões periféricas do estado de São Paulo. Contempla música, dança, teatro, artes visuais e literatura. Valor de até R$ 30.000 por projeto.',
    'Edital Estadual',
    'Música e Artes Cênicas',
    'Secretaria de Cultura do Estado de SP',
    'https://cultura.sp.gov.br',
    (CURRENT_DATE + INTERVAL '30 days')::date
  ),
  (
    gen_random_uuid(),
    '00000000-demo-0002-0000-000000000002',
    'Edital Carmim — Territórios Criativos',
    'A Carmim Cultura apoia projetos culturais em territórios de vulnerabilidade social. Foco em jovens de 15 a 29 anos. Bolsas de até R$ 15.000.',
    'Edital de Iniciativa Privada',
    'Juventude e Cultura',
    'Instituto Carmim',
    'https://institutocarmim.org.br',
    (CURRENT_DATE + INTERVAL '21 days')::date
  ),
  (
    gen_random_uuid(),
    '00000000-demo-0003-0000-000000000003',
    'Fomento à Dança — Zona Leste',
    'Edital específico para grupos de dança da Zona Leste de São Paulo. Prioridade para grupos com histórico de pelo menos 2 anos de atividade na região.',
    'Edital Municipal',
    'Dança',
    'Secretaria Municipal de Cultura — SP',
    'https://prefeitura.sp.gov.br/cultura',
    (CURRENT_DATE + INTERVAL '45 days')::date
  ),
  (
    gen_random_uuid(),
    '00000000-demo-0001-0000-000000000001',
    'Lei Paulo Gustavo — Audiovisual Periférico',
    'Recursos da Lei Paulo Gustavo para produções audiovisuais de artistas da periferia. Documentários, curtas e videoclipes. Valor único de R$ 20.000.',
    'Edital Federal',
    'Audiovisual',
    'Ministério da Cultura (MinC)',
    'https://cultura.gov.br/leipaulogustavo',
    (CURRENT_DATE + INTERVAL '60 days')::date
  );

-- ──────────────────────────────────────────────────────────────────────
-- 5. MAPEAMENTO CULTURAL — Espaços e Projetos da Zona Leste
--    Coordenadas reais de bairros da Zona Leste de São Paulo
-- ──────────────────────────────────────────────────────────────────────
INSERT INTO public.projetos_mapa (
  id, user_id, nome, descricao, categoria,
  localidade, endereco, latitude, longitude, tags
)
VALUES
  (
    gen_random_uuid(),
    '00000000-demo-0001-0000-000000000001',
    'Coletivo Voz da Leste',
    'Coletivo de rap e hip-hop que atua em Itaquera desde 2018. Produz shows, batalhas de MC e oficinas gratuitas para jovens da região.',
    'Coletivo Cultural',
    'Itaquera',
    'Av. do Contorno, 500 — Itaquera, SP',
    -23.5437,
    -46.4568,
    ARRAY['hip-hop', 'batalha', 'juventude', 'oficina']
  ),
  (
    gen_random_uuid(),
    '00000000-demo-0002-0000-000000000002',
    'Grafiteiros da Penha',
    'Grupo de grafiteiros que transforma muros e espaços públicos da Penha em obras de arte. Já pintaram mais de 40 murais na região.',
    'Coletivo Cultural',
    'Penha',
    'R. Capitão Pacheco e Chaves, 313 — Penha, SP',
    -23.5245,
    -46.5391,
    ARRAY['grafite', 'arte urbana', 'mural', 'arte pública']
  ),
  (
    gen_random_uuid(),
    '00000000-demo-0003-0000-000000000003',
    'Cia de Dança Tatuapé',
    'Companhia de dança contemporânea que mistura street dance, afro e técnicas clássicas. Apresenta espetáculos gratuitos e oferece aulas para a comunidade.',
    'Grupo Artístico',
    'Tatuapé',
    'R. Baronesa de Bela Vista, 900 — Tatuapé, SP',
    -23.5374,
    -46.5704,
    ARRAY['dança', 'street dance', 'contemporâneo', 'afro']
  ),
  (
    gen_random_uuid(),
    '00000000-demo-0001-0000-000000000001',
    'Casa de Cultura da Vila Matilde',
    'Espaço comunitário que sedia saraus, exposições, ensaios e workshops. Aberto à comunidade todos os dias. Tem palco, biblioteca e sala de ensaio.',
    'Espaço Cultural',
    'Vila Matilde',
    'R. Padre Estevão Pernet, 80 — Vila Matilde, SP',
    -23.5345,
    -46.5261,
    ARRAY['espaço', 'sarau', 'exposição', 'comunidade']
  ),
  (
    gen_random_uuid(),
    '00000000-demo-0002-0000-000000000002',
    'Biblioteca Popular São Miguel',
    'Biblioteca comunitária com acervo de literatura periférica, zines, quadrinhos e DVDs independentes. Funciona com voluntários da comunidade.',
    'Espaço Cultural',
    'São Miguel Paulista',
    'Praça João Pessoa, 12 — São Miguel Paulista, SP',
    -23.5087,
    -46.4428,
    ARRAY['biblioteca', 'literatura', 'zine', 'leitura']
  ),
  (
    gen_random_uuid(),
    '00000000-demo-0003-0000-000000000003',
    'Cineclube Guaianases',
    'Cineclube que exibe filmes independentes e nacionais todo domingo à tarde. Entrada franca. Debate com cineastas locais mensalmente.',
    'Projeto Cultural',
    'Guaianases',
    'Av. Marechal Tito, 3000 — Guaianases, SP',
    -23.5664,
    -46.3946,
    ARRAY['cinema', 'audiovisual', 'cineclube', 'debate']
  );

-- ====================================================================
-- PRONTO! Dados de exemplo inseridos com sucesso.
-- Para conferir: SELECT COUNT(*) FROM public.eventos;
--                SELECT COUNT(*) FROM public.editais;
--                SELECT COUNT(*) FROM public.projetos_mapa;
--
-- ─────────────────────────────────────────────────────────────────────
-- APAGAR DADOS DE EXEMPLO (rode quando quiser limpar):
-- ─────────────────────────────────────────────────────────────────────
-- DELETE FROM public.projetos_mapa WHERE user_id IN (
--   '00000000-demo-0001-0000-000000000001',
--   '00000000-demo-0002-0000-000000000002',
--   '00000000-demo-0003-0000-000000000003'
-- );
-- DELETE FROM public.editais WHERE user_id IN (
--   '00000000-demo-0001-0000-000000000001',
--   '00000000-demo-0002-0000-000000000002',
--   '00000000-demo-0003-0000-000000000003'
-- );
-- DELETE FROM public.eventos WHERE user_id IN (
--   '00000000-demo-0001-0000-000000000001',
--   '00000000-demo-0002-0000-000000000002',
--   '00000000-demo-0003-0000-000000000003'
-- );
-- DELETE FROM public.artistas WHERE id IN (
--   '00000000-demo-0001-0000-000000000001',
--   '00000000-demo-0002-0000-000000000002',
--   '00000000-demo-0003-0000-000000000003'
-- );
-- DELETE FROM auth.users WHERE id IN (
--   '00000000-demo-0001-0000-000000000001',
--   '00000000-demo-0002-0000-000000000002',
--   '00000000-demo-0003-0000-000000000003'
-- );
-- ====================================================================
