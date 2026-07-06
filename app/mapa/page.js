"use client";

import { useEffect, useMemo, useState } from "react";
import { GoogleMap, InfoWindow, Marker, useJsApiLoader } from "@react-google-maps/api";
import { useAuth } from "@/lib/AuthProvider";
import { supabase } from "@/lib/supabaseClient";
import { CATEGORIAS_PROJETO_MAPA, BAIRROS_ZONA_LESTE, CENTRO_ZONA_LESTE } from "@/lib/constants";
import { GOOGLE_MAPS_LIBRARIES, GOOGLE_MAPS_SCRIPT_ID } from "@/lib/googleMapsConfig";
import ProjetoFormModal from "@/components/ProjetoFormModal";
import LoadingSpinner from "@/components/LoadingSpinner";
import styles from "./page.module.css";

const MAP_CONTAINER_STYLE = { width: "100%", height: "100%" };

export default function MapaPage() {
  const { user } = useAuth();
  const [projetos, setProjetos] = useState([]);
  const [carregando, setCarregando] = useState(true);
  const [modalAberto, setModalAberto] = useState(false);
  const [projetoSelecionado, setProjetoSelecionado] = useState(null);

  const [filtroLocalidade, setFiltroLocalidade] = useState("todas");
  const [filtroCategoria, setFiltroCategoria] = useState("todas");
  const [filtroTag, setFiltroTag] = useState("");

  const { isLoaded, loadError } = useJsApiLoader({
    id: GOOGLE_MAPS_SCRIPT_ID,
    googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || "",
    libraries: GOOGLE_MAPS_LIBRARIES,
  });

  async function carregarProjetos() {
    const { data, error } = await supabase
      .from("projetos_mapa")
      .select("*")
      .order("created_at", { ascending: false });

    if (!error) setProjetos(data || []);
    setCarregando(false);
  }

  useEffect(() => {
    carregarProjetos();

    // Realtime: projeto cadastrado em qualquer dispositivo aparece no
    // mapa de todo mundo instantaneamente, sem precisar recarregar.
    const channel = supabase
      .channel("mapa-projetos")
      .on("postgres_changes", { event: "*", schema: "public", table: "projetos_mapa" }, () => {
        carregarProjetos();
      })
      .subscribe();

    return () => supabase.removeChannel(channel);
  }, []);

  const projetosFiltrados = useMemo(() => {
    const tagBusca = filtroTag.trim().toLowerCase();
    return projetos.filter((p) => {
      const okLocalidade = filtroLocalidade === "todas" || p.localidade === filtroLocalidade;
      const okCategoria = filtroCategoria === "todas" || p.categoria === filtroCategoria;
      const okTag =
        !tagBusca || (p.tags || []).some((tag) => tag.toLowerCase().includes(tagBusca));
      return okLocalidade && okCategoria && okTag;
    });
  }, [projetos, filtroLocalidade, filtroCategoria, filtroTag]);

  function handleAdicionarClick() {
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
          <h1 className="heading">Mapeamento Cultural</h1>
          <p className="text-muted" style={{ margin: 0, maxWidth: 600 }}>
            Espaços, saraus, coletivos e projetos sociais da Zona Leste,
            marcados no mapa pela própria comunidade.
          </p>
        </div>
        <button type="button" className="btn btn-primary" onClick={handleAdicionarClick}>
          + Adicionar projeto
        </button>
      </div>

      <div className={styles.filters}>
        <select value={filtroLocalidade} onChange={(e) => setFiltroLocalidade(e.target.value)}>
          <option value="todas">Todos os bairros</option>
          {BAIRROS_ZONA_LESTE.map((bairro) => (
            <option key={bairro} value={bairro}>
              {bairro}
            </option>
          ))}
        </select>

        <select value={filtroCategoria} onChange={(e) => setFiltroCategoria(e.target.value)}>
          <option value="todas">Todos os tipos</option>
          {CATEGORIAS_PROJETO_MAPA.map((cat) => (
            <option key={cat} value={cat}>
              {cat}
            </option>
          ))}
        </select>

        <input
          type="text"
          placeholder="Filtrar por tag (ex: gratuito, infantil)"
          value={filtroTag}
          onChange={(e) => setFiltroTag(e.target.value)}
          className={styles.tagInput}
        />
      </div>

      {carregando ? (
        <LoadingSpinner label="Carregando mapa…" />
      ) : loadError ? (
        <div className="empty-state card">
          Não foi possível carregar o Google Maps. Verifique se a chave
          NEXT_PUBLIC_GOOGLE_MAPS_API_KEY está configurada corretamente.
        </div>
      ) : !isLoaded ? (
        <LoadingSpinner label="Carregando mapa…" />
      ) : (
        <div className={styles.mapWrap}>
          <GoogleMap
            mapContainerStyle={MAP_CONTAINER_STYLE}
            center={CENTRO_ZONA_LESTE}
            zoom={11}
            options={{ streetViewControl: false, mapTypeControl: false }}
          >
            {projetosFiltrados.map((projeto) => (
              <Marker
                key={projeto.id}
                position={{ lat: projeto.latitude, lng: projeto.longitude }}
                onClick={() => setProjetoSelecionado(projeto)}
              />
            ))}

            {projetoSelecionado && (
              <InfoWindow
                position={{ lat: projetoSelecionado.latitude, lng: projetoSelecionado.longitude }}
                onCloseClick={() => setProjetoSelecionado(null)}
              >
                <div className={styles.infoWindow}>
                  <strong>{projetoSelecionado.nome}</strong>
                  <span className={styles.infoBadge}>{projetoSelecionado.categoria}</span>
                  <p>{projetoSelecionado.localidade}</p>
                  {projetoSelecionado.endereco && <p>{projetoSelecionado.endereco}</p>}
                  {projetoSelecionado.descricao && <p>{projetoSelecionado.descricao}</p>}
                  {projetoSelecionado.tags?.length > 0 && (
                    <p className={styles.infoTags}>
                      {projetoSelecionado.tags.map((t) => `#${t}`).join("  ")}
                    </p>
                  )}
                </div>
              </InfoWindow>
            )}
          </GoogleMap>
        </div>
      )}

      {!carregando && projetosFiltrados.length === 0 && !loadError && isLoaded && (
        <div className="empty-state card" style={{ marginTop: 16 }}>
          Nenhum projeto encontrado com esses filtros.
        </div>
      )}

      {modalAberto && (
        <ProjetoFormModal
          user={user}
          onClose={() => setModalAberto(false)}
          onCreated={carregarProjetos}
        />
      )}
    </div>
  );
}
