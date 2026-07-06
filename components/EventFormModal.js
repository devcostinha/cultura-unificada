"use client";

import { useRef, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { AREAS_ATUACAO, BAIRROS_ZONA_LESTE } from "@/lib/constants";
import Modal from "@/components/Modal";
import styles from "./EventFormModal.module.css";

const VAZIO = {
  titulo: "",
  descricao: "",
  categoria: AREAS_ATUACAO[0],
  data_evento: "",
  horario: "",
  local: "",
  bairro: BAIRROS_ZONA_LESTE[0],
  link: "",
};

export default function EventFormModal({ user, onClose, onCreated }) {
  const [form, setForm] = useState(VAZIO);
  const [arquivo, setArquivo] = useState(null);
  const [previewUrl, setPreviewUrl] = useState("");
  const [uploadando, setUploadando] = useState(false);
  const [erro, setErro] = useState("");
  const [enviando, setEnviando] = useState(false);
  const inputFileRef = useRef(null);

  function handleChange(campo, valor) {
    setForm((f) => ({ ...f, [campo]: valor }));
  }

  function handleFileChange(e) {
    const file = e.target.files?.[0];
    if (!file) return;

    // Limita a 8 MB
    if (file.size > 8 * 1024 * 1024) {
      setErro("A imagem precisa ter no máximo 8 MB.");
      return;
    }

    setErro("");
    setArquivo(file);
    setPreviewUrl(URL.createObjectURL(file));
  }

  function removerArquivo() {
    setArquivo(null);
    setPreviewUrl("");
    if (inputFileRef.current) inputFileRef.current.value = "";
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setErro("");
    setEnviando(true);

    let imagem_url = null;

    // Faz upload do flyer se o usuário escolheu um arquivo
    if (arquivo) {
      setUploadando(true);
      const nomeArquivo = `${user.id}/${Date.now()}_${arquivo.name.replace(/\s+/g, "_")}`;

      const { data: uploadData, error: uploadError } = await supabase.storage
        .from("flyers")
        .upload(nomeArquivo, arquivo, { upsert: false });

      setUploadando(false);

      if (uploadError) {
        // Se o bucket ainda não foi criado, avisa sobre a migração
        const msg = uploadError.message.includes("Bucket not found")
          ? 'Bucket "flyers" não encontrado. Rode o arquivo supabase/migration_flyers.sql no SQL Editor do Supabase antes de fazer upload de imagens.'
          : `Erro ao enviar imagem: ${uploadError.message}`;
        setErro(msg);
        setEnviando(false);
        return;
      }

      imagem_url = supabase.storage
        .from("flyers")
        .getPublicUrl(uploadData.path).data.publicUrl;
    }

    const { error } = await supabase.from("eventos").insert({
      user_id: user.id,
      ...form,
      horario: form.horario || null,
      link: form.link || null,
      imagem_url,
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
    <Modal title="Adicionar evento ao Calendário Unificado" onClose={onClose}>
      {erro && <div className="form-error">{erro}</div>}
      <form onSubmit={handleSubmit}>
        <div className="form-field">
          <label htmlFor="titulo">Título do evento</label>
          <input
            id="titulo"
            required
            value={form.titulo}
            onChange={(e) => handleChange("titulo", e.target.value)}
            placeholder="Ex: Sarau da Cidade Tiradentes"
          />
        </div>

        <div className="form-field">
          <label htmlFor="descricao">Descrição</label>
          <textarea
            id="descricao"
            rows={3}
            value={form.descricao}
            onChange={(e) => handleChange("descricao", e.target.value)}
            placeholder="Conte um pouco sobre o evento"
          />
        </div>

        <div className="form-field">
          <label htmlFor="categoria">Categoria / área artística</label>
          <select
            id="categoria"
            value={form.categoria}
            onChange={(e) => handleChange("categoria", e.target.value)}
          >
            {AREAS_ATUACAO.map((area) => (
              <option key={area} value={area}>
                {area}
              </option>
            ))}
          </select>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
          <div className="form-field">
            <label htmlFor="data_evento">Data</label>
            <input
              id="data_evento"
              type="date"
              required
              value={form.data_evento}
              onChange={(e) => handleChange("data_evento", e.target.value)}
            />
          </div>
          <div className="form-field">
            <label htmlFor="horario">Horário</label>
            <input
              id="horario"
              type="time"
              value={form.horario}
              onChange={(e) => handleChange("horario", e.target.value)}
            />
          </div>
        </div>

        <div className="form-field">
          <label htmlFor="local">Local (nome do espaço / endereço)</label>
          <input
            id="local"
            required
            value={form.local}
            onChange={(e) => handleChange("local", e.target.value)}
            placeholder="Ex: Centro Cultural Itaquera"
          />
        </div>

        <div className="form-field">
          <label htmlFor="bairro">Bairro (Zona Leste)</label>
          <select id="bairro" value={form.bairro} onChange={(e) => handleChange("bairro", e.target.value)}>
            {BAIRROS_ZONA_LESTE.map((bairro) => (
              <option key={bairro} value={bairro}>
                {bairro}
              </option>
            ))}
          </select>
        </div>

        <div className="form-field">
          <label htmlFor="link">Link (opcional)</label>
          <input
            id="link"
            type="url"
            value={form.link}
            onChange={(e) => handleChange("link", e.target.value)}
            placeholder="https://..."
          />
        </div>

        {/* ── Upload do flyer ── */}
        <div className="form-field">
          <label>Flyer do evento (opcional)</label>

          {/* Dica de formato */}
          <div className={styles.dica}>
            📐 <strong>Formato recomendado:</strong> imagem vertical{" "}
            <strong>1080 × 1920 px</strong> (Stories do Instagram) ou quadrada{" "}
            <strong>1080 × 1080 px</strong>. JPG ou PNG, até 8 MB.
          </div>

          {!previewUrl ? (
            <label className={styles.uploadArea} htmlFor="flyer-input">
              <span className={styles.uploadIcone}>🖼️</span>
              <span className={styles.uploadTexto}>Clique para escolher a imagem do flyer</span>
              <input
                id="flyer-input"
                ref={inputFileRef}
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                className={styles.inputHidden}
              />
            </label>
          ) : (
            <div className={styles.previewWrap}>
              <img src={previewUrl} alt="Preview do flyer" className={styles.preview} />
              <button
                type="button"
                className={styles.removerBtn}
                onClick={removerArquivo}
              >
                Remover imagem
              </button>
            </div>
          )}
        </div>

        <button
          type="submit"
          className="btn btn-primary btn-block"
          disabled={enviando || uploadando}
        >
          {uploadando ? "Enviando imagem…" : enviando ? "Salvando…" : "Adicionar evento"}
        </button>
      </form>
    </Modal>
  );
}
