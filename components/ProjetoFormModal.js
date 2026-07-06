"use client";

// Formulário de cadastro de projeto cultural no Mapeamento Cultural.
// A localização exata (latitude/longitude) é definida clicando no
// mini-mapa abaixo — assim não dependemos da API de Geocoding do
// Google (que exigiria habilitar e cobrar outro serviço); o campo
// "endereço" continua sendo só texto livre/descritivo.
import { useState } from "react";
import { GoogleMap, Marker, useJsApiLoader } from "@react-google-maps/api";
import { supabase } from "@/lib/supabaseClient";
import { CATEGORIAS_PROJETO_MAPA, BAIRROS_ZONA_LESTE, CENTRO_ZONA_LESTE } from "@/lib/constants";
import { GOOGLE_MAPS_LIBRARIES, GOOGLE_MAPS_SCRIPT_ID } from "@/lib/googleMapsConfig";
import Modal from "@/components/Modal";
import styles from "./ProjetoFormModal.module.css";

const VAZIO = {
  nome: "",
  descricao: "",
  categoria: CATEGORIAS_PROJETO_MAPA[0],
  localidade: BAIRROS_ZONA_LESTE[0],
  endereco: "",
  tagsTexto: "",
};

const MINI_MAP_STYLE = { width: "100%", height: "220px", borderRadius: "12px" };

export default function ProjetoFormModal({ user, onClose, onCreated }) {
  const [form, setForm] = useState(VAZIO);
  const [posicao, setPosicao] = useState(CENTRO_ZONA_LESTE);
  const [erro, setErro] = useState("");
  const [enviando, setEnviando] = useState(false);

  const { isLoaded, loadError } = useJsApiLoader({
    id: GOOGLE_MAPS_SCRIPT_ID,
    googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || "",
    libraries: GOOGLE_MAPS_LIBRARIES,
  });

  function handleChange(campo, valor) {
    setForm((f) => ({ ...f, [campo]: valor }));
  }

  function handleMapClick(e) {
    setPosicao({ lat: e.latLng.lat(), lng: e.latLng.lng() });
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setErro("");
    setEnviando(true);

    const tags = form.tagsTexto
      .split(",")
      .map((t) => t.trim().toLowerCase())
      .filter(Boolean);

    const { error } = await supabase.from("projetos_mapa").insert({
      user_id: user.id,
      nome: form.nome,
      descricao: form.descricao || null,
      categoria: form.categoria,
      localidade: form.localidade,
      endereco: form.endereco || null,
      latitude: posicao.lat,
      longitude: posicao.lng,
      tags,
    });

    setEnviando(false);

    if (error) {
      setErro(error.message);
      return;
    }

    onCreated?.();
    onClose();
  }

  return (
    <Modal title="Adicionar projeto ao Mapeamento Cultural" onClose={onClose}>
      {erro && <div className="form-error">{erro}</div>}
      <form onSubmit={handleSubmit}>
        <div className="form-field">
          <label htmlFor="nome">Nome do projeto / espaço</label>
          <input
            id="nome"
            required
            value={form.nome}
            onChange={(e) => handleChange("nome", e.target.value)}
            placeholder="Ex: Sarau da Cohab"
          />
        </div>

        <div className="form-field">
          <label htmlFor="descricao">Descrição</label>
          <textarea
            id="descricao"
            rows={3}
            value={form.descricao}
            onChange={(e) => handleChange("descricao", e.target.value)}
            placeholder="O que acontece nesse espaço/projeto?"
          />
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
          <div className="form-field">
            <label htmlFor="categoria">Categoria</label>
            <select
              id="categoria"
              value={form.categoria}
              onChange={(e) => handleChange("categoria", e.target.value)}
            >
              {CATEGORIAS_PROJETO_MAPA.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          </div>
          <div className="form-field">
            <label htmlFor="localidade">Bairro (Zona Leste)</label>
            <select
              id="localidade"
              value={form.localidade}
              onChange={(e) => handleChange("localidade", e.target.value)}
            >
              {BAIRROS_ZONA_LESTE.map((bairro) => (
                <option key={bairro} value={bairro}>
                  {bairro}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="form-field">
          <label htmlFor="endereco">Endereço (texto descritivo, opcional)</label>
          <input
            id="endereco"
            value={form.endereco}
            onChange={(e) => handleChange("endereco", e.target.value)}
            placeholder="Ex: Rua das Flores, 123"
          />
        </div>

        <div className="form-field">
          <label htmlFor="tags">Tags (separadas por vírgula)</label>
          <input
            id="tags"
            value={form.tagsTexto}
            onChange={(e) => handleChange("tagsTexto", e.target.value)}
            placeholder="Ex: gratuito, infantil, ao ar livre"
          />
          <span className={styles.hint}>
            Tags livres ajudam outras pessoas a filtrar o mapa por características do projeto.
          </span>
        </div>

        <div className="form-field">
          <label>Localização exata no mapa</label>
          <span className={styles.hint}>
            Clique no mapa abaixo para marcar o ponto exato do projeto.
          </span>
          {loadError && (
            <div className="form-error">
              Não foi possível carregar o Google Maps. Verifique a chave em
              NEXT_PUBLIC_GOOGLE_MAPS_API_KEY.
            </div>
          )}
          {!loadError && !isLoaded && <div className={styles.miniMapLoading}>Carregando mapa…</div>}
          {!loadError && isLoaded && (
            <GoogleMap
              mapContainerStyle={MINI_MAP_STYLE}
              center={posicao}
              zoom={13}
              onClick={handleMapClick}
              options={{ streetViewControl: false, mapTypeControl: false, fullscreenControl: false }}
            >
              <Marker position={posicao} />
            </GoogleMap>
          )}
          <span className={styles.hint}>
            Latitude: {posicao.lat.toFixed(5)} · Longitude: {posicao.lng.toFixed(5)}
          </span>
        </div>

        <button type="submit" className="btn btn-primary btn-block" disabled={enviando}>
          {enviando ? "Salvando…" : "Adicionar projeto"}
        </button>
      </form>
    </Modal>
  );
}
