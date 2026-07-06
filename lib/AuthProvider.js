"use client";

// ====================================================================
// Contexto global de autenticação. Por quê um Context aqui?
// Várias páginas e componentes (Navbar, Calendário, Mapa, Editais,
// Perfil) precisam saber "o usuário está logado? quem é?" o tempo
// todo. Em vez de cada componente perguntar ao Supabase de novo,
// guardamos a sessão uma vez no topo da árvore (em app/layout.js) e
// todo o resto consome via o hook useAuth().
// ====================================================================
import { createContext, useContext, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";

const AuthContext = createContext({
  session: null,
  user: null,
  loading: true,
  signOut: async () => {},
});

export function AuthProvider({ children }) {
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;

    // 1. Carrega a sessão já salva (localStorage) ao abrir o app —
    //    é isso que faz o login "persistir" entre recargas de página.
    supabase.auth.getSession().then(({ data }) => {
      if (isMounted) {
        setSession(data.session);
        setLoading(false);
      }
    });

    // 2. Escuta mudanças (login, logout, token renovado) em tempo real.
    const { data: listener } = supabase.auth.onAuthStateChange(
      (_event, newSession) => {
        setSession(newSession);
        setLoading(false);
      }
    );

    return () => {
      isMounted = false;
      listener.subscription.unsubscribe();
    };
  }, []);

  const signOut = async () => {
    await supabase.auth.signOut();
  };

  const value = {
    session,
    user: session?.user ?? null,
    loading,
    signOut,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  return useContext(AuthContext);
}

// ====================================================================
// Hook usado em toda página/ação que exige login (perfil, cadastrar
// evento, edital ou projeto no mapa). Redireciona para /login se não
// houver usuário autenticado, já preservando para onde voltar depois.
// ====================================================================
export function useRequireAuth() {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) {
      router.push("/login");
    }
  }, [loading, user, router]);

  return { user, loading };
}
