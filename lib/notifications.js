"use client";

// ====================================================================
// Sugestão de melhoria 2 — Notificações de novos editais.
// Implementação enxuta e sem tabela extra no banco: guardamos no
// localStorage do navegador a data/hora do último edital que o
// usuário "viu" e comparamos com os editais existentes. Para editais
// publicados enquanto o app está aberto, escutamos o Supabase
// Realtime e atualizamos a lista na hora.
// ====================================================================
import { useCallback, useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";

const STORAGE_KEY = "cultura-unificada:ultimo-edital-visto";

function getUltimoVisto() {
  if (typeof window === "undefined") return null;
  return window.localStorage.getItem(STORAGE_KEY);
}

function setUltimoVisto(isoDate) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(STORAGE_KEY, isoDate);
}

export function useEditalNotifications(ativo) {
  const [novosEditais, setNovosEditais] = useState([]);

  useEffect(() => {
    if (!ativo) return;

    let isMounted = true;
    const ultimoVisto = getUltimoVisto();

    // Busca editais publicados desde a última visita (ou os mais
    // recentes, se for a primeira vez do usuário no app).
    async function carregarPendentes() {
      let query = supabase
        .from("editais")
        .select("id, titulo, categoria, created_at")
        .order("created_at", { ascending: false })
        .limit(10);

      if (ultimoVisto) {
        query = query.gt("created_at", ultimoVisto);
      }

      const { data, error } = await query;
      if (!error && data && isMounted) {
        setNovosEditais(data);
      }
    }

    carregarPendentes();

    // Realtime: qualquer edital novo cadastrado por qualquer usuário
    // (em qualquer dispositivo) aparece aqui instantaneamente.
    const channel = supabase
      .channel("notificacoes-editais")
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "editais" },
        (payload) => {
          if (isMounted) {
            setNovosEditais((atual) => [payload.new, ...atual]);
          }
        }
      )
      .subscribe();

    return () => {
      isMounted = false;
      supabase.removeChannel(channel);
    };
  }, [ativo]);

  const marcarComoLidas = useCallback(() => {
    setUltimoVisto(new Date().toISOString());
    setNovosEditais([]);
  }, []);

  return { novosEditais, marcarComoLidas };
}
