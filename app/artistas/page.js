"use client";

import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { AREAS_ATUACAO, BAIRROS_ZONA_LESTE } from "@/lib/constants";
import ArtistCard from "@/components/ArtistCard";
import LoadingSpinner from "@/components/LoadingSpinner";
import styles from "./page.module.css";

export default function ArtistasPage() {
  const [artistas, setArtistas] = useState([]);
  const [carregando, setCarregando] = useState(true);
  const [filtroArea, setFiltroArea] = useState("todas");
  const [filtroRegiao, setFiltroRegiao] = useState("todas");

  useEffect(() => {
    async function carregar() {
      const { data, error } = await supabase
        .from("artistas")
        .select("*")
        .order("nome_artistico", { ascending: true });

      if (!error) setArtistas(data || []);
      setCarregando(false);
    }
    carregar();
  }, []);

  const filtrados = useMemo(() => {
    return artistas.filter((a) => {
      const okArea = filtroArea === "todas" || a.area_atuacao === filtroArea;
      const okRegiao = filtroRegiao === "todas" || a.regiao_atuacao === filtroRegiao;
      return okArea && okRegiao;
    });
  }, [artistas, filtroArea, filtroRegiao]);

  return (
    <div className={`container ${styles.wrap}`}>
      <h1 className="heading">Artistas e agentes culturais</h1>
      <p className="text-muted">
        Conheça quem faz a cena cultural da Zona Leste acontecer. Clique em
        um artista para ver o perfil público completo.
      </p>

      <div className={styles.filters}>
        <select value={filtroArea} onChange={(e) => setFiltroArea(e.target.value)}>
          <option value="todas">Todas as áreas</option>
          {AREAS_ATUACAO.map((area) => (
            <option key={area} value={area}>
              {area}
            </option>
          ))}
        </select>

        <select value={filtroRegiao} onChange={(e) => setFiltroRegiao(e.target.value)}>
          <option value="todas">Todas as regiões</option>
          {BAIRROS_ZONA_LESTE.map((bairro) => (
            <option key={bairro} value={bairro}>
              {bairro}
            </option>
          ))}
        </select>
      </div>

      {carregando ? (
        <LoadingSpinner label="Carregando artistas…" />
      ) : filtrados.length === 0 ? (
        <div className="empty-state card">Nenhum artista encontrado com esses filtros.</div>
      ) : (
        <div className="grid-3">
          {filtrados.map((artista) => (
            <ArtistCard key={artista.id} artista={artista} />
          ))}
        </div>
      )}
    </div>
  );
}
