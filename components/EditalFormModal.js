"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { CATEGORIAS_EDITAL, SUBCATEGORIAS_EDITAL_PRIVADO } from "@/lib/constants";
import Modal from "@/components/Modal";

const VAZIO = {
  titulo: "",
  descricao: "",
  categoria: CATEGORIAS_EDITAL[0],
  subcategoria: "",
  entidade_responsavel: "",
  link: "",
  prazo: "",
};

export default function EditalFormModal({ user, onClose, onCreated }) {
  const [form, setForm] = useState(VAZIO);
  const [erro, setErro] = useState("");
  const [enviando, setEnviando] = useState(false);

  function handleChange(campo, valor) {
    setForm((f) => ({ ...f, [campo]: valor }));
  }

  const isPrivado = form.categoria === "Edital de Iniciativa Privada";

  async function handleSubmit(e) {
    e.preventDefault();
    setErro("");
    setEnviando(true);

    const { error } = await supabase.from("editais").insert({
      user_id: user.id,
      titulo: form.titulo,
      descricao: form.descricao || null,
      categoria: form.categoria,
      subcategoria: isPrivado ? form.subcategoria || "Outros" : null,
      entidade_responsavel: form.entidade_responsavel || null,
      link: form.link || null,
      prazo: form.prazo || null,
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
    <Modal title="Cadastrar edital" onClose={onClose}>
      {erro && <div className="form-error">{erro}</div>}
      <form onSubmit={handleSubmit}>
        <div className="form-field">
          <label htmlFor="titulo">Título do edital</label>
          <input
            id="titulo"
            required
            value={form.titulo}
            onChange={(e) => handleChange("titulo", e.target.value)}
            placeholder="Ex: Edital de Fomento à Cultura Periférica 2026"
          />
        </div>

        <div className="form-field">
          <label htmlFor="categoria">Categoria</label>
          <select
            id="categoria"
            value={form.categoria}
            onChange={(e) => handleChange("categoria", e.target.value)}
          >
            {CATEGORIAS_EDITAL.map((cat) => (
              <option key={cat} value={cat}>
                {cat}
              </option>
            ))}
          </select>
        </div>

        {isPrivado && (
          <div className="form-field">
            <label htmlFor="subcategoria">Subcategoria (iniciativa privada)</label>
            <select
              id="subcategoria"
              value={form.subcategoria}
              onChange={(e) => handleChange("subcategoria", e.target.value)}
            >
              <option value="">Selecione…</option>
              {SUBCATEGORIAS_EDITAL_PRIVADO.map((sub) => (
                <option key={sub} value={sub}>
                  {sub}
                </option>
              ))}
            </select>
          </div>
        )}

        <div className="form-field">
          <label htmlFor="descricao">Descrição</label>
          <textarea
            id="descricao"
            rows={3}
            value={form.descricao}
            onChange={(e) => handleChange("descricao", e.target.value)}
            placeholder="Resumo do que o edital oferece e quem pode se inscrever"
          />
        </div>

        <div className="form-field">
          <label htmlFor="entidade_responsavel">Entidade responsável</label>
          <input
            id="entidade_responsavel"
            value={form.entidade_responsavel}
            onChange={(e) => handleChange("entidade_responsavel", e.target.value)}
            placeholder="Ex: Secretaria Municipal de Cultura"
          />
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
          <div className="form-field">
            <label htmlFor="prazo">Prazo de inscrição</label>
            <input
              id="prazo"
              type="date"
              value={form.prazo}
              onChange={(e) => handleChange("prazo", e.target.value)}
            />
          </div>
          <div className="form-field">
            <label htmlFor="link">Link externo</label>
            <input
              id="link"
              type="url"
              value={form.link}
              onChange={(e) => handleChange("link", e.target.value)}
              placeholder="https://..."
            />
          </div>
        </div>

        <button type="submit" className="btn btn-primary btn-block" disabled={enviando}>
          {enviando ? "Salvando…" : "Cadastrar edital"}
        </button>
      </form>
    </Modal>
  );
}
