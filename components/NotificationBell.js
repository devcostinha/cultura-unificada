"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabaseClient";
import { useEditalNotifications } from "@/lib/notifications";
import { useRole } from "@/lib/useRole";
import styles from "./NotificationBell.module.css";

const STORAGE_KEY_USUARIOS = "cu_novos_usuarios_lidos";

function useNovosUsuarios(ativo) {
  const [novos, setNovos] = useState([]);
  const lidosRef = useRef(
    new Set(JSON.parse(localStorage.getItem(STORAGE_KEY_USUARIOS) || "[]"))
  );

  useEffect(() => {
    if (!ativo) return;

    // Carrega usuários criados nas últimas 48h que ainda não foram vistos
    const limite = new Date(Date.now() - 48 * 60 * 60 * 1000).toISOString();
    supabase.rpc("get_users_for_admin").then(({ data }) => {
      if (!data) return;
      const recentes = data.filter(
        (u) => u.created_at > limite && !lidosRef.current.has(u.id)
      );
      setNovos(recentes);
    });

    // Realtime: novo usuário se cadastrou
    const channel = supabase
      .channel("admin-novos-usuarios")
      .on("postgres_changes", { event: "INSERT", schema: "public", table: "perfis" },
        async (payload) => {
          const { data } = await supabase.rpc("get_users_for_admin");
          const novo = data?.find((u) => u.id === payload.new.id);
          if (novo && !lidosRef.current.has(novo.id)) {
            setNovos((prev) => [novo, ...prev]);
          }
        }
      )
      .subscribe();

    return () => supabase.removeChannel(channel);
  }, [ativo]);

  function marcarLidos() {
    const ids = novos.map((u) => u.id);
    ids.forEach((id) => lidosRef.current.add(id));
    localStorage.setItem(STORAGE_KEY_USUARIOS, JSON.stringify([...lidosRef.current]));
    setNovos([]);
  }

  return { novos, marcarLidos };
}

export default function NotificationBell() {
  const { novosEditais, marcarComoLidas } = useEditalNotifications(true);
  const { isSuperAdmin } = useRole();
  const { novos: novosUsuarios, marcarLidos } = useNovosUsuarios(isSuperAdmin);
  const [open, setOpen] = useState(false);

  const totalBadge = novosEditais.length + (isSuperAdmin ? novosUsuarios.length : 0);

  function toggle() {
    const next = !open;
    setOpen(next);
    if (next) {
      if (novosEditais.length > 0) setTimeout(marcarComoLidas, 1500);
      if (novosUsuarios.length > 0) setTimeout(marcarLidos, 1500);
    }
  }

  return (
    <div className={styles.wrapper}>
      <button
        type="button"
        className="iconBtn"
        onClick={toggle}
        aria-label="Notificações"
      >
        🔔
        {totalBadge > 0 && (
          <span className="badgeDot">{totalBadge}</span>
        )}
      </button>

      {open && (
        <div className={styles.dropdown}>
          <div className={styles.dropdownTitle}>
            <span>Notificações</span>
            <button
              type="button"
              onClick={() => setOpen(false)}
              aria-label="Fechar"
              style={{ background: "none", border: "none", cursor: "pointer" }}
            >
              ✕
            </button>
          </div>

          {/* Novos usuários — só super_admin */}
          {isSuperAdmin && novosUsuarios.length > 0 && (
            <>
              <p className={styles.secaoLabel}>👤 Novos cadastros</p>
              {novosUsuarios.map((u) => (
                <Link
                  key={u.id}
                  href="/admin"
                  className={styles.item}
                  onClick={() => setOpen(false)}
                >
                  <div className={styles.itemTitle}>{u.email}</div>
                  <div className={styles.itemMeta}>
                    Cadastrado em {new Date(u.created_at).toLocaleDateString("pt-BR")}
                  </div>
                </Link>
              ))}
            </>
          )}

          {/* Novos editais */}
          {novosEditais.length > 0 && (
            <>
              <p className={styles.secaoLabel}>📋 Novos editais</p>
              {novosEditais.map((edital) => (
                <Link
                  key={edital.id}
                  href="/editais"
                  className={styles.item}
                  onClick={() => setOpen(false)}
                >
                  <div className={styles.itemTitle}>{edital.titulo}</div>
                  <div className={styles.itemMeta}>{edital.categoria}</div>
                </Link>
              ))}
            </>
          )}

          {totalBadge === 0 && (
            <p className="text-muted" style={{ fontSize: "0.85rem", margin: 0 }}>
              Tudo em dia por aqui!
            </p>
          )}
        </div>
      )}
    </div>
  );
}
