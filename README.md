# Cultura Unificada

Plataforma digital para artistas e agentes culturais da Zona Leste de São Paulo: cadastro de artistas, Calendário Unificado de eventos, Mapeamento Cultural interativo e Editais Abertos.

Construída em Next.js 15 (App Router) + Supabase (Auth, Postgres, Realtime) + Google Maps.

## 1. Pré-requisitos

- Node.js 18.18 ou superior
- Uma conta gratuita em [supabase.com](https://supabase.com)
- Uma chave de API do Google Maps ([console.cloud.google.com](https://console.cloud.google.com/google/maps-apis))

## 2. Configurar o Supabase

1. Crie um projeto novo em supabase.com.
2. Abra **SQL Editor** e cole o conteúdo inteiro de `supabase/schema.sql`. Execute.
   Isso cria as 4 tabelas (`artistas`, `eventos`, `editais`, `projetos_mapa`), os índices, as políticas de Row Level Security e ativa o Realtime.
3. Em **Authentication > Providers**, confirme que "Email" está habilitado (é o padrão).
4. Em **Authentication > URL Configuration**, adicione a URL do seu site (local e de produção) em "Site URL" e "Redirect URLs" — necessário para o fluxo de recuperação de senha funcionar.
5. Em **Project Settings > API**, copie a **Project URL** e a **anon public key**.

## 3. Configurar o Google Maps

1. Crie/abra um projeto no Google Cloud Console.
2. Ative a API **Maps JavaScript API**.
3. Crie uma chave de API e restrinja-a por domínio HTTP (seu domínio de produção + `localhost` para testes).

## 4. Variáveis de ambiente

Copie `.env.example` para `.env.local` e preencha com os valores reais obtidos acima:

```
NEXT_PUBLIC_SUPABASE_URL=...
NEXT_PUBLIC_SUPABASE_ANON_KEY=...
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=...
```

`.env.local` nunca deve ser commitado (já está no `.gitignore`).

## 5. Rodar localmente

```bash
npm install
npm run dev
```

Acesse `http://localhost:3000`.

## 6. Deploy na Vercel

1. Suba o projeto para um repositório Git (GitHub, GitLab ou Bitbucket).
2. Em [vercel.com](https://vercel.com), clique em **Add New > Project** e importe o repositório. O Next.js é detectado automaticamente — não é preciso `vercel.json`.
3. Em **Settings > Environment Variables**, adicione as três variáveis do passo 4 (mesmos nomes e valores do `.env.local`).
4. Clique em **Deploy**.
5. Depois do primeiro deploy, volte ao Supabase (**Authentication > URL Configuration**) e adicione a URL final da Vercel em "Site URL"/"Redirect URLs".

## Estrutura do projeto

Ver lista completa de arquivos na mensagem de entrega. Resumo das pastas:

- `app/` — páginas (App Router): landing, login/registro/recuperação de senha, artistas, calendário, editais, mapa, perfil.
- `components/` — componentes reutilizáveis (Navbar, Footer, cards, modais de formulário, notificações).
- `lib/` — cliente Supabase, AuthProvider, constantes (bairros da Zona Leste, categorias), notificações, configuração do Google Maps.
- `supabase/schema.sql` — schema completo do banco (tabelas, índices, RLS, Realtime, trigger).

## Notas de segurança

- Nenhuma credencial real está nos arquivos do projeto — apenas placeholders em `.env.example`.
- Row Level Security está ativo em todas as tabelas: qualquer pessoa pode ler os dados públicos, mas só o autor de um registro pode editá-lo ou excluí-lo.
- Dependências auditadas via `npm audit` no momento da entrega: 0 vulnerabilidades conhecidas (Next.js 15.5.19 + override de `postcss` para a versão corrigida).
