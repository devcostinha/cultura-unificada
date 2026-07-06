"use client";

import { useEffect, useMemo, useState } from "react";
import { useAuth } from "@/lib/AuthProvider";
import { supabase } from "@/lib/supabaseClient";
import { CATEGORIAS_EDITAL } from "@/lib/constants";
import EditalCard from "@/components/EditalCard";
import EditalFormModal from "@/components/EditalFormModal";
import LoadingSpinner from "@/components/LoadingSpinner";
import styles from "./page.module.css";

export default function EditaisPage() {
  const { user } = useAuth();
  const [editais, setEditais] = useState([]);
  const [carregando, setCarregando] = useState(true);
  const [categoriaAtiva, setCategoriaAtiva] = useState("Todas");
  const [modalAberto, setModalAberto] = useState(false);

  async function carregarEditais() {
    const { data, error } = await supabase
      .from("editais")
      .select("*")
      .order("prazo", { ascending: true, nullsFirst: false });

    if (!error) setEditais(data || []);
    setCarregando(false);
  }

  useEffect(() => {
    carregarEditais();

    const channel = supabase
      .channel("editais-publicos")
      .on("postgres_changes", { event: "*", schema: "public", table: "editais" }, () => {
        carregarEditais();
      })
      .subscribe();

    return () => supabase.removeChannel(channel);
  }, []);

  const editaisFiltrados = useMemo(() => {
    if (categoriaAtiva === "Todas") return editais;
    return editais.filter((e) => e.categoria === categoriaAtiva);
  }, [editais, categoriaAtiva]);

  function handleCadastrarClick() {
    if (!user) {
      window.location.href = "/login";
      return;
    }
    setModalAberto(true);
  }

  return (
    <div className={`container ${styles.wrap}`}>
      <div className={styles.headerRow}>
        <div>
          <h1 className="heading">Editais Abertos</h1>
          <p className="text-muted" style={{ margin: 0, maxWidth: 600 }}>
            Oportunidades de fomento e financiamento para projetos
            culturais, organizadas por categoria.
          </p>
        </div>
        <button type="button" className="btn btn-primary" onClick={handleCadastrarClick}>
          + Cadastrar edital
        </button>
      </div>

      <div className={styles.tabs}>
        {["Todas", ...CATEGORIAS_EDITAL].map((cat) => (
          <button
            key={cat}
            type="button"
            className={categoriaAtiva === cat ? styles.active : ""}
            onClick={() => setCategoriaAtiva(cat)}
          >
            {cat}
          </button>
        ))}
      </div>

      {carregando ? (
        <LoadingSpinner label="Carregando editais…" />
      ) : editaisFiltrados.length === 0 ? (
        <div className="empty-state card">
          Nenhum edital cadastrado nessa categoria ainda.
        </div>
      ) : (
        <div className="grid-3">
          {editaisFiltrados.map((edital) => (
            <EditalCard key={edital.id} edital={edital} />
          ))}
        </div>
      )}

      {modalAberto && (
        <EditalFormModal
          user={user}
          onClose={() => setModalAberto(false)}
          onCreated={carregarEditais}
        />
      )}
    </div>
  );
}
