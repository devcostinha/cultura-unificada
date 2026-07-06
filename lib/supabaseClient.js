// ====================================================================
// Cliente único do Supabase, usado em toda a aplicação (auth, banco de
// dados e realtime). Por que um arquivo separado? Assim garantimos que
// existe apenas UMA instância do cliente em todo o app — criar várias
// instâncias é uma causa comum de bugs com sessão/realtime no Next.js.
// ====================================================================
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  // Não lançamos erro fatal aqui para não quebrar o build na Vercel
  // antes das variáveis de ambiente serem configuradas — mas avisamos
  // claramente no console do navegador.
  console.warn(
    "[Cultura Unificada] Variáveis NEXT_PUBLIC_SUPABASE_URL e/ou " +
      "NEXT_PUBLIC_SUPABASE_ANON_KEY não estão definidas. Configure o " +
      "arquivo .env.local (veja .env.example)."
  );
}

export const supabase = createClient(
  supabaseUrl || "https://placeholder.supabase.co",
  supabaseAnonKey || "placeholder-anon-key",
  {
    auth: {
      // Mantém a sessão salva no navegador (localStorage) entre recargas
      // de página e reaberturas do app — é o que dá o efeito de "sessão
      // persistente" pedido no projeto.
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: true,
    },
  }
);
